/**
 * Shared slug helpers for CMS auto-slug (ADMIN.B).
 * Cyrillic → latin transliteration, normalize, uniqueness helpers.
 */

const CYRILLIC_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Placeholder / junk slugs that must never stay on public guides. */
export const FORBIDDEN_PUBLIC_SLUGS = new Set([
  "slug",
  "guide",
  "placeholder",
  "name",
  "test",
  "demo-guide",
  "untitled",
  "new",
]);

export function transliterateCyrillic(input: string): string {
  let out = "";
  for (const char of input) {
    const lower = char.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(CYRILLIC_MAP, lower)) {
      out += CYRILLIC_MAP[lower];
    } else {
      out += char;
    }
  }
  return out;
}

/**
 * Build a URL-safe slug from a human title/name.
 * Empty input → empty string (caller decides fallback).
 */
export function slugifyTitle(input: string, maxLength = 80): string {
  const transliterated = transliterateCyrillic(input);
  const normalized = transliterated
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .slice(0, maxLength)
    .replace(/-+$/g, "");

  return normalized;
}

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

export function isForbiddenPublicSlug(value: string): boolean {
  return FORBIDDEN_PUBLIC_SLUGS.has(value.trim().toLowerCase());
}

/**
 * Next unique candidate: base, base-2, base-3, …
 */
export function nextSlugCandidate(base: string, attempt: number): string {
  if (attempt <= 1) return base;
  const suffix = `-${attempt}`;
  const maxBase = Math.max(1, 80 - suffix.length);
  return `${base.slice(0, maxBase)}${suffix}`;
}
