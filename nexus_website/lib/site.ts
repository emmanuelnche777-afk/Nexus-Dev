export const SITE_NAME = "NEXUS";
export const SITE_TAGLINE = "Four divisions, one mission. Learn. Build. Impact.";

export const CONTACT = {
  whatsapp: "+237653137081",
  email: "nexustechnolgies7@gmail.com",
  phone: "+237678661281",
  domain: "nexus.cm",
};

export const SOCIAL_LINKS = [
  { href: "https://www.youtube.com/channel/UC5EPNwhG-1OyqSW7YrzzX_A", label: "YouTube" },
  { href: "https://www.linkedin.com/in/nexus-group-600611423", label: "LinkedIn" },
  { href: "https://www.instagram.com/nexu.s06?igsi=N3ZtOXh2Y3A3YWcw", label: "Instagram" },
  { href: "https://vm.tiktok.com/ZS9BMsLQxxB5Y-asRce/", label: "TikTok" },
] as const;

export const DIVISIONS = [
  {
    name: "NEXUS Academy",
    href: "/academy",
    tagline: "Practical tech training, cohort-based.",
  },
  {
    name: "NEXUS Tech Hub",
    href: "/divisions/tech-hub",
    tagline: "Services, products & client work.",
  },
  {
    name: "NEXUS Foundation",
    href: "/divisions/foundation",
    tagline: "Community impact & digital literacy.",
  },
  {
    name: "NEXUS Mentorship",
    href: "/divisions/mentorship",
    tagline: "Structured people development.",
  },
] as const;

export type Division = (typeof DIVISIONS)[number];

export const SITE_STATS = {
  divisions: 4,
  programs: 10,
  trained: 300,
  communities: 15,
} as const;

export const ACADEMY_COHORTS = [
  {
    id: "cohort-5",
    name: "Cohort 5",
    period: "October 2026",
    status: "open" as const,
    description: "Applications now open for all programs",
  },
  {
    id: "cohort-6",
    name: "Cohort 6",
    period: "January 2027",
    status: "upcoming" as const,
    description: "Applications opening soon",
  },
] as const;

export type CohortStatus = "open" | "closed" | "upcoming";

export type NavLink = {
  label: string;
  href: string;
  children?: readonly Division[];
};

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Divisions", href: "/divisions", children: DIVISIONS },
  { label: "Journey", href: "/journey" },
  { label: "Blog", href: "/blog" },
  { label: "Join Us", href: "/join-us?division=general" },
  { label: "Contact", href: "/contact" },
];
