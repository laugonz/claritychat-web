// Sample reports (invented chats, real model output) shown at /<lang>/report/example/.
import type { Report } from "./ReportView";
import type { Viz } from "./chat";
import es from "./examples/es.json";
import it from "./examples/it.json";
import en from "./examples/en.json";
import fr from "./examples/fr.json";
import de from "./examples/de.json";
import pl from "./examples/pl.json";

export type Example = { report: Report; viz: Viz };
export const EXAMPLES: Record<string, Example> = Object.fromEntries(Object.entries({ es, it, en, fr, de, pl }).map(([k, v]) => [k, v as unknown as Example]));
/** Which example a language shows (Spanish as fallback until each language has its own). */
export const exampleFor = (lang: string): Example => EXAMPLES[lang] ?? EXAMPLES.es;
export const hasOwnExample = (lang: string) => lang in EXAMPLES;
/** Link to the sample report in the page language (Spanish one as fallback). */
export function exampleHref(): string {
  const l = typeof document !== "undefined" ? (document.documentElement.lang || "es").slice(0, 2) : "es";
  const t = hasOwnExample(l) ? l : "es";
  return t === "en" ? "/report/example/" : `/${t}/report/example/`;
}
