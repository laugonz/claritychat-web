// Builds the free "stories" from the stats. Every story is computed from the
// whole chat on the device; nothing here calls the AI.
import type { Stats } from "./chat";
import { loc, tr } from "./i18n";

export type Story = { kicker: string; big?: string; title: string; body: string; card: string; visual?: Visual };
export type Visual =
  | { type: "split"; rows: { name: string; value: number; label: string; mine: boolean }[] }
  | { type: "silences"; rows: { days: number; from: string; who: string }[] }
  | { type: "hours"; hours: number[]; peak: number }
  | { type: "words"; groups: { name: string; mine: boolean; items: string[] }[] }
  | { type: "calendar"; weeks: number[][]; max: number; months: { col: number; label: string }[] };

const nf = { format: (n: number) => new Intl.NumberFormat(loc()).format(n) };
const fmtDate = (d: Date) => d.toLocaleDateString(loc(), { day: "numeric", month: "long", year: "numeric" });
const short = (d: Date) => d.toLocaleDateString(loc(), { day: "2-digit", month: "2-digit", year: "2-digit" });
const dec = (n: number) => n.toLocaleString(loc(), { maximumFractionDigits: 1 });
const hour = (h: number) => new Date(2000, 0, 1, h).toLocaleTimeString(loc(), { hour: "2-digit", minute: "2-digit" });
const esc = (x: string) => x.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const first = (n: string) => esc(n.split(" ")[0]);

export function buildStories(s: Stats, me: string): Story[] {
  const meP = s.people.find(p => p.name === me) ?? s.people[0];
  const others = s.people.filter(p => p !== meP);
  const them = others[0];
  const T = them ? first(them.name) : "";
  const out: Story[] = [];

  const perDay = s.total / Math.max(1, s.spanDays);
  out.push({
    kicker: tr("s_chat_k"), big: nf.format(s.spanDays), title: tr("s_chat_t"),
    body: tr("s_chat_b", { total: nf.format(s.total), perDay: dec(perDay), streak: s.longestStreak }),
    card: tr("s_chat_c", { days: nf.format(s.spanDays), total: nf.format(s.total) }),
  });

  // GitHub-style calendar: one column per week, one cell per day.
  {
    const DAY = 86400000;
    const start = new Date(s.first.getFullYear(), s.first.getMonth(), s.first.getDate());
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));            // back to Monday
    const end = new Date(s.last.getFullYear(), s.last.getMonth(), s.last.getDate());
    let weeks: number[][] = [], months: { col: number; label: string }[] = [], max = 1, active = 0;
    for (let d = new Date(start), w = -1; d <= end; d = new Date(+d + DAY)) {
      const dow = (d.getDay() + 6) % 7;
      if (dow === 0) { weeks.push([]); w++; if (d.getDate() <= 7) months.push({ col: w, label: d.toLocaleDateString(loc(), { month: "short" }).replace(".", "") }); }
      const inRange = d >= new Date(s.first.getFullYear(), s.first.getMonth(), s.first.getDate());
      const n = inRange ? (s.perDay.get(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`) ?? 0) : -1;
      weeks[w].push(n); if (n > max) max = n; if (n > 0) active++;
    }
    if (weeks.length > 78) {                                               // keep it legible on a phone
      const cut = weeks.length - 78; weeks = weeks.slice(cut);
      months = months.filter(m => m.col >= cut).map(m => ({ ...m, col: m.col - cut }));
    }
    out.push({
      kicker: tr("s_cal_k"), big: nf.format(active), title: tr("s_cal_t", { n: nf.format(s.spanDays + 1) }),
      body: tr("s_cal_b", { streak: s.longestStreak }),
      card: tr("s_cal_c", { n: nf.format(active) }),
      visual: { type: "calendar", weeks, max, months },
    });
  }

  if (them) {
    const mePct = Math.round(meP.share * 100), thPct = Math.round(them.share * 100);
    const more = mePct >= thPct;
    const ratio = meP.wordsPerMessage / Math.max(0.1, them.wordsPerMessage);
    const longer = ratio >= 1.4 ? tr("s_more_longer") : ratio <= 0.7 ? tr("s_more_theyLonger", { T }) : "";
    out.push({
      kicker: tr("s_more_k"), title: (more ? tr("s_more_me", { x: longer }) : tr("s_more_them", { T, x: longer })).trim(),
      body: tr("s_more_b", { a: dec(meP.wordsPerMessage), b: dec(them.wordsPerMessage), T }),
      card: tr("s_more_c", { a: mePct, b: thPct, T }),
      visual: { type: "split", rows: [
        { name: tr("you"), value: mePct, label: `${mePct} %`, mine: true },
        { name: T, value: thPct, label: `${thPct} %`, mine: false }] },
    });

    const starter = meP.started >= them.started;
    const a = starter ? meP.started : them.started, b = starter ? them.started : meP.started;
    out.push({
      kicker: tr("s_start_k"), big: nf.format(a),
      title: starter ? tr("s_start_me") : tr("s_start_them", { T }),
      body: starter ? tr("s_start_b_me", { T, n: nf.format(b) }) : tr("s_start_b_them", { n: nf.format(b) }),
      card: starter ? tr("s_start_c_me", { a, b, T }) : tr("s_start_c_them", { a, b, T }),
    });

    const sil = s.silences.filter(x => x.days >= 1);
    if (sil.length >= 2) {
      const mine = sil.filter(x => x.brokenBy === meP.name).length;
      const meBreaks = mine * 2 >= sil.length;
      out.push({
        kicker: tr("s_sil_k"), title: tr("s_sil_t", { n: sil.length }),
        body: mine === sil.length ? tr("s_sil_allMe") : mine === 0 ? tr("s_sil_allThem", { T }) : tr("s_sil_mixed", { a: mine, b: sil.length - mine, T }),
        card: meBreaks ? tr("s_sil_c_me", { a: mine, n: sil.length }) : tr("s_sil_c_them", { a: sil.length - mine, n: sil.length, T }),
        visual: { type: "silences", rows: sil.map(x => ({ days: x.days, from: short(x.from), who: x.brokenBy === meP.name ? tr("you") : first(x.brokenBy) })) },
      });
    }
  }

  out.push({
    kicker: tr("s_rec_k"), big: nf.format(s.busiestDay.messages), title: tr("s_rec_t", { d: fmtDate(s.busiestDay.date) }),
    body: tr("s_rec_b"),
    card: tr("s_rec_c", { n: nf.format(s.busiestDay.messages) }),
  });

  const late = Math.round(s.afterTenShare * 100);
  out.push({
    kicker: tr("s_hour_k"), big: hour(s.peakHour), title: tr("s_hour_t"),
    body: late >= 20 ? tr("s_hour_late", { n: late }) : tr("s_hour_early", { n: late }),
    card: tr("s_hour_c", { h: hour(s.peakHour) }),
    visual: { type: "hours", hours: s.hours, peak: s.peakHour },
  });

  if (them && (meP.loveYou + them.loveYou) > 0) {
    const tie = meP.loveYou === them.loveYou;
    out.push({
      kicker: tr("s_love_k"), big: `${meP.loveYou}–${them.loveYou}`,
      title: tie ? tr("s_love_tie") : meP.loveYou > them.loveYou ? tr("s_love_me") : tr("s_love_them", { T }),
      body: tr("s_love_b", { a: meP.loveYou, b: them.loveYou, T }) + (meP.firstLoveYou && them.firstLoveYou ? (+meP.firstLoveYou < +them.firstLoveYou ? tr("s_love_firstMe") : tr("s_love_firstThem", { T })) : ""),
      card: tr("s_love_c", { a: meP.loveYou, b: them.loveYou }),
    });
  } else if (them) {
    out.push({
      kicker: tr("s_laugh_k"), big: nf.format(meP.laughs + them.laughs), title: tr("s_laugh_t"),
      body: tr("s_laugh_b", { a: nf.format(meP.laughs), b: nf.format(them.laughs), T }),
      card: tr("s_laugh_c", { n: nf.format(meP.laughs + them.laughs) }),
    });
  }

  out.push({
    kicker: tr("s_words_k"), title: tr("s_words_t"),
    body: them && meP.medianReplyMin != null && them.medianReplyMin != null
      ? tr("s_words_b", { T, a: dec(them.medianReplyMin), b: dec(meP.medianReplyMin) }) : "",
    card: them ? tr("s_words_c", { a: esc(them.topWords[0]?.[0] ?? "…"), b: esc(meP.topWords[0]?.[0] ?? "…") }) : tr("s_words_c_solo"),
    visual: { type: "words", groups: [
      ...(them ? [{ name: T, mine: false, items: [...them.topWords.map(w => w[0]), ...them.topEmojis.slice(0, 3).map(e => e[0])] }] : []),
      { name: tr("you"), mine: true, items: [...meP.topWords.map(w => w[0]), ...meP.topEmojis.slice(0, 3).map(e => e[0])] }] },
  });
  return out;
}

/** Rotating lines while the AI writes, built from the person's own numbers. */
export function waitingLines(s: Stats, me: string): string[] {
  const meP = s.people.find(p => p.name === me) ?? s.people[0];
  const them = s.people.find(p => p !== meP);
  const T = them ? them.name.split(" ")[0] : "";
  const sil = s.silences.filter(x => x.days >= 1).length;
  const lines = [
    tr("wl1", { n: nf.format(s.total) }),
    tr("wl2"),
    tr("wl3", { d: fmtDate(s.busiestDay.date) }),
    sil ? tr("wl4a", { n: sil }) : tr("wl4b"),
    them?.topWords[0] ? tr("wl5a", { T, w: them.topWords[0][0] }) : tr("wl5b"),
    tr("wl6"),
    tr("wl7"),
    tr("wl8"),
  ];
  return lines;
}
