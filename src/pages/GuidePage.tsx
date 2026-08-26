import { CtaCallout, FaqItem, GuideCard, PageFrame, SafetyNote } from "../components";
import { guideBySlug, type Guide } from "../data";

function ArticleParagraph({ text }: { text: string }) {
  return <p dangerouslySetInnerHTML={{ __html: text }} />;
}

export default function GuidePage({ guide }: { guide: Guide }) {
  const related = guide.related.map((slug) => guideBySlug.get(slug)).filter((item): item is Guide => Boolean(item));
  const isSafetyGuide = guide.slug === "gaslighting-in-text-messages" || guide.slug === "unhealthy-texting-patterns";
  const sectionId = (heading: string) => heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <PageFrame>
      <main className="article-page">
        <article>
          <header className="article-header shell narrow-shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Clarity Chat</a><span aria-hidden="true">/</span><a href="/guides/">Guides</a>
            </nav>
            <span className="guide-kicker">{guide.keyword}</span>
            <h1>{guide.h1}</h1>
            <p className="article-dek">{guide.description}</p>
            <div className="article-meta"><span>{guide.readTime}</span><span>Updated August 26, 2026</span></div>
          </header>

          <div className="shell article-feature-wrap">
            <img
              className="article-feature"
              src={guide.featureImage.src}
              alt={guide.featureImage.alt}
              width={guide.featureImage.width}
              height={guide.featureImage.height}
              fetchPriority="high"
            />
          </div>

          <div className="shell article-grid">
            <div className="article-body">
              <p className="article-intro">{guide.intro}</p>

              {guide.howTo && (
                <section className="howto-box" aria-labelledby="howto-heading">
                  <span className="eyebrow">Step by step</span>
                  <h2 id="howto-heading">{guide.howTo.name}</h2>
                  <ol>{guide.howTo.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                </section>
              )}

              {isSafetyGuide && <SafetyNote />}

              {guide.sections.map((section, index) => (
                <section key={section.h2} id={sectionId(section.h2)}>
                  <h2>{section.h2}</h2>
                  {section.paras.map((para) => <ArticleParagraph key={para} text={para} />)}
                  {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                  {section.steps && <ol>{section.steps.map((step) => <li key={step}>{step}</li>)}</ol>}
                  {section.callout && <CtaCallout>{section.callout}</CtaCallout>}
                  {index === 1 && (
                    <figure className="article-screenshot">
                      <img src={guide.screenshot.src} alt={guide.screenshot.alt} width={guide.screenshot.width} height={guide.screenshot.height} loading="lazy" />
                      <figcaption>{guide.screenshot.caption}</figcaption>
                    </figure>
                  )}
                </section>
              ))}

              {guide.sources && (
                <section className="sources">
                  <h2>Responsible sources and support</h2>
                  <ul>{guide.sources.map((source) => <li key={source.href}><a href={source.href}>{source.label}</a></li>)}</ul>
                </section>
              )}

              <section className="article-faq">
                <span className="eyebrow">Quick answers</span>
                <h2>Questions about this guide</h2>
                {guide.faq.map((faq) => <FaqItem key={faq.question} faq={faq} />)}
              </section>
            </div>

            <aside className="article-sidebar">
              <div className="sidebar-card">
                <span className="eyebrow">Keep in mind</span>
                <strong>Visible messages are only part of the relationship.</strong>
                <p>Check context, repeated behavior and how safe you feel raising a concern.</p>
              </div>
              <div className="sidebar-card sidebar-links">
                <strong>In this guide</strong>
                {guide.sections.map((section) => <a key={section.h2} href={`#${sectionId(section.h2)}`}>{section.h2}</a>)}
              </div>
            </aside>
          </div>
        </article>

        <section className="related-guides section">
          <div className="shell">
            <div className="section-heading split-heading"><div><span className="eyebrow">Keep reading</span><h2>Related Clarity Chat guides</h2></div></div>
            <div className="guide-grid guide-grid-three">{related.map((item) => <GuideCard key={item.slug} guide={item} compact />)}</div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
