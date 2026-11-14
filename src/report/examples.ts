// Sample reports (invented chats, real model output) shown at /<lang>/report/example/.
import type { Report } from "./ReportView";
import type { Viz } from "./chat";
import es from "./examples/es.json";
import it from "./examples/it.json";

export type Example = { report: Report; viz: Viz };
export const EXAMPLES: Record<string, Example> = { es: es as unknown as Example, it: it as unknown as Example };
/** Which example a language shows (Spanish as fallback until each language has its own). */
export const exampleFor = (lang: string): Example => EXAMPLES[lang] ?? EXAMPLES.es;
export const hasOwnExample = (lang: string) => lang in EXAMPLES;
/** Link to the sample report in the page language (Spanish one as fallback). */
export function exampleHref(): string {
  const l = typeof document !== "undefined" ? (document.documentElement.lang || "es").slice(0, 2) : "es";
  return `/${hasOwnExample(l) ? l : "es"}/report/example/`;
}
