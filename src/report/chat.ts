// WhatsApp export → parsed chat → stats → sample for the AI.
// Everything here runs in the browser: the chat never leaves the device except
// for the sample the person agrees to send. Port of the tested Swift WhatsAppChatKit.

import { loc } from "./i18n";

export type Kind = "text" | "media" | "call" | "deleted";
export type Message = { date: Date; author: string; text: string; kind: Kind };
export type ParsedChat = { messages: Message[]; participants: string[]; startsWithEncryptionNotice: boolean };

const IOS = /^\[(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4}),?\s+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?\s*([AaPp]\.?\s?[Mm]\.?)?\]\s(.*)$/;
const ANDROID = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4}),?\s+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?\s*([AaPp]\.?\s?[Mm]\.?)?\s[-–]\s(.*)$/;

type Header = { d1: number; d2: number; y: number; h: number; m: number; s: number; ampm?: string; author?: string; body: string };

function clean(raw: string): string {
  return raw.replace(/\r\n?/g, "\n").replace(/[‎‏‪‬﻿]/g, "").replace(/[  ]/g, " ");
}

function matchHeader(line: string): Header | null {
  const m = IOS.exec(line) ?? ANDROID.exec(line);
  if (!m) return null;
  const rest = m[8] ?? "";
  let author: string | undefined;
  let body = rest;
  const sep = rest.indexOf(": ");
  if (sep > 0 && sep <= 60) { author = rest.slice(0, sep).trim(); body = rest.slice(sep + 2); }
  return { d1: +m[1], d2: +m[2], y: +m[3], h: +m[4], m: +m[5], s: m[6] ? +m[6] : 0, ampm: m[7], author, body };
}

function inferDayFirst(pairs: [number, number][]): boolean {
  if (pairs.some(p => p[0] > 12)) return true;
  if (pairs.some(p => p[1] > 12)) return false;
  let c1 = 0, c2 = 0;
  for (let i = 1; i < pairs.length; i++) { if (pairs[i][0] !== pairs[i - 1][0]) c1++; if (pairs[i][1] !== pairs[i - 1][1]) c2++; }
  return c1 >= c2;
}

const NOTICE = ["cifrados de extremo a extremo", "end-to-end encrypted", "chiffrés de bout en bout", "ende-zu-ende-verschlüsselt", "crittografia end-to-end", "criptografia de ponta a ponta", "szyfrowane metodą end-to-end", "szyfrowane end-to-end"];
const isNotice = (s: string) => { const l = s.toLowerCase(); return NOTICE.some(n => l.includes(n)); };

const MEDIA = ["imagen omitida", "audio omitido", "video omitido", "vídeo omitido", "sticker omitido", "gif omitido", "documento omitido", "<multimedia omitido>", "<media omitted>", "image omitted", "audio omitted", "video omitted", "sticker omitted", "gif omitted", "document omitted", "<médias omis>", "<medien ausgeschlossen>", "image absente", "immagine omessa", "audio omesso", "<media omessi>", "pominięto multimedia", "obraz pominięty"];
const CALLS = ["llamada", "videollamada", "voice call", "video call", "missed voice call", "missed video call", "appel vocal", "appel vidéo", "sprachanruf", "videoanruf", "chiamata", "videochiamata", "połączenie"];
const DELETED = ["se eliminó este mensaje", "eliminaste este mensaje", "this message was deleted", "you deleted this message", "ce message a été supprimé", "questo messaggio è stato eliminato", "ta wiadomość została usunięta", "diese nachricht wurde gelöscht"];

function kindOf(body: string): Kind {
  const l = body.toLowerCase();
  if (MEDIA.some(x => l.includes(x))) return "media";
  if (l.length < 60 && CALLS.some(x => l.startsWith(x))) return "call";
  if (DELETED.some(x => l.includes(x))) return "deleted";
  return "text";
}

export function parseChat(raw: string): ParsedChat {
  const lines = clean(raw).split("\n");
  const headers: Header[] = [];
  const cont = new Map<number, string[]>();
  for (const line of lines) {
    const h = matchHeader(line);
    if (h) headers.push(h);
    else if (headers.length) { const k = headers.length - 1; (cont.get(k) ?? cont.set(k, []).get(k)!).push(line); }
  }
  const dayFirst = inferDayFirst(headers.map(h => [h.d1, h.d2]));
  const messages: Message[] = [];
  let notice = false;
  headers.forEach((h, i) => {
    let body = h.body;
    const extra = cont.get(i);
    if (extra) body += "\n" + extra.join("\n");
    body = body.trim();
    if (!h.author || isNotice(body)) { if (messages.length === 0 && isNotice(body)) notice = true; return; }
    let hour = h.h;
    const ap = h.ampm?.toLowerCase();
    if (ap?.startsWith("p") && hour < 12) hour += 12;
    if (ap?.startsWith("a") && hour === 12) hour = 0;
    const year = h.y < 100 ? 2000 + h.y : h.y;
    const date = new Date(year, (dayFirst ? h.d2 : h.d1) - 1, dayFirst ? h.d1 : h.d2, hour, h.m, h.s);
    if (isNaN(date.getTime())) return;
    messages.push({ date, author: h.author, text: body, kind: kindOf(body) });
  });
  const participants = [...new Set(messages.map(m => m.author))];
  return { messages, participants, startsWithEncryptionNotice: notice };
}

// ---------- stats ----------

export type Person = {
  name: string; messages: number; share: number; words: number; wordsPerMessage: number; media: number;
  started: number; closed: number; medianReplyMin: number | null; topEmojis: [string, number][];
  topWords: [string, number][]; laughs: number; loveYou: number; firstLoveYou: Date | null;
};
export type Silence = { from: Date; to: Date; days: number; brokenBy: string };
export type Stats = {
  total: number; first: Date; last: Date; spanDays: number; conversations: number; people: Person[];
  busiestDay: { date: Date; messages: number }; longestStreak: number; silences: Silence[];
  hours: number[]; peakHour: number; afterTenShare: number; calls: number; historyMayBeIncomplete: boolean;
  months: { key: string; date: Date; counts: Record<string, number> }[];
  startsBySeason: { label: string; date: Date; counts: Record<string, number> }[];
  perDay: Map<string, number>;
  weekdays: Record<string, number[]>;                          // Mon..Sun per person
  replyByMonth: Record<string, Record<number, number>>;        // person → year*12+month → median minutes
};

const GAP_MS = 6 * 3600 * 1000;
const DAY_MS = 86400000;
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const words = (s: string) => s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const isLaugh = (w: string) => w.startsWith("jaj") || w.startsWith("jej") || w.startsWith("haha") || w.startsWith("ahah") || w === "xd" || w === "lol" || w === "xddd" || (w.length >= 4 && /^[jaxkh]+$/.test(w));
const EMOJI = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*/gu;
const LOVE = /\b(te quiero|te amo|i love you|love you|ti amo|ti voglio bene|je t'aime|je t’aime|ich liebe dich|hab dich lieb|kocham cię|kocham cie|t'estimo)\b/i;

const STOP = new Set(("pero como para esto esta este todo porque cuando donde también tambien aunq aunque bueno vale pues nada algo muy más mas eso esa ese ahora luego hasta desde entre sobre solo tengo tiene estoy están estás estas hace hacer puedo quiero mejor bien claro verdad igual otra otro tienes sabes dice dijo creo mañana manana hola gracias omitido omitida imagen audio video vídeo sticker mensaje eres mucho mucha cómo está esté qué quién cuál dónde cuándo hoy ayer tarde noche entonces siempre nunca ahí aquí allí días semana vamos vaya venga sería había tenía vale okey okay " +
  "that this with have just what your like about from they will would there their been were when then than dont really yeah omitted " +
  "anche come sono della questo questa quando perché perche però pero molto cosa fatto fare ancora tutto oggi domani grazie ciao " +
  "jest się sie żeby zeby jestem tylko może moze dzisiaj jutro dobrze " +
  "mais pour avec dans tout bien fait faire suis c'est cest vous nous elle " +
  "aber auch nicht noch schon dann heute morgen gut").split(" "));

export function computeStats(chat: ParsedChat): Stats {
  const sorted = [...chat.messages].sort((a, b) => +a.date - +b.date);
  const all = sorted.filter(m => m.kind !== "call");
  if (!all.length) throw new Error("empty");
  const total = all.length, first = all[0].date, last = all[all.length - 1].date;
  const started: Record<string, number> = {}, closed: Record<string, number> = {}, replies: Record<string, number[]> = {};
  const silences: Silence[] = [];
  const replyByMonth: Record<string, Record<number, number[]>> = {};
  const weekdays: Record<string, number[]> = {};
  for (const m of all) (weekdays[m.author] ??= Array(7).fill(0))[(m.date.getDay() + 6) % 7]++;
  let convs = 0;
  const seasonOf = (d: Date) => new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
  const seasons = new Map<number, Record<string, number>>();
  all.forEach((m, i) => {
    if (i === 0 || +m.date - +all[i - 1].date >= GAP_MS) {
      convs++;
      started[m.author] = (started[m.author] ?? 0) + 1;
      const s = +seasonOf(m.date); const rec = seasons.get(s) ?? {}; rec[m.author] = (rec[m.author] ?? 0) + 1; seasons.set(s, rec);
      if (i > 0) {
        closed[all[i - 1].author] = (closed[all[i - 1].author] ?? 0) + 1;
        silences.push({ from: all[i - 1].date, to: m.date, days: Math.floor((+m.date - +all[i - 1].date) / DAY_MS), brokenBy: m.author });
      }
    } else if (m.author !== all[i - 1].author) {
      const mins = (+m.date - +all[i - 1].date) / 60000;
      (replies[m.author] ??= []).push(mins);
      const mk = m.date.getFullYear() * 12 + m.date.getMonth();
      ((replyByMonth[m.author] ??= {})[mk] ??= []).push(mins);
    }
  });
  closed[all[total - 1].author] = (closed[all[total - 1].author] ?? 0) + 1;

  const wc: Record<string, Record<string, number>> = {};
  for (const m of all) if (m.kind === "text")
    for (const w of words(m.text)) if (w.length > 3 && !STOP.has(w) && !isLaugh(w) && !/^\d+$/.test(w) && !w.startsWith("http"))
      (wc[m.author] ??= {})[w] = ((wc[m.author] ??= {})[w] ?? 0) + 1;
  const distinctive = (name: string): [string, number][] => {
    const mine = wc[name] ?? {}; const rest: Record<string, number> = {};
    for (const [n, c] of Object.entries(wc)) if (n !== name) for (const [w, k] of Object.entries(c)) rest[w] = (rest[w] ?? 0) + k;
    const nM = Math.max(1, Object.values(mine).reduce((a, b) => a + b, 0)), nR = Math.max(1, Object.values(rest).reduce((a, b) => a + b, 0));
    return Object.entries(mine).filter(([, c]) => c >= 3)
      .map(([w, c]) => [w, c, Math.sqrt(c) * Math.log(Math.max((c / nM) / (((rest[w] ?? 0) + 1) / nR), 1))] as const)
      .sort((a, b) => b[2] - a[2]).slice(0, 5).map(([w, c]) => [w, c]);
  };

  const people: Person[] = chat.participants.filter(p => all.some(m => m.author === p)).map(name => {
    const mine = all.filter(m => m.author === name), textual = mine.filter(m => m.kind === "text");
    const w = textual.reduce((a, m) => a + words(m.text).length, 0);
    const emo: Record<string, number> = {};
    let laughs = 0, love = 0, firstLove: Date | null = null;
    for (const m of textual) {
      for (const e of m.text.match(EMOJI) ?? []) emo[e] = (emo[e] ?? 0) + 1;
      if (words(m.text).some(isLaugh)) laughs++;
      if (LOVE.test(m.text)) { love++; firstLove ??= m.date; }
    }
    const r = (replies[name] ?? []).sort((a, b) => a - b);
    return {
      name, messages: mine.length, share: mine.length / total, words: w, wordsPerMessage: textual.length ? w / textual.length : 0,
      media: mine.filter(m => m.kind === "media").length, started: started[name] ?? 0, closed: closed[name] ?? 0,
      medianReplyMin: r.length ? r[Math.floor(r.length / 2)] : null,
      topEmojis: Object.entries(emo).sort((a, b) => b[1] - a[1]).slice(0, 5), topWords: distinctive(name),
      laughs, loveYou: love, firstLoveYou: firstLove,
    };
  }).sort((a, b) => b.messages - a.messages);

  const perDay = new Map<string, number>();
  const hours = Array<number>(24).fill(0);
  const months = new Map<string, { key: string; date: Date; counts: Record<string, number> }>();
  for (const m of all) {
    perDay.set(dayKey(m.date), (perDay.get(dayKey(m.date)) ?? 0) + 1);
    hours[m.date.getHours()]++;
    const k = `${m.date.getFullYear()}-${String(m.date.getMonth() + 1).padStart(2, "0")}`;
    const rec = months.get(k) ?? { key: k, date: new Date(m.date.getFullYear(), m.date.getMonth(), 1), counts: {} };
    rec.counts[m.author] = (rec.counts[m.author] ?? 0) + 1; months.set(k, rec);
  }
  let busiest = { date: first, messages: 0 };
  for (const [k, n] of perDay) if (n > busiest.messages) { const [y, mo, d] = k.split("-").map(Number); busiest = { date: new Date(y, mo - 1, d), messages: n }; }
  const days = [...perDay.keys()].map(k => { const [y, mo, d] = k.split("-").map(Number); return +new Date(y, mo - 1, d); }).sort((a, b) => a - b);
  let best = 1, cur = 1;
  for (let i = 1; i < days.length; i++) { cur = Math.round((days[i] - days[i - 1]) / DAY_MS) === 1 ? cur + 1 : 1; best = Math.max(best, cur); }
  const late = hours[22] + hours[23] + hours.slice(0, 6).reduce((a, b) => a + b, 0);

  return {
    total, first, last, spanDays: Math.round((+startOfDay(last) - +startOfDay(first)) / DAY_MS), conversations: convs, people,
    busiestDay: busiest, longestStreak: best,
    silences: silences.sort((a, b) => (+b.to - +b.from) - (+a.to - +a.from)).slice(0, 5),
    hours, peakHour: hours.indexOf(Math.max(...hours)), afterTenShare: late / total,
    calls: sorted.filter(m => m.kind === "call").length, historyMayBeIncomplete: chat.startsWithEncryptionNotice,
    months: [...months.values()].sort((a, b) => +a.date - +b.date),
    startsBySeason: [...seasons.entries()].sort((a, b) => a[0] - b[0]).map(([t, counts]) => ({ label: "", date: new Date(t), counts })),
    perDay, weekdays,
    replyByMonth: Object.fromEntries(Object.entries(replyByMonth).map(([n, byM]) => [n, Object.fromEntries(Object.entries(byM)
      .filter(([, v]) => v.length >= 5).map(([k, v]) => { const x = [...v].sort((a, b) => a - b); return [k, Math.round(x[Math.floor(x.length / 2)] * 10) / 10]; }))])),
  };
}

// ---------- sample for the AI ----------

const PHONE_NAME = /^\+?\d[\d\s().-]{6,}$/;
/** Contacts saved only as a phone number are renamed "Contacto N" before anything goes to the AI. */
export function safeName(name: string, participants: string[]): string {
  if (!PHONE_NAME.test(name.trim())) return name;
  const phones = participants.filter(p => PHONE_NAME.test(p.trim()));
  return `Contacto ${phones.indexOf(name) + 1}`;
}

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function sampleChat(chat: ParsedChat, stats: Stats, budget = 2200): { transcript: string; covered: number } {
  const all = chat.messages.filter(m => m.kind !== "call").sort((a, b) => +a.date - +b.date);
  const picked = new Set<number>();
  const add = (a: number, b: number) => { for (let i = Math.max(0, a); i < Math.min(all.length, b) && picked.size < budget; i++) picked.add(i); };
  const indexOf = (d: Date) => { const i = all.findIndex(m => m.date >= d); return i < 0 ? all.length - 1 : i; };
  if (all.length <= budget) add(0, all.length);
  else {
    add(0, 60); add(all.length - 60, all.length);
    // Busiest days: if a day is huge, take its start, middle and end (not just the first N messages).
    const cap = Math.floor(budget / 8);
    [...stats.perDay.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).forEach(([k, n]) => {
      const [y, mo, d] = k.split("-").map(Number); const s = indexOf(new Date(y, mo - 1, d));
      if (n <= cap) { add(s, s + n); return; }
      const third = Math.floor(cap / 3);
      add(s, s + third); add(s + Math.floor(n / 2 - third / 2), s + Math.floor(n / 2 + third / 2)); add(s + n - third, s + n);
    });
    stats.silences.slice(0, 4).forEach(s => { const i = indexOf(s.to); add(i - 25, i + 25); });
    // Plans and promises ("quedamos el martes", "lo hablamos", "un café") with a little context:
    // what two people agree to, and whether it happens, is often the story.
    const PLAN = /\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|mañana|quedamos|quedar|nos vemos|te veo|lo hablamos|hablarlo|hablamos|caf[eé]|cenar|cena|monday|tuesday|wednesday|thursday|friday|weekend|tomorrow|let'?s talk|coffee|meet|domani|caff[eè]|ci vediamo|parliamo|jutro|kawa|spotkajmy|demain|caf[eé]|on se voit|morgen|kaffee|treffen)\b/i;
    const planIdx = all.map((m, i) => (m.kind === "text" && PLAN.test(m.text) ? i : -1)).filter(i => i >= 0);
    const step = Math.max(1, Math.ceil(planIdx.length / Math.floor(budget / 10 / 6)));   // ~10% of the budget
    for (let k = 0; k < planIdx.length; k += step) add(planIdx[k] - 2, planIdx[k] + 4);
    // Cancellations and postponements ("lo dejamos para otro día", "se me ha liado", "al final no"):
    // a plan that breaks is usually a key moment, and it hides in the middle of long days.
    const CANCEL = /(lo dejamos|dej[eé]moslo|otro d[ií]a|se me ha liado|me ha surgido|al final no|no puedo (hoy|al final)|mejor otro|lo aplazamos|cancel|rain check|another (day|time)|something came up|can'?t make it|rimandiamo|un altro giorno|non riesco|alla fine no|mi è saltat|ein andermal|ein anderes mal|klappt (doch )?nicht|kann (doch )?nicht|verschieben|abgesagt|une autre fois|on remet|je peux pas finalement|annul|empêchement|przełóżmy|innym razem|nie dam rady|jednak nie|odwoł)/i;
    const seenDay = new Set<string>();
    const cancelIdx = all.map((m, i) => {
      if (m.kind !== "text" || !CANCEL.test(m.text)) return -1;
      const d = `${m.date.getFullYear()}-${m.date.getMonth()}-${m.date.getDate()}`;
      if (seenDay.has(d)) return -1; seenDay.add(d); return i;     // first one of each day
    }).filter(i => i >= 0);
    const cStep = Math.max(1, Math.ceil(cancelIdx.length / Math.floor(budget * 0.12 / 13)));   // ~12% of the budget
    for (let k = 0; k < cancelIdx.length; k += cStep) add(cancelIdx[k] - 6, cancelIdx[k] + 7);
    if (picked.size < budget) {
      const step = Math.max(1, Math.floor(all.length / Math.max(1, Math.floor((budget - picked.size) / 8))));
      for (let i = 0; i < all.length && picked.size < budget; i += step) add(i, i + 8);
    }
  }
  // Never send phone numbers or emails to the AI: mask them in text and in author names.
  const PHONE = /\+?\d[\d\s().-]{7,}\d/g, EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g;
  const mask = (t: string) => t.replace(EMAIL, "[email]").replace(PHONE, "[teléfono]");
  const who = (a: string) => safeName(a, chat.participants);
  const out: string[] = []; let gap = 0;
  all.forEach((m, i) => {
    if (!picked.has(i)) { gap++; return; }
    if (gap) { out.push(`[… ${gap} omitted …]`); gap = 0; }
    const body = m.kind === "media" ? "<media>" : m.kind === "deleted" ? "<deleted>" : mask(m.text.replace(/\n/g, " / "));
    out.push(`[${stamp(m.date)}] ${who(m.author)}: ${body}`);
  });
  if (gap) out.push(`[… ${gap} omitted …]`);
  return { transcript: out.join("\n"), covered: picked.size / all.length };
}

export function statsForPrompt(s: Stats, participants: string[] = s.people.map(p => p.name)) {
  const f = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  return {
    total_messages: s.total, from: f(s.first), to: f(s.last), days: s.spanDays, conversations: s.conversations,
    busiest_day: { date: f(s.busiestDay.date), messages: s.busiestDay.messages }, longest_streak_days: s.longestStreak,
    pct_messages_22h_6h: Math.round(s.afterTenShare * 100), peak_hour: s.peakHour, whatsapp_calls_logged: s.calls,
    history_may_be_incomplete: s.historyMayBeIncomplete,
    longest_silences: s.silences.map(x => ({ from: f(x.from), days: x.days, broken_by: safeName(x.brokenBy, participants) })),
    people: s.people.map(p => ({
      name: safeName(p.name, participants), messages: p.messages, pct: Math.round(p.share * 100), words_per_message: Math.round(p.wordsPerMessage * 10) / 10,
      starts_conversations: p.started, ends_conversations: p.closed,
      median_reply_min: p.medianReplyMin == null ? null : Math.round(p.medianReplyMin * 10) / 10,
      emojis: p.topEmojis.map(e => e[0]), own_words: p.topWords.map(w => w[0]), laugh_messages: p.laughs, media: p.media, love_you: p.loveYou,
    })),
  };
}

// ---------- aggregates for the report charts (counts only, safe to store) ----------

export type Viz = {
  me: string; other: string;
  people: { name: string; messages: number; started: number; wpm: number; reply: number | null; silencesBroken: number }[];
  months: [string, number, number, number][];   // label, me, other, year*12+month
  seasons: [string, number, number][];  // label, conversations started by me, by other
  weekdays?: [number[], number[]];                 // me, other (Mon..Sun)
  replyMonths?: [string, number | null, number | null][];  // label, me, other (median minutes)
  emojis?: [[string, number][], [string, number][]];
  stories?: unknown[];                   // the free stories, already built (numbers and first names only)
};
/** Short month name in the page language ("ene", "Jan", "janv", "Jan.", "gen", "sty"). */
const monthShort = (m: number) => new Date(2000, m, 1).toLocaleDateString(loc(), { month: "short" }).replace(".", "");

export function buildViz(s: Stats, me: string): Viz {
  const meP = s.people.find(p => p.name === me) ?? s.people[0];
  const other = s.people.find(p => p !== meP) ?? meP;
  const yy = (d: Date) => String(d.getFullYear()).slice(2);
  const months = s.months.map((m, i): [string, number, number, number] => [
    `${monthShort(m.date.getMonth())}${i === 0 || m.date.getMonth() === 0 ? " " + yy(m.date) : ""}`, m.counts[meP.name] ?? 0, m.counts[other.name] ?? 0,
    m.date.getFullYear() * 12 + m.date.getMonth()]);
  const seasons = s.startsBySeason.map((q, i): [string, number, number] => {
    const a = monthShort(q.date.getMonth()), b = monthShort(q.date.getMonth() + 2);
    return [`${a}–${b}${i === 0 || q.date.getMonth() === 0 ? " " + yy(q.date) : ""}`, q.counts[meP.name] ?? 0, q.counts[other.name] ?? 0];
  });
  const broken = (n: string) => s.silences.filter(x => x.days >= 1 && x.brokenBy === n).length;
  return {
    me: meP.name, other: other.name,
    people: [meP, other].map(p => ({ name: p.name, messages: p.messages, started: p.started, wpm: Math.round(p.wordsPerMessage * 10) / 10,
      reply: p.medianReplyMin == null ? null : Math.round(p.medianReplyMin * 10) / 10, silencesBroken: broken(p.name) })),
    months, seasons,
    weekdays: [s.weekdays[meP.name] ?? Array(7).fill(0), s.weekdays[other.name] ?? Array(7).fill(0)],
    replyMonths: s.months.map((m, i) => {
      const k = m.date.getFullYear() * 12 + m.date.getMonth();
      return [months[i][0], s.replyByMonth[meP.name]?.[k] ?? null, s.replyByMonth[other.name]?.[k] ?? null];
    }),
    emojis: [meP.topEmojis.slice(0, 5), other.topEmojis.slice(0, 5)],
  };
}

/** How many times each dictionary term appears in the whole chat, per person. */
export function countTerms(chat: ParsedChat, terms: string[]): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const t of terms) {
    const needle = t.toLowerCase().trim();
    if (!needle) continue;
    const rec: Record<string, number> = {};
    for (const m of chat.messages) if (m.kind === "text") {
      const hay = m.text.toLowerCase();
      let i = hay.indexOf(needle), n = 0;
      while (i >= 0) { n++; i = hay.indexOf(needle, i + needle.length); }
      if (n) rec[m.author] = (rec[m.author] ?? 0) + n;
    }
    out[t] = rec;
  }
  return out;
}

// ---------- quote check ----------
const norm = (t: string) => t.toLowerCase().normalize("NFKC").replace(/[\s\u200e\u200f]+/g, " ").replace(/[“”«»"']/g, "").trim();

/** Drops chat bubbles (key_exchange, topic_timeline) that don't exist in the real chat. The AI must only copy real messages. */
export function verifyQuotes<R extends { chapters: { key_exchange?: { text: string }[]; topic_timeline?: { steps: { text: string }[] } | null }[] }>(report: R, chat: ParsedChat): { report: R; dropped: number } {
  const bodies = chat.messages.filter(m => m.kind === "text").map(m => norm(m.text));
  const exists = (t: string) => { const n = norm(t); return n.length > 0 && bodies.some(b => b === n || (n.length >= 12 && b.includes(n))); };
  let dropped = 0;
  const keep = <T extends { text: string }>(xs: T[]) => xs.filter(x => { const ok = exists(x.text); if (!ok) dropped++; return ok; });
  const chapters = report.chapters.map(c => ({
    ...c,
    ...(c.key_exchange ? { key_exchange: keep(c.key_exchange) } : {}),
    ...(c.topic_timeline?.steps ? { topic_timeline: { ...c.topic_timeline, steps: keep(c.topic_timeline.steps) } } : {}),
  }));
  return { report: { ...report, chapters }, dropped };
}
