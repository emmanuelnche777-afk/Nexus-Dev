import { OpportunityStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { translations } from "@/lib/i18n/translations";
import { containsObviousSensitiveKnowledge, isSensitiveAssistantRequest } from "@/lib/ai/security";

type KnowledgeDocument = {
  title: string;
  category: string;
  route: string;
  content: string;
  tags?: string[];
};

type PublicVideo = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  category: string;
  tags: string[];
};

const MAX_DOCUMENTS = 8;
const MAX_CONTEXT_CHARS = 8_000;
const MAX_DOCUMENT_CHARS = 2_000;

const STOP_WORDS = new Set([
  "confused", "confusion", "guide", "guidance", "step", "steps", "process", "instructions",
  "about", "after", "also", "and", "are", "as", "at", "be", "by", "can", "could", "did", "does", "for", "from", "have", "how", "in", "into", "is", "it", "its", "more", "of", "on", "or", "our", "please", "tell", "that", "the", "their", "them", "there", "this", "to", "what", "when", "where", "which", "who", "with", "would", "you", "your",
  "alors", "au", "aux", "avec", "avez", "ce", "ces", "comment", "dans", "de", "des", "du", "elle", "en", "est", "et", "faire", "fait", "il", "la", "le", "les", "mais", "mon", "ne", "nous", "ou", "par", "pas", "pour", "que", "quel", "quelle", "quels", "qui", "sa", "se", "son", "sur", "ta", "tes", "ton", "tous", "tout", "un", "une", "vos", "votre", "vous",
]);

const QUERY_SYNONYMS: Record<string, string[]> = {
  mentor: ["mentorship", "mentee"],
  mentorship: ["mentor", "mentee"],
  apply: ["application", "submit"],
  register: ["registration", "enrollment", "academy", "submit"],
  ai: ["artificial", "intelligence", "automation"],
  ia: ["ai", "artificial", "intelligence", "automation"],
  artificielle: ["ai", "intelligence", "automation"],
  artificiel: ["ai", "intelligence", "automation"],
  course: ["program", "academy", "training"],
  cours: ["program", "academy", "training"],
  curriculum: ["course", "program", "modules"],
  cursus: ["course", "program", "curriculum"],
  formation: ["training", "academy", "program"],
  inscription: ["enrollment", "application", "registration"],
  cohorte: ["cohort", "schedule", "enrollment"],
  horaire: ["schedule", "cohort"],
  horaires: ["schedule", "cohort"],
  prix: ["price", "fees", "xaf"],
  tarif: ["price", "fees", "xaf"],
  frais: ["price", "fees", "payment"],
  paiement: ["payment", "fees", "mtn", "orange"],
  mentorat: ["mentorship", "mentor", "career"],
  fondation: ["foundation", "community", "safety"],
  benevolat: ["volunteer", "opportunity", "foundation"],
  securite: ["security", "safety", "foundation"],
  confidentialite: ["privacy", "policy", "personal", "data"],
  politique: ["policy", "privacy", "terms"],
  conditions: ["terms", "use", "policy"],
};

function textFrom(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) return value.map(textFrom).filter(Boolean).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map(textFrom).filter(Boolean).join(" ");
  }
  return "";
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function tokens(value: string): string[] {
  return normalize(value)
    .match(/[\p{L}\p{N}]+/gu)
    ?.filter((token) => token.length > 1 && !STOP_WORDS.has(token)) || [];
}

function expandQueryTokens(query: string): string[] {
  const expanded = new Set(tokens(query));
  for (const token of [...expanded]) {
    for (const synonym of QUERY_SYNONYMS[token] || []) {
      for (const synonymToken of tokens(synonym)) expanded.add(synonymToken);
    }
  }
  return [...expanded];
}

function scoreDocument(queryTokens: string[], document: KnowledgeDocument): number {
  const title = new Set(tokens(document.title));
  const category = new Set(tokens(document.category));
  const searchable = new Set(tokens(`${(document.tags || []).join(" ")} ${document.content}`));
  return queryTokens.reduce((score, token) => score + (
    title.has(token) ? 4 : category.has(token) ? 2 : searchable.has(token) ? 1 : 0
  ), 0);
}

function makeDocument(
  title: string,
  category: string,
  route: string,
  content: unknown,
  tags: string[] = []
): KnowledgeDocument | null {
  const cleanContent = textFrom(content).replace(/\s+/g, " ").trim();
  if (!cleanContent) return null;
  return { title, category, route, content: cleanContent.slice(0, MAX_DOCUMENT_CHARS), tags };
}

function staticDocuments(): KnowledgeDocument[] {
  const publicSections: Array<{ key: string; title: string; route: string; category: string }> = [
    { key: "home", title: "NEXUS overview", route: "/", category: "about" },
    { key: "about", title: "About NEXUS, mission, history, and team", route: "/about", category: "about" },
    { key: "divisions", title: "NEXUS divisions", route: "/divisions", category: "divisions" },
    { key: "divisionsPage", title: "NEXUS division overview", route: "/divisions", category: "divisions" },
    { key: "techHubPage", title: "NEXUS Tech Hub", route: "/divisions/tech-hub", category: "tech hub" },
    { key: "foundationPage", title: "NEXUS Foundation and digital safety", route: "/divisions/foundation", category: "foundation" },
    { key: "mentorshipPage", title: "NEXUS Mentorship", route: "/divisions/mentorship", category: "mentorship" },
    { key: "contactPage", title: "NEXUS contact information", route: "/contact", category: "contact" },
    { key: "journeyPage", title: "NEXUS public journey page", route: "/journey", category: "journey" },
    { key: "faqPage", title: "Frequently asked questions", route: "/faq", category: "faq" },
    { key: "joinUsPage", title: "How to join NEXUS", route: "/join-us", category: "joining" },
    { key: "partnerPage", title: "NEXUS partnerships", route: "/partner", category: "partnership" },
    { key: "verifyPage", title: "NEXUS certificate verification", route: "/academy/verify", category: "verification" },
  ];

  const docs: KnowledgeDocument[] = [];
  for (const language of ["en", "fr"] as const) {
    const translation = translations[language] as unknown as Record<string, unknown>;
    for (const section of publicSections) {
      const document = makeDocument(
        `${section.title} (${language.toUpperCase()})`,
        section.category,
        section.route,
        translation[section.key],
        [language, "public website"]
      );
      if (document) docs.push(document);
    }

    const legalRecord = translations[language].legalPage as unknown as Record<string, string>;
    const privacyContent = Object.entries(legalRecord)
      .filter(([key]) => key === "privacyTitle" || key === "privacySubtitle" || key === "lastUpdated" || key.startsWith("p"))
      .map(([, value]) => value)
      .join(" ");
    const termsContent = Object.entries(legalRecord)
      .filter(([key]) => key.startsWith("terms") || key === "lastUpdated")
      .map(([, value]) => value)
      .join(" ");
    const privacyDocument = makeDocument("NEXUS privacy policy", "privacy policy", "/privacy-policy", privacyContent, [language, "privacy", "personal data"]);
    const termsDocument = makeDocument("NEXUS terms of use", "terms and policies", "/terms", termsContent, [language, "terms", "conditions"]);
    if (privacyDocument) docs.push(privacyDocument);
    if (termsDocument) docs.push(termsDocument);
  }

  const processGuides: KnowledgeDocument[] = [
    {
      title: "How to contact the right NEXUS team",
      category: "site guide contact process",
      route: "/contact",
      content: "Open the Contact Us page. Choose Academy, Tech Hub, Mentorship, Partnership, Foundation, or General / Not sure. Enter your name and email, add a phone number if useful, choose a subject, explain your question, and submit the form. General / Not sure is for questions that do not fit a listed team or when the visitor is unsure. The form can be opened with a team already selected from a related NEXUS page.",
      tags: ["contact", "department", "team", "inquiry", "question", "help"],
    },
    {
      title: "How to explore Academy programs and request enrollment",
      category: "site guide academy process",
      route: "/academy/programs",
      content: "Open Academy Programs and choose a program to read its details. If an open cohort is available, use that program's registration path, choose the cohort, enter the requested contact details, and submit. If no cohort is accepting applications, the program page may offer a private training request; this asks the Academy team to review availability, schedule, and fees and is not a confirmed enrollment or payment. For an Academy question, use Contact Us and choose Academy.",
      tags: ["academy", "program", "course", "apply", "register", "enroll", "cohort", "training"],
    },
    {
      title: "How to apply to a public NEXUS opportunity",
      category: "site guide opportunity application process",
      route: "/join-us",
      content: "Open Join Us and review the available public opportunities. Select an opportunity to open its application form, enter the requested applicant information, provide the required explanation, and attach supporting documents if requested. Submit the application for review. An opportunity application is different from a general Join Us pathway inquiry.",
      tags: ["opportunity", "application", "apply", "submit", "join", "job", "internship", "volunteer"],
    },
    {
      title: "How to send a general Join Us pathway inquiry",
      category: "site guide joining pathway process",
      route: "/join-us",
      content: "Open Join Us and choose the pathway that best matches how you want to connect with NEXUS, such as student, client, volunteer, mentor, partner, or investor. The form changes based on the selected pathway. Complete its required fields and submit. Use the separate opportunity application form when applying to a specific published opening.",
      tags: ["join", "pathway", "student", "client", "volunteer", "mentor", "partner", "investor", "inquiry"],
    },
    {
      title: "How to ask a Tech Hub service question",
      category: "site guide tech hub service process",
      route: "/services",
      content: "Open Services to review Tech Hub services and choose the one related to your project. Use its order or project inquiry form to describe what you need and provide the requested contact and planning details. For a general Tech Hub question, use Contact Us and choose Tech Hub. The AI assistant must not promise a quote, price, or delivery date unless current public information provides it.",
      tags: ["tech", "hub", "service", "project", "client", "inquiry", "request"],
    },
    {
      title: "How to request a NEXUS mentor or apply as a mentor",
      category: "site guide mentor mentorship application process",
      route: "/divisions/mentorship",
      content: "For someone seeking a mentor, open the Mentorship page and choose Apply as Mentee. Complete the application with contact details, current status, field of interest, and information about goals and experience, then submit for review. Someone who wants to become a mentor should choose Apply as Mentor; that opens the Mentor pathway on Join Us, where the form asks for professional background, years of experience, expertise, and why they want to mentor. These are different application routes.",
      tags: ["mentorship", "mentor", "mentee", "apply", "application", "join", "pathway"],
    },
    {
      title: "How to send a partnership proposal",
      category: "site guide partnership process",
      route: "/partner",
      content: "Open the Partner page and complete its partnership form with organization and contact details, partnership type or area of interest, and a message describing the proposal. Submit it for review. For a question rather than a full proposal, use Contact Us and choose Partnership.",
      tags: ["partner", "partnership", "proposal", "inquiry", "contact"],
    },
    {
      title: "How to ask the Foundation a question",
      category: "site guide foundation process",
      route: "/divisions/foundation",
      content: "To ask about NEXUS Foundation programs or community work, open Contact Us and choose Foundation, then describe your question and submit the form. Foundation questions are directed to the Super Admin for review. To offer volunteer help, use the relevant pathway on Join Us.",
      tags: ["foundation", "community", "volunteer", "contact", "inquiry"],
    },
  ];
  docs.push(...processGuides);

  return docs;
}

async function loadDatabaseDocuments(): Promise<{ documents: KnowledgeDocument[]; videos: PublicVideo[] }> {
  const documents: KnowledgeDocument[] = [];
  const videos: PublicVideo[] = [];

  const results = await Promise.allSettled([
    prisma.program.findMany({
      where: { status: "active" },
      orderBy: { title: "asc" },
      select: {
        slug: true, title: true, durationWeeks: true, price: true, currency: true,
        shortDescription: true, fullDescription: true, targetAudience: true,
        certification: true, tools: true, highlights: true, awards: true,
        curriculumModules: true, instructors: true, requirements: true,
      },
    }),
    // Read only public cohort fields. Do not join or aggregate student records.
    prisma.cohort.findMany({
      where: { status: "open" },
      orderBy: { startDate: "asc" },
      select: {
        name: true, programSlug: true, period: true, status: true, startDate: true,
        endDate: true, applicationDeadline: true, location: true, schedule: true,
        price: true, currency: true, description: true,
      },
    }),
    prisma.faq.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: { question: true, answer: true, category: true },
    }),
    prisma.service.findMany({
      where: { status: "active" },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, title: true, tagline: true, description: true, features: true, deliverables: true },
    }),
    prisma.aiKnowledge.findMany({
      where: { approved: true },
      orderBy: { updatedAt: "desc" },
      select: { title: true, content: true, category: true },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: { slug: true, title: true, titleFr: true, excerpt: true, excerptFr: true, content: true, contentFr: true, tags: true, category: true },
    }),
    prisma.journeyEntry.findMany({
      where: { status: "live" },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: { title: true, description: true, fullContent: true, date: true, category: true, tags: true },
    }),
    prisma.opportunity.findMany({
      where: { lifecycle: OpportunityStatus.OPEN },
      orderBy: [{ deadline: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      select: { title: true, description: true, type: true, location: true, deadline: true, lifecycle: true },
    }),
    prisma.aiVideo.findMany({
      where: { status: "published" },
      orderBy: { views: "desc" },
      take: 30,
      select: { id: true, title: true, description: true, videoUrl: true, category: true, tags: true },
    }),
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      select: { siteName: true, contactEmail: true, metadata: true },
    }),
  ]);

  const [programs, cohorts, faqs, services, knowledge, posts, journey, opportunities, videoRows, settings] = results;

  if (programs.status === "fulfilled") {
    for (const program of programs.value) {
      const document = makeDocument(
        program.title,
        "academy program",
        `/academy/program/${program.slug}`,
        {
          DurationWeeks: program.durationWeeks,
          Price: `${program.price} ${program.currency}`,
          Description: program.shortDescription,
          Details: program.fullDescription,
          TargetAudience: program.targetAudience,
          Certification: program.certification,
          Tools: program.tools,
          Highlights: program.highlights,
          Awards: program.awards,
          Curriculum: program.curriculumModules,
          Instructors: program.instructors,
          Requirements: program.requirements,
        },
        ["academy", "program", "course", "enrollment", "price", "curriculum"]
      );
      if (document) documents.push(document);
    }
  }

  if (cohorts.status === "fulfilled") {
    const now = Date.now();
    for (const cohort of cohorts.value) {
      const deadline = new Date(cohort.applicationDeadline).setUTCHours(23, 59, 59, 999);
      const registrationStatus = deadline >= now
        ? "Marked open; the enrollment page confirms current seat availability"
        : "The listed application deadline has passed";
      const document = makeDocument(
        `${cohort.name} — ${cohort.programSlug}`,
        "academy cohort",
        "/academy/programs",
        {
          Program: cohort.programSlug,
          Period: cohort.period,
          Status: registrationStatus,
          StartDate: cohort.startDate.toISOString().slice(0, 10),
          EndDate: cohort.endDate.toISOString().slice(0, 10),
          ApplicationDeadline: cohort.applicationDeadline.toISOString().slice(0, 10),
          Location: cohort.location,
          Schedule: cohort.schedule,
          Price: `${cohort.price} ${cohort.currency}`,
          Description: cohort.description,
        },
        ["academy", "cohort", "schedule", "enrollment", "price"]
      );
      if (document) documents.push(document);
    }
  }

  if (faqs.status === "fulfilled") {
    for (const faq of faqs.value) {
      const document = makeDocument(faq.question, `faq ${faq.category}`, "/faq", faq.answer, ["faq"]);
      if (document) documents.push(document);
    }
  }

  if (services.status === "fulfilled") {
    for (const service of services.value) {
      const document = makeDocument(
        service.title,
        "tech hub service",
        `/services/${service.slug}`,
        { Tagline: service.tagline, Description: service.description, Features: service.features, Deliverables: service.deliverables },
        ["tech hub", "service", "client"]
      );
      if (document) documents.push(document);
    }
  }

  if (knowledge.status === "fulfilled") {
    for (const item of knowledge.value) {
      if (
        containsObviousSensitiveKnowledge(`${item.title}\n${item.content}`) ||
        isSensitiveAssistantRequest(item.content)
      ) continue;
      const document = makeDocument(item.title, `approved knowledge ${item.category}`, "", item.content, [item.category]);
      if (document) documents.push(document);
    }
  }

  if (posts.status === "fulfilled") {
    for (const post of posts.value) {
      const document = makeDocument(
        post.title,
        `published article ${post.category}`,
        `/blog/${post.slug}`,
        { Summary: post.excerpt, SummaryFr: post.excerptFr, Content: post.content, ContentFr: post.contentFr, Tags: post.tags },
        post.tags
      );
      if (document) documents.push(document);
    }
  }

  if (journey.status === "fulfilled") {
    for (const entry of journey.value) {
      const document = makeDocument(
        entry.title,
        `public journey ${entry.category}`,
        "/journey",
        { Date: entry.date, Description: entry.description, Details: entry.fullContent, Tags: entry.tags },
        entry.tags
      );
      if (document) documents.push(document);
    }
  }

  if (opportunities.status === "fulfilled") {
    const now = Date.now();
    for (const opportunity of opportunities.value) {
      if (opportunity.deadline && opportunity.deadline.getTime() < now) continue;
      const document = makeDocument(
        opportunity.title,
        `open opportunity ${opportunity.type}`,
        "/join-us",
        { Description: opportunity.description, Type: opportunity.type, Location: opportunity.location, Deadline: opportunity.deadline?.toISOString().slice(0, 10) || "No deadline listed" },
        ["join", "opportunity", opportunity.type]
      );
      if (document) documents.push(document);
    }
  }

  if (videoRows.status === "fulfilled") {
    for (const video of videoRows.value) {
      videos.push(video);
      const document = makeDocument(
        video.title,
        `published learning video ${video.category}`,
        video.videoUrl,
        video.description,
        video.tags
      );
      if (document) documents.push(document);
    }
  }

  if (settings.status === "fulfilled" && settings.value) {
    const metadata = settings.value.metadata;
    const publicSettings = metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? metadata as Record<string, unknown>
      : {};
    const paymentInfo = publicSettings.paymentInfo && typeof publicSettings.paymentInfo === "object" && !Array.isArray(publicSettings.paymentInfo)
      ? publicSettings.paymentInfo as Record<string, unknown>
      : {};
    const content = {
      SiteName: settings.value.siteName,
      ContactEmail: settings.value.contactEmail,
      ContactPhone: publicSettings.phone,
      PublicWhatsApp: publicSettings.phone,
      PaymentInstructions: paymentInfo.instructions,
      PaymentInstructionsFrench: paymentInfo.instructionsFr,
      PublicMtnMoneyNumber: paymentInfo.mtnNumber,
      PublicMtnMoneyLabel: paymentInfo.mtnLabel,
      PublicOrangeMoneyNumber: paymentInfo.orangeNumber,
      PublicOrangeMoneyLabel: paymentInfo.orangeLabel,
    };
    const document = makeDocument("NEXUS public contact and Academy payment instructions", "contact and payment", "/academy/register", content, ["contact", "email", "phone", "whatsapp", "payment", "mtn", "orange", "mobile money"]);
    if (document) documents.push(document);
  }

  return { documents, videos };
}

export async function retrievePublicKnowledge(query: string): Promise<{
  context: string;
  relevantVideos: PublicVideo[];
}> {
  const [dbResult, staticResult] = await Promise.allSettled([
    loadDatabaseDocuments(),
    Promise.resolve(staticDocuments()),
  ]);

  const documents = [
    ...(dbResult.status === "fulfilled" ? dbResult.value.documents : []),
    ...(staticResult.status === "fulfilled" ? staticResult.value : []),
  ];
  const videos = dbResult.status === "fulfilled" ? dbResult.value.videos : [];
  const queryTokens = expandQueryTokens(query);
  if (!queryTokens.length) return { context: "", relevantVideos: [] };

  const ranked = documents
    .map((document) => ({ document, score: scoreDocument(queryTokens, document) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_DOCUMENTS);

  const contextParts: string[] = [];
  let remaining = MAX_CONTEXT_CHARS;
  for (const { document } of ranked) {
    const pageLine = document.route ? `PUBLIC PAGE: ${document.route}\n` : "This is approved assistant knowledge; it has no public page URL.\n";
    const entry = `SOURCE: ${document.title}\nCATEGORY: ${document.category}\n${pageLine}CONTENT: ${JSON.stringify(document.content)}`;
    if (entry.length > remaining) {
      continue;
    }
    contextParts.push(entry);
    remaining -= entry.length;
  }

  const relevantVideos = videos
    .map((video) => ({ video, score: scoreDocument(queryTokens, {
      title: video.title,
      category: video.category,
      route: video.videoUrl,
      content: video.description,
      tags: video.tags,
    }) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ video }) => video);

  return { context: contextParts.join("\n\n"), relevantVideos };
}
