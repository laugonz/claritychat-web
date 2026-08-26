# Clarity Chat landing contract

## App identity

| Field | Value |
|---|---|
| Public brand | Clarity Chat |
| App Store name | Deep Conversations: Clarity |
| App Store ID | `6740494653` |
| Bundle ID | `com.laugonz.EmotionsDetector` |
| Seller | Laura Gonzalez Lopez |
| Platform | iPhone and iPad; no matching Google Play listing found |
| Category | Lifestyle; Social Networking |
| Price | Free download with in-app purchases |
| Rating snapshot | 4.5 from 18 ratings on the US storefront, 2026-08-26 |
| Version snapshot | 1.10, released 2025-06-25 |
| Production URL | `https://claritychat.app` |
| App Store URL | `https://apps.apple.com/us/app/deep-conversations-clarity/id6740494653` |

## App Store description (verbatim snapshot)

> Looking for honest relationship advice without judgment? Deep Conversations Analyzer: Clarity Chat gives you your own WhatsApp Wrapped but for emotions. Get relationship advice from your chats. Clarity Chat helps you decode messages, spot red flags, social ghost, and understand emotions: fast, smart, and completely private. Upload a screen shot of any conversation and let our therapy AI uncover red flags, social ghost, emotional patterns, or disconnects you might have missed. Whether you’re navigating a long-distance chat, reflecting on your AI lover, or just curious about how your AI friends might interpret the tone, Clarity offers clarity, not labels. It’s fast, private, and built to support your emotional insight.
>
> Deep Conversations Analyzer: Clarity Chat uses AI to analyze your screenshots and text messages (WhatsApp, Tinder, Instagram…) to uncover hidden emotions, detect red flags, spot social ghosting, and reveal toxic patterns affecting your relationships.
>
> Get emotional clarity: fast, private, and without judgment.
>
> • What you can do with Deep Conversations Analyzer Clarity Chat:
> • Upload chat screenshots instantly.
> • Detect emotions like warmth, coldness, or frustration.
> • Identify toxic behaviors, gaslighting, narcissism, or avoidance.
> • Visualize emotional dynamics for each contact.
>
> • How it works:
> 1. Screenshot your chat.
> 2. Let Clarity analyze it.
> 3. Discover emotional clarity you didn’t expect.
>
> Our approach:
> Clarity Chat offers clarity, not judgment.
> We reveal emotional patterns respectfully, without diagnosing or labeling anyone.
> You stay in control. Your emotions deserve clarity, not confusion.
>
> No data is stored. 100% private.
>
> Disclaimer: Designed by a Psychology-trained developer, focused on emotional support, not clinical diagnosis.

## Asset and screenshot findings

- `public/assets/icon.png`: 1024×1024. White ground, teal chat bubble, navy magnifier and orange warning marker.
- Screenshots 1–4: dark navy result screen for a romantic chat. They show participant-level emotions, tones, comfort rings, behavior examples, positive/negative aspects, recommended actions, message counts, response times, silences, topics and sentiment evolution.
- Screenshot 5: upload screen. It explicitly supports up to four chat images, shows three free analyses in the captured state and has a single Analyze action.
- Production JPEGs are 631×1369 and 82–116 KB. Original 1053×2282 PNGs stay under `public/assets/full/` and are excluded from deployment.

## Product claims allowed on the landing

- Upload up to four screenshots from a text conversation.
- Review emotions, observed tone, concrete excerpts, response patterns, silences and a conversation-level summary.
- Receive reflective next steps such as clarifying a misunderstanding or setting a boundary.
- The published privacy policy says conversations are processed once and are not stored, shared, reused or sold for advertising.
- Clarity Chat is a reflection tool. It cannot read another person’s mind, prove intent, diagnose abuse or replace professional mental-health or safety support.

## Keyword research

Everank/DataForSEO snapshot for United States / English on 2026-08-26. Volume and CPC are directional monthly estimates. Empty fields mean no reportable data, not zero demand.

| Keyword | Volume | CPC (USD) | Difficulty | Intent | Placement |
|---|---:|---:|---:|---|---|
| AI relationship advice | 480 | 3.58 | 0 | Informational | Hero support copy; guide |
| analyze text messages | 320 | — | 2 | Informational | H1; how-it-works; guide |
| relationship advice app | 210 | 4.48 | 17 | Informational | Title/meta; download CTA |
| chat analyzer | 170 | — | 11 | Informational | Features and guides index |
| text message analyzer | 110 | 9.00 | 8 | Commercial | Title/H1; guide |
| conversation analyzer | 50 | — | 0 | Informational | Feature copy |
| WhatsApp chat analyzer | 40 | 4.86 | 7 | Transactional | FAQ; guide support term |
| how to tell if someone likes you over text | 170 | 0.05 | 3 | Informational | Guide |
| why did he ghost me | 210 | 0.78 | 0 | Informational | Gender-neutral guide targeting the query |
| gaslighting signs | 880 | 0.29 | 40 | Informational | Safety-framed guide; never a diagnosis claim |
| toxic relationship signs | 4,400 | 0.62 | 8 | Informational | Safety-framed guide; authoritative outbound sources |

Spain and Mexico were measured separately. Their product phrases mostly returned no numeric data; the few reported queries were far smaller than the US English set. The first public cluster therefore targets US English only. Do not blend those Spanish markets into the English figures.

## SERP validation

- `analyze text messages` and `text message analyzer` return a mix of how-to articles and screenshot/chat-analysis products. The intent fits a guide that teaches context-first review and then presents the app.
- `AI relationship advice` returns apps, consumer technology reporting and prompt-led advice. Clarity Chat should position AI as a second look, not an authority or replacement for a real conversation.
- Attraction and ghosting searches return practical list articles and product-led guides. The page must resist certainty: consistency, reciprocal questions and real-world plans are stronger evidence than a single enthusiastic text.
- Gaslighting/toxic-relationship searches include medical and relationship-safety publishers. Those guides must define repeated patterns, cite responsible resources and direct anyone in danger to local emergency or domestic-abuse support.

## Primary placement map

- `<title>`: `Clarity Chat — AI Text Message Analyzer`
- H1: `AI text message analyzer for relationship clarity`
- Meta description: `Upload chat screenshots and review tone, emotions, response patterns and concrete examples with Clarity Chat. Private, reflective and judgment-free.`
- Secondary terms: chat analyzer, conversation analyzer, relationship advice app, emotional tone, response patterns, message screenshots.
- Homepage sections: hero/download, what the report shows, screenshots, three-step workflow, guides, ten FAQs, final download CTA.

## Guide cluster

1. `/guides/how-to-analyze-text-messages/` — analyze text messages
2. `/guides/ai-relationship-advice/` — AI relationship advice
3. `/guides/text-message-analyzer/` — text message analyzer
4. `/guides/how-to-tell-if-someone-likes-you-over-text/` — how to tell if someone likes you over text
5. `/guides/why-did-they-ghost-me/` — why did he ghost me
6. `/guides/gaslighting-in-text-messages/` — gaslighting signs in text messages
7. `/guides/unhealthy-texting-patterns/` — toxic relationship signs / unhealthy texting patterns

Each guide needs 600–900 words, a unique 1536×1024 feature image, one relevant product screenshot, an answer-first introduction, two unique FAQs, reciprocal related links, Article/Breadcrumb/FAQ schema and HowTo schema when the structure is step-based.

## Feature-image briefs

All images: editorial 3D illustration with soft tactile materials, deep navy and midnight-blue base, teal/cyan accents and a restrained warm orange focal point. No copied app UI. No readable messages. No labels or logos.

1. **Analyze text messages:** two abstract message cards on a desk beneath a glass magnifier, colored emotion pebbles arranged nearby, overhead composition.
2. **AI relationship advice:** two chairs facing each other with a phone placed between them and a soft teal reflection, calm human-scale scene.
3. **Text message analyzer:** layered speech bubbles passing through a translucent analytical lens, a few colored dots separating into tone groups.
4. **Someone likes you over text:** two phones on opposite sides of a small table connected by a warm thread of light, balanced rather than romantic-cliché imagery.
5. **Ghosting:** one lit phone beside an empty chair at dusk, a fading line of message-shaped light, quiet rather than melodramatic.
6. **Gaslighting in texts:** overlapping translucent message panels casting contradictory shadows, one steady orange reference marker, no threatening imagery.
7. **Unhealthy texting patterns:** a tangled loop of dark message tiles gradually opening into a clear path, safety-focused and non-clinical.

## ASO notes

- The current title carries broad `Deep Conversations` language but omits the high-value `text message analyzer` phrase. Test a subtitle such as `AI Text Message Analyzer` if App Store policy and localization allow it.
- Do not repeat title/subtitle words in the keyword field. Candidate concepts include `relationship,advice,chat,tone,ghosting,red flags,whatsapp` after checking live metadata for duplicates.
- With only 18 US ratings, ask for a review after a user opens a completed report or saves a useful takeaway, never before the first analysis.
