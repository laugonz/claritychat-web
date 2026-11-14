import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { unzipSync } from "fflate";
import { buildViz, computeStats, countTerms, parseChat, safeName, sampleChat, statsForPrompt, type ParsedChat, type Stats, type Viz } from "../report/chat";
import { ReportView, type Report } from "../report/ReportView";
import { Clara } from "../report/Mascot";
import { StoryVisual } from "../report/StoryVisual";
import { shareCard } from "../report/shareCard";
import { buildStories, waitingLines, type Story } from "../report/stories";
import { homePath, loc, setLang, tr } from "../report/i18n";
import "../report/report.css";

type Step = "landing" | "count" | "setup" | "stories" | "report";
const RELATIONS: [string, string][] = [["💘", "partner"], ["💔", "ex"], ["🫣", "almost"], ["🤝", "friend"], ["🏡", "family"], ["💼", "work"]];
const relLabel = (id: string) => (id ? tr(`rel_${id}`) : "");
const API = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_REPORT_API) || "https://api.emotions-detector.com";
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

async function readExport(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  let bytes: Uint8Array = buf;
  if (file.name.toLowerCase().endsWith(".zip") || (buf[0] === 0x50 && buf[1] === 0x4b)) {
    const files = unzipSync(buf, { filter: f => f.name.toLowerCase().endsWith(".txt") && !f.name.includes("__MACOSX") });
    const name = Object.keys(files).find(n => n.endsWith("_chat.txt")) ?? Object.keys(files)[0];
    if (!name) throw new Error("no-chat");
    bytes = files[name];
  }
  const utf16 = bytes[0] === 0xff && bytes[1] === 0xfe;
  return new TextDecoder(utf16 ? "utf-16le" : "utf-8").decode(bytes);
}

export default function ReportPage({ locale }: { locale?: string } = {}) {
  if (locale) setLang(locale);
  const [step, setStep] = useState<Step>("landing");
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [reportId, setReportId] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [viz, setViz] = useState<Viz | null>(null);
  const [counts, setCounts] = useState<Record<string, Record<string, number>> | undefined>();
  const [reportError, setReportError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  // One "visit" ping per browser session → Telegram (country from time zone, source from referrer). Nothing stored.
  useEffect(() => {
    try { if (sessionStorage.getItem("rp-visit")) return; sessionStorage.setItem("rp-visit", "1"); } catch { /* private mode: still ping once */ }
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
    fetch(`${API}/chat/visit`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tz: Intl.DateTimeFormat().resolvedOptions().timeZone, lang: navigator.language, ref: utm || ref }) }).catch(() => {});
  }, []);

  // Coming back from Stripe (or opening the private link): ?r=<id>[&session_id=…]
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const id = q.get("r");
    if (!id || !/^[0-9a-f]{32}$/.test(id)) return;
    setReportId(id); setStep("report");
    const sid = q.get("session_id");
    const c = store.get(`rp-counts-${id}`); if (c) try { setCounts(JSON.parse(c)); } catch { /* ignore */ }
    (async () => {
      if (sid) {
        const r = await fetch(`${API}/chat/report/${id}/unlock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sid }) });
        if (r.ok) { const d = await r.json(); setReport(d.report); if (d.viz) setViz(d.viz); history.replaceState(null, "", `${location.pathname}?r=${id}`); return; }
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
        if (d.status === "ready") { setReport(d.report); return; }
        if (d.status === "error") { setReportError(tr("errGen")); return; }
      } catch { /* network blip: keep polling */ }
      await new Promise(res => setTimeout(res, 4000));
    }
    setReportError(tr("errSlow"));
  }

  async function startReport(given?: boolean) {
    if (!chat || !stats || !(given ?? consent) || reportId) return;
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
          stats: JSON.stringify(statsForPrompt(stats, chat.participants)), transcript: sample.transcript, viz: JSON.stringify(v),
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const { id } = await r.json();
      setReportId(id);
      history.replaceState(null, "", `${location.pathname}?r=${id}`);
      poll(id);
    } catch (e) {
      setReportError(String((e as Error).message) === "429" ? tr("errMany") : tr("errStart"));
    }
  }

  // Count the private-dictionary terms in the WHOLE chat once the report arrives.
  useEffect(() => {
    if (!report || !chat || !reportId) return;
    const terms = report.chapters.flatMap(c => (c as { dictionary?: { term: string }[] }).dictionary?.map(d => d.term) ?? []);
    if (!terms.length) return;
    const c = countTerms(chat, terms); setCounts(c); store.set(`rp-counts-${reportId}`, JSON.stringify(c));
  }, [report, chat, reportId]);

  async function pay() {
    setPaying(true); setPayError("");
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

  async function onFile(file?: File) {
    if (!file) return;
    setError(""); setBusy(true);
    try {
      const parsed = parseChat(await readExport(file));
      if (parsed.messages.length < 20 || parsed.participants.length < 2) throw new Error("empty");
      setChat(parsed); setStats(computeStats(parsed)); setStep("count");
    } catch (e) {
      setError((e as Error).message === "no-chat"
        ? tr("errNoChat")
        : tr("errRead"));
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
              <div className="rp-hello"><Clara size={64} /><span>{tr("hello1")}<br />{tr("hello2")}</span></div>
              <h1>{tr("h1a")}<em>{tr("h1em")}</em>{tr("h1b")}</h1>
              <p className="rp-muted">{tr("lead")}</p>
              <input ref={fileRef} type="file" accept=".zip,.txt,application/zip,text/plain" hidden onChange={e => onFile(e.target.files?.[0])} />
              <button className="rp-btn rp-main" disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? tr("reading") : tr("upload")}</button>
              <p className="rp-drop-hint">{tr("dropHint")}</p>
              <div className="rp-trust"><span>{tr("trustFree")}</span><span>{tr("trustTime")}</span><span>{tr("trustPrivate")}</span></div>
              <div className="rp-demo-mobile" aria-hidden="true"><DemoPhone /></div>
              {error && <p className="rp-error" role="alert">{error}</p>}
              <div className="rp-how">
                <div className="rp-tabs" role="tablist">
                  <button role="tab" aria-selected={os === "ios"} onClick={() => setOs("ios")}>iPhone</button>
                  <button role="tab" aria-selected={os === "android"} onClick={() => setOs("android")}>Android</button>
                  <button role="tab" aria-selected={os === "desktop"} onClick={() => setOs("desktop")}>{tr("tabDesktop")}</button>
                </div>
                {os === "ios" && <Steps ids={["ios1", "ios2", "ios3"]} />}
                {os === "android" && <Steps ids={["and1", "and2", "and3"]} />}
                {os === "desktop" && <Steps ids={["desk1", "desk2", "desk3"]} />}
              </div>
              <p className="rp-lock">{tr("lock")}</p>
            </div>
            <div className="rp-hero-demo" aria-hidden="true"><DemoPhone /></div>
          </section>
        )}

        {step === "count" && stats && chat && (
          <Counter stats={stats} names={stats.people.map(p => p.name)} onPick={n => { setMe(n); setStep("setup"); }} />
        )}

        {step === "setup" && stats && (
          <Setup meName={meName} otherName={otherName}
            relation={relation} setRelation={setRelation} question={question} setQuestion={setQuestion}
            context={context} setContext={setContext} email={email} setEmail={setEmail}
            consent={consent} setConsent={setConsent}
            onDone={(given: boolean) => { setConsent(given); startReport(given); setStep("stories"); }} />
        )}

        {step === "stories" && (stats || viz?.stories) && <Stories stories={stats ? buildStories(stats, me) : (viz!.stories as Story[])} lines={consent && stats && !report ? waitingLines(stats, me) : []} ready={!!report} onDone={() => setStep("report")} />}

        {step === "report" && (
          <section className="rp-screen rp-pad rp-letter">
            {report && (stats || viz?.stories?.length) ? <button className="rp-stories-again" onClick={() => setStep("stories")}>{tr("seeStories")}</button> : null}
            {report ? <ReportView report={report} viz={viz} counts={counts} onPay={pay} paying={paying} payError={payError} />
              : reportError ? <><h1>{tr("oops")}</h1><p className="rp-error" role="alert">{reportError}</p></>
              : !reportId && !consent ? <><h1>{tr("needsOk")}</h1><p className="rp-muted">{tr("needsOkText")}</p>
                  {stats && <button className="rp-btn rp-ghost-ink" onClick={() => setStep("setup")}>{tr("back")}</button>}</>
              : <WaitScreen lines={stats ? waitingLines(stats, me) : [tr("writing")]} />}
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

function Stories({ stories, lines, ready, onDone }: { stories: Story[]; lines: string[]; ready: boolean; onDone: () => void }) {
  const line = useRotating(lines, 3200);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const canShareFiles = typeof navigator !== "undefined" && !!(navigator as Navigator & { canShare?: (d: ShareData) => boolean }).canShare?.({ files: [new File([""], "x.png", { type: "image/png" })] });
  const s = stories[i];
  useEffect(() => {
    if (paused || sharing) return;
    const t = setTimeout(() => (i < stories.length - 1 ? setI(i + 1) : onDone()), 6500);
    return () => clearTimeout(t);
  }, [i, paused, sharing, stories.length, onDone]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); i < stories.length - 1 ? setI(i + 1) : onDone(); }
      if (e.key === "ArrowLeft") setI(Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, stories.length, onDone]);
  const visual = useMemo(() => s.visual ? <StoryVisual v={s.visual} /> : null, [s]);
  return (
    <section className="rp-screen rp-story" onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerCancel={() => setPaused(false)}>
      <div className="rp-bars">{stories.map((_, k) => <i key={k}><b className={k < i ? "done" : k === i ? (paused || sharing ? "hold" : "on") : ""} key={`${k}-${i}`} /></i>)}</div>
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
      <button className="rp-tap rp-next" aria-label={tr("nextStory")} onClick={() => (i < stories.length - 1 ? setI(i + 1) : onDone())} />
      <button className="rp-arrow rp-arrow-l" aria-label={tr("prev")} onClick={() => setI(Math.max(0, i - 1))}>‹</button>
      <button className="rp-arrow rp-arrow-r" aria-label={tr("nextStory")} onClick={() => (i < stories.length - 1 ? setI(i + 1) : onDone())}>›</button>
      <div className="rp-story-foot">
        <button className="rp-btn rp-ghost" onClick={() => setSharing(true)}>{tr("share")}</button>
        <button className="rp-btn rp-teal" onClick={onDone}>{tr("toReport")}</button>
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
              try { const r = await shareCard(s); setSaved(r === "downloaded" ? tr("imgDownloaded") : r === "shared" ? tr("done") : ""); }
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
  friend: ["w_care", "w_apart", "w_pull", "w_what", "w_fix", "w_curious"],
  family: ["w_listen", "w_argue", "w_pull", "w_what", "w_fix", "w_curious"],
  work: ["w_respect", "w_healthy", "w_hard", "w_what", "w_limits", "w_curious"],
};
const OUTSIDE = ["o_phone", "o_person", "o_fight", "o_nocontact", "o_nothing"];

function Steps({ ids }: { ids: string[] }) {
  return <ol>{ids.map(id => <li key={id} dangerouslySetInnerHTML={{ __html: tr(id) }} />)}</ol>;
}

function Setup(p: {
  meName: string; otherName: string; relation: string; setRelation: (v: string) => void;
  question: string; setQuestion: (v: string) => void; context: string; setContext: (v: string) => void;
  email: string; setEmail: (v: string) => void; consent: boolean; setConsent: (v: boolean) => void; onDone: (given: boolean) => void;
}) {
  const [q, setQ] = useState(0);              // current step: 0 relation · 1 worry · 2 outside · 3 consent
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { setTyping(false); end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [q]);
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
        ? <div className="rp-opts">{RELATIONS.map(([, r]) => <button key={r} aria-pressed={p.relation === r} onClick={() => { p.setRelation(r); setQ(1); }}>{relLabel(r)}</button>)}</div>
        : <Reply text={relLabel(p.relation)} />}

      {q >= 1 && <>
        <Ask>{tr("askWorry")}</Ask>
        {q === 1 ? <>
          {chips(WORRIES[p.relation] ?? WORRIES_LOVE, p.question, p.setQuestion)}
          {free(p.question, p.setQuestion, tr("sayWorry"))}
          <button className="rp-btn rp-teal" onClick={() => setQ(2)}>{p.question ? tr("next") : tr("ratherNot")}</button>
        </> : (p.question ? <Reply text={p.question} /> : <Reply text={tr("ratherNot")} />)}
      </>}

      {q >= 2 && <>
        <Ask>{tr("askOutside")}</Ask>
        {q === 2 ? <>
          {chips(OUTSIDE, p.context, p.setContext)}
          {free(p.context, p.setContext, tr("sayOutside"))}
          <button className="rp-btn rp-teal" onClick={() => setQ(3)}>{tr("next")}</button>
        </> : (p.context ? <Reply text={p.context} /> : null)}
      </>}

      {q >= 3 && <>
        <div className="rp-ask-row"><Clara size={34} /><div className="rp-ask rp-consent-card">
          <strong>{tr("consentTitle")}</strong>
          <ul>
            <li><Icon name="send" /><span>{tr("consentSend")}</span></li>
            <li><Icon name="lock" /><span>{tr("consentPrivate")}</span></li>
            <li><Icon name="tag" /><span>{tr("consentPrice")}</span></li>
          </ul>
          <a href={homePath() + "privacy/"} target="_blank" rel="noopener">{tr("privacy")} ↗</a>
        </div></div>
        <div className="rp-consent-actions">
          <button className="rp-btn rp-main" onClick={() => p.onDone(true)}><Icon name="check" />{tr("consentYes")}</button>
          <button className="rp-linkbtn" onClick={() => p.onDone(false)}>{tr("statsOnly")}</button>
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
function Icon({ name }: { name: "send" | "lock" | "tag" | "check" | "chart" }) {
  const d: Record<string, string> = {
    send: "M4 12l16-8-6 16-2.5-6.5L4 12z M11.5 13.5L20 4",
    lock: "M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3",
    tag: "M3 12V4h8l10 10-8 8L3 12z M7.5 8.5h.01",
    check: "M5 12.5l4.5 4.5L19 7.5",
    chart: "M5 20V10 M12 20V4 M19 20v-7",
  };
  return <svg className="rp-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d[name]} /></svg>;
}
