import type { ReactNode } from "react";
import { SITE, type Faq, type Guide } from "./data";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="/" aria-label="Clarity Chat home">
          <img src="/assets/icon.png" width="48" height="48" alt="" />
          <span>Clarity Chat</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="/#report">What you see</a>
          <a href="/#how-it-works">How it works</a>
          <a href="/guides/">Guides</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <StoreButton compact />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <a className="brand footer-brand" href="/">
            <img src="/assets/icon.png" width="42" height="42" alt="" />
            <span>Clarity Chat</span>
          </a>
          <p>A private second look at the conversation, never a verdict.</p>
        </div>
        <div className="footer-links" aria-label="Footer links">
          <a href="/guides/">Guides</a>
          <a href="/privacy/">Privacy</a>
          <a href="/terms/">Terms</a>
          <a href="/support/">Support</a>
          <a href={SITE.appStoreUrl}>App Store</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Laura Gonzalez Lopez</span>
        <span>Reflection tool · Not therapy or emergency support</span>
      </div>
    </footer>
  );
}

export function StoreButton({ compact = false }: { compact?: boolean }) {
  return (
    <a
      className={compact ? "store-button store-button-compact" : "store-button"}
      href={SITE.appStoreUrl}
      aria-label="Download Clarity Chat on the App Store"
    >
      <span className="store-symbol" aria-hidden="true">●</span>
      <span>
        <small>{compact ? "Get the app" : "Download on the"}</small>
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
  return (
    <a className={compact ? "guide-card guide-card-compact" : "guide-card"} href={`/guides/${guide.slug}/`}>
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
        <span className="text-link">Read guide <span aria-hidden="true">→</span></span>
      </span>
    </a>
  );
}

export function FaqItem({ faq }: { faq: Faq }) {
  return (
    <details className="faq-item">
      <summary>{faq.question}</summary>
      <div>
        <p>{faq.answer}</p>
        {faq.guideSlug && <a href={`/guides/${faq.guideSlug}/`}>Learn more <span aria-hidden="true">→</span></a>}
      </div>
    </details>
  );
}

export function CtaCallout({ children }: { children?: ReactNode }) {
  return (
    <aside className="article-cta">
      <div>
        <span className="eyebrow">Try it with your own context</span>
        <strong>{children ?? "Turn up to four chat screenshots into a report you can inspect."}</strong>
        <p>Read the examples, add the context only you know and keep control of the conclusion.</p>
      </div>
      <StoreButton />
    </aside>
  );
}

export function SafetyNote() {
  return (
    <aside className="safety-note">
      <strong>If you feel unsafe</strong>
      <p>
        Clarity Chat is not emergency support. Contact local emergency services or a trusted relationship-abuse service from a safe device.
      </p>
    </aside>
  );
}
