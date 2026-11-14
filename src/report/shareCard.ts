// Turns a story into a real 1080×1920 PNG (Instagram/TikTok story size) and
// opens the phone's share sheet ("Save image" → gallery), or downloads it on desktop.
import type { Story } from "./stories";
import { lang, tr } from "./i18n";

const strip = (html: string) => html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const w of para.split(" ")) {
      const t = line ? `${line} ${w}` : w;
      if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
    }
    out.push(line);
  }
  return out;
}

export async function renderCard(story: Story): Promise<Blob> {
  const W = 1080, H = 1920, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  try { await document.fonts?.ready; } catch { /* fonts optional */ }
  const g = x.createLinearGradient(0, 0, W * 0.6, H);
  g.addColorStop(0, "#1b4f6e"); g.addColorStop(0.55, "#071626"); g.addColorStop(1, "#071626");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const pad = 96, maxW = W - pad * 2;
  let y = 330;
  x.fillStyle = "#42c5ca"; x.font = '700 42px "Figtree", system-ui, sans-serif';
  x.fillText(tr("cardTop"), pad, 220);
  x.fillStyle = "#9fb3c8"; x.font = '700 38px "Figtree", system-ui, sans-serif';
  x.fillText(story.kicker.toUpperCase(), pad, y); y += 70;
  if (story.big) {
    x.fillStyle = "#ffffff"; x.font = '800 230px "Bricolage Grotesque", system-ui, sans-serif';
    x.fillText(story.big, pad - 8, y + 200); y += 260;
  }
  x.fillStyle = "#f3f7fb"; x.font = '800 92px "Bricolage Grotesque", system-ui, sans-serif';
  for (const l of wrap(x, strip(story.card || story.title), maxW)) { x.fillText(l, pad, y + 90); y += 108; }
  // footer
  x.fillStyle = "#ff8b45"; x.beginPath(); x.roundRect(pad, H - 250, maxW, 120, 60); x.fill();
  x.fillStyle = "#26120a"; x.font = '700 46px "Figtree", system-ui, sans-serif'; x.textAlign = "center";
  x.fillText(tr("cardCta"), W / 2, H - 175);
  x.textAlign = "start";
  return new Promise((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error("png"))), "image/png"));
}

/** Returns "shared" | "downloaded". */
export async function shareCard(story: Story): Promise<string> {
  const blob = await renderCard(story);
  const file = new File([blob], tr("cardFile"), { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file], text: tr("shareText", { u: `https://claritychat.app${lang() === "en" ? "" : "/" + lang()}/report/?utm_source=share_card` }) }); return "shared"; }
    catch (e) { if ((e as Error).name === "AbortError") return "cancelled"; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = tr("cardFile");
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return "downloaded";
}
