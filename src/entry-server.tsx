import { LANGUAGES, localizedPath } from "./i18n";
import { renderToStaticMarkup } from "react-dom/server";
import { ROUTES, type Route } from "./routes";
import { SITE } from "./data";

const esc = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const json = (value: unknown) => JSON.stringify(value).replaceAll("<", "\\u003c");

export function renderRoute(route: Route) {
  const body = renderToStaticMarkup(route.element);
  const type = route.meta.type ?? "website";
  const jsonLd = route.meta.jsonLd
    .map((item) => `<script type="application/ld+json">${json(item)}</script>`)
    .join("");

  return `<!doctype html>
<html lang="${route.locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(route.meta.title)}</title>
  <meta name="description" content="${esc(route.meta.description)}">
  <meta name="theme-color" content="#081426">
  <meta name="apple-itunes-app" content="app-id=${SITE.appId}">
  <link rel="canonical" href="${esc(route.meta.canonical)}">
  ${LANGUAGES.map(({ code }) => `<link rel="alternate" hreflang="${code}" href="${SITE.url}${localizedPath(code, route.basePath)}">`).join("\n  ")}
  <link rel="alternate" hreflang="x-default" href="${SITE.url}${route.basePath}">
  <meta property="og:locale" content="${({ en: "en_US", es: "es_ES", fr: "fr_FR", de: "de_DE", it: "it_IT", pl: "pl_PL" })[route.locale]}">
  <link rel="icon" href="/assets/icon.png">
  <link rel="apple-touch-icon" href="/assets/icon.png">
  <link rel="stylesheet" href="/style.css">
  <link rel="alternate" type="text/plain" href="/llms.txt" title="Clarity Chat product facts">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Clarity Chat">
  <meta property="og:title" content="${esc(route.meta.title)}">
  <meta property="og:description" content="${esc(route.meta.description)}">
  <meta property="og:url" content="${esc(route.meta.canonical)}">
  <meta property="og:image" content="${esc(route.meta.image)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(route.meta.title)}">
  <meta name="twitter:description" content="${esc(route.meta.description)}">
  <meta name="twitter:image" content="${esc(route.meta.image)}">
  ${jsonLd}
</head>
<body>${body}
  <script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  </script>
  <script defer src="/_vercel/insights/script.js"></script>
</body>
</html>`;
}

export { ROUTES };
