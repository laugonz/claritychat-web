import { createContext, useContext, type ReactNode } from "react";
import { guides, homeFaqs, screenshots } from "./data";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import pl from "./locales/pl.json";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pl", label: "Polski" },
] as const;
export type Locale = typeof LANGUAGES[number]["code"];
const catalogs: Record<Exclude<Locale, "en">, Record<string, string>> = { es, fr, de, it, pl };

export function translate(locale: Locale, text: string): string {
  if (locale === "en" || !text.trim()) return text;
  const result = catalogs[locale][text];
  if (!result) throw new Error(`Missing ${locale} translation: ${text}`);
  return result;
}

export function localizedPath(locale: Locale, path: string): string {
  return locale === "en" ? path : `/${locale}${path}`;
}

const technicalKeys = new Set(["slug", "guideSlug", "related", "src", "href", "reviewed"]);
function translateData<T>(value: T, locale: Locale, key = ""): T {
  if (technicalKeys.has(key)) return value;
  if (typeof value === "string") return translate(locale, value) as T;
  if (Array.isArray(value)) return value.map(item => translateData(item, locale, key)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([field, item]) => [field, translateData(item, locale, field)])) as T;
  }
  return value;
}

const cache = new Map<Locale, ReturnType<typeof makeContent>>();
function makeContent(locale: Locale) {
  return translateData({ guides, homeFaqs, screenshots }, locale);
}
export function contentFor(locale: Locale) {
  let content = cache.get(locale);
  if (!content) { content = makeContent(locale); cache.set(locale, content); }
  return content;
}

const LocaleContext = createContext<{ locale: Locale; basePath: string }>({ locale: "en", basePath: "/" });
export function LocaleProvider({ locale, basePath, children }: { locale: Locale; basePath: string; children: ReactNode }) {
  return <LocaleContext.Provider value={{ locale, basePath }}>{children}</LocaleContext.Provider>;
}
export function useLocale() {
  const { locale, basePath } = useContext(LocaleContext);
  return { locale, basePath, t: (text: string) => translate(locale, text), path: (path: string) => localizedPath(locale, path) };
}
export function useContent() { return contentFor(useLocale().locale); }
