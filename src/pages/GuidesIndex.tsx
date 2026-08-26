import { GuideCard, PageFrame } from "../components";
import { guides } from "../data";

export default function GuidesIndex() {
  return (
    <PageFrame>
      <main className="inner-page">
        <section className="index-hero">
          <div className="shell narrow-shell">
            <span className="eyebrow">Clarity Chat guides</span>
            <h1>Understand the pattern without pretending to read minds</h1>
            <p>Context-first guides for analyzing texts, mixed signals, ghosting and concerning communication. Each one separates what a screenshot can show from what it cannot know.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell guide-grid">
            {guides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
