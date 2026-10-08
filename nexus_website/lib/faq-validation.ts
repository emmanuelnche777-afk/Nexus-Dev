export const FAQ_CATEGORIES = [
  "general",
  "academy",
  "tech-hub",
  "foundation",
  "mentorship",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export type FaqInput = {
  question: string;
  answer: string;
  category: FaqCategory;
  order?: number;
  published?: boolean;
};

type ParseResult = { ok: true; value: FaqInput } | { ok: false; error: string };

function textField(
  value: unknown,
  label: string,
  maximum: number
): { value: string | null; error?: string } {
  if (value === undefined || value === null) {
    return { value: null, error: `${label} is required.` };
  }
  if (typeof value !== "string") return { value: null, error: `${label} must be text.` };
  const trimmed = value.trim();
  if (trimmed.length < 3) return { value: null, error: `${label} must contain at least 3 characters.` };
  if (trimmed.length > maximum) return { value: null, error: `${label} must be ${maximum} characters or fewer.` };
  return { value: trimmed };
}

export function parseFaqInput(body: unknown): ParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body must be an object." };
  }
  const input = body as Record<string, unknown>;
  const question = textField(input.question, "Question", 200);
  if (question.error) return { ok: false, error: question.error };
  const answer = textField(input.answer, "Answer", 5000);
  if (answer.error) return { ok: false, error: answer.error };
  const category = input.category === undefined ? "general" : input.category;
  if (typeof category !== "string" || !FAQ_CATEGORIES.includes(category as FaqCategory)) {
    return { ok: false, error: "Choose a valid FAQ category." };
  }
  if (input.order !== undefined &&
      (typeof input.order !== "number" || !Number.isInteger(input.order) || input.order < 1 || input.order > 10000)) {
    return { ok: false, error: "Display order must be a whole number from 1 to 10000." };
  }
  if (input.published !== undefined && typeof input.published !== "boolean") {
    return { ok: false, error: "Published must be true or false." };
  }

  return {
    ok: true,
    value: {
      question: question.value!,
      answer: answer.value!,
      category: category as FaqCategory,
      ...(input.order !== undefined ? { order: input.order as number } : {}),
      ...(input.published !== undefined ? { published: input.published } : {}),
    },
  };
}
