import type { SiteContacts } from "@/lib/site-settings";

const PLACEHOLDER_PHONE_PATTERN = /000-00-00|0000000/i;

/** Не показывать технический телефон-заглушку из дефолтов. */
export function isDisplayablePhone(phone?: string | null): phone is string {
  if (!phone?.trim()) return false;
  return !PLACEHOLDER_PHONE_PATTERN.test(phone);
}

export function contactsForDisplay(contact: SiteContacts): SiteContacts {
  return {
    ...contact,
    phone: isDisplayablePhone(contact.phone) ? contact.phone : undefined,
  };
}
