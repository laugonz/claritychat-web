import { useLocale, LANGUAGES, localizedPath } from "./i18n";
import type { ReactNode } from "react";
import { SITE, type Faq, type Guide } from "./data";

export function Header() {
  const { t, path } = useLocale();
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href={path("/")} aria-label={t("Clarity Chat home")}>
          <img src="/assets/icon.png" width="48" height="48" alt="" />
          <span>Clarity Chat</span>
        </a>
        <nav aria-label={t("Main navigation")}>
          <a href={path("/#report")}>{t("What you see")}</a>
          <a href={path("/#how-it-works")}>{t("How it works")}</a>
          <a href={path("/guides/")}>{t("Guides")}</a>
          <a href={path("/#faq")}>{t("FAQ")}</a>
        </nav>
        <LanguagePicker />
        <StoreButton compact />
      </div>
    </header>
  );
}

function LanguagePicker() {
  const { locale, basePath, t } = useLocale();
  return (
    <details className="language-picker">
      <summary aria-label={t("Choose language")}>◎ <span lang={locale}>{LANGUAGES.find(item => item.code === locale)!.label}</span><span aria-hidden="true">⌄</span></summary>
      <ul aria-label={t("Available languages")}>
        {LANGUAGES.map(item => <li key={item.code}><a href={localizedPath(item.code, basePath)} lang={item.code} hrefLang={item.code} aria-current={item.code === locale ? "page" : undefined}>{item.label}{item.code === locale && <span aria-hidden="true"> ✓</span>}</a></li>)}
      </ul>
    </details>
  );
}

export function Footer() {
  const { t, path } = useLocale();
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <a className="brand footer-brand" href={path("/")}>
            <img src="/assets/icon.png" width="42" height="42" alt="" />
            <span>Clarity Chat</span>
          </a>
          <p>{t("A private second look at the conversation, never a verdict.")}</p>
        </div>
        <div className="footer-links" aria-label={t("Footer links")}>
          <a href={path("/guides/")}>{t("Guides")}</a>
          <a href={path("/privacy/")}>{t("Privacy")}</a>
          <a href={path("/terms/")}>{t("Terms")}</a>
          <a href={path("/support/")}>{t("Support")}</a>
          <a href={SITE.appStoreCampaignUrl}>App Store</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Laura Gonzalez Lopez</span>
        <span>{t("Reflection tool · Not therapy or emergency support")}</span>
      </div>
    </footer>
  );
}

export function StoreButton({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();
  return (
    <a
      className={compact ? "store-button store-button-compact" : "store-button"}
      href={SITE.appStoreCampaignUrl}
      aria-label={t("Download Clarity Chat on the App Store")}
    >
      <span className="store-symbol" aria-hidden="true">●</span>
      <span>
        <small>{t(compact ? "Get the app" : "Download on the")}</small>
        <strong>App Store</strong>
      </span>
    </a>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export function GuideCard({ guide, compact = false }: { guide: Guide; compact?: boolean }) {
  const { t, path } = useLocale();
  return (
    <a className={compact ? "guide-card guide-card-compact" : "guide-card"} href={path(`/guides/${guide.slug}/`)}>
      <img
        src={guide.featureImage.src}
        alt={guide.featureImage.alt}
        width={guide.featureImage.width}
        height={guide.featureImage.height}
        loading="lazy"
      />
      <span className="guide-card-body">
        <span className="guide-kicker">{guide.keyword}</span>
        <strong>{guide.title}</strong>
        {!compact && <span>{guide.description}</span>}
        <span className="text-link">{t("Read guide")}{" "}<span aria-hidden="true">→</span></span>
      </span>
    </a>
  );
}

export function FaqItem({ faq }: { faq: Faq }) {
  const { t, path } = useLocale();
  return (
    <details className="faq-item">
      <summary>{faq.question}</summary>
      <div>
        <p>{faq.answer}</p>
        {faq.guideSlug && <a href={path(`/guides/${faq.guideSlug}/`)}>{t("Learn more")}{" "}<span aria-hidden="true">→</span></a>}
      </div>
    </details>
  );
}

export function CtaCallout({ children }: { children?: ReactNode }) {
  const { t } = useLocale();
  return (
    <aside className="article-cta">
      <div>
        <span className="eyebrow">{t("Try it with your own context")}</span>
        <strong>{children ?? t("Turn up to four chat screenshots into a report you can inspect.")}</strong>
        <p>{t("Read the examples, add the context only you know and keep control of the conclusion.")}</p>
      </div>
      <StoreButton />
    </aside>
  );
}

export function SafetyNote() {
  const { t } = useLocale();
  return (
    <aside className="safety-note">
      <strong>{t("If you feel unsafe")}</strong>
      <p>{t("Clarity Chat is not emergency support. Contact local emergency services or a trusted relationship-abuse service from a safe device.")}</p>
    </aside>
  );
}
