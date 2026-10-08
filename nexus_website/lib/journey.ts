export type JourneyStatus = "live" | "upcoming" | "completed";
export type JourneyCategory =
  | "academy"
  | "tech-hub"
  | "foundation"
  | "mentorship"
  | "company";

export interface JourneyMedia {
  type: "video" | "image";
  url: string;
  thumbnail?: string;
  caption?: string;
}

export interface SocialShareConfig {
  platforms: (
    | "facebook"
    | "twitter"
    | "linkedin"
    | "instagram"
    | "youtube"
    | "tiktok"
    | "whatsapp"
  )[];
  sharedAt?: string;
  shareUrl?: string;
}

export interface JourneyEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  fullContent?: string;
  status: JourneyStatus;
  category: JourneyCategory;
  media?: JourneyMedia[];
  tags?: string[];
  socialShare?: SocialShareConfig;
  priority?: number;
  author?: string;
}

export const JOURNEY_ENTRIES: JourneyEntry[] = [
  {
    id: "entry-1",
    date: "August 2026",
    title: "NEXUS Public Website Launches",
    description:
      "The NEXUS web platform goes live, establishing our digital presence with dedicated pages for all four divisions, a blog, and public resources.",
    fullContent:
      "Phase 1 of the NEXUS web platform has been deployed. The site is built with Next.js 16, React 19, Tailwind CSS v4, and powered by TypeScript. It includes dedicated pages for each of our four divisions — Academy, Tech Hub, Foundation, and Mentorship — along with a blog for sharing insights, a FAQ section, and a newsletter subscription system. An AI-powered NEXUS Assistant using Google Gemini provides 24/7 support. The site is optimised for performance, accessibility, and bilingual support in both English and French. This marks a significant milestone in establishing NEXUS as a credible technology organisation in Cameroon.",
    status: "completed",
    category: "company",
    tags: ["Milestone", "Website", "Launch"],
    media: [
      {
        type: "image",
        url: "/images/logo/nexus-logo-sm.jpg",
        caption: "The NEXUS brand identity",
      },
    ],
    socialShare: {
      platforms: ["facebook", "twitter", "linkedin", "instagram"],
    },
    priority: 10,
    author: "NEXUS Team",
  },
  {
    id: "entry-2",
    date: "August 2026",
    title: "Certificate Verification Portal Goes Live",
    description:
      "A public tool enabling employers and institutions to verify NEXUS Academy certificates in real time, reinforcing trust and accountability.",
    fullContent:
      "NEXUS Academy now offers a public certificate verification portal. Anyone with a NEXUS Academy certificate can share their unique verification URL with employers, institutions, or clients. The verifier enters the certificate ID and instantly confirms its authenticity, including the recipient name, program completed, and date of issue. This system ensures that every certificate issued by NEXUS Academy is traceable, tamper-proof, and recognised by employers across Cameroon. It is a key part of our commitment to digital trust and professional credibility.",
    status: "completed",
    category: "company",
    tags: ["Verification", "Trust", "Academy"],
    socialShare: {
      platforms: ["facebook", "twitter", "linkedin"],
    },
    priority: 9,
    author: "NEXUS Team",
  },
  {
    id: "entry-3",
    date: "August 2026",
    title: "AI-Powered NEXUS Assistant Deployed",
    description:
      "An intelligent chat widget powered by Google Gemini is integrated into the platform, providing instant answers about NEXUS services and programs.",
    fullContent:
      "NEXUS Tech Hub has deployed an AI-powered assistant across the website using Google Gemini. The chat widget provides visitors with instant, accurate responses to questions about NEXUS programs, services, divisions, and governance. It supports both English and French, handles complex queries about academy tracks and enrollment, and can redirect users to relevant pages. The assistant operates 24/7 and learns from interaction patterns to improve response quality over time. This is a practical demonstration of the AI automation capabilities that NEXUS Academy teaches.",
    status: "completed",
    category: "tech-hub",
    tags: ["AI", "Automation", "Innovation"],
    socialShare: {
      platforms: ["facebook", "twitter", "linkedin", "youtube"],
    },
    priority: 8,
    author: "NEXUS Tech Hub",
  },
  {
    id: "entry-4",
    date: "August 2026",
    title: "Newsletter System Launched",
    description:
      "A subscription system is added to the platform, allowing visitors to stay updated on NEXUS news, program launches, and community events.",
    fullContent:
      "NEXUS has launched a newsletter subscription system across the website. Visitors can subscribe with their email address to receive updates about program launches, community events, campaign announcements, and partnership opportunities. The system includes duplicate detection, email validation, and a clean API backend stored securely. The newsletter is currently featured on the Foundation page and will expand to other sections as the platform grows. This is a key channel for keeping our community informed and engaged.",
    status: "completed",
    category: "company",
    tags: ["Newsletter", "Community", "Engagement"],
    socialShare: {
      platforms: ["facebook", "twitter", "whatsapp"],
    },
    priority: 7,
    author: "NEXUS Team",
  },
  {
    id: "entry-5",
    date: "August 2026",
    title: "Academy Cohort 5 — Applications Now Open",
    description:
      "Applications are open for the 5th training cohort with tracks in Software Development, UI/UX Design, Graphic Design, and AI Automation.",
    fullContent:
      "NEXUS Academy is now accepting applications for Cohort 5. This cycle features four specialised tracks: Software Development, UI/UX Design, Graphic Design, and AI Automation. Each track runs for 8 to 12 weeks with live sessions, real-world projects, and one-on-one mentorship from industry professionals. Applications close on September 30th, and seats are limited. We encourage students, recent graduates, and early-career professionals across Cameroon to apply. Our certificate verification system ensures that every certificate issued is traceable and recognised by employers.",
    status: "live",
    category: "academy",
    tags: ["Applications Open", "Cohort 5", "Training"],
    media: [
      {
        type: "image",
        url: "/images/academy/software-dev.svg",
        caption: "Software Development track",
      },
      {
        type: "image",
        url: "/images/academy/ui-ux.svg",
        caption: "UI/UX Design track",
      },
    ],
    socialShare: {
      platforms: [
        "facebook",
        "twitter",
        "linkedin",
        "instagram",
        "whatsapp",
      ],
    },
    priority: 10,
    author: "NEXUS Academy",
  },
  {
    id: "entry-6",
    date: "September 2026",
    title: "Foundation Digital Safety Campaign",
    description:
      "A nationwide awareness campaign targeting Mobile Money scam prevention, reaching schools, churches, and community centres across Cameroon.",
    fullContent:
      "NEXUS Foundation is preparing to launch its most ambitious public campaign to date. The Digital Safety Campaign focuses on educating Cameroonians about Mobile Money fraud, phishing attacks, and online safety practices. The campaign will include free workshops in schools, churches, and community centres, along with downloadable educational materials in both English and French. We are working to partner with local telecommunications companies and community leaders to maximise reach and impact. This initiative aligns with our mission of bridging the digital literacy gap across Cameroonian communities.",
    status: "upcoming",
    category: "foundation",
    tags: ["Campaign", "Digital Safety", "Community"],
    socialShare: {
      platforms: [
        "facebook",
        "twitter",
        "instagram",
        "youtube",
        "tiktok",
      ],
    },
    priority: 9,
    author: "NEXUS Foundation",
  },
  {
    id: "entry-7",
    date: "October 2026",
    title: "Academy Cohort 5 Training Begins",
    description:
      "The 5th training cohort kicks off with live sessions, hands-on projects, and mentorship across all four specialisation tracks.",
    fullContent:
      "Following the application period, NEXUS Academy Cohort 5 will begin正式 training in October 2026. Selected students will join one of four tracks — Software Development, UI/UX Design, Graphic Design, or AI Automation — for an intensive 8 to 12 week program. Training includes live instructor-led sessions, collaborative projects, portfolio development, and career preparation workshops. Graduates receive verifiable certificates through our public verification portal. This cohort represents our continued commitment to building practical tech talent in Cameroon.",
    status: "upcoming",
    category: "academy",
    tags: ["Training", "Cohort 5", "Launch"],
    socialShare: {
      platforms: [
        "facebook",
        "twitter",
        "linkedin",
        "instagram",
      ],
    },
    priority: 8,
    author: "NEXUS Academy",
  },
];

export const CATEGORY_LABELS: Record<JourneyCategory, string> = {
  academy: "Academy",
  "tech-hub": "Tech Hub",
  foundation: "Foundation",
  mentorship: "Mentorship",
  company: "Company",
};

export const CATEGORY_COLORS: Record<JourneyCategory, string> = {
  academy: "bg-nexus-cyan/10 text-nexus-cyan",
  "tech-hub": "bg-nexus-navy/10 text-nexus-navy",
  foundation: "bg-green-100 text-green-700",
  mentorship: "bg-purple-100 text-purple-700",
  company: "bg-amber-100 text-amber-700",
};

export const STATUS_LABELS: Record<JourneyStatus, string> = {
  live: "LIVE",
  upcoming: "Upcoming",
  completed: "Completed",
};

export const STATUS_COLORS: Record<JourneyStatus, string> = {
  live: "bg-green-500 text-white",
  upcoming: "bg-amber-500 text-white",
  completed: "bg-nexus-cyan text-nexus-dark",
};

export const STATUS_BORDER_COLORS: Record<JourneyStatus, string> = {
  live: "border-l-green-500",
  upcoming: "border-l-amber-500",
  completed: "border-l-nexus-cyan",
};

export const SHARE_PLATFORMS = {
  facebook: { name: "Facebook", color: "#1877F2" },
  twitter: { name: "Twitter", color: "#1DA1F2" },
  linkedin: { name: "LinkedIn", color: "#0A66C2" },
  instagram: { name: "Instagram", color: "#E4405F" },
  youtube: { name: "YouTube", color: "#FF0000" },
  tiktok: { name: "TikTok", color: "#000000" },
  whatsapp: { name: "WhatsApp", color: "#25D366" },
} as const;

export type SharePlatform = keyof typeof SHARE_PLATFORMS;

export const JOURNEY_STATS = [
  { value: 4, suffix: "", label: "Programs Available" },
  { value: 4, suffix: "", label: "Divisions" },
  { value: 2, suffix: "", label: "Languages Supported" },
  { value: 1, suffix: "", label: "AI Assistant" },
] as const;
