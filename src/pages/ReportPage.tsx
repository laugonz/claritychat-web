import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { unzipSync } from "fflate";
import { buildViz, computeStats, countTerms, parseChat, safeName, sampleChat, statsForPrompt, verifyQuotes, type ParsedChat, type Stats, type Viz } from "../report/chat";
import { Numbers, ReportView, type Report } from "../report/ReportView";
import { Clara } from "../report/Mascot";
import { StoryVisual } from "../report/StoryVisual";
import { shareCard } from "../report/shareCard";
import { buildStories, waitingLines, type Story } from "../report/stories";
import { homePath, loc, setLang, tr } from "../report/i18n";
import { exampleFor, exampleHref } from "../report/examples";
import "../report/report.css";

type Step = "landing" | "count" | "setup" | "stories" | "report";
const RELATIONS: [string, string][] = [["💘", "partner"], ["💔", "ex"], ["🫣", "almost"], ["🤝", "friend"], ["🏡", "family"], ["💼", "work"]];
const relLabel = (id: string) => (id ? tr(`rel_${id}`) : "");
const API = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_REPORT_API) || "https://api.emotions-detector.com";
// Anonymous funnel events → our server (steps and coarse numbers only; never chat content or names).
const SID = (() => { try { let v = sessionStorage.getItem("rp-sid"); if (!v) { v = Math.random().toString(36).slice(2, 14); sessionStorage.setItem("rp-sid", v); } return v; } catch { return Math.random().toString(36).slice(2, 14); } })();
// Our own tests: open any page once with ?internal=1 and the whole session is tagged (no Telegram pings).
const INTERNAL = (() => { try { if (typeof location !== "undefined" && new URLSearchParams(location.search).get("internal") === "1") sessionStorage.setItem("rp-int", "1"); return sessionStorage.getItem("rp-int") === "1"; } catch { return false; } })();
const pageLang = () => (typeof document !== "undefined" ? (document.documentElement.lang || "en").slice(0, 2) : "en");
function track(name: string, props: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  const p: Record<string, string> = { lang: pageLang() };
  if (INTERNAL) p.int = "1";
  for (const [k, v] of Object.entries(props)) p[k] = String(v);
  fetch(`${API}/chat/event`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sid: SID, name, props: p }), keepalive: true }).catch(() => {});
}
// Where the person is right now, so we learn where people leave (sent once per place on pagehide/tab hide).
let WHERE = "landing";
const T0 = typeof performance !== "undefined" ? performance.now() : 0;
const at = (w: string) => { WHERE = w; };
if (typeof window !== "undefined") {
  let sent = "";
  const leave = () => { if (sent === WHERE) return; sent = WHERE; track("page_leave", { step: WHERE, secs: Math.round((performance.now() - T0) / 1000) }); };
  addEventListener("pagehide", leave);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") leave(); });
}
/** Shape of a line without content: letters → a, digits → d (e.g. "[dddd-dd-dd, d:dd a.a.] a: a"). */
const shape = (line: string) => line.replace(/\p{L}+/gu, "a").replace(/\d/g, "d").replace(/[^\sad\[\]().,:;\/\-–]/g, "·").slice(0, 40);
const bucket = (n: number) => n < 200 ? "<200" : n < 1000 ? "200-1k" : n < 3000 ? "1k-3k" : n < 10000 ? "3k-10k" : "10k+";
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/** Contacts saved only as a phone number travel as "Contacto N" (also inside the chart data). */
function maskNames(json: string, participants: string[]): string {
  for (const p of participants) { const s = safeName(p, participants); if (s !== p) json = json.split(JSON.stringify(p).slice(1, -1)).join(s); }
  return json;
}

async function readExport(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  let bytes: Uint8Array = buf;
  if (file.name.toLowerCase().endsWith(".zip") || (buf[0] === 0x50 && buf[1] === 0x4b)) {
    const files = unzipSync(buf, { filter: f => f.name.toLowerCase().endsWith(".txt") && !f.name.includes("__MACOSX") });
    const keys = Object.keys(files);
    const name = keys.find(n => /(_chat|whatsapp)[^/]*\.txt$/i.test(n)) ?? keys.sort((a, b) => files[b].length - files[a].length)[0];
    if (!name) throw new Error("no-chat");
    bytes = files[name];
  }
  const utf16 = bytes[0] === 0xff && bytes[1] === 0xfe;
  return new TextDecoder(utf16 ? "utf-16le" : "utf-8").decode(bytes);
}

export default function ReportPage({ locale, example }: { locale?: string; example?: boolean } = {}) {
  if (locale) setLang(locale);
  const isExample = example ?? (typeof location !== "undefined" && /\/report\/example\/?$/.test(location.pathname));
  return isExample ? <ExamplePage /> : <ReportFlow />;
}

function ReportFlow() {
  const [step, setStep] = useState<Step>("landing");
  const demoRef = useRef(false);
  useEffect(() => { at(demoRef.current ? `demo_${step}` : step); }, [step]);
  const [os, setOs] = useState<"ios" | "android" | "desktop">("ios");
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [chat, setChat] = useState<ParsedChat | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [me, setMe] = useState("");
  const [relation, setRelation] = useState("");
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [demo, setDemo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // A report from an earlier visit on this device (id only; reports live 30 days).
  const [last, setLast] = useState<{ id: string; ts: number } | null>(null);
  useEffect(() => {
    try { const v = JSON.parse(store.get("rp-last") || "null"); if (v && /^[0-9a-f]{32}$/.test(v.id) && Date.now() - v.ts < 29 * 86400000 && !new URLSearchParams(location.search).get("r")) setLast(v); } catch { /* ignore */ }
  }, []);
  const [reportId, setReportId] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [viz, setViz] = useState<Viz | null>(null);
  const [counts, setCounts] = useState<Record<string, Record<string, number>> | undefined>();
  const [reportError, setReportError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  // One "visit" ping per browser session → Telegram (country from time zone, source from referrer). Nothing stored.
  useEffect(() => {
    // One visit per device every 12 h (Android restores old tabs when Chrome opens; those aren't new visits).
    try {
      const last = Number(localStorage.getItem("rp-visit-at") || 0);
      if (Date.now() - last < 12 * 3600 * 1000) return;
      localStorage.setItem("rp-visit-at", String(Date.now()));
    } catch { /* private mode: still ping once */ }
    let ref = "";
    try {
      if (document.referrer) {
        const u = new URL(document.referrer);
        if (u.hostname !== location.hostname) ref = u.hostname;
        else {
          const g = u.pathname.match(/\/guides\/([^/]+)/);
          ref = g ? `guía: ${g[1]}` : /^\/([a-z]{2}\/)?$/.test(u.pathname) ? "la portada" : `web: ${u.pathname}`;
        }
      }
    } catch { /* ignore */ }
    const utm = new URLSearchParams(location.search).get("utm_source");
    track("page_view", { source: (utm || ref || "directo").slice(0, 60) });
    if (!INTERNAL) fetch(`${API}/chat/visit`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tz: Intl.DateTimeFormat().resolvedOptions().timeZone, lang: navigator.language, ref: utm || ref }) }).catch(() => {});
  }, []);

  // Coming back from Stripe (or opening the private link): ?r=<id>[&session_id=…]
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const id = q.get("r");
    if (!id || !/^[0-9a-f]{32}$/.test(id)) return;
    setReportId(id); setStep("report");
    store.set("rp-last", JSON.stringify({ id, ts: Date.now() }));
    const sid = q.get("session_id");
    if (q.get("c") === "1") { track("checkout_cancel"); history.replaceState(null, "", `${location.pathname}?r=${id}`); }
    else if (!sid) track("report_link_open");
    const c = store.get(`rp-counts-${id}`); if (c) try { setCounts(JSON.parse(c)); } catch { /* ignore */ }
    (async () => {
      if (sid) {
        const r = await fetch(`${API}/chat/report/${id}/unlock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sid }) });
        if (r.ok) { track("purchase"); const d = await r.json(); setReport(d.report); if (d.viz) setViz(d.viz); history.replaceState(null, "", `${location.pathname}?r=${id}`); return; }
        setPayError(tr("errPay"));
      }
      poll(id);
    })();
  }, []);

  async function poll(id: string) {
    for (let k = 0; k < 90; k++) {
      try {
        const r = await fetch(`${API}/chat/report/${id}`);
        if (r.status === 404) { setReportError(tr("errGone")); return; }
        const d = await r.json();
        if (d.viz) setViz(d.viz);
        if (d.status === "ready") { if (k > 0) track("report_ready"); setReport(d.report); return; }
        if (d.status === "error") { setReportError(tr("errGen")); return; }
      } catch { /* network blip: keep polling */ }
      await new Promise(res => setTimeout(res, 4000));
    }
    setReportError(tr("errSlow"));
  }

  async function startReport(given?: boolean, retry = false) {
    if (!chat || !stats || !(given ?? consent) || (reportId && !retry)) return;
    const v = { ...buildViz(stats, me), stories: buildStories(stats, me) }; setViz(v);
    const sample = sampleChat(chat, stats);
    const lang = (document.documentElement.lang || "es").slice(0, 2);
    const fmt = (d: Date) => d.toLocaleDateString(loc(), { day: "numeric", month: "long", year: "numeric" });
    try {
      const r = await fetch(`${API}/chat/report`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: safeName(me, chat.participants), relation: relLabel(relation), question, context, language: lang,
          historyNote: stats.historyMayBeIncomplete ? tr("historyNote", { d: fmt(stats.first) }) : "",
          stats: JSON.stringify(statsForPrompt(stats, chat.participants)), transcript: sample.transcript, viz: maskNames(JSON.stringify(v), chat.participants),
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const { id } = await r.json();
      track("report_requested", { msgs: bucket(stats.total) });
      store.set("rp-last", JSON.stringify({ id, ts: Date.now() }));
      setReportId(id);
      history.replaceState(null, "", `${location.pathname}?r=${id}`);
      poll(id);
    } catch (e) {
      track("report_failed", { reason: String((e as Error).message).slice(0, 20) });
      setReportError(String((e as Error).message) === "429" ? tr("errMany") : tr("errStart"));
    }
  }

  // With the chat still in memory, only show bubbles that really exist in it.
  const shown = useMemo(() => (report && chat ? verifyQuotes(report, chat).report : report), [report, chat]);

  // Funnel: did they see the paywall, or the full report?
  const seenRef = useRef("");
  useEffect(() => {
    if (!report || step !== "report") return;   // only when it's actually on screen (not while still in the stories)
    const kind = report.chapters.some(c => (c as { locked?: boolean }).locked) ? "paywall_view" : "report_read";
    if (seenRef.current !== kind) { seenRef.current = kind; track(kind); }
    at(kind === "paywall_view" ? "paywall" : "report_read");
  }, [report, step]);
  useEffect(() => { if (step === "report" && !consent && !reportId) at("no_consent_stats"); }, [step, consent, reportId]);

  // Count the private-dictionary terms in the WHOLE chat once the report arrives.
  useEffect(() => {
    if (!report || !chat || !reportId) return;
    const terms = report.chapters.flatMap(c => (c as { dictionary?: { term: string }[] }).dictionary?.map(d => d.term) ?? []);
    if (!terms.length) return;
    const c = countTerms(chat, terms); setCounts(c); store.set(`rp-counts-${reportId}`, JSON.stringify(c));
  }, [report, chat, reportId]);

  async function pay() {
    at("stripe");
    setPaying(true); setPayError(""); track("checkout_click");
    try {
      const r = await fetch(`${API}/chat/report/${reportId}/checkout`, { method: "POST" });
      const d = await r.json();
      if (d.url) { location.href = d.url; return; }
      if (d.paid) { poll(reportId); return; }
      throw new Error();
    } catch { setPayError(tr("errCheckout")); }
    setPaying(false);
  }

  useEffect(() => { window.scrollTo(0, 0); }, [step]);
  useEffect(() => {
    if (/Android/i.test(navigator.userAgent)) setOs("android");
    else if (!/iPhone|iPad|Mobile/i.test(navigator.userAgent) && matchMedia("(min-width: 900px)").matches) setOs("desktop");
  }, []);

  /** "Try it with an example chat": made-up chat (es / it; other languages get the Spanish one with their example's names). */
  async function startDemo() {
    track("sample_open", { from: "demo_start" }); setBusy(true); setError("");
    try {
      const L = pageLang();
      const raw = await (await fetch(`/assets/demo/chat-${L === "it" ? "it" : "es"}.txt`)).text();
      const names = ({ en: ["Emma", "Jake"], fr: ["Camille", "Hugo"], de: ["Lena", "Jonas"], pl: ["Zosia", "Kuba"] } as Record<string, string[]>)[L];
      const txt = names ? raw.split("] Marta:").join(`] ${names[0]}:`).split("] Iván:").join(`] ${names[1]}:`) : raw;
      const parsed = parseChat(txt);
      setChat(parsed); setStats(computeStats(parsed)); setMe(L === "it" ? "Giulia" : names ? names[0] : "Marta");
      demoRef.current = true; setDemo(true); setConsent(false); setStep("stories");
    } catch { setError(tr("errRead")); }
    setBusy(false);
  }
  function endDemo() { demoRef.current = false; setDemo(false); setChat(null); setStats(null); setMe(""); setStep("landing"); track("sample_open", { from: "demo_mine" }); }

  async function onFile(file?: File) {
    if (!file) { at("landing"); return; }
    setError(""); setBusy(true);
    let fmtShape = "";
    try {
      const raw = await readExport(file);
      const parsed = parseChat(raw);
      if (parsed.participants.length === 0) { fmtShape = shape(raw.split(/\r?\n/).find(l => /\d/.test(l)) ?? ""); throw new Error("format"); }
      if (parsed.participants.length < 2) throw new Error("solo");
      if (parsed.messages.length < 20) throw new Error("short");
      // Group chats: 3+ people who each write at least 5 % → the 1:1 report would be wrong.
      const per = new Map<string, number>();
      for (const m of parsed.messages) per.set(m.author, (per.get(m.author) ?? 0) + 1);
      if ([...per.values()].filter(n => n >= parsed.messages.length * 0.05).length >= 3) throw new Error("group");
      setChat(parsed); setStats(computeStats(parsed)); setStep("count");
      track("upload_ok", { msgs: bucket(parsed.messages.length), people: parsed.participants.length, os: /Android/i.test(navigator.userAgent) ? "android" : /iPhone|iPad/i.test(navigator.userAgent) ? "ios" : "desktop" });
    } catch (e) {
      const reason = String((e as Error).message);
      track("upload_error", { reason: ["no-chat", "solo", "short", "group"].includes(reason) ? reason : "format", count: bucket(file.size / 1024), ...(fmtShape ? { shape: fmtShape } : {}) });
      at("upload_error");
      setError(reason === "no-chat" ? tr("errNoChat") : reason === "group" ? tr("errGroup") : reason === "short" ? tr("errShort") : reason === "solo" ? tr("errSolo") : reason === "format" ? tr("errFormat") : tr("errRead"));
    } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  const other = stats?.people.find(p => p.name !== me);
  const meName = me ? me.split(" ")[0] : "";
  const otherName = other ? other.name.split(" ")[0] : "";

  return (
    <div className="rp">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" />
      <div className={`rp-shell rp-at-${step}`}>
        {step === "landing" && (
          <section className={`rp-screen rp-dark rp-pad rp-hero${drag ? " rp-drag" : ""}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0]); }}>
            <div className="rp-hero-copy">
              <a className="rp-brand" href={homePath()}><i />Clarity Chat</a>
              {last && <a className="rp-resume" href={`?r=${last.id}`} onClick={() => track("resume_click")}><Clara size={28} mood="soft" /><span>{tr("resumeT", { d: new Date(last.ts).toLocaleDateString(loc(), { day: "numeric", month: "long" }) })}</span><b>{tr("resumeBtn")} →</b></a>}
              <div className="rp-hello"><Clara size={64} /><span>{tr("hello1")}<br />{tr("hello2")}</span></div>
              <h1>{tr("h1a")}<em>{tr("h1em")}</em>{tr("h1b")}</h1>
              <p className="rp-muted">{tr("lead")}</p>
              {new Date() < new Date(2027, 0, 1) && <p className="rp-wrapped-line">{tr("wrappedLine")}</p>}
              <input ref={fileRef} type="file" accept=".zip,.txt,application/zip,application/x-zip-compressed,text/plain" hidden onChange={e => onFile(e.target.files?.[0])} />
              <button className="rp-btn rp-main" disabled={busy} onClick={() => { track("upload_click"); at("file_picker"); fileRef.current?.click(); }}>{busy ? tr("reading") : tr("upload")}</button>
              <p className="rp-drop-hint">{tr("dropHint")}</p>
              <button className="rp-btn rp-ghost rp-demo-btn" disabled={busy} onClick={startDemo}>{tr("demoBtn")}</button>
              {error && <p className="rp-error" role="alert" ref={el => { el?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>{error}</p>}
              <ul className="rp-ladder"><li dangerouslySetInnerHTML={{ __html: tr("ladderFree") }} /><li dangerouslySetInnerHTML={{ __html: tr("ladderPaid") }} /></ul>
              <div className="rp-how">
                <p className="rp-how-h">{tr("howHead")}</p>
                <div className="rp-tabs" role="tablist">
                  <button role="tab" aria-selected={os === "ios"} onClick={() => setOs("ios")}>iPhone</button>
                  <button role="tab" aria-selected={os === "android"} onClick={() => setOs("android")}>Android</button>
                  <button role="tab" aria-selected={os === "desktop"} onClick={() => setOs("desktop")}>{tr("tabDesktop")}</button>
                </div>
                {os === "ios" && <><VisualSteps os="ios" /><p className="rp-how-tip" dangerouslySetInnerHTML={{ __html: tr("iosTip") }} /></>}
                {os === "android" && <><VisualSteps os="android" /><p className="rp-how-tip" dangerouslySetInnerHTML={{ __html: tr("andTip") }} /></>}
                {os === "desktop" && <Steps ids={["desk1", "desk2", "desk3"]} />}
              </div>
              <div className="rp-trust"><span>{tr("trustFree")}</span><span>{tr("trustTime")}</span><span>{tr("trustPrivate")}</span></div>
              <a className="rp-example-link" href={exampleHref()} onClick={() => track("sample_open", { from: "landing" })}>{tr("seeExample")}</a>
              <div className="rp-demo-mobile" aria-hidden="true"><DemoPhone /></div>
              <p className="rp-lock">{tr("lock")}</p>
              <section className="rp-faq">
                <h2>{tr("faqTitle")}</h2>
                {[1, 2, 3, 4].map(k => <details key={k} onToggle={e => { if ((e.currentTarget as HTMLDetailsElement).open) track("faq_open", { value: k }); }}><summary>{tr(`faq${k}q`)}</summary><p>{tr(`faq${k}a`)}</p></details>)}
              </section>
            </div>
            <div className="rp-hero-demo" aria-hidden="true"><DemoPhone /></div>
          </section>
        )}

        {step === "count" && stats && chat && (
          <Counter stats={stats} names={stats.people.map(p => p.name)} onPick={n => { setMe(n); setStep("setup"); track("who_selected"); }} />
        )}

        {step === "setup" && stats && (
          <Setup meName={meName} otherName={otherName}
            relation={relation} setRelation={setRelation} question={question} setQuestion={setQuestion}
            context={context} setContext={setContext} email={email} setEmail={setEmail}
            consent={consent} setConsent={setConsent} short={stats.total < 150}
            onDone={(given: boolean) => { setConsent(given); startReport(given); setStep("stories"); }} />
        )}

        {step === "stories" && (stats || viz?.stories) && <Stories note={demo ? tr("demoBanner") : undefined} endLabel={demo || (!consent && !reportId) ? tr("seeAllNumbers") : undefined} stories={stats ? buildStories(stats, me, demo || (!consent && !reportId)) : (viz!.stories as Story[])} lines={consent && stats && !report ? waitingLines(stats, me) : []} ready={!!report} onDone={() => setStep("report")} />}

        {step === "report" && (
          <section className="rp-screen rp-pad rp-letter">
            {report && (stats || viz?.stories?.length) ? <button className="rp-stories-again" onClick={() => setStep("stories")}>{tr("seeStories")}</button> : null}
            {shown ? <ReportView report={shown} viz={viz} counts={counts} onPay={pay} paying={paying} payError={payError} question={question} relation={relation} />
              : reportError ? <><h1>{tr("oops")}</h1><p className="rp-error" role="alert">{reportError}</p>
                  {stats && chat && <button className="rp-btn rp-main" onClick={() => { setReportError(""); setReportId(""); startReport(true, true); }}>{tr("retry")}</button>}</>
              : demo && stats ? <>
                  <p className="rp-demo-banner">{tr("demoBanner")}</p>
                  <div className="rp-pitch"><Clara size={44} mood="soft" /><div>
                    <p>{tr("demoEnd")}</p>
                    <a className="rp-btn rp-teal" href={exampleHref()} onClick={() => track("sample_open", { from: "demo_end" })}>{tr("demoSeeReport")}</a>
                    <button className="rp-btn rp-main" onClick={endDemo}>{tr("demoMine")}</button>
                  </div></div>
                  <Numbers viz={{ ...buildViz(stats, me), stories: buildStories(stats, me, true) }} />
                  <button className="rp-btn rp-main" onClick={endDemo}>{tr("demoMine")}</button></>
              : !reportId && !consent ? <>
                  {stats && <div className="rp-pitch rp-pitch-top"><Clara size={36} mood="soft" /><div>
                    <p>{tr("topPitch")}</p>
                    <button className="rp-btn rp-main" onClick={() => { track("consent", { value: "yes", step: "late_top" }); setConsent(true); startReport(true); }}>{tr("topPitchBtn")}</button>
                  </div></div>}
                  {stats && <Numbers viz={{ ...buildViz(stats, me), stories: buildStories(stats, me, true) }} />}
                  <div className="rp-pitch"><Clara size={44} mood="soft" /><div>
                    <p>{tr("noConsentPitch", { T: otherName })}</p>
                    <p className="rp-hint">{tr("consentSend")} {tr("consentPrivate")}</p>
                    <details className="rp-how"><summary>{tr("consentHow")}</summary><p>{tr("consentHowBody")} <a href={homePath() + "privacy/"} target="_blank" rel="noopener">{tr("privacy")} ↗</a></p></details>
                    {stats && <button className="rp-btn rp-main" onClick={() => { track("consent", { value: "yes", step: "late" }); setConsent(true); startReport(true); }}>{tr("consentYes")}</button>}
                  </div></div></>
              : <><WaitScreen lines={stats ? waitingLines(stats, me) : [tr("writing")]} />{viz && <Numbers viz={viz} />}</>}
          </section>
        )}
      </div>
    </div>
  );
}

function Counter({ stats, names, onPick }: { stats: Stats; names: string[]; onPick: (n: string) => void }) {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now(), dur = reduce ? 0 : 1600;
    let raf = 0;
    const step = (t: number) => {
      const p = dur ? Math.min(1, (t - t0) / dur) : 1;
      setN(Math.round(stats.total * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step); else { setDone(true); if (!reduce) confetti(canvas.current); }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [stats.total]);
  const nf = new Intl.NumberFormat(loc());
  const fmt = (d: Date) => d.toLocaleDateString(loc(), { day: "numeric", month: "long", year: "numeric" });
  const esc = (x: string) => x.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
  const shown = names.slice(0, 2);
  return (
    <section className="rp-screen rp-dark" style={{ position: "relative" }}>
      <canvas ref={canvas} className="rp-confetti" aria-hidden="true" />
      <div className="rp-pad rp-center">
        <p className="rp-muted">{done ? tr("gotIt") : tr("readingChat")}</p>
        <div className="rp-big">{nf.format(n)}</div>
        <p style={{ fontSize: 18, margin: 0 }}><span dangerouslySetInnerHTML={{ __html: tr("msgsBetween", { a: esc(shown[0] ?? ""), b: esc(shown[1] ?? "") }) + (names.length > 2 ? esc(tr("andMore", { n: names.length - 2 })) : "") }} /><br />
          <span className="rp-muted rp-small">{tr("fromTo", { a: fmt(stats.first), b: fmt(stats.last) })}</span></p>
        {done && (
          <div className="rp-who">
            <p>{tr("whoAreYou")}</p>
            {stats.people.map(p => <button key={p.name} onClick={() => onPick(p.name)}>{p.name} <span>{tr("nMessages", { n: nf.format(p.messages) })}</span></button>)}
          </div>
        )}
      </div>
    </section>
  );
}

function confetti(c: HTMLCanvasElement | null) {
  if (!c) return;
  const r = c.getBoundingClientRect(); c.width = r.width; c.height = r.height;
  const x = c.getContext("2d")!, cols = ["#42c5ca", "#ff8b45", "#f3f7fb", "#ffd166"];
  const ps = Array.from({ length: 110 }, () => ({ x: r.width / 2, y: r.height * .4, vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 3, s: Math.random() * 6 + 4, c: cols[Math.random() * 4 | 0], a: Math.random() * 6 }));
  let f = 0;
  const tick = () => {
    x.clearRect(0, 0, c.width, c.height);
    for (const p of ps) { p.vy += .32; p.x += p.vx; p.y += p.vy; p.a += .2; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); }
    if (++f < 140) requestAnimationFrame(tick); else x.clearRect(0, 0, c.width, c.height);
  };
  tick();
}

function Stories({ stories, lines, ready, onDone, note, endLabel }: { stories: Story[]; lines: string[]; ready: boolean; onDone: () => void; note?: string; endLabel?: string }) {
  const line = useRotating(lines, 3200);
  const [i, setI] = useState(0);
  const finish = () => { track("stories_done", { count: Math.min(i + 1, stories.length) }); onDone(); };
  const [paused, setPaused] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const canShareFiles = typeof navigator !== "undefined" && !!(navigator as Navigator & { canShare?: (d: ShareData) => boolean }).canShare?.({ files: [new File([""], "x.png", { type: "image/png" })] });
  const s = stories[i];
  useEffect(() => {
    if (paused || sharing) return;
    const t = setTimeout(() => (i < stories.length - 1 ? setI(i + 1) : finish()), 6500);
    return () => clearTimeout(t);
  }, [i, paused, sharing, stories.length, onDone]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); i < stories.length - 1 ? setI(i + 1) : finish(); }
      if (e.key === "ArrowLeft") setI(Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, stories.length, onDone]);
  const visual = useMemo(() => s.visual ? <StoryVisual v={s.visual} /> : null, [s]);
  return (
    <section className="rp-screen rp-story" onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerCancel={() => setPaused(false)}>
      <div className="rp-bars">{stories.map((_, k) => <i key={k}><b className={k < i ? "done" : k === i ? (paused || sharing ? "hold" : "on") : ""} key={`${k}-${i}`} /></i>)}</div>
      {note && <div className="rp-writing rp-demo-note">{note}</div>}
      {lines.length > 0 && <div className="rp-writing">{ready ? <>{tr("reportReady")}</> : <><span className="rp-dot" /><span key={line}>{line}</span></>}</div>}
      <div className="rp-slide" key={i}>
        <div className="rp-kicker">{s.kicker}</div>
        {s.big && <div className="rp-num">{s.big}</div>}
        <h2 dangerouslySetInnerHTML={{ __html: s.title }} />
        {visual}
        {s.body && <p dangerouslySetInnerHTML={{ __html: s.body }} />}
      </div>
      <div className="rp-wm">claritychat.app</div>
      <button className="rp-tap rp-prev" aria-label={tr("prev")} onClick={() => setI(Math.max(0, i - 1))} />
      <button className="rp-tap rp-next" aria-label={tr("nextStory")} onClick={() => (i < stories.length - 1 ? setI(i + 1) : finish())} />
      <button className="rp-arrow rp-arrow-l" aria-label={tr("prev")} onClick={() => setI(Math.max(0, i - 1))}>‹</button>
      <button className="rp-arrow rp-arrow-r" aria-label={tr("nextStory")} onClick={() => (i < stories.length - 1 ? setI(i + 1) : finish())}>›</button>
      <div className="rp-story-foot">
        <button className="rp-btn rp-ghost" onClick={() => setSharing(true)}>{tr("share")}</button>
        <button className="rp-btn rp-teal" onClick={finish}>{endLabel ?? tr("toReport")}</button>
      </div>
      {sharing && (
        <div className="rp-sheet" onClick={() => setSharing(false)}>
          <div className="rp-sheet-in" onClick={e => e.stopPropagation()}>
            <div className="rp-card916">
              <div className="k">{tr("cardHead")}</div>
              <div className="t" dangerouslySetInnerHTML={{ __html: s.card }} />
              <div className="f"><span>claritychat.app</span><span>{tr("yours")}</span></div>
            </div>
            <button className="rp-btn rp-main" disabled={saving} onClick={async () => {
              setSaving(true);
              try { const r = await shareCard(s); track("share_card", { value: r }); setSaved(r === "downloaded" ? tr("imgDownloaded") : r === "shared" ? tr("done") : ""); }
              catch { setSaved(tr("imgFail")); }
              setSaving(false);
            }}>{saving ? tr("imgMaking") : canShareFiles ? tr("imgShare") : tr("imgDownload")}</button>
            {saved && <p className="rp-hint" style={{ textAlign: "center" }}>{saved}</p>}
            <button className="rp-btn rp-ghost-ink" onClick={() => { setSharing(false); setSaved(""); }}>{tr("close")}</button>
          </div>
        </div>
      )}
    </section>
  );
}


const WORRIES_LOVE = ["w_pull", "w_interest", "w_cold", "w_what", "w_fix", "w_curious"];
const WORRIES: Record<string, string[]> = {
  ex: ["w_ex_why", "w_ex_first", "w_ex_fault", "w_ex_love", "w_ex_back", "w_ex_move"],
  almost: ["w_al_like", "w_al_why", "w_al_back", "w_al_try", "w_curious"],
  friend: ["w_care", "w_apart", "w_pull", "w_what", "w_fix", "w_curious"],
  family: ["w_listen", "w_argue", "w_pull", "w_what", "w_fix", "w_curious"],
  work: ["w_respect", "w_healthy", "w_hard", "w_what", "w_limits", "w_curious"],
};
const OUTSIDE = ["o_phone", "o_person", "o_fight", "o_nocontact", "o_nothing"];

function Steps({ ids }: { ids: string[] }) {
  return <ol>{ids.map(id => <li key={id} dangerouslySetInnerHTML={{ __html: tr(id) }} />)}</ol>;
}

/** The words in <b> of a step, e.g. "Exportar chat", "Sin archivos" — so the drawn screens use the same labels as WhatsApp in each language. */
const bold = (id: string) => [...tr(id).matchAll(/<b>(.*?)<\/b>/g)].map(m => m[1]);

/** Export how-to as three tiny drawn phone screens (not real WhatsApp screenshots), the thing to tap highlighted. */
function VisualSteps({ os }: { os: "ios" | "android" }) {
  const ids = os === "ios" ? ["ios1", "ios2", "ios3"] : ["and1", "and2", "and3"];
  const [exp, noMedia] = os === "ios" ? bold("ios2") : [bold("and1")[2], bold("and2")[0]];
  const save = os === "ios" ? bold("ios3")[0] : "Drive";
  const header = (tapName: boolean, dots: boolean) => (
    <div className="ms-head"><i className="ms-back" /><i className="ms-av" /><span className={tapName ? "ms-tap" : ""}>Dani</span>{dots && <b className="ms-dots ms-tap">⋮</b>}</div>
  );
  const screens = os === "ios" ? [
    <>{header(true, false)}<div className="ms-b them" /><div className="ms-b me" /><div className="ms-b them s" /></>,
    <><div className="ms-list"><i /><i /><i /><span className="ms-row ms-tap">{exp}</span></div><div className="ms-sheet"><span className="ms-row ms-tap">{noMedia}</span><i /></div></>,
    <><div className="ms-sheet up"><div className="ms-icons"><i /><i /><i /><i /></div><span className="ms-row ms-tap">📁 {save}</span><i /></div></>,
  ] : [
    <>{header(false, true)}<div className="ms-menu"><i /><i /><span className="ms-row">{bold("and1")[1]} ›</span><span className="ms-row ms-tap">{exp}</span></div><div className="ms-b them s" /></>,
    <><div className="ms-b them" /><div className="ms-dialog"><span className="ms-row ms-tap">{noMedia}</span><i /></div></>,
    <><div className="ms-sheet up"><div className="ms-icons"><i className="ms-tap" /><i /><i /><i /></div><span className="ms-row ms-tap">{save}</span></div></>,
  ];
  return (
    <ol className="ms-steps">{ids.map((id, k) => (
      <li key={id}><div className="ms-phone" aria-hidden="true"><span className="ms-n">{k + 1}</span>{screens[k]}</div><p dangerouslySetInnerHTML={{ __html: tr(id) }} /></li>
    ))}</ol>
  );
}

function Setup(p: {
  meName: string; otherName: string; relation: string; setRelation: (v: string) => void;
  question: string; setQuestion: (v: string) => void; context: string; setContext: (v: string) => void;
  email: string; setEmail: (v: string) => void; consent: boolean; setConsent: (v: boolean) => void; onDone: (given: boolean) => void; short?: boolean;
}) {
  const [q, setQ] = useState(0);              // current step: 0 relation · 1 worry · 2 outside · 3 consent
  const [typing, setTyping] = useState(false);
  // A random example report each time (written examples, not AI, not the user's chat).
  const [pick] = useState(() => { let n = 1; try { n = Number(sessionStorage.getItem("rp-ex")) || (Math.random() < 0.5 ? 1 : 3); sessionStorage.setItem("rp-ex", String(n)); } catch { /* private mode */ } return n; });
  // An ex / almost-something sees the "three silences" example (it fits a breakup); others keep the A/B pick.
  const n = p.relation === "ex" || p.relation === "almost" ? 3 : pick;
  const preview = n === 1 ? { n, t: "previewTitle", l: "previewLine" } : { n, t: `previewTitle${n}`, l: `previewLine${n}` };
  useEffect(() => { if (q === 3) track("consent_view", { ex: `ex${preview.n}` }); at(["setup_relation", "setup_worry", "setup_outside", "consent"][q] ?? "setup"); }, [q]);
  const decide = (yes: boolean) => { track("consent", { value: yes ? "yes" : "no", step: `ex${preview.n}` }); p.onDone(yes); };
  const end = useRef<HTMLDivElement>(null);
  const askRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setTyping(false); (q === 3 ? askRef.current : end.current)?.scrollIntoView({ behavior: "smooth", block: q === 3 ? "start" : "end" }); }, [q]);
  const toggle = (cur: string, v: string, set: (x: string) => void) => {
    const parts = cur ? cur.split(" · ") : [];
    set(parts.includes(v) ? parts.filter(x => x !== v).join(" · ") : [...parts, v].join(" · "));
  };
  const Ask = ({ children, html }: { children?: ReactNode; html?: string }) => (
    <div className="rp-ask-row"><Clara size={34} />{html ? <div className="rp-ask" dangerouslySetInnerHTML={{ __html: html }} /> : <div className="rp-ask">{children}</div>}</div>
  );
  const Reply = ({ text }: { text: string }) => <div className="rp-reply">{text}</div>;
  const chips = (ids: string[], value: string, set: (v: string) => void) => (
    <div className="rp-opts rp-opts-text">{ids.map(id => tr(id)).map(w =>
      <button key={w} aria-pressed={value.split(" · ").includes(w)} onClick={() => toggle(value, w, set)}>{w}</button>)}</div>
  );
  const free = (value: string, set: (v: string) => void, ph: string) => typing
    ? <textarea className="rp-say" rows={2} autoFocus value={value} onChange={e => set(e.target.value)} placeholder={ph} />
    : <button className="rp-linkbtn" onClick={() => setTyping(true)}>{tr("writeOwn")}</button>;
  return (
    <section className="rp-screen rp-dark rp-pad rp-convo">
      <div className="rp-steps" aria-label={`${Math.min(q + 1, 4)} / 4`}>{[0, 1, 2, 3].map(k => <i key={k} className={k < q ? "done" : k === q ? "on" : ""} />)}</div>
      <div className="rp-ask-row rp-ask-first"><Clara size={34} mood="soft" /><div className="rp-ask">{tr("ask0", { me: p.meName })}</div></div>

      <Ask html={tr("askRel", { other: p.otherName.replace(/[&<>"]/g, "") })} />
      {q === 0
        ? <div className="rp-opts">{RELATIONS.map(([, r]) => <button key={r} aria-pressed={p.relation === r} onClick={() => { p.setRelation(r); setQ(1); track("setup_relation", { value: r }); }}>{relLabel(r)}</button>)}</div>
        : <Reply text={relLabel(p.relation)} />}

      {q >= 1 && <>
        <Ask>{tr("askWorry")}</Ask>
        {q === 1 ? <>
          {chips(WORRIES[p.relation] ?? WORRIES_LOVE, p.question, p.setQuestion)}
          {free(p.question, p.setQuestion, tr("sayWorry"))}
          <button className="rp-btn rp-teal" onClick={() => { setQ(2); track("setup_worry", { value: p.question ? "answered" : "skipped" }); }}>{p.question ? tr("next") : tr("ratherNot")}</button>
        </> : (p.question ? <Reply text={p.question} /> : <Reply text={tr("ratherNot")} />)}
      </>}

      {q >= 2 && <>
        <Ask>{tr("askOutside")}</Ask>
        {q === 2 ? <>
          {chips(OUTSIDE, p.context, p.setContext)}
          {free(p.context, p.setContext, tr("sayOutside"))}
          <button className="rp-btn rp-teal" onClick={() => { setQ(3); track("setup_outside", { value: p.context ? "answered" : "skipped" }); }}>{tr("next")}</button>
        </> : (p.context ? <Reply text={p.context} /> : null)}
      </>}

      {q >= 3 && <>
        <div ref={askRef} className="rp-anchor" />
        <Ask>{tr("askReport")}</Ask>
        <div className="rp-ask-row"><Clara size={34} /><div className="rp-ask rp-consent-card">
          <div className="rp-preview" aria-hidden="true">
            <span className="rp-preview-k">{tr("previewLabel")}</span>
            <b>{tr(preview.t)}</b>
            <p>{tr(preview.l)}</p>
            <div className="rp-preview-blur"><i style={{ width: "92%" }} /><i style={{ width: "84%" }} /><i style={{ width: "88%" }} />
              <svg viewBox="0 0 300 60" width="100%" height="46"><polyline points="0,45 40,35 80,38 120,20 160,28 200,12 240,22 300,8" fill="none" stroke="#42c5ca" strokeWidth="4" /><polyline points="0,50 40,48 80,50 120,38 160,42 200,32 240,36 300,28" fill="none" stroke="#ff8b45" strokeWidth="4" /></svg>
              <i style={{ width: "76%" }} /><i style={{ width: "90%" }} /></div>
          </div>
          <a className="rp-example-link" href={exampleHref()} target="_blank" rel="noopener" onClick={() => track("sample_open", { from: "consent" })}>{tr("seeExample")}</a>
          {p.short && <p className="rp-short-note">{tr("shortNote")}</p>}
          <strong>{tr("benefitTitle")}</strong>
          <ul className="rp-benefits">
            <li><Icon name="book" /><span>{tr("benefitStory")}</span></li>
            <li><Icon name="eye" /><span>{tr("benefitTruth")}</span></li>
            <li><Icon name="compass" /><span>{tr("benefitNext")}</span></li>
          </ul>
          <strong className="rp-consent-sub">{tr("privacyTitle")}</strong>
          <ul>
            <li><Icon name="send" /><span>{tr("consentSend")}</span></li>
            <li><Icon name="lock" /><span>{tr("consentPrivate")}</span></li>
            <li><Icon name="tag" /><span>{tr("consentPrice")}</span></li>
          </ul>
          <details className="rp-how" onToggle={e => { if ((e.target as HTMLDetailsElement).open) track("faq_open", { from: "consent_ai" }); }}>
            <summary>{tr("consentHow")}</summary>
            <p>{tr("consentHowBody")} <a href={homePath() + "privacy/"} target="_blank" rel="noopener">{tr("privacy")} ↗</a></p>
          </details>
        </div></div>
        <div className="rp-consent-actions">
          <button className="rp-btn rp-main" onClick={() => decide(true)}><Icon name="check" />{tr("consentYes")}</button>
          <p className="rp-yes-hint">{tr("consentYesHint")}</p>
          <button className="rp-linkbtn" onClick={() => decide(false)}>{tr("statsOnly")}</button>
        </div>
      </>}
      <div ref={end} />
    </section>
  );
}

function useRotating(lines: string[], ms: number) {
  const [k, setK] = useState(0);
  useEffect(() => {
    if (lines.length < 2) return;
    const t = setInterval(() => setK(x => Math.min(x + 1, lines.length - 1)), ms);
    return () => clearInterval(t);
  }, [lines.length, ms]);
  return lines[k] ?? "";
}

function WaitScreen({ lines }: { lines: string[] }) {
  const line = useRotating(lines, 3200);
  return (
    <div className="rp-wait">
      <Clara size={88} mood="soft" />
      <h1 key={line} className="rp-wait-line">{line}</h1>
      <p className="rp-muted">{tr("waitNote")}</p>
    </div>
  );
}

type Demo = { kicker: string; emoji: string; bg: string; big?: string; title: string; body?: ReactNode; extra?: ReactNode };
const html = (id: string) => <span dangerouslySetInnerHTML={{ __html: tr(id) }} />;
function demos(): Demo[] {
  const nf = new Intl.NumberFormat(loc());
  return [
    { kicker: tr("d_sil_k"), emoji: "🤐", bg: "linear-gradient(160deg,#2b1055 0%,#071626 70%)", title: tr("d_sil_t"),
      extra: <div className="rp-sil">{[[12, "03/02"], [9, "21/03"], [7, "14/04"], [6, "02/05"], [5, "30/05"]].map(([d, f]) => <div key={f}><em>{tr("d_days", { n: d })}</em><span>{tr("d_since", { d: f })}</span><span>{tr("you")}</span></div>)}</div> },
    { kicker: tr("d_reply_k"), emoji: "⏳", bg: "linear-gradient(160deg,#5a1f0b 0%,#071626 70%)", big: "38 min", title: tr("d_reply_t"), body: html("d_reply_b") },
    { kicker: tr("d_love_k"), emoji: "💘", bg: "linear-gradient(160deg,#6b0f3a 0%,#071626 72%)", big: "23–4", title: tr("d_love_t"), body: html("d_love_b") },
    { kicker: tr("d_start_k"), emoji: "👋", bg: "linear-gradient(160deg,#123d7a 0%,#071626 70%)", big: tr("d_start_big"), title: tr("d_start_t"), body: html("d_start_b") },
    { kicker: tr("d_laugh_k"), emoji: "😂", bg: "linear-gradient(160deg,#5b4a0b 0%,#071626 70%)", big: nf.format(1284), title: tr("d_laugh_t"), body: html("d_laugh_b") },
    { kicker: tr("d_rec_k"), emoji: "🔥", bg: "linear-gradient(160deg,#0b4a52 0%,#071626 70%)", big: "312", title: tr("d_rec_t"), body: html("d_rec_b") },
  ];
}

function DemoPhone() {
  const DEMOS = useMemo(demos, []);
  const [order, setOrder] = useState<number[]>(() => DEMOS.map((_, k) => k));
  const [i, setI] = useState(0);
  useEffect(() => {
    const o = DEMOS.map((_, k) => k);
    for (let k = o.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [o[k], o[j]] = [o[j], o[k]]; }
    setOrder(o);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI(k => (k + 1) % DEMOS.length), 3800);
    return () => clearInterval(t);
  }, [DEMOS]);
  const d = DEMOS[order[i]];
  return (
    <div className="rp-phone" style={{ background: d.bg }}>
      <div className="rp-bars">{DEMOS.map((_, k) => <i key={k}><b className={k < i ? "done" : k === i ? "demo-on" : ""} key={`${k}-${i}`} /></i>)}</div>
      <div className="rp-slide" key={i}>
        <div className="rp-demo-emoji">{d.emoji}</div>
        <div className="rp-kicker">{d.kicker}</div>
        {d.big && <div className="rp-num">{d.big}</div>}
        <h2>{d.title}</h2>
        {d.extra}
        {d.body && <p>{d.body}</p>}
      </div>
    </div>
  );
}

/** Simple line icons (no emoji) for the consent step. */
function Icon({ name }: { name: "send" | "lock" | "tag" | "check" | "chart" | "book" | "eye" | "compass" }) {
  const d: Record<string, string> = {
    send: "M4 12l16-8-6 16-2.5-6.5L4 12z M11.5 13.5L20 4",
    lock: "M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3",
    tag: "M3 12V4h8l10 10-8 8L3 12z M7.5 8.5h.01",
    check: "M5 12.5l4.5 4.5L19 7.5",
    chart: "M5 20V10 M12 20V4 M19 20v-7",
    book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M15.5 8.5l-2 5-5 2 2-5z",
  };
  return <svg className="rp-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d[name]} /></svg>;
}

function ExamplePage() {
  const ex = exampleFor(typeof document !== "undefined" ? (document.documentElement.lang || "es").slice(0, 2) : "es");
  const first = (n: string) => n.split(" ")[0];
  const home = typeof location !== "undefined" ? location.pathname.replace(/example\/?$/, "") : "../";
  return (
    <div className="rp">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" />
      <div className="rp-shell rp-at-report">
        <section className="rp-screen rp-pad rp-letter">
          <p className="rp-ex-banner"><Clara size={30} mood="soft" /><span>{tr("exBanner", { a: first(ex.viz.me), b: first(ex.viz.other) })}</span></p>
          <ReportView report={ex.report} viz={ex.viz} onPay={() => {}} paying={false} example />
          <div className="rp-ex-cta"><a className="rp-btn rp-main" href={home} onClick={() => track("sample_open", { from: "example_cta" })}>{tr("exCta")}</a><p className="rp-hint">{tr("exCtaNote")}</p></div>
        </section>
      </div>
    </div>
  );
}
