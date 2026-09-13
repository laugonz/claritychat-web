import { LANGUAGES, LocaleProvider, contentFor, translate, localizedPath, type Locale } from "./i18n";
import type { ReactElement } from "react";
import { SITE } from "./data";
import { guideJsonLd, guidesIndexJsonLd, homeJsonLd, webPageJsonLd } from "./seo";
import Home from "./pages/Home";
import GuidePage from "./pages/GuidePage";
import GuidesIndex from "./pages/GuidesIndex";
import { PrivacyPage, SupportPage, TermsPage } from "./pages/LegalPages";

export type PageMeta = {
  title: string;
  description: string;
  canonical: string;
  image: string;
  type?: "website" | "article";
  jsonLd: Record<string, unknown>[];
  sitemapPriority: string;
};

export type Route = {
  path: string;
  basePath: string;
  locale: Locale;
  meta: PageMeta;
  element: ReactElement;
};

function createRoutes(locale: Locale): Route[] {
  const t = (text: string) => translate(locale, text);
  const { guides } = contentFor(locale);
  const route = (path: string, meta: Omit<PageMeta, "canonical">, element: ReactElement): Route => ({
    path: localizedPath(locale, path),
    basePath: path,
    locale,
    meta: { ...meta, canonical: `${SITE.url}${localizedPath(locale, path)}` },
    element: <LocaleProvider locale={locale} basePath={path}>{element}</LocaleProvider>,
  });

  const guidePageTitles: Record<string, string> = {
    "how-to-analyze-text-messages": "How to Analyze Text Messages | Clarity Chat",
    "ai-relationship-advice": "AI Relationship Advice: A Safer Second Opinion | Clarity Chat",
    "text-message-analyzer": "Text Message Analyzer: What Reports Show | Clarity Chat",
    "how-to-tell-if-someone-likes-you-over-text": "Signs Someone Likes You Over Text | Clarity Chat",
    "why-did-they-ghost-me": "Why Did They Ghost Me? | Clarity Chat",
    "gaslighting-in-text-messages": "Gaslighting Signs in Text Messages | Clarity Chat",
    "unhealthy-texting-patterns": "Unhealthy Texting Patterns | Clarity Chat",
  };

  return [
    route("/", {
      title: t("Clarity Chat | AI Text Message Analyzer"),
      description: t(SITE.description),
      image: `${SITE.url}/assets/screenshots/screenshot-1.jpg`,
      jsonLd: homeJsonLd(locale),
      sitemapPriority: "1.0",
    }, <Home />),
    route("/guides/", {
      title: t("Text & Relationship Analysis Guides | Clarity Chat"),
      description: t("Context-first guides for analyzing texts, mixed signals, ghosting and concerning communication without pretending to read minds."),
      image: `${SITE.url}/assets/guides/how-to-analyze-text-messages-feature.jpg`,
      jsonLd: guidesIndexJsonLd(locale),
      sitemapPriority: "0.9",
    }, <GuidesIndex />),
    ...guides.map((guide) => route(`/guides/${guide.slug}/`, {
      title: guidePageTitles[guide.slug] ? t(guidePageTitles[guide.slug]) : `${guide.title} | Clarity Chat`,
      description: guide.description,
      image: `${SITE.url}${guide.featureImage.src}`,
      type: "article",
      jsonLd: guideJsonLd(guide, locale),
      sitemapPriority: "0.8",
    }, <GuidePage guide={guide} />)),
    route("/privacy/", {
      title: t("Privacy Policy | Clarity Chat"),
      description: t("How Clarity Chat processes selected chat screenshots, protects conversation content and handles purchases."),
      image: `${SITE.url}/assets/icon.png`,
      jsonLd: webPageJsonLd("Clarity Chat privacy policy", "How Clarity Chat processes selected chat screenshots and protects conversation content.", "/privacy/", locale),
      sitemapPriority: "0.3",
    }, <PrivacyPage />),
    route("/terms/", {
      title: t("Terms of Use | Clarity Chat"),
      description: t("Read the terms for using Clarity Chat as a personal AI-assisted conversation reflection tool, including safety, purchases and service limits."),
      image: `${SITE.url}/assets/icon.png`,
      jsonLd: webPageJsonLd("Clarity Chat terms of use", "Terms for using Clarity Chat as a personal conversation reflection tool.", "/terms/", locale),
      sitemapPriority: "0.3",
    }, <TermsPage />),
    route("/support/", {
      title: t("Support | Clarity Chat"),
      description: t("Get help with Clarity Chat analyses, screenshot uploads, purchase restoration and app access, with guidance on what to include in a support request."),
      image: `${SITE.url}/assets/icon.png`,
      jsonLd: webPageJsonLd("Clarity Chat support", "Get help with Clarity Chat analyses, purchases and app access.", "/support/", locale),
      sitemapPriority: "0.3",
    }, <SupportPage />),
  ];
}

export const ROUTES = LANGUAGES.flatMap(({ code }) => createRoutes(code));

export function findRoute(pathname: string) {
  const clean = pathname === "/" ? "/" : `${pathname.replace(/\/+$/, "")}/`;
  return ROUTES.find((candidate) => candidate.path === clean) ?? ROUTES[0];
}
