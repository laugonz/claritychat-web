import { contentFor, translate, localizedPath, type Locale } from "./i18n";
import { SITE, type Guide } from "./data";

const absolute = (path: string) => (path.startsWith("http") ? path : `${SITE.url}${path}`);

export function homeJsonLd(locale: Locale) {
  const t = (text: string) => translate(locale, text);
  const { homeFaqs } = contentFor(locale);
  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE.name,
      alternateName: "Deep Conversations: Clarity",
      description: t(SITE.description),
      applicationCategory: "LifestyleApplication",
      operatingSystem: "iOS 17.6 or later",
      url: `${SITE.url}${localizedPath(locale, "/")}`,
      installUrl: SITE.appStoreUrl,
      image: absolute("/assets/icon.png"),
      screenshot: absolute("/assets/screenshots/screenshot-1.jpg"),
      author: { "@type": "Person", name: "Laura Gonzalez Lopez" },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: t("Free download with optional in-app purchases"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: homeFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: `${SITE.url}${localizedPath(locale, "/")}`,
      description: t(SITE.description),
      inLanguage: locale,
    },
  ];
}

export function guideJsonLd(guide: Guide, locale: Locale) {
  const t = (text: string) => translate(locale, text);
  const pageUrl = `${SITE.url}${localizedPath(locale, `/guides/${guide.slug}/`)}`;
  const items: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      image: absolute(guide.featureImage.src),
      datePublished: SITE.published,
      dateModified: guide.reviewed ?? SITE.published,
      inLanguage: locale,
      author: { "@type": "Person", name: "Laura Gonzalez Lopez" },
      publisher: {
        "@type": "Organization",
        name: SITE.name,
        logo: { "@type": "ImageObject", url: absolute("/assets/icon.png") },
      },
      mainEntityOfPage: pageUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE.name, item: `${SITE.url}${localizedPath(locale, "/")}` },
        { "@type": "ListItem", position: 2, name: t("Guides"), item: `${SITE.url}${localizedPath(locale, "/guides/")}` },
        { "@type": "ListItem", position: 3, name: guide.title, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faq.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  if (guide.howTo) {
    items.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: guide.howTo.name,
      description: guide.description,
      image: absolute(guide.featureImage.src),
      step: guide.howTo.steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: `${t("Step")} ${index + 1}`,
        text: step,
      })),
    });
  }

  return items;
}

export function guidesIndexJsonLd(locale: Locale) {
  const t = (text: string) => translate(locale, text);
  const { guides } = contentFor(locale);
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: t("Clarity Chat relationship and text analysis guides"),
      description: t("Context-first guides for text analysis, mixed signals, ghosting and concerning communication."),
      url: `${SITE.url}${localizedPath(locale, "/guides/")}`,
      inLanguage: locale,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: guides.map((guide, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${SITE.url}${localizedPath(locale, `/guides/${guide.slug}/`)}`,
          name: guide.title,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE.name, item: `${SITE.url}${localizedPath(locale, "/")}` },
        { "@type": "ListItem", position: 2, name: t("Guides"), item: `${SITE.url}${localizedPath(locale, "/guides/")}` },
      ],
    },
  ];
}

export function webPageJsonLd(name: string, description: string, path: string, locale: Locale) {
  const t = (text: string) => translate(locale, text);
  return [{
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t(name),
    description: t(description),
    url: `${SITE.url}${localizedPath(locale, path)}`,
    inLanguage: locale,
  }];
}
