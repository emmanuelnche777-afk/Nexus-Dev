/**
 * Utility to merge class names.
 * Used within the admin UI kit to combine variant and conditional classes.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
