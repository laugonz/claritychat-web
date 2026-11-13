import type { Story } from "./stories";
import { tr } from "./i18n";

export function StoryVisual({ v }: { v: NonNullable<Story["visual"]> }) {
  if (v.type === "split") return (
    <div className="rp-split">{v.rows.map(r => (
      <div key={r.name}><div className="rp-split-l"><span>{r.name}</span><span>{r.label}</span></div>
        <div className="rp-meter"><b style={{ width: `${r.value}%`, background: r.mine ? "var(--rp-teal)" : "var(--rp-orange)" }} /></div></div>))}
    </div>);
  if (v.type === "silences") return (
    <div className="rp-sil">{v.rows.map((r, k) => <div key={k}><em>{r.days} {r.days === 1 ? tr("day1") : tr("daysW")}</em><span>{tr("d_since", { d: r.from })}</span><span>{r.who}</span></div>)}</div>);
  if (v.type === "hours") {
    const max = Math.max(...v.hours);
    return (<div><div className="rp-hours">{v.hours.map((h, k) => <i key={k} className={k === v.peak ? "pk" : ""} style={{ height: `${Math.max(2, h / max * 100)}%` }} />)}</div>
      <div className="rp-hours-ax"><span>0 h</span><span>6</span><span>12</span><span>18</span><span>23</span></div></div>);
  }
  if (v.type === "calendar") {
    const level = (n: number) => n < 0 ? "x" : n === 0 ? "0" : String(Math.min(4, Math.ceil(Math.sqrt(n / v.max) * 4)));
    return (
      <div className="rp-cal" style={{ ["--cols" as string]: v.weeks.length }}>
        <div className="rp-cal-m">{v.months.map(m => <span key={m.col} style={{ gridColumn: m.col + 1 }}>{m.label}</span>)}</div>
        <div className="rp-cal-g">{v.weeks.map((w, c) => w.map((n, r) => <i key={`${c}-${r}`} className={`l${level(n)}`} style={{ gridColumn: c + 1, gridRow: r + 1 }} />))}</div>
      </div>
    );
  }
  return (<div className="rp-words">{v.groups.map(g => (
    <div key={g.name}><p>{g.name}</p><div className={g.mine ? "mine" : ""}>{g.items.map(w => <span key={w}>{w}</span>)}</div></div>))}</div>);
}
