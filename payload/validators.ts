import type { Validate } from "payload";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const validateRequiredSlug: Validate<string> = (value) => {
  if (!value || typeof value !== "string") {
    return "Укажите URL-slug";
  }
  if (!SLUG_PATTERN.test(value)) {
    return "Slug: только латиница, цифры и дефис (например: wooden-irkutsk)";
  }
  return true;
};
