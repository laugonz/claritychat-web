// The report as a letter: one chart per chapter, built from the AI's structured
// fields plus the chat's own counts (Viz). Locked chapters show only their titles.
import type { ReactNode } from "react";
import type { Viz } from "./chat";
import { Clara } from "./Mascot";
import { StoryVisual } from "./StoryVisual";
import type { Story } from "./stories";
import { claraName, loc, tr } from "./i18n";

export type Chapter = {
  id: string; emoji?: string; title: string; body?: string; locked?: boolean; message_suggestion?: string | null;
  moments?: { date: string; label: string }[];
  key_exchange?: { date: string; time?: string; author: string; text: string }[];
  shines?: string[]; watch?: string[];
  dictionary?: { term: string; meaning: string; who: string }[];
  topic_timeline?: { topic: string; steps: { date: string; author: string; text: string; note?: string | null }[] } | null;
};
export type Report = { title: string; verdict: string; chapters: Chapter[]; follow_ups?: { title: string; teaser?: string }[]; safety?: { concern: boolean; note?: string | null } };

const first = (n: string) => n.split(" ")[0];
const esc = (x: string) => x.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

/** «quotes» and dd/mm/yy dates get their own styling. */
function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /«[^»]+»|\b\d{2}\/\d{2}\/\d{2}\b/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(m[0].startsWith("«") ? <span key={k++} className="rp-cite">{m[0]}</span> : <span key={k++} className="rp-date">{m[0]}</span>);
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}
const paras = (body = "") => body.split(/\n\n+/).filter(Boolean);

function Legend({ viz }: { viz: Viz }) {
  return <span className="rp-legend"><span><i style={{ background: "var(--rp-teal)" }} />{tr("you")}</span><span><i style={{ background: "var(--rp-orange)" }} />{first(viz.other)}</span></span>;
}

function Timeline({ viz, moments }: { viz: Viz; moments: { date: string; label: string }[] }) {
  const n = viz.months.length;
  if (n < 2) return null;
  const W = 340, H = 168, x0 = 30, x1 = 334, y0 = 46, y1 = 142;
  const max = Math.max(10, ...viz.months.flatMap(m => [m[1], m[2]]));
  const X = (i: number) => x0 + (x1 - x0) * i / (n - 1), Y = (v: number) => y1 - (y1 - y0) * v / max;
  const path = (k: 1 | 2) => viz.months.map((m, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(m[k]).toFixed(1)}`).join("");
  // dd/mm/yy → fractional position in the monthly series (exact day, so two moments in one month don't overlap)
  const pos = (d: string) => {
    const [dd, mm, yy] = d.split("/").map(Number);
    const key = (yy < 100 ? 2000 + yy : yy) * 12 + (mm - 1);
    const i = viz.months.findIndex(m => m[3] === key);
    if (i < 0) return -1;
    const days = new Date(yy < 100 ? 2000 + yy : yy, mm, 0).getDate();
    return Math.min(n - 1, i + ((dd || 1) - 1) / days - 0.5 + 0.5);   // points sit at the start of the month's segment
  };
  const ev = moments.map(m => ({ ...m, p: pos(m.date) })).filter(m => m.p >= 0).slice(0, 7)
    .map(m => ({ ...m, x: Math.max(x0, Math.min(x1, X(m.p))), row: 0 }));
  // markers closer than 18px go up one row
  ev.forEach((e, k) => { const prev = ev[k - 1]; if (prev && Math.abs(e.x - prev.x) < 18) e.row = prev.row === 0 ? 1 : 0; });
  const ticks = [0, Math.round(max / 2), max];
  const labels = [...new Set([0, Math.floor((n - 1) / 3), Math.floor(2 * (n - 1) / 3), n - 1])];
  return (
    <figure className="rp-vis">
      <div className="rp-vis-t"><span>{tr("r_msgsMonth")}</span><Legend viz={viz} /></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tr("r_msgsMonthAria")}>
        {ticks.map(v => <g key={v}><line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke="var(--rp-line)" /><text x={x0 - 5} y={Y(v) + 3} textAnchor="end">{v}</text></g>)}
        <path d={`${path(1)}L${X(n - 1)},${y1}L${X(0)},${y1}Z`} fill="var(--rp-teal)" fillOpacity=".14" />
        <path d={path(1)} fill="none" stroke="var(--rp-teal)" strokeWidth="2.4" strokeLinejoin="round" />
        <path d={path(2)} fill="none" stroke="var(--rp-orange)" strokeWidth="2.4" strokeLinejoin="round" />
        {ev.map((e, k) => { const cy = e.row ? 12 : 30; return <g key={k}><line x1={e.x} x2={e.x} y1={cy + 8} y2={y1} stroke="var(--rp-ink)" strokeOpacity=".18" strokeDasharray="2 3" />
          <circle cx={e.x} cy={cy} r="8" fill="var(--rp-ink)" /><text x={e.x} y={cy + 3.5} textAnchor="middle" className="rp-svg-num">{k + 1}</text></g>; })}
        {labels.map(i => <text key={i} x={X(i)} y={y1 + 16} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>{viz.months[i][0]}</text>)}
      </svg>
      {ev.length > 0 && <ol className="rp-events">{ev.map((e, k) => <li key={k}><b>{k + 1}</b>{e.label} · {e.date}</li>)}</ol>}
    </figure>
  );
}

function Exchange({ msgs, me }: { msgs: NonNullable<Chapter["key_exchange"]>; me: string }) {
  if (!msgs.length) return null;
  let lastDate = "";
  return (
    <div className="rp-chatbub">
      {msgs.map((m, k) => {
        const day = m.date !== lastDate ? <span className="rp-day">{m.date}</span> : null;
        lastDate = m.date;
        return <div key={k} style={{ display: "contents" }}>{day}<div className={`rp-m${m.author === me ? " me" : ""}`}>{m.text}<small>{m.time ?? ""}</small></div></div>;
      })}
    </div>
  );
}

function Tug({ viz }: { viz: Viz }) {
  const [a, b] = viz.people;
  const nf = (v: number) => v.toLocaleString(loc(), { maximumFractionDigits: 1 });
  const rows: [string, number, number, string, string][] = [
    [tr("r_t_messages"), a.messages, b.messages, nf(a.messages), nf(b.messages)],
    [tr("r_t_started"), a.started, b.started, nf(a.started), nf(b.started)],
    [tr("r_t_wpm"), a.wpm, b.wpm, nf(a.wpm), nf(b.wpm)],
    [tr("r_t_sil"), a.silencesBroken, b.silencesBroken, nf(a.silencesBroken), nf(b.silencesBroken)],
  ];
  if (a.reply && b.reply) rows.push([tr("r_t_speed"), 1 / Math.max(a.reply, .1), 1 / Math.max(b.reply, .1), `${nf(a.reply)} min`, `${nf(b.reply)} min`]);
  const total = viz.seasons.map(s => s[1] + s[2]);
  return (
    <>
      <figure className="rp-vis">
        <div className="rp-vis-t"><span>{tr("r_faceoff", { T: first(viz.other) })}</span><Legend viz={viz} /></div>
        <div className="rp-tug">{rows.map(([l, x, y, tx, ty]) => {
          const m = Math.max(x, y, 1e-9);
          return <div key={l}><div className="rp-tug-l">{l}</div><div className="rp-tug-b"><span>{tx}</span><div className="l"><i style={{ width: `${x / m * 100}%` }} /></div><div className="r"><i style={{ width: `${y / m * 100}%` }} /></div><span>{ty}</span></div></div>;
        })}</div>
        <p className="rp-vis-note">{tr("r_tugNote")}</p>
      </figure>
      {viz.seasons.length >= 2 && (
        <figure className="rp-vis">
          <div className="rp-vis-t"><span>{tr("r_whoStarts")}</span><Legend viz={viz} /></div>
          <div className="rp-stack">{viz.seasons.map(([l, x, y], k) => {
            const pa = total[k] ? Math.round(x / total[k] * 100) : 50;
            return <div key={k} className="rp-stack-row"><span className="rp-stack-l">{l}</span><div className="rp-stack-b"><i style={{ width: `${pa}%`, background: "var(--rp-teal)" }}>{pa}%</i><i style={{ width: `${100 - pa}%`, background: "var(--rp-orange)" }}>{100 - pa}%</i></div></div>;
          })}<div className="rp-stack-mid" aria-hidden="true" /></div>
        </figure>
      )}
    </>
  );
}

function Signals({ c }: { c: Chapter }) {
  if (!c.shines?.length && !c.watch?.length) return null;
  return (
    <div className="rp-two">
      <div className="good"><strong>{tr("r_shines")}</strong><ul>{(c.shines ?? []).map(s => <li key={s}>{s}</li>)}</ul></div>
      <div className="watch"><strong>{tr("r_watch")}</strong><ul>{(c.watch ?? []).map(s => <li key={s}>{s}</li>)}</ul></div>
    </div>
  );
}

function Dictionary({ c, counts }: { c: Chapter; counts?: Record<string, Record<string, number>> }) {
  if (!c.dictionary?.length) return null;
  return (
    <div className="rp-dict">{c.dictionary.map(d => {
      const n = counts?.[d.term] ? Object.values(counts[d.term]).reduce((a, b) => a + b, 0) : 0;
      return <div key={d.term}><strong>{d.term}{n ? <em> · {n}</em> : null}</strong><span>{d.meaning}</span></div>;
    })}</div>
  );
}

function TopicTimeline({ c, me }: { c: Chapter; me: string }) {
  const t = c.topic_timeline;
  if (!t || !t.steps?.length) return null;
  return (
    <figure className="rp-vis">
      <div className="rp-vis-t"><span>{tr("r_topicStory", { t: t.topic, n: t.steps.length })}</span></div>
      <ol className="rp-tl">{t.steps.map((s, k) => (
        <li key={k}><span className="rp-tl-d">{s.date}</span><div className="rp-tl-c"><span className={`rp-tl-q ${s.author === me ? "me" : "them"}`}>{s.text}</span>{s.note && <span className="rp-tl-n">{s.note}</span>}</div></li>
      ))}</ol>
    </figure>
  );
}

function Body({ c, i, viz, counts }: { c: Chapter; i: number; viz: Viz | null; counts?: Record<string, Record<string, number>> }) {
  const ps = paras(c.body);
  const visual = (() => {
    if (c.id === "story" || i === 0) return <>{viz && <Timeline viz={viz} moments={c.moments ?? []} />}<Exchange msgs={c.key_exchange ?? []} me={viz?.me ?? ""} /></>;
    if (c.id === "who_gives") return viz ? <Tug viz={viz} /> : null;
    if (c.id === "signals") return <Signals c={c} />;
    if (c.id === "language") return <Dictionary c={c} counts={counts} />;
    if (c.id === "unsaid") return <TopicTimeline c={c} me={viz?.me ?? ""} />;
    return null;
  })();
  if (c.id === "next") {
    return <div className="rp-prose">{ps.map((p, k) => {
      const m = p.match(/^(?:Opci[oó]n|Option|Opzione|Opcja) (\d)\s*[.:]\s*([\s\S]*)$/);
      return m ? <div key={k} className="rp-opt"><b>{tr("r_option", { n: m[1] })}</b><Rich text={m[2]} /></div> : <p key={k}><Rich text={p} /></p>;
    })}</div>;
  }
  return <div className="rp-prose">{ps[0] && <p><Rich text={ps[0]} /></p>}{visual}{ps.slice(1).map((p, k) => <p key={k}><Rich text={p} /></p>)}</div>;
}

function Weekdays({ viz }: { viz: Viz }) {
  if (!viz.weekdays) return null;
  const [a, b] = viz.weekdays, max = Math.max(1, ...a, ...b), days = tr("r_daysLetters").split(",");
  const top = (arr: number[]) => days[arr.indexOf(Math.max(...arr))];
  return (
    <figure className="rp-vis">
      <div className="rp-vis-t"><span>{tr("r_whichDays")}</span><Legend viz={viz} /></div>
      <div className="rp-week">{days.map((d, k) => (
        <div key={k}><div className="bars"><i style={{ height: `${a[k] / max * 100}%`, background: "var(--rp-teal)" }} /><i style={{ height: `${b[k] / max * 100}%`, background: "var(--rp-orange)" }} /></div><span>{d}</span></div>
      ))}</div>
      <p className="rp-vis-note" dangerouslySetInnerHTML={{ __html: tr("r_daysNote", { a: top(a), b: top(b), T: esc(first(viz.other)) }) }} />
    </figure>
  );
}

function ReplyTrend({ viz }: { viz: Viz }) {
  const rows = viz.replyMonths ?? [];
  const pts = rows.filter(r => r[1] != null || r[2] != null);
  if (pts.length < 3) return null;
  const W = 340, H = 150, x0 = 30, x1 = 334, y0 = 14, y1 = 118, n = rows.length;
  const cap = Math.max(5, Math.min(240, Math.max(...rows.flatMap(r => [r[1] ?? 0, r[2] ?? 0]))));
  const X = (i: number) => x0 + (x1 - x0) * i / Math.max(1, n - 1), Y = (v: number) => y1 - (y1 - y0) * Math.min(v, cap) / cap;
  const line = (k: 1 | 2) => rows.map((r, i) => r[k] == null ? "" : `${X(i).toFixed(1)},${Y(r[k] as number).toFixed(1)}`).filter(Boolean).join(" ");
  const fmt = (v: number) => v < 1 ? "<1" : String(Math.round(v));
  const last = (k: 1 | 2) => [...rows].reverse().find(r => r[k] != null)?.[k] as number | undefined;
  const firstV = (k: 1 | 2) => rows.find(r => r[k] != null)?.[k] as number | undefined;
  const labels = [...new Set([0, Math.floor((n - 1) / 2), n - 1])];
  return (
    <figure className="rp-vis">
      <div className="rp-vis-t"><span>{tr("r_replyTitle")}</span><Legend viz={viz} /></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tr("r_replyAria")}>
        {[0, cap / 2, cap].map(v => <g key={v}><line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke="var(--rp-line)" /><text x={x0 - 5} y={Y(v) + 3} textAnchor="end">{fmt(v)}</text></g>)}
        <polyline points={line(1)} fill="none" stroke="var(--rp-teal)" strokeWidth="2.4" strokeLinejoin="round" />
        <polyline points={line(2)} fill="none" stroke="var(--rp-orange)" strokeWidth="2.4" strokeLinejoin="round" />
        {labels.map(i => <text key={i} x={X(i)} y={y1 + 16} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>{rows[i][0]}</text>)}
      </svg>
      <p className="rp-vis-note" dangerouslySetInnerHTML={{ __html: tr("r_replyNote", { T: esc(first(viz.other)), a: esc(fmt(firstV(2) ?? 0)), b: esc(fmt(last(2) ?? 0)), c: esc(fmt(firstV(1) ?? 0)), d: esc(fmt(last(1) ?? 0)) }) }} />
    </figure>
  );
}

function Emojis({ viz }: { viz: Viz }) {
  if (!viz.emojis || (!viz.emojis[0].length && !viz.emojis[1].length)) return null;
  const col = (list: [string, number][], name: string) => (
    <div className="rp-emo"><strong>{name}</strong>{list.slice(0, 5).map(([e, n], k) => <div key={e}><span className="e" style={{ fontSize: 30 - k * 3 }}>{e}</span><span className="n">{n}</span></div>)}</div>
  );
  return (
    <figure className="rp-vis">
      <div className="rp-vis-t"><span>{tr("r_emojis")}</span></div>
      <div className="rp-two-emo">{col(viz.emojis[0], tr("you"))}{col(viz.emojis[1], first(viz.other))}</div>
    </figure>
  );
}

function Numbers({ viz }: { viz: Viz }) {
  if (!viz.stories?.length && !viz.weekdays) return null;   // older reports: nothing to show
  return (
    <section className="rp-chapter rp-numbers">
      <div className="rp-eyebrow">{tr("r_numbersK")}</div>
      <h2>{tr("r_numbersH")}</h2>
      {viz.stories?.length ? <div className="rp-cards">{(viz.stories as Story[]).map((s, k) => (
        <div key={k} className="rp-card">
          <div className="rp-kicker">{s.kicker}</div>
          {s.big && <div className="rp-card-num">{s.big}</div>}
          <h3 dangerouslySetInnerHTML={{ __html: s.title }} />
          {s.visual && <StoryVisual v={s.visual} />}
          {s.body && <p dangerouslySetInnerHTML={{ __html: s.body }} />}
        </div>
      ))}
        <ReplyTrend viz={viz} /><Weekdays viz={viz} /><Emojis viz={viz} />
      </div> : <div className="rp-cards"><ReplyTrend viz={viz} /><Weekdays viz={viz} /><Emojis viz={viz} /></div>}
    </section>
  );
}

export function ReportView({ report, viz, counts, onPay, paying, payError }: {
  report: Report; viz: Viz | null; counts?: Record<string, Record<string, number>>;
  onPay: () => void; paying: boolean; payError?: string;
}) {
  const locked = report.chapters.some(c => c.locked);
  const lockIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
  const chapterHead = (c: Chapter, i: number) => <h2><span className="rp-n">{String(i + 1).padStart(2, "0")}</span><span>{c.emoji} {c.title}</span></h2>;
  return (
    <div className="rp-report">
      <div className="rp-report-hello"><Clara size={44} mood="soft" /><div className="rp-eyebrow">{tr("r_yourReport")}{viz ? ` · ${first(viz.me)} ${tr("r_and")} ${first(viz.other)}` : ""}</div></div>
      <h1>{report.title}</h1>
      <button className="rp-copylink" onClick={e => { const b = e.currentTarget; navigator.clipboard?.writeText(location.href).then(() => { b.textContent = tr("r_copied"); }, () => { b.textContent = location.href; }); }}>{tr("r_copyLink")}</button>
      <p className="rp-verdict"><Rich text={report.verdict} /></p>
      {report.safety?.concern && report.safety.note && <p className="rp-safety">{report.safety.note}</p>}
      {locked ? (
        <>
          <article className="rp-chapter rp-cut rp-cut-blur">{chapterHead(report.chapters[0], 0)}<Body c={report.chapters[0]} i={0} viz={viz} counts={counts} /></article>
          <div className="rp-ghost-text" aria-hidden="true">{[96, 88, 92, 70, 94, 85, 60].map((w, k) => <i key={k} style={{ width: `${w}%` }} />)}</div>
          <div className="rp-paywall">
            <h3>{tr("r_keepReading")}</h3>
            <ol className="rp-locked">{report.chapters.map((c, i) => <li key={i} className={i === 0 ? "read" : ""}><span className="e">{String(i + 1).padStart(2, "0")}</span><span>{c.title}</span>{i > 0 ? lockIcon : <span className="rp-read">{tr("r_readingNow")}</span>}</li>)}</ol>
            <div className="rp-price"><strong>{tr("r_price")}</strong><em>{tr("r_launch")}</em></div>
            <button className="rp-btn rp-main" onClick={onPay} disabled={paying}>{paying ? tr("r_openingPay") : tr("r_readFull")}</button>
            <p className="rp-hint rp-waiver">{tr("r_waiver")}</p>
            {payError && <p className="rp-error" role="alert">{payError}</p>}
            <p className="rp-hint" style={{ textAlign: "center" }}>{tr("r_payNote")}</p>
          </div>
        </>
      ) : (
        <>
          {viz && (viz.stories?.length || viz.weekdays) ? <><Numbers viz={viz} /><div className="rp-eyebrow" style={{ paddingTop: 30 }}>{tr("r_meaning")}</div></> : null}
          {report.chapters.map((c, i) => (
            <article key={i} className="rp-chapter">
              {chapterHead(c, i)}
              <Body c={c} i={i} viz={viz} counts={counts} />
              {c.message_suggestion && <div className="rp-suggest"><span>{tr("r_suggest")}</span><div className="rp-m me">{c.message_suggestion}</div>
                <button onClick={() => navigator.clipboard?.writeText(c.message_suggestion ?? "").catch(() => {})}>{tr("r_copy")}</button></div>}
            </article>
          ))}
          <div className="rp-signoff"><Clara size={56} mood="soft" /><span><b>— {claraName()}</b><br />{tr("r_signoff")}</span></div>
          {report.follow_ups?.length ? (
            <section className="rp-chapter">
              <div className="rp-eyebrow">{tr("r_ch2")}</div>
              <h2>{tr("r_ch2h")}</h2>
              <div className="rp-next">{report.follow_ups.map(f => <div key={f.title} className="rp-nc"><span className="tag">{tr("r_soon")}</span><strong>{f.title}</strong>{f.teaser && <span>{f.teaser}</span>}</div>)}</div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
