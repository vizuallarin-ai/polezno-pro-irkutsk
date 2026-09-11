import type { Validate } from "payload";
import { isValidSlug } from "@/lib/slug";

export const validateRequiredSlug: Validate<string> = (value) => {
  if (!value || typeof value !== "string") {
    return "Ссылка на сайте заполнится автоматически из названия. Если меняете вручную — укажите латиницу.";
  }
  if (!isValidSlug(value)) {
    return "Ссылка: только латиница, цифры и дефис (например: wooden-irkutsk)";
  }
  return true;
};
