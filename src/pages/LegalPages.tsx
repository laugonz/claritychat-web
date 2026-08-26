import { PageFrame } from "../components";
import { SITE } from "../data";

function LegalLayout({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <PageFrame>
      <main className="legal-page">
        <div className="shell legal-copy">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {children}
        </div>
      </main>
    </PageFrame>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout eyebrow="Last updated August 26, 2026" title="Privacy policy">
      <p className="legal-lead">Clarity Chat processes the screenshots you choose to analyze. It does not use your conversations as an advertising product.</p>
      <h2>Conversation analysis</h2>
      <p>Selected screenshots are sent securely to Clarity Chat’s analysis service so the app can extract visible messages and produce a report. The published Clarity Chat privacy commitment states that conversations are processed once and are not stored, shared, reused or sold for advertising.</p>
      <p>Only upload material you have a lawful right to use. Crop names, phone numbers and unrelated personal information when they are not needed for your question.</p>
      <h2>Information on your device</h2>
      <p>The app may keep settings, usage limits and purchase entitlement information needed to operate. Apple processes App Store purchases and subscriptions; Clarity Chat does not receive your payment-card details.</p>
      <h2>Service providers</h2>
      <p>Clarity Chat relies on infrastructure and AI service providers to process an analysis, deliver app configuration and verify purchases. They receive only the information required to perform those functions under their applicable terms and privacy obligations.</p>
      <h2>No advertising sale</h2>
      <p>Clarity Chat does not sell conversation content or personal data to advertisers and does not reuse uploaded conversations for advertising.</p>
      <h2>Children and sensitive content</h2>
      <p>Do not upload intimate, medical, financial or identifying content that is not necessary. Clarity Chat is not designed for collecting children’s personal information.</p>
      <h2>Contact</h2>
      <p>For privacy questions, email <a href={`mailto:${SITE.email}?subject=Clarity%20Chat%20privacy`}>{SITE.email}</a>.</p>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout eyebrow="Last updated August 26, 2026" title="Terms of use">
      <p className="legal-lead">Clarity Chat is a personal reflection tool. It does not replace professional advice or direct communication.</p>
      <h2>Personal and lawful use</h2>
      <p>You may use Clarity Chat to analyze conversations for your own lawful purposes. You are responsible for having the right to upload the screenshots you select and for avoiding unnecessary personal information.</p>
      <h2>Automated insights</h2>
      <p>Reports are generated with automated language and image analysis. They may be incomplete or wrong. Clarity Chat cannot determine another person’s private intent, diagnose a person or relationship, or guarantee an outcome.</p>
      <h2>Health, safety and professional advice</h2>
      <p>Clarity Chat is not therapy, medical care, legal advice or emergency support. Do not make a high-stakes safety, health or legal decision solely from an app report. Contact an appropriate professional or local support service.</p>
      <h2>Purchases and subscriptions</h2>
      <p>Apple processes all in-app purchases. Any subscription renews according to the terms shown by Apple before confirmation and can be managed through your Apple account. Apple’s standard end-user license agreement also applies.</p>
      <h2>Availability</h2>
      <p>Features may change as the app is improved. We may restrict abusive or unlawful use and cannot promise uninterrupted access to every analysis service.</p>
      <h2>Contact</h2>
      <p>Questions about these terms can be sent to <a href={`mailto:${SITE.email}?subject=Clarity%20Chat%20terms`}>{SITE.email}</a>.</p>
    </LegalLayout>
  );
}

export function SupportPage() {
  return (
    <LegalLayout eyebrow="Clarity Chat support" title="How can we help?">
      <p className="legal-lead">If an analysis failed, a purchase is missing or something in the app does not look right, send us the details below.</p>
      <h2>Contact</h2>
      <p>Email <a href={`mailto:${SITE.email}?subject=Clarity%20Chat%20support`}>{SITE.email}</a>. Include your device model, iOS version and a short description of what happened. Do not attach private chat screenshots unless we specifically ask for a redacted example.</p>
      <h2>Restore a purchase</h2>
      <p>Open Clarity Chat and use the restore option on the purchase screen. Confirm that the device is signed into the same Apple account used for the original purchase.</p>
      <h2>Analysis is taking too long</h2>
      <p>Use clear screenshots, keep the app open and try a smaller set if the connection is slow. Up to four images are supported, but one or two consecutive screenshots may be enough for a focused question.</p>
      <h2>Urgent relationship or safety concerns</h2>
      <p>Support cannot provide crisis care or assess abuse. If you are in immediate danger, contact local emergency services. For relationship-abuse concerns, use a trusted local hotline or advocate from a safe device.</p>
    </LegalLayout>
  );
}
