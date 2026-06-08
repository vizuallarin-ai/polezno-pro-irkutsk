import { getPayloadClient } from "@/lib/payload";

export type SiteContacts = {
  phone?: string;
  email?: string;
  telegram?: string;
  whatsapp?: string;
  vk?: string;
  boosty?: string;
  youtube?: string;
  instagram?: string;
};

export type SiteSettingsData = {
  projectName: string;
  description: string;
  city: string;
  heroTitle: string;
  heroSubtitle: string;
  mainCta: { label: string; href: string; description?: string };
  secondaryCta?: { label: string; href: string };
  contact: SiteContacts;
  footerText: string;
  footerTagline: string;
  metaDescription: string;
  ogImageUrl?: string;
};

const DEFAULTS: SiteSettingsData = {
  projectName: "Полезно про Иркутск",
  description:
    "Авторский навигатор по Иркутску: маршруты, экскурсии, медиа и клуб на Boosty.",
  city: "Иркутск",
  heroTitle: "Иркутск",
  heroSubtitle: "Авторский навигатор по городу и Байкалу",
  mainCta: {
    label: "Спланировать",
    href: "/program",
    description: "Экскурсии и программы под ваш визит",
  },
  secondaryCta: { label: "Маршруты", href: "/map" },
  contact: {
    phone: "+7 (3952) 000-00-00",
    email: "info@irkportal.ru",
    telegram: "https://t.me/polezno_irkutsk",
    instagram: "https://instagram.com/polezno.irkutsk",
    boosty: "https://boosty.to/polezno_irkutsk",
  },
  footerText:
    "Маршруты, экскурсии и материалы о городе — без туристических штампов.",
  footerTagline: "Авторский навигатор по Иркутску",
  metaDescription:
    "Иркутск и Байкал: маршруты, экскурсии, события и программы под ключ.",
};

function mediaUrl(field: unknown): string | undefined {
  if (field && typeof field === "object" && "url" in field) {
    const url = (field as { url?: string }).url;
    return url ? String(url) : undefined;
  }
  return undefined;
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  if (!process.env.DATABASE_URL) return DEFAULTS;

  try {
    const payload = await getPayloadClient();
    const raw = await payload.findGlobal({ slug: "site-settings", depth: 1 });

    const contactRaw = (raw.contact || {}) as Record<string, string | undefined>;
    const socialRaw = (raw.socialLinks || {}) as Record<string, string | undefined>;
    const mainCtaRaw = (raw.mainCta || {}) as Record<string, string | undefined>;
    const secondaryCtaRaw = (raw.secondaryCta || {}) as Record<
      string,
      string | undefined
    >;

    return {
      projectName: String(raw.projectName || DEFAULTS.projectName),
      description: String(raw.description || DEFAULTS.description),
      city: String(raw.city || DEFAULTS.city),
      heroTitle: String(raw.heroTitle || DEFAULTS.heroTitle),
      heroSubtitle: String(raw.heroSubtitle || DEFAULTS.heroSubtitle),
      mainCta: {
        label: String(mainCtaRaw.label || DEFAULTS.mainCta.label),
        href: String(mainCtaRaw.href || DEFAULTS.mainCta.href),
        description: mainCtaRaw.description || DEFAULTS.mainCta.description,
      },
      secondaryCta: secondaryCtaRaw.label
        ? {
            label: String(secondaryCtaRaw.label),
            href: String(secondaryCtaRaw.href || "/map"),
          }
        : DEFAULTS.secondaryCta,
      contact: {
        phone: contactRaw.phone || DEFAULTS.contact.phone,
        email: contactRaw.email || DEFAULTS.contact.email,
        telegram:
          contactRaw.telegram || socialRaw.telegram || DEFAULTS.contact.telegram,
        whatsapp: contactRaw.whatsapp,
        vk: contactRaw.vk || socialRaw.vk,
        boosty: contactRaw.boosty || DEFAULTS.contact.boosty,
        youtube: contactRaw.youtube,
        instagram:
          contactRaw.instagram ||
          socialRaw.instagram ||
          DEFAULTS.contact.instagram,
      },
      footerText: String(raw.footerText || DEFAULTS.footerText),
      footerTagline: String(raw.footerTagline || DEFAULTS.footerTagline),
      metaDescription: String(
        raw.defaultSeo?.metaDescription ||
          raw.metaDescription ||
          DEFAULTS.metaDescription
      ),
      ogImageUrl:
        mediaUrl(raw.defaultSeo?.ogImage) || mediaUrl(raw.ogImage),
    };
  } catch {
    return DEFAULTS;
  }
}
