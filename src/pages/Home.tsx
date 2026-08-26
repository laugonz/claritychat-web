import { FaqItem, GuideCard, PageFrame, StoreButton } from "../components";
import { guides, homeFaqs, screenshots } from "../data";

const reportFeatures = [
  {
    icon: "01",
    title: "Emotion and tone",
    body: "Review warmth, concern, coldness, frustration and other observed signals by participant.",
  },
  {
    icon: "02",
    title: "Examples, not mystery scores",
    body: "See the excerpts behind a behavior indicator so you can decide whether the label fits.",
  },
  {
    icon: "03",
    title: "Timing and participation",
    body: "Compare message balance, average response time, interruptions and notable quiet moments.",
  },
  {
    icon: "04",
    title: "Conversation movement",
    body: "Notice recurring topics and how sentiment changes across the selected exchange.",
  },
  {
    icon: "05",
    title: "Strengths and concerns",
    body: "Keep positive repair attempts in view alongside avoidance, denial or emotional pressure.",
  },
  {
    icon: "06",
    title: "A next question",
    body: "Turn the report into one calm question, boundary or reflection instead of a verdict.",
  },
];

export default function Home() {
  return (
    <PageFrame>
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">The conversation, with room to think</span>
              <h1>AI text message analyzer for relationship clarity</h1>
              <p className="hero-lead">
                Upload chat screenshots and review tone, emotions, response patterns and the exact examples behind them. Clarity Chat gives you a second look, not a verdict.
              </p>
              <div className="hero-actions">
                <StoreButton />
                <a className="secondary-button" href="#how-it-works">See how it works</a>
              </div>
              <p className="hero-note">Free to download · Up to four screenshots · No account required</p>
              <div className="hero-proof" aria-label="Product principles">
                <span><strong>Private</strong> Processed once, not sold for ads</span>
                <span><strong>Inspectable</strong> Examples behind the insight</span>
                <span><strong>Grounded</strong> Reflection, never diagnosis</span>
              </div>
            </div>
            <div className="hero-visual" aria-label="Clarity Chat analysis preview">
              <div className="hero-orbit hero-orbit-one" />
              <div className="hero-orbit hero-orbit-two" />
              <img
                className="hero-phone"
                src="/assets/screenshots/screenshot-1.jpg"
                width="631"
                height="1369"
                alt="Clarity Chat report showing emotional tone and the text examples behind a behavior indicator"
                fetchPriority="high"
              />
              <div className="floating-insight insight-a">
                <span>Observed tone</span><strong>Detached · Sarcastic</strong>
              </div>
              <div className="floating-insight insight-b">
                <span>Check the evidence</span><strong>2 message examples</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip">
          <div className="shell">
            <p><strong>Clarity Chat cannot read minds.</strong> It helps you slow down a thread, notice repeated patterns and decide what you want to ask next.</p>
          </div>
        </section>

        <section id="report" className="section section-light">
          <div className="shell">
            <div className="section-heading split-heading">
              <div>
                <span className="eyebrow">What the report shows</span>
                <h2>Go back to the messages that matter</h2>
              </div>
              <p>A useful conversation analysis should make its reasoning visible. Clarity Chat connects the summary to examples, timing and the wider pattern inside your selected screenshots.</p>
            </div>
            <div className="feature-grid">
              {reportFeatures.map((feature) => (
                <article className="feature-card" key={feature.title}>
                  <span>{feature.icon}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section section-dark">
          <div className="shell">
            <div className="section-heading centered-heading">
              <span className="eyebrow">Three deliberate steps</span>
              <h2>From screenshots to a calmer next move</h2>
              <p>Keep the sample continuous, read the examples and add the context no model can see.</p>
            </div>
            <div className="steps-grid">
              <article><span>1</span><h3>Choose the exchange</h3><p>Select up to four consecutive screenshots. Include the lead-in and what happened after the moment you want to understand.</p></article>
              <article><span>2</span><h3>Inspect the report</h3><p>Review emotions, tone, timing and behavior examples. Reject an interpretation if the quoted evidence does not support it.</p></article>
              <article><span>3</span><h3>Add real context</h3><p>Consider what happened off-screen, then form one question, boundary or decision about your own next step.</p></article>
            </div>
          </div>
        </section>

        <section className="section screenshots-section">
          <div className="shell">
            <div className="section-heading split-heading">
              <div>
                <span className="eyebrow">Inside the app</span>
                <h2>A report you can actually inspect</h2>
              </div>
              <p>Clarity Chat separates participants, ties concerns to excerpts and keeps conversation strengths in view.</p>
            </div>
            <div className="screenshot-rail">
              {screenshots.map((shot) => (
                <figure key={shot.src}>
                  <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" />
                  <figcaption>{shot.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="section guides-section" id="guides">
          <div className="shell">
            <div className="section-heading split-heading">
              <div>
                <span className="eyebrow">Read before you conclude</span>
                <h2>Practical guides for confusing chats</h2>
              </div>
              <p>Context-first answers to the questions people search when one message starts taking up the whole day.</p>
            </div>
            <div className="guide-grid">
              {guides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
            </div>
            <p className="center-link"><a href="/guides/">Browse every guide <span aria-hidden="true">→</span></a></p>
          </div>
        </section>

        <section id="faq" className="section faq-section">
          <div className="shell faq-layout">
            <div className="faq-intro">
              <span className="eyebrow">Questions, answered plainly</span>
              <h2>What a chat analysis can and cannot do</h2>
              <p>Clarity Chat organizes visible communication. You keep the context, judgment and final decision.</p>
              <StoreButton />
            </div>
            <div className="faq-list">
              {homeFaqs.map((faq) => <FaqItem key={faq.question} faq={faq} />)}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="shell final-cta-inner">
            <div>
              <span className="eyebrow">One report. Your judgment.</span>
              <h2>Stop rereading the same line in a loop.</h2>
              <p>Choose the exchange, inspect the pattern and decide what deserves a real conversation.</p>
            </div>
            <StoreButton />
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
