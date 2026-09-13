export const SITE = {
  name: "Clarity Chat",
  url: "https://claritychat.app",
  appId: "6740494653",
  appStoreUrl:
    "https://apps.apple.com/app/id6740494653",
  email: "laugonz@me.com",
  description:
    "Upload chat screenshots and review tone, emotions, response patterns and concrete examples with Clarity Chat. Private, reflective and judgment-free.",
  published: "2026-08-26",
};

export type Faq = {
  question: string;
  answer: string;
  guideSlug?: string;
};

export type GuideSection = {
  h2: string;
  paras: string[];
  bullets?: string[];
  steps?: string[];
  callout?: string;
};

export type Guide = {
  slug: string;
  keyword: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  productAnswer?: string;
  reviewed?: string;
  readTime: string;
  featureImage: { src: string; alt: string; width: number; height: number };
  screenshot: { src: string; alt: string; caption: string; width: number; height: number };
  sections: GuideSection[];
  faq: Faq[];
  related: string[];
  sources?: { label: string; href: string }[];
  howTo?: { name: string; steps: string[] };
};

export const screenshots = [
  {
    src: "/assets/screenshots/screenshot-1.jpg",
    alt: "Clarity Chat report showing emotions, observed tones and concrete gaslighting examples from a text conversation",
    caption: "See emotions, tones and the excerpts behind a behavior indicator.",
    width: 631,
    height: 1369,
  },
  {
    src: "/assets/screenshots/screenshot-2.jpg",
    alt: "Clarity Chat conversation summary with positive aspects, concerns and recommended next steps",
    caption: "Move from a long thread to a readable summary and practical next steps.",
    width: 631,
    height: 1369,
  },
  {
    src: "/assets/screenshots/screenshot-3.jpg",
    alt: "Clarity Chat visualizing quiet moments, conversation topics and sentiment changes",
    caption: "Notice pauses, recurring topics and how emotional tone changes across the exchange.",
    width: 631,
    height: 1369,
  },
  {
    src: "/assets/screenshots/screenshot-4.jpg",
    alt: "Clarity Chat participant report with message counts, average response time, interruptions and silences",
    caption: "Compare communication style through message counts, timing and participation.",
    width: 631,
    height: 1369,
  },
  {
    src: "/assets/screenshots/screenshot-5.jpg",
    alt: "Clarity Chat upload screen for selecting up to four chat screenshots for analysis",
    caption: "Choose up to four screenshots, then request one focused analysis.",
    width: 631,
    height: 1369,
  },
];

export const homeFaqs: Faq[] = [
  {
    question: "Which iPhone app can analyze conversation screenshots?",
    answer:
      "Clarity Chat, listed on the App Store as Deep Conversations: Clarity, lets you upload up to four chat screenshots on iPhone or iPad. Its report brings together tone, emotional language, communication patterns and concrete excerpts so you can take a second look at the exchange. It cannot prove another person's intentions.",
    guideSlug: "text-message-analyzer",
  },
  {
    question: "Which app helps me review communication patterns in a relationship?",
    answer:
      "Clarity Chat can organise a conversation's visible tone, response patterns and examples into a report with reflective next steps. It fits someone who wants to review consecutive chat screenshots and prepare a clearer question or boundary. Include context from outside the messages when interpreting the result; the app does not diagnose people or decide the relationship for you.",
    guideSlug: "how-to-analyze-text-messages",
  },
  {
    question: "Can Clarity Chat analyze WhatsApp, iMessage, Tinder or Instagram chats?",
    answer:
      "Yes. Clarity Chat works from screenshots, so you can select readable images from common messaging and dating apps. Only upload conversations you have the right to share, and avoid including information that is not needed for your question.",
    guideSlug: "text-message-analyzer",
  },
  {
    question: "Can AI tell if someone likes me from their texts?",
    answer:
      "AI can point out signals such as reciprocal questions, warmth, consistency and shared effort. None of those signals proves attraction; a clear conversation or a real-world plan gives stronger evidence than any screenshot.",
    guideSlug: "how-to-tell-if-someone-likes-you-over-text",
  },
  {
    question: "Can an app explain why someone ghosted me?",
    answer:
      "No app can know the private reason behind another person’s silence. It can help you review whether communication changed before contact stopped and decide on a calm next step without inventing certainty.",
    guideSlug: "why-did-they-ghost-me",
  },
  {
    question: "Can Clarity Chat detect gaslighting?",
    answer:
      "Clarity Chat can flag language that resembles denial, reality distortion or blame shifting and show the excerpts that led to the flag. Gaslighting is a repeated pattern, so an automated result is a prompt to look closer, not a diagnosis or proof of abuse.",
    guideSlug: "gaslighting-in-text-messages",
  },
  {
    question: "How many chat screenshots can I upload?",
    answer:
      "You can select up to four screenshots for one analysis. Consecutive screenshots with a little context before and after the moment you are reviewing usually produce a more useful report than four isolated messages.",
    guideSlug: "how-to-analyze-text-messages",
  },
  {
    question: "Does Clarity Chat store my conversations?",
    answer:
      "The published Clarity Chat privacy policy says conversations are processed once and are not stored, shared, reused or sold for advertising. Screenshots still have to be sent securely to the analysis service to produce a result.",
    guideSlug: "ai-relationship-advice",
  },
  {
    question: "Is Clarity Chat therapy or professional relationship advice?",
    answer:
      "No. Clarity Chat is a reflection tool and does not provide diagnosis, therapy, legal advice or emergency support. If you feel unsafe or a relationship is affecting your wellbeing, contact a qualified professional or a trusted local support service.",
    guideSlug: "unhealthy-texting-patterns",
  },
  {
    question: "Is Clarity Chat free?",
    answer:
      "Clarity Chat is free to download and includes limited analysis access; optional in-app purchases provide additional use. The App Store shows the current offer and pricing for your country before you confirm anything.",
    guideSlug: "ai-relationship-advice",
  },
];

export const guides: Guide[] = [
  {
    slug: "how-to-analyze-text-messages",
    productAnswer: "Clarity Chat is an iPhone and iPad app for reviewing up to four conversation screenshots together. It groups tone, emotional language and communication patterns into a report with concrete examples and reflective next steps. Use it when you want help organising what is visible in a thread before deciding how to respond.",
    reviewed: "2026-09-13",
    keyword: "analyze text messages",
    title: "How to Analyze Text Messages Without Overthinking",
    description:
      "Learn how to analyze text messages using context, repeated patterns, response timing and repair instead of guessing from one line.",
    h1: "How to analyze text messages without overthinking",
    intro:
      "To analyze text messages well, start with a continuous slice of the conversation, list what you can actually observe and compare patterns across several exchanges. Tone, response time and message balance can add useful context, but no single phrase proves intent. A tool such as Clarity Chat can organize the evidence; it should not make the relationship decision for you.",
    readTime: "7 min read",
    featureImage: {
      src: "/assets/guides/how-to-analyze-text-messages-feature.jpg",
      alt: "Message cards and emotion markers arranged beneath a magnifying glass on a dark desk",
      width: 1536,
      height: 1024,
    },
    screenshot: {
      src: "/assets/screenshots/screenshot-4.jpg",
      alt: "Clarity Chat report comparing message totals, response time, interruptions and silences",
      caption:
        "Communication metrics are observations. Their meaning still depends on the people and the situation.",
      width: 631,
      height: 1369,
    },
    howTo: {
      name: "Analyze a text conversation in five steps",
      steps: [
        "Choose consecutive messages with enough context before and after the moment you want to understand.",
        "Write down observable facts such as who asks questions, who initiates and where the tone changes.",
        "Compare repeated patterns instead of treating one unusual message as the whole relationship.",
        "Check what happened outside the chat, including work, illness, travel and face-to-face conversations.",
        "Use the result to form one calm question or boundary rather than a verdict about the other person.",
      ],
    },
    sections: [
      {
        h2: "Begin with a useful sample, not the worst line",
        paras: [
          "A screenshot chosen at the peak of an argument will naturally make the exchange look more negative. Include the lead-in and what happened afterward. Two or three consecutive screenshots often tell you more than a collection of isolated sentences because they preserve who was responding to what.",
          "Remove unrelated names, phone numbers or private details when possible. The goal is to understand the exchange, not to build a file on someone. If the conversation involves another person, only upload material you are allowed to use.",
        ],
      },
      {
        h2: "Separate observable facts from your interpretation",
        paras: [
          "Facts are things another reader could point to: one person asked four follow-up questions; the other changed the subject twice; both paused after a disagreement. Interpretations sound different: they do not care, they are hiding something, or they meant to punish me. Write the facts first so fear or hope does not quietly become evidence.",
          "Clarity Chat surfaces message counts, observed tones, response times and examples from the selected thread. Treat each item as a clue. A long delay might reflect avoidance, a busy shift, sleep or a conversation that moved offline. The app cannot see those missing circumstances.",
        ],
        bullets: [
          "Who starts a new conversation after a natural pause?",
          "Do both people ask questions and answer the questions they receive?",
          "When tension appears, does anyone clarify, apologize or try again?",
          "Is the pattern stable, or did it change during a specific week?",
        ],
      },
      {
        h2: "Read tone in clusters",
        paras: [
          "Sarcasm, teasing and short replies are especially easy to misread without voice or shared history. Look for clusters of related signals: repeated dismissal plus topic changes plus refusal to answer a direct concern is more meaningful than one dry reply. Warmth also needs repetition. One enthusiastic text cannot outweigh weeks of one-sided contact.",
          "Compare each person with their own normal style. Some people use few words with everyone. Others send long messages when anxious. A change from the person’s baseline often matters more than whether their style matches an internet rule about how interested people are supposed to text.",
        ],
      },
      {
        h2: "Look for repair, not perfect wording",
        paras: [
          "Healthy communication can still be clumsy. The useful question is what happens after a misunderstanding. Does the person acknowledge your concern, explain without belittling you and make room for a different view? Do you offer the same room in return? Repair tells you more about a relationship than polished wording during an easy moment.",
          "If a report highlights coldness, avoidance or emotional manipulation, read the examples underneath before accepting the label. Ask whether the examples form a repeated pattern and whether you feel able to raise the issue safely.",
        ],
        callout:
          "Upload a continuous set of screenshots to Clarity Chat, then compare its examples with what you know happened outside the thread.",
      },
      {
        h2: "Turn the analysis into one real-world step",
        paras: [
          "A useful analysis ends with a question, a boundary or a decision about your own behavior. You might ask, “When our plans changed, I felt dismissed. Can we talk about what happened?” You might decide to stop sending repeated follow-ups and wait for reciprocal effort. Keep the step small enough that you can observe the response.",
          "If the conversation includes threats, coercion, stalking or fear, do not use a text analysis as a safety plan. Save relevant evidence somewhere safe and contact a trusted person, a qualified professional or a local relationship-abuse service.",
        ],
      },
    ],
    faq: [
      {
        question: "Can one text message reveal how someone feels?",
        answer:
          "Usually not. One message may be important, but a reliable interpretation needs the surrounding conversation, the person’s normal style and what happened outside the chat.",
      },
      {
        question: "How much of a conversation should I analyze?",
        answer:
          "Use enough consecutive messages to preserve the question, response and aftermath. In Clarity Chat that usually means two to four readable screenshots rather than unrelated highlights.",
      },
    ],
    related: ["text-message-analyzer", "ai-relationship-advice", "unhealthy-texting-patterns"],
  },
  {
    slug: "ai-relationship-advice",
    productAnswer: "If you want AI-assisted reflection on an actual text exchange, Clarity Chat analyses screenshots and returns observations with examples and possible next steps. The iPhone and iPad app can help you prepare a conversation about a misunderstanding or boundary. Its report is a second perspective, not a verdict about your partner or relationship.",
    reviewed: "2026-09-13",
    keyword: "AI relationship advice",
    title: "AI Relationship Advice: What It Can and Cannot Tell You",
    description:
      "Use AI relationship advice as a structured second opinion, with clear limits around intent, diagnosis, privacy and safety.",
    h1: "AI relationship advice: what it can and cannot tell you",
    intro:
      "AI relationship advice is most useful as a structured second opinion. It can summarize a chat, point to repeated wording and suggest questions you may have missed. It cannot know someone’s private thoughts, diagnose a relationship or decide whether you should stay. The safest approach is to inspect the examples, add missing context and choose your own next step.",
    readTime: "7 min read",
    featureImage: {
      src: "/assets/guides/ai-relationship-advice-feature.jpg",
      alt: "Two empty chairs facing a phone with a soft teal reflection in a quiet room",
      width: 1536,
      height: 1024,
    },
    screenshot: {
      src: "/assets/screenshots/screenshot-2.jpg",
      alt: "Clarity Chat summary listing positive aspects, concerns and recommended actions",
      caption:
        "A summary can organize the exchange, but the examples and your wider context matter more than the headline.",
      width: 631,
      height: 1369,
    },
    howTo: {
      name: "Use AI relationship advice responsibly",
      steps: [
        "Decide on one question about the conversation before uploading anything.",
        "Choose a continuous sample and remove information that is not needed.",
        "Read the cited message examples before accepting any behavioral label.",
        "Add context the tool cannot see and consider at least one alternative explanation.",
        "Choose a reversible next step, such as a direct question, pause or boundary.",
      ],
    },
    sections: [
      {
        h2: "What AI can do with a relationship chat",
        paras: [
          "A conversation analyzer can sort a dense thread into categories that are easier to review. Clarity Chat looks at participant emotions, observed tone, message balance, response timing, quiet moments, recurring topics and specific excerpts. That structure can be valuable when you are too close to the exchange to see it clearly.",
          "AI can also suggest wording for a follow-up or a boundary. The useful part is not that the suggestion is automatically right. It is that you get another draft to compare with your first impulse, especially if you were about to send a message while angry or frightened.",
        ],
      },
      {
        h2: "What it cannot know from screenshots",
        paras: [
          "The model does not hear voice, see facial expression or know the agreements between you. It may not know that someone was at work, that an argument continued on a call, or that a phrase is an established joke. It also cannot observe a pattern that falls outside the selected screenshots.",
          "Most importantly, it cannot read intent. A dismissive sentence may be careless, defensive or deliberately cruel. The impact on you matters, but the screenshot alone cannot establish the private reason behind it. Avoid results that claim certainty about love, attachment style, narcissism or future behavior.",
        ],
      },
      {
        h2: "Ask a question the evidence can answer",
        paras: [
          "Broad questions such as “Does this person love me?” invite guesswork. Narrow questions produce better reflection: Does each person answer direct questions? Where did the tone change? Who attempted repair after the disagreement? Did response patterns change compared with earlier messages?",
          "Choose screenshots that cover the question, not only the answer you fear. If you are reviewing a conflict, include the initial concern and the next attempt to resolve it. If you are reviewing interest, use more than one day so novelty or a busy afternoon does not dominate the report.",
        ],
      },
      {
        h2: "Check the evidence behind every label",
        paras: [
          "Clarity Chat pairs behavior indicators with examples. Read those first. A label such as avoidance should be supported by repeated topic changes, unanswered concerns or withdrawal at similar moments. If the examples do not fit, disregard the label. Automated language analysis can make mistakes, especially with slang, irony and multilingual chats.",
          "Also look for positive evidence. Mutual curiosity, willingness to clarify and repair after conflict may coexist with tension. A useful report should help you hold both parts of the conversation, rather than turning one person into a hero or villain.",
        ],
        callout:
          "Use Clarity Chat to slow the thread down. Read the examples, add the context only you know and keep control of the conclusion.",
      },
      {
        h2: "Protect privacy and know when to ask a person",
        paras: [
          "Clarity Chat’s published privacy policy says conversations are processed once and are not stored, shared, reused or sold for advertising. Screenshots still have to travel securely to the analysis service. Crop details that are irrelevant, and do not upload intimate or identifying material unless you have a lawful reason to do so.",
          "For high-stakes questions, talk to a person who can understand the wider situation. A therapist can help with recurring relationship distress. A trusted friend can reality-check a confusing exchange. If there are threats, coercion or fear, contact a local abuse-support service or emergency service instead of relying on an app.",
        ],
      },
    ],
    faq: [
      {
        question: "Is AI relationship advice accurate?",
        answer:
          "It can accurately quote and organize visible patterns, but interpretation is uncertain because screenshots omit context and private intent. Check the examples and treat the result as a hypothesis.",
      },
      {
        question: "Should I follow an AI recommendation about ending a relationship?",
        answer:
          "No automated recommendation should make that decision for you. Consider your safety, lived experience, values and advice from qualified or trusted people who know the situation.",
      },
    ],
    related: ["how-to-analyze-text-messages", "text-message-analyzer", "gaslighting-in-text-messages"],
  },
  {
    slug: "text-message-analyzer",
    productAnswer: "Clarity Chat, also listed as Deep Conversations: Clarity on the App Store, is a screenshot-based text message analyser for iPhone and iPad. Upload up to four readable images from a conversation to review tone, response patterns, a summary and the excerpts behind the report. It works with screenshots from messaging apps such as WhatsApp, iMessage and Instagram.",
    reviewed: "2026-09-13",
    keyword: "text message analyzer",
    title: "Text Message Analyzer: What a Useful Report Should Show",
    description:
      "Understand how a text message analyzer works, what to look for in a report and which privacy and accuracy claims deserve scrutiny.",
    h1: "Text message analyzer: what a useful report should show",
    intro:
      "A useful text message analyzer should show its work. It can extract messages from screenshots, group emotional and conversational signals, measure visible patterns and link conclusions to concrete excerpts. It should also state what it cannot infer. A score without examples may feel decisive, but it gives you little basis for checking whether the analysis fits.",
    readTime: "6 min read",
    featureImage: {
      src: "/assets/guides/text-message-analyzer-feature.jpg",
      alt: "Layered speech bubbles passing through a translucent lens into groups of colored markers",
      width: 1536,
      height: 1024,
    },
    screenshot: {
      src: "/assets/screenshots/screenshot-1.jpg",
      alt: "Clarity Chat report showing participant emotions, tones and behavior examples",
      caption:
        "The report connects an indicator to the messages behind it instead of presenting a bare score.",
      width: 631,
      height: 1369,
    },
    sections: [
      {
        h2: "How a screenshot analyzer works",
        paras: [
          "The first step is text extraction. The tool reads visible names, message bubbles and timestamps from one or more screenshots. The second step is classification: it identifies possible tone, emotional wording, topics and interaction patterns. Finally, it turns those observations into a report.",
          "Errors can enter at each stage. Small text may be misread. A reaction emoji may attach to the wrong message. Sarcasm may look literal. Check that the extracted examples match the screenshot before relying on the summary.",
        ],
      },
      {
        h2: "Four parts of a useful conversation report",
        paras: [
          "First, it should separate participants so you can compare communication rather than blend every line together. Second, it should show examples for claims about tone or behavior. Third, it should describe the exchange as a whole, including positive attempts at connection. Fourth, it should offer modest next steps instead of dramatic predictions.",
        ],
        bullets: [
          "Participant-level emotions and observed tones",
          "Message balance, response time and notable pauses",
          "Specific excerpts linked to a pattern",
          "A summary that includes strengths, concerns and possible actions",
        ],
      },
      {
        h2: "What Clarity Chat includes",
        paras: [
          "Clarity Chat accepts up to four screenshots in one analysis. Its report can show positive and negative emotions, tones such as detached or sarcastic, comfort indicators, personal highlights, message counts, average response times, interruptions, quiet moments, topics and sentiment changes.",
          "The app also displays behavior indicators with examples and a conversation summary with recommended actions. Those features are best used to find the part of the chat you want to revisit. They do not turn a limited sample into a full psychological profile.",
        ],
        callout:
          "Download Clarity Chat, choose up to four consecutive screenshots and inspect the excerpts behind each result.",
      },
      {
        h2: "Privacy questions to ask before uploading a chat",
        paras: [
          "Find out whether screenshots leave the device, whether the service stores them and whether data is reused for advertising or model training. Clarity Chat’s published policy says conversations are processed once and are not stored, shared, reused or sold for advertising. The analysis still requires secure server processing.",
          "Crop names or unrelated personal details. Avoid uploading financial, medical or intimate information that is not necessary. A conversation involves more than one person, so use the minimum amount of material needed for your own lawful reflection.",
        ],
      },
      {
        h2: "How to judge the result",
        paras: [
          "Start with extraction accuracy, then examples, then summary. If the quoted message is wrong, the label built on it is unreliable. If the quote is right but the label ignores a clear joke or shared history, keep the quote and reject the interpretation.",
          "Compare the report with a second sample from another day. A stable pattern is more informative than an unusual exchange. Use the report to decide what you want to ask or change, and leave claims about another person’s mind where they belong: unresolved until that person communicates clearly.",
        ],
      },
    ],
    faq: [
      {
        question: "Can a text message analyzer read screenshots from any app?",
        answer:
          "It can usually read clear screenshots from common messaging apps, regardless of the brand. Results depend on legible text, correct ordering and enough context.",
      },
      {
        question: "Does a high behavior score prove manipulation?",
        answer:
          "No. A score is an automated interpretation of the selected text. Review the examples, look for repetition and seek human support for serious concerns.",
      },
    ],
    related: ["how-to-analyze-text-messages", "ai-relationship-advice", "gaslighting-in-text-messages"],
  },
  {
    slug: "how-to-tell-if-someone-likes-you-over-text",
    keyword: "how to tell if someone likes you over text",
    title: "How to Tell If Someone Likes You Over Text",
    description:
      "Look for reciprocal effort, curiosity, consistency and real plans when deciding whether someone may like you over text.",
    h1: "How to tell if someone likes you over text",
    intro:
      "You cannot prove that someone likes you from texts alone. The strongest visible signals are reciprocal effort, genuine questions, consistent warmth and movement toward a call or real plan. Read them as a pattern across time, not as a checklist where one fast reply or flirty emoji settles the question.",
    readTime: "7 min read",
    featureImage: {
      src: "/assets/guides/how-to-tell-if-someone-likes-you-over-text-feature.jpg",
      alt: "Two phones on opposite sides of a table joined by a warm thread of light",
      width: 1536,
      height: 1024,
    },
    screenshot: {
      src: "/assets/screenshots/screenshot-3.jpg",
      alt: "Clarity Chat report showing conversation topics and changes in sentiment over time",
      caption:
        "A trend across the conversation is more informative than one affectionate message.",
      width: 631,
      height: 1369,
    },
    sections: [
      {
        h2: "Reciprocal effort is the clearest starting point",
        paras: [
          "Notice whether both people begin conversations, ask questions and introduce new topics. Interest does not require a perfect 50/50 split, but the exchange should not collapse every time you stop carrying it. A person may be shy or busy; over time, they still find a way to participate if the connection matters to them.",
          "Message length is only useful against the person’s normal style. A concise texter may show interest through reliable replies, remembered details or invitations. Someone who writes paragraphs to everyone may sound intense without offering any real commitment.",
        ],
      },
      {
        h2: "Curiosity looks different from polite replying",
        paras: [
          "A polite reply answers what you asked. Curiosity adds something: a follow-up question, a remembered detail or a topic they think you would enjoy. Look for whether they make it easier for the conversation to continue rather than simply responding until it ends.",
          "Warm words can be sincere, friendly or habitual. Compare words with behavior. If someone says they miss you but repeatedly avoids a reasonable plan, the plan tells you more. If they cannot meet but suggest another day, that is stronger evidence of effort.",
        ],
        bullets: [
          "They sometimes reach out without needing a favor.",
          "They respond to the substance of what you said.",
          "They remember details and return to them later.",
          "They make or accept specific plans, or propose an alternative.",
        ],
      },
      {
        h2: "Consistency beats speed",
        paras: [
          "Fast replies feel reassuring, but they are heavily shaped by schedule and phone habits. A steadier signal is whether the person returns, acknowledges delays and maintains roughly the same level of care. One exciting evening followed by weeks of ambiguity is weaker evidence than moderate but reliable contact.",
          "Be careful with rules about waiting a certain number of minutes or sending a fixed number of words. Those rules reward performance. You are looking for a pattern where both people can communicate without constant guessing or punishment.",
        ],
      },
      {
        h2: "Use chat analysis to compare patterns, not predict attraction",
        paras: [
          "Clarity Chat can highlight interest, curiosity, coldness, avoidance, message balance and changes in sentiment within selected screenshots. Use that structure to compare days or notice where your uncertainty began. The tool cannot distinguish romantic interest from friendship with certainty.",
          "Choose screenshots from more than one moment. Include ordinary conversation, not only flirting or conflict. If the report shows warmth but the wider relationship remains unclear, let that uncertainty stay visible instead of forcing a yes or no answer.",
        ],
        callout:
          "Review several consecutive screenshots in Clarity Chat, then compare the report with the person’s actual follow-through.",
      },
      {
        h2: "The direct test is a clear, low-pressure step",
        paras: [
          "When it feels safe, offer something specific: a coffee, a call or a date with room to decline. A clear yes, a thoughtful alternative or an honest no gives you more information than another hour of decoding punctuation.",
          "If you are not ready to ask, observe reciprocity without staging a test. Do not disappear to provoke a reaction or send jealousy bait. Give the connection a fair chance to show itself, while keeping your time and self-respect in the equation.",
        ],
      },
    ],
    faq: [
      {
        question: "Do fast replies mean someone likes me?",
        answer:
          "Fast replies can show availability or enthusiasm, but they are not proof. Consistent effort, curiosity and follow-through across time are stronger signals.",
      },
      {
        question: "Can Clarity Chat give me a compatibility score?",
        answer:
          "Clarity Chat analyzes the selected conversation rather than proving compatibility. Use observed patterns and examples as prompts for reflection, not a prediction of the relationship.",
      },
    ],
    related: ["how-to-analyze-text-messages", "why-did-they-ghost-me", "ai-relationship-advice"],
  },
  {
    slug: "why-did-they-ghost-me",
    keyword: "why did he ghost me",
    title: "Why Did They Ghost Me? What Texts Can and Cannot Explain",
    description:
      "Understand what ghosting means, what a message history may reveal and how to choose a calm next step without inventing a reason.",
    h1: "Why did they ghost me? What texts can and cannot explain",
    intro:
      "If someone stopped replying without explanation, the message history may show when their participation changed, but it cannot reveal the private reason. Ghosting can come from avoidance, lost interest, overwhelm, another relationship or circumstances you never see. The honest answer is often that you do not know. You can still decide what respectful contact and closure look like for you.",
    readTime: "7 min read",
    featureImage: {
      src: "/assets/guides/why-did-they-ghost-me-feature.jpg",
      alt: "A softly lit phone beside an empty chair at dusk with a fading trail of message-shaped light",
      width: 1536,
      height: 1024,
    },
    screenshot: {
      src: "/assets/screenshots/screenshot-3.jpg",
      alt: "Clarity Chat report showing quiet moments and sentiment changes in a conversation",
      caption:
        "A report may show where contact changed. It cannot supply the missing person’s reason.",
      width: 631,
      height: 1369,
    },
    sections: [
      {
        h2: "First decide whether this is a pause or a pattern",
        paras: [
          "People use the word ghosting for very different gaps. A few hours after a date is uncertainty. Several days after regular contact may be a change. Disappearing after an established relationship or a direct question is a more serious withdrawal. Compare the silence with the rhythm you had before it.",
          "Check practical context once. Travel, illness, exams, caregiving and work can interrupt communication. Context is not an excuse for indefinite silence, but it can stop you from treating every delay as rejection.",
        ],
      },
      {
        h2: "What the earlier messages may show",
        paras: [
          "Look for a gradual reduction in questions, shorter replies, repeatedly postponed plans or one person carrying every restart. You may also find no warning at all. Some people stay warm until the moment they withdraw because they have not communicated their doubts, not because you failed to decode a hidden clue.",
          "Do not search the thread for a single sentence that makes the outcome your fault. Relationships are not puzzles with one secret correct answer. The other person had the option to communicate, even if the conversation would have been uncomfortable.",
        ],
      },
      {
        h2: "How Clarity Chat can help without pretending to know why",
        paras: [
          "A Clarity Chat report can organize message balance, quiet periods, observed tone and sentiment changes in the screenshots you select. That may help you identify the point where the exchange changed or confirm that effort had become one-sided.",
          "Use a sample from before the silence rather than only the final unanswered message. Read the examples and consider alternative explanations. No indicator should be translated into a claim that the person met someone else, feared commitment or planned to hurt you.",
        ],
        callout:
          "If replaying the thread is making you more distressed, analyze it once, write down the facts and step away from the phone.",
      },
      {
        h2: "Choose one follow-up, if a follow-up is appropriate",
        paras: [
          "If the relationship felt safe and there was no clear request for no contact, one concise message can create a clean endpoint: “I enjoyed getting to know you. I have not heard back, so I will step back. If you want to reconnect, please be direct.” You do not need to argue your case or send a series of escalating messages.",
          "There are situations where no follow-up is wiser: the person blocked you, asked for space, behaved threateningly or repeatedly disappeared and returned without accountability. Respect their boundary and your own.",
        ],
      },
      {
        h2: "Closure can come from your decision",
        paras: [
          "An explanation would be kind, but you may not receive one. Closure can mean accepting the observable fact that communication stopped and choosing not to remain on standby. Mute the thread, lean on people who show up and return attention to the parts of life that answer back.",
          "If the loss triggers intense anxiety or old wounds, talking with a therapist can help more than another round of message analysis. Your distress deserves care even when the absent person never explains themselves.",
        ],
      },
    ],
    faq: [
      {
        question: "How long without a reply counts as ghosting?",
        answer:
          "There is no universal number. Compare the gap with your established rhythm, the stage of the relationship and whether a direct question or plan was left unanswered.",
      },
      {
        question: "Should I send one last message after being ghosted?",
        answer:
          "One calm message may be reasonable in a safe relationship with no request for space. Do not keep contacting someone who has blocked you, set a boundary or made you feel unsafe.",
      },
    ],
    related: ["how-to-tell-if-someone-likes-you-over-text", "how-to-analyze-text-messages", "unhealthy-texting-patterns"],
  },
  {
    slug: "gaslighting-in-text-messages",
    keyword: "gaslighting signs in text messages",
    title: "Gaslighting in Text Messages: Patterns to Review Carefully",
    description:
      "Learn how repeated reality distortion may appear in text messages, why one disagreement is not proof and when to seek support.",
    h1: "Gaslighting in text messages: patterns to review carefully",
    intro:
      "Gaslighting is a repeated attempt to make someone doubt their memory, perception or judgment. In text messages it may appear as persistent denial of documented events, rewriting earlier statements, attacking your ability to remember or shifting the standard whenever you provide evidence. One disagreement, mistake or defensive reply is not enough to establish a gaslighting pattern.",
    readTime: "8 min read",
    featureImage: {
      src: "/assets/guides/gaslighting-in-text-messages-feature.jpg",
      alt: "Overlapping translucent message panels casting contradictory shadows around a steady orange marker",
      width: 1536,
      height: 1024,
    },
    screenshot: {
      src: "/assets/screenshots/screenshot-1.jpg",
      alt: "Clarity Chat behavior indicator with message excerpts associated with possible gaslighting",
      caption:
        "A behavior flag should lead you back to the exact excerpts and the pattern around them.",
      width: 631,
      height: 1369,
    },
    sections: [
      {
        h2: "Distinguish a pattern from an ordinary conflict",
        paras: [
          "People remember conversations differently. They become defensive, use careless wording and sometimes deny something because they are embarrassed. Gaslighting is more systematic: the denials repeatedly pull you away from observable facts and toward distrust of your own mind.",
          "Ask what happens when you clarify. A healthy but imperfect person may check the thread, admit uncertainty or correct themselves. A concerning pattern may include ridicule, absolute denial despite clear evidence, a new version of events each time, or punishment for raising the discrepancy.",
        ],
      },
      {
        h2: "Text patterns worth examining",
        paras: [
          "No phrase proves gaslighting by itself. Look for combinations that recur and affect your ability to trust your experience. The surrounding behavior matters, including what happens in person and whether you feel free to disagree.",
        ],
        bullets: [
          "They deny a statement that remains visible in the same thread.",
          "They insist you misunderstood every version while refusing to explain one consistent version.",
          "They shift from the event to attacks on your memory, stability or character.",
          "They move the standard after you answer the original accusation.",
          "They pressure you to keep the exchange secret or distance yourself from outside perspectives.",
        ],
      },
      {
        h2: "What an automated flag means",
        paras: [
          "Clarity Chat may identify language that resembles denial, blame shifting or emotional manipulation and show examples from the selected screenshots. Read each example. Check extraction accuracy, sarcasm, quoted messages and whether the app assigned the right speaker.",
          "An automated flag is not a diagnosis of a person or legal proof of abuse. A short sample can overstate a tense moment or miss a long pattern. Use the result to name what you want to review with a trusted person, therapist or advocate.",
        ],
        callout:
          "If Clarity Chat flags a concerning behavior, save the examples that are accurate and disregard labels that the evidence does not support.",
      },
      {
        h2: "Keep a record without living inside the record",
        paras: [
          "When it is safe, preserve important messages in a place the other person cannot access. Add dates and brief notes about what happened outside the chat. Do not spend hours trying to prove every detail to someone who repeatedly changes the terms of the discussion.",
          "Share the pattern with a person you trust. An outside perspective can help you distinguish a mutual misunderstanding from a recurring effort to destabilize you. If a partner monitors your phone, use a safer device before saving evidence or contacting support.",
        ],
      },
      {
        h2: "Get support when fear or control is present",
        paras: [
          "Threats, stalking, coercive control and isolation deserve human support. If you are in immediate danger, contact local emergency services. In the United States, the National Domestic Violence Hotline offers phone, chat and text support; elsewhere, use a trusted local service.",
          "You do not need an app to certify that an interaction hurts or frightens you before asking for help. Clarity Chat can help organize words on a screen. Your safety plan should come from people and services equipped to understand the full situation.",
        ],
      },
    ],
    sources: [
      {
        label: "Cleveland Clinic: relationship red flags",
        href: "https://health.clevelandclinic.org/domestic-abuse-how-to-spot-relationship-red-flags",
      },
      {
        label: "National Domestic Violence Hotline",
        href: "https://www.thehotline.org/",
      },
    ],
    faq: [
      {
        question: "Is denying one text message gaslighting?",
        answer:
          "Not necessarily. Gaslighting describes a repeated pattern that undermines your trust in your perception; one denial may be a mistake, defensiveness or a different memory.",
      },
      {
        question: "Can screenshots prove emotional abuse?",
        answer:
          "Screenshots can document part of a pattern, but they rarely contain the entire relationship context. A qualified advocate, clinician or legal professional can help you assess serious concerns.",
      },
    ],
    related: ["unhealthy-texting-patterns", "how-to-analyze-text-messages", "ai-relationship-advice"],
  },
  {
    slug: "unhealthy-texting-patterns",
    keyword: "toxic relationship signs in texting",
    title: "Unhealthy Texting Patterns: Warning Signs and Next Steps",
    description:
      "Review repeated texting patterns involving control, pressure, insults or ignored boundaries, with practical safety-focused next steps.",
    h1: "Unhealthy texting patterns: warning signs and next steps",
    intro:
      "An unhealthy texting pattern is repeated communication that erodes safety, autonomy or respect. Examples include demands for immediate access, insults, threats, monitoring, sexual pressure and punishment when you set a boundary. Frequency alone does not make texting unhealthy; the important questions are whether contact is consensual, whether boundaries are respected and how the pattern affects you.",
    readTime: "8 min read",
    featureImage: {
      src: "/assets/guides/unhealthy-texting-patterns-feature.jpg",
      alt: "A tangled loop of dark message tiles opening into a clear illuminated path",
      width: 1536,
      height: 1024,
    },
    screenshot: {
      src: "/assets/screenshots/screenshot-2.jpg",
      alt: "Clarity Chat summary showing positive aspects, concerns and recommended actions",
      caption:
        "Look at the full pattern, including positive moments, concerns and whether repair actually happens.",
      width: 631,
      height: 1369,
    },
    sections: [
      {
        h2: "Start with boundaries and impact",
        paras: [
          "Partners and friends can prefer different amounts of contact. A mismatch becomes concerning when one person cannot say no without retaliation. Notice whether you feel pressured to report your location, answer during work or sleep, share passwords, send sexual content or prove who you are with.",
          "Your reaction is information. Feeling tense every time the phone lights up, changing normal activities to prevent an argument or hiding harmless interactions may signal that the communication has become controlling. You do not have to wait for the language to become dramatic before taking that impact seriously.",
        ],
      },
      {
        h2: "Warning signs in digital communication",
        paras: [
          "Look for repetition and escalation. A single jealous message can be discussed. A cycle of accusations, demands for proof and punishment after reassurance is different. The same principle applies to jokes: humor stops being mutual when you have asked for it to stop and the response is ridicule or more pressure.",
        ],
        bullets: [
          "Repeated demands for immediate replies or continuous location updates",
          "Insults, humiliation, threats or messages designed to frighten you",
          "Pressure to send images, money, passwords or personal information",
          "Monitoring your contacts or punishing you for spending time with others",
          "Ignoring a clear request to pause or stop contact",
          "Warm apologies followed by the same conduct without meaningful change",
        ],
      },
      {
        h2: "Use context without explaining the pattern away",
        paras: [
          "Stress, insecurity and past experiences can explain why someone communicates poorly. Explanation is not the same as permission. The practical test is whether they can hear the impact, respect a boundary and change behavior over time.",
          "Avoid diagnosing the person from messages. Terms such as narcissist or sociopath sound definitive but rarely help you choose a next step. Describe the behavior instead: they called me names after I asked to sleep; they contacted my friends when I did not answer; they threatened to share a photo.",
        ],
      },
      {
        h2: "What Clarity Chat can add",
        paras: [
          "Clarity Chat can organize selected messages into emotions, observed tones, examples, response patterns and possible behavior indicators. It may help when a long exchange feels too tangled to review. Include enough context to see what triggered the interaction and what happened after a boundary was stated.",
          "The app does not know whether you are safe, whether messages were deleted or what happens off-screen. Do not show an automated report to a controlling person as proof if doing so could increase risk. Use it privately as one input and seek human guidance.",
        ],
        callout:
          "A report can help name a pattern. It cannot replace a safety plan, an advocate or your own knowledge of the relationship.",
      },
      {
        h2: "Choose support that matches the risk",
        paras: [
          "For a lower-risk communication mismatch, state one specific boundary and observe the response. For example: “I do not answer messages during work. I will reply tonight.” Respectful behavior may not be perfect immediately, but it should move toward the boundary rather than punish you for having one.",
          "If there are threats, stalking, coercion or fear, use a safe device and contact a relationship-abuse service. In immediate danger, contact local emergency services. A trusted person can also help you store evidence, plan transport or avoid facing the situation alone.",
        ],
      },
    ],
    sources: [
      {
        label: "One Love: healthy and unhealthy relationship signs",
        href: "https://www.joinonelove.org/signs-unhealthy-relationship/",
      },
      {
        label: "Cleveland Clinic: relationship red flags",
        href: "https://health.clevelandclinic.org/domestic-abuse-how-to-spot-relationship-red-flags",
      },
      {
        label: "National Domestic Violence Hotline",
        href: "https://www.thehotline.org/",
      },
    ],
    faq: [
      {
        question: "Is frequent texting a sign of a toxic relationship?",
        answer:
          "Not by itself. Frequent contact can be mutual and welcome. It becomes concerning when it is demanded, monitored or used to punish someone for having boundaries.",
      },
      {
        question: "What should I do if someone threatens me by text?",
        answer:
          "If safe, preserve the message and contact a trusted person or local abuse-support service. In immediate danger, contact emergency services and avoid confronting the person alone.",
      },
    ],
    related: ["gaslighting-in-text-messages", "how-to-analyze-text-messages", "why-did-they-ghost-me"],
  },
];

export const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));
