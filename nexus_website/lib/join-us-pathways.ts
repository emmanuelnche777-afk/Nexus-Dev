/**
 * Shared metadata for the public "Join Us" pathway forms.
 *
 * The authoritative field definitions live in `data/join-us-config.json`, which
 * the public page renders directly. This module mirrors that field list so the
 * server can (a) validate incoming payloads against the same shape the browser
 * sends and (b) render a PathwayInquiry's `details` JSON readably in the admin
 * panel, where the config file is not loaded.
 *
 * Keep in sync with `pathways.fields` in data/join-us-config.json.
 */

export const PATHWAY_IDS = [
  "student",
  "client",
  "volunteer",
  "mentor",
  "partner",
  "investor",
] as const;

export type PathwayId = (typeof PATHWAY_IDS)[number];

export const PATHWAY_LABELS: Record<PathwayId, string> = {
  student: "Student",
  client: "Client",
  volunteer: "Volunteer",
  mentor: "Mentor",
  partner: "Partner",
  investor: "Investor",
};

export interface PathwayFieldMeta {
  /** Key as sent by the public form, and as stored in `details`. */
  name: string;
  /** Human label for the admin detail view. */
  label: string;
  /** Marks the free-text long answer so the admin renders it as a paragraph. */
  long?: boolean;
}

/**
 * Pathway-specific fields, i.e. everything except the shared identity fields
 * (fullName / email / phone) which get dedicated columns on the model.
 */
export const PATHWAY_FIELDS: Record<PathwayId, PathwayFieldMeta[]> = {
  student: [
    { name: "university", label: "Current University / School" },
    { name: "fieldOfStudy", label: "Area of Study" },
    { name: "message", label: "Why do you want to join NEXUS?", long: true },
  ],
  client: [
    { name: "organization", label: "Organization Name" },
    { name: "projectType", label: "Project Type" },
    { name: "message", label: "Describe your project or needs", long: true },
  ],
  volunteer: [
    { name: "skills", label: "Skills / Areas of Interest" },
    { name: "availability", label: "Availability" },
    { name: "message", label: "Why do you want to volunteer with NEXUS?", long: true },
  ],
  mentor: [
    { name: "background", label: "Professional Background" },
    { name: "experience", label: "Years of Experience" },
    { name: "expertise", label: "Area of Expertise" },
    { name: "message", label: "Why do you want to mentor at NEXUS?", long: true },
  ],
  partner: [
    { name: "organization", label: "Organization Name" },
    { name: "orgType", label: "Organization Type" },
    { name: "message", label: "How would you like to partner?", long: true },
  ],
  investor: [
    { name: "organization", label: "Organization / Individual Investor" },
    { name: "focus", label: "Investment Focus" },
    { name: "message", label: "How would you like to support NEXUS?", long: true },
  ],
};

/** Select options per pathway, used to normalise and to label stored values. */
export const PATHWAY_OPTIONS: Partial<
  Record<PathwayId, Record<string, string[]>>
> = {
  client: {
    projectType: [
      "Web Application",
      "Mobile Application",
      "Cloud Infrastructure",
      "Security Audit",
      "Technical Consulting",
      "Other",
    ],
  },
  volunteer: {
    availability: ["Full-time", "Part-time", "Weekends"],
  },
  partner: {
    orgType: ["Corporate", "Educational", "Government", "NGO", "Individual"],
  },
  investor: {
    focus: ["Education", "Technology", "Community Impact", "All"],
  },
};

export function isPathwayId(value: unknown): value is PathwayId {
  return (
    typeof value === "string" &&
    (PATHWAY_IDS as readonly string[]).includes(value)
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function clean(value: unknown, max = 2000): string {
  return String(value ?? "").trim().slice(0, max);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value) && value.length <= 254;
}

export function cleanEmail(value: unknown): string {
  return clean(value, 254).toLowerCase();
}

/**
 * Keep only the keys this pathway actually collects, so a client cannot smuggle
 * arbitrary keys into the `details` JSON column.
 */
export function extractDetails(
  pathway: PathwayId,
  body: Record<string, unknown>
): Record<string, string> {
  const allowed = PATHWAY_FIELDS[pathway].map((f) => f.name);
  const details: Record<string, string> = {};
  for (const key of allowed) {
    const value = clean(body[key], 4000);
    if (value) details[key] = value;
  }
  return details;
}

export type PathwayDetailRow = {
  key: string;
  label: string;
  value: string;
  long: boolean;
};

/**
 * Turns a stored `details` object into ordered display rows for the admin
 * detail view. Falls back to raw key/label pairs for any key not present in
 * the metadata, so nothing stored is ever invisible.
 */
export function describeDetails(
  pathway: string,
  details: unknown
): PathwayDetailRow[] {
  const source =
    details && typeof details === "object" && !Array.isArray(details)
      ? (details as Record<string, unknown>)
      : {};

  const meta = isPathwayId(pathway) ? PATHWAY_FIELDS[pathway] : [];
  const rows: PathwayDetailRow[] = [];
  const seen = new Set<string>();

  for (const field of meta) {
    if (seen.has(field.name)) continue;
    seen.add(field.name);
    const value = clean(source[field.name], 4000);
    rows.push({
      key: field.name,
      label: field.label,
      value,
      long: Boolean(field.long),
    });
  }

  for (const [key, value] of Object.entries(source)) {
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      key,
      label: key,
      value: clean(value, 4000),
      long: String(value ?? "").length > 120,
    });
  }

  return rows;
}