# Website language expansion — 13 September 2026

Clarity Chat previously exposed only English website pages. The six languages supported by published app version 1.10 now each have the full website content.

| Language | Homepage | Pages |
|---|---|---:|
| English | `/` | 12 |
| Español | `/es/` | 12 |
| Français | `/fr/` | 12 |
| Deutsch | `/de/` | 12 |
| Italiano | `/it/` | 12 |
| Polski | `/pl/` | 12 |

## Behavior

- The header language selector preserves the current page. It is a native disclosure with ordinary links and works without JavaScript.
- Each language includes the homepage, guide index, seven articles, privacy, terms and support. Internal navigation stays in the current language.
- English URLs and guide slugs remain stable. Every page has a self-referencing canonical, six reciprocal hreflang links and an English x-default equivalent.
- All 72 pages are prerendered HTML and included in the sitemap. Titles, descriptions, document language, social metadata, image descriptions, FAQ and article schema follow the selected language.
- Six checked-in catalogs contain 431 messages each. Missing translations fail the build. No runtime translation dependency or translation API was added.
- The store button uses the country-neutral App Store URL. Product screenshots retain their original English pixels and display a translated note; app code and assets were not changed.

## Verification

- `npm run build` — TypeScript and production prerender pass for 72 routes.
- `npm run verify` — source/catalog parity, metadata, schema, internal links, guide depth, image assets, robots and exact sitemap coverage pass.
- Output checks cover language-preserving links, matching language-selector destinations, reciprocal hreflang, unique IDs and working fragments, 42 Article schemas, 144 visible/schema FAQ pairs, preserved brand names and HTML tags, and absence of added numeric claims or untranslated English blocks.
- `tsc --noEmit --noUnusedLocals --noUnusedParameters` and `git diff --check` pass.
- Chrome: all six homepages fit at 320 CSS pixels; Spanish homepage also checked at desktop width and German at tablet width. Mobile selector, keyboard opening, language switching on an article, FAQ disclosure and Italian privacy navigation were exercised. The Vite development path was separately checked with a Polish article.

The original keyword research remains a dated US/English snapshot. Translations are not fresh multilingual keyword-volume research and do not imply indexing or ranking guarantees. Translation drafts received editorial review, but were not certified by professional native-language reviewers.
