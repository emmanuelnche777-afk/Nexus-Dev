export type AdminRole =
  | "SUPER_ADMIN"
  | "ACADEMY_MANAGER"
  | "TECH_HUB_MANAGER"
  | "MENTORSHIP_COORDINATOR"
  | "CONTENT_EDITOR"
  | "SUPPORT_STAFF"
  | "NEWSLETTER_MANAGER"
  | "FINANCE";

export type AdminStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

/**
 * Canonical permission strings — the single source of truth.
 *
 * The admin navigation (`components/admin/AdminLayout.tsx`) and every admin API
 * route must both reference these constants. Sharing one constant is what stops
 * a menu item and its own endpoint from disagreeing about who may reach it,
 * which is how `/admin/content/opportunities` came to require
 * `content:opportunities:*` in the nav while the API it calls checked
 * `foundation:opportunities:*`.
 *
 * Verbs are split because they carry different risk. `read` exposes applicant
 * PII (name, email, phone, uploaded CVs). `triage` is internal housekeeping.
 * `respond` sends real messages to a real person on the organisation's behalf.
 * A role that should review a queue is not automatically a role that should
 * contact applicants.
 *
 * A `resource:*` entry grants every verb on that resource.
 */
export const PERMISSIONS = {
  ACADEMY_PAYMENTS_READ: "academy:payments:read",
  ACADEMY_PAYMENTS_VERIFY: "academy:payments:verify",
  ACADEMY_PAYMENTS_NOTIFY: "academy:payments:notify",
  ACADEMY_PAYMENTS_DELETE: "academy:payments:delete",
  ACADEMY_STUDENT_NOTIFICATIONS_SEND: "academy:notifications:send",
  /** Public Join Us pathway inquiries (student / client / volunteer / mentor / partner / investor). */
  PATHWAY_INQUIRIES_READ: "joiners:pathways:read",
  PATHWAY_INQUIRIES_TRIAGE: "joiners:pathways:triage",
  PATHWAY_INQUIRIES_RESPOND: "joiners:pathways:respond",
  PATHWAY_INQUIRIES_ALL: "joiners:pathways:*",

  /** Applications submitted against a public Opportunity listing. */
  APPLICATIONS_READ: "joiners:applications:read",
  APPLICATIONS_TRIAGE: "joiners:applications:triage",
  APPLICATIONS_RESPOND: "joiners:applications:respond",
  APPLICATIONS_ALL: "joiners:applications:*",

  /**
   * Tech Hub service inquiries submitted via the public service order form.
   * Scoped to the Tech Hub Manager only.
   */
  SERVICE_INQUIRIES_READ: "services:inquiries:read",
  SERVICE_INQUIRIES_TRIAGE: "services:inquiries:triage",
  SERVICE_INQUIRIES_RESPOND: "services:inquiries:respond",
  SERVICE_INQUIRIES_ALL: "services:inquiries:*",

  /**
   * Mentorship inquiries submitted via the public mentorship application form.
   * Scoped to the Mentorship Coordinator only.
   */
  MENTORSHIP_INQUIRIES_READ: "mentorship:inquiries:read",
  MENTORSHIP_INQUIRIES_TRIAGE: "mentorship:inquiries:triage",
  MENTORSHIP_INQUIRIES_RESPOND: "mentorship:inquiries:respond",
  MENTORSHIP_INQUIRIES_ALL: "mentorship:inquiries:*",

  /**
   * Partnership inquiries submitted via the public partner form.
   * Scoped to Support Staff.
   */
  PARTNERSHIP_INQUIRIES_READ: "partnerships:inquiries:read",
  PARTNERSHIP_INQUIRIES_TRIAGE: "partnerships:inquiries:triage",
  PARTNERSHIP_INQUIRIES_RESPOND: "partnerships:inquiries:respond",
  PARTNERSHIP_INQUIRIES_ALL: "partnerships:inquiries:*",

  /**
   * Contact form messages submitted via the public contact page.
   * Scoped to Support Staff.
   */
  CONTACT_INQUIRIES_READ: "contact:inquiries:read",
  CONTACT_INQUIRIES_TRIAGE: "contact:inquiries:triage",
  CONTACT_INQUIRIES_RESPOND: "contact:inquiries:respond",
  CONTACT_INQUIRIES_ALL: "contact:inquiries:*",

  /**
   * Create / edit / publish / close public Opportunity listings. Deliberately a
   * top-level resource namespace rather than nested under `content:` or
   * `foundation:`, because the listing is a single resource that two very
   * different roles legitimately own.
   */
  LISTINGS_WRITE: "opportunities:write",

  /** Internal business development (value, probability, expected value). Never public. */
  DEALS_WRITE: "foundation:deals:write",
} as const;

/**
 * Which Join Us pathways a role may see. `null` means every pathway; an empty
 * list means none.
 *
 * This is a data-visibility control, so it is enforced in the query rather than
 * only in the navigation — hiding a nav link is not access control, since the
 * endpoint can be called directly. These are policy defaults in one place: edit
 * here, not in a route.
 */
export const ROLE_PATHWAY_SCOPE: Record<AdminRole, readonly string[] | null> = {
  SUPER_ADMIN: null,
  SUPPORT_STAFF: null,
  NEWSLETTER_MANAGER: [],
  MENTORSHIP_COORDINATOR: ["mentor", "volunteer"],
  ACADEMY_MANAGER: ["student"],
  TECH_HUB_MANAGER: ["client"],
  CONTENT_EDITOR: [],
  FINANCE: [],
};

/**
 * Which public listing types a role may see applications for. Scopes the
 * OpportunityApplication queue the same way `ROLE_PATHWAY_SCOPE` scopes
 * PathwayInquiry. Mirrors the opportunity `type` values in the admin listing form.
 */
export const ROLE_LISTING_TYPE_SCOPE: Record<AdminRole, readonly string[] | null> = {
  SUPER_ADMIN: null,
  SUPPORT_STAFF: null,
  NEWSLETTER_MANAGER: [],
  MENTORSHIP_COORDINATOR: ["volunteer"],
  ACADEMY_MANAGER: ["job", "internship"],
  TECH_HUB_MANAGER: ["partnership"],
  CONTENT_EDITOR: [],
  FINANCE: [],
};

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ["*"],

  // Runs Academy programs, cohorts, registrations, and students. Payment review
  // is reserved for Finance and Super Admin.
  ACADEMY_MANAGER: [
    "academy:students:*",
    PERMISSIONS.ACADEMY_STUDENT_NOTIFICATIONS_SEND,
    "academy:registrations:*",
    "academy:cohorts:*",
    "academy:programs:*",
    PERMISSIONS.PATHWAY_INQUIRIES_READ,
    PERMISSIONS.APPLICATIONS_READ,
    PERMISSIONS.CONTACT_INQUIRIES_READ,
    PERMISSIONS.CONTACT_INQUIRIES_RESPOND,
    "inbox:messages",
  ],

  // Runs the Tech Hub. Manages services and service orders. Has read-only view of
  // client-sourced intake and can respond to service inquiries.
  TECH_HUB_MANAGER: [
    "techhub:services:*",
    "techhub:orders:*",
    "techhub:*",
    PERMISSIONS.PATHWAY_INQUIRIES_READ,
    PERMISSIONS.APPLICATIONS_READ,
    PERMISSIONS.SERVICE_INQUIRIES_READ,
    PERMISSIONS.SERVICE_INQUIRIES_RESPOND,
    PERMISSIONS.CONTACT_INQUIRIES_READ,
    PERMISSIONS.CONTACT_INQUIRIES_RESPOND,
    "inbox:messages",
  ],

  // Owns partnerships, opportunities and the internal deal pipeline, and is an
  // intake operator for mentorship inquiries.
  MENTORSHIP_COORDINATOR: [
    "mentorship:*",
    PERMISSIONS.MENTORSHIP_INQUIRIES_ALL,
    PERMISSIONS.APPLICATIONS_READ,
    PERMISSIONS.CONTACT_INQUIRIES_READ,
    PERMISSIONS.CONTACT_INQUIRIES_RESPOND,
    "inbox:messages",
  ],

  // Publishes listings but is not an intake operator, so it holds no read grant
  // on applicant PII. This is the narrowing that matters: the previous
  // `joiners:*` grant put every applicant's name, email, phone and CV in reach
  // of the content team.
  CONTENT_EDITOR: [
    "content:blog:*",
    "content:journey:*",
    "content:faq:*",
    "content:ai-knowledge:*",
    "content:ai-videos:*",
    "content:social-media:*",
    PERMISSIONS.LISTINGS_WRITE,
    "media:*",
    "content:*",
    "inbox:messages",
  ],

  // Front desk: handles partnership and contact inquiries, plus live chat and AI
  // escalations.
  SUPPORT_STAFF: [
    "inquiries:*",
    "livechat:*",
    "ai-chat:*",
    "ai-escalations:*",
    "ai-live-support:*",
    "central-inbox:*",
    PERMISSIONS.PARTNERSHIP_INQUIRIES_ALL,
    PERMISSIONS.CONTACT_INQUIRIES_ALL,
    PERMISSIONS.APPLICATIONS_ALL,
    "inbox:messages",
  ],

  // Owns newsletter subscribers and campaigns only.
  NEWSLETTER_MANAGER: ["newsletter:read", "newsletter:manage", "newsletter:send"],

  FINANCE: [
    "payments:*",
    "finance:*",
    PERMISSIONS.ACADEMY_PAYMENTS_READ,
    PERMISSIONS.ACADEMY_PAYMENTS_VERIFY,
    PERMISSIONS.ACADEMY_PAYMENTS_NOTIFY,
    "inbox:messages",
  ],
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Full access to all admin areas and settings.",
  ACADEMY_MANAGER: "Manage academy programs, cohorts, students, and paid registrations. Does not manage payments.",
  TECH_HUB_MANAGER: "Manage tech hub services and service orders. Read-only view of client-sourced intake. Respond to service inquiries.",
  MENTORSHIP_COORDINATOR: "Manage mentorship programs and process mentorship inquiries.",
  CONTENT_EDITOR: "Manage public content: blog, journey, FAQ, opportunity listings, AI knowledge, AI videos, and media.",
  SUPPORT_STAFF: "Handle partnership and contact inquiries, live chat, AI chat escalations, and process applications.",
  NEWSLETTER_MANAGER: "Manage newsletter subscribers and send approved email campaigns. No access to other inquiry queues or finance.",
  FINANCE: "Manage payments and financial records, including Academy payment review and verification.",
};
