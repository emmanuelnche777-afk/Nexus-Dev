export interface ManifestoParagraph {
  heading: string;
  body: string;
}

export interface Manifesto {
  title: string;
  paragraphs: ManifestoParagraph[];
}

export interface PathwayRole {
  id: string;
  label: string;
  description: string;
}

export interface FormFieldOption {
  name: string;
  label: { en: string; fr: string };
  type: "text" | "email" | "tel" | "textarea" | "select";
  required: boolean;
  options?: string[];
  optionsFr?: string[];
}

export interface JoinUsRole {
  id: string;
  division: string;
  title: { en: string; fr: string };
  description: { en: string; fr: string };
  type: string;
}

/** Public-safe shape of a Prisma Opportunity, as returned by GET /api/opportunities. */
export interface PublicOpportunity {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string | null;
  deadline: string | null;
}

export interface JoinUsConfig {
  manifesto: {
    en: Manifesto;
    fr: Manifesto;
  };
  pathways: {
    en: {
      title: string;
      subtitle: string;
      roles: PathwayRole[];
    };
    fr: {
      title: string;
      subtitle: string;
      roles: PathwayRole[];
    };
    fields: Record<string, FormFieldOption[]>;
  };
  rolePortal: {
    isActive: boolean;
    eyebrow: { en: string; fr: string };
    title: { en: string; fr: string };
    description: { en: string; fr: string };
    formTitle: { en: string; fr: string };
    formSuccess: { en: string; fr: string };
    roles: JoinUsRole[];
  };
}
