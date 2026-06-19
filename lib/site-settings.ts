import { getPayloadClient } from "@/lib/payload";
import { BRAND, DEFAULT_SOCIAL_DISCLAIMER } from "@/lib/brand-constants";
import {
  DEFAULT_CONSENT_TEXT,
  DEFAULT_CONSENT_VERSION,
  DEFAULT_PRIVACY_POLICY_URL,
} from "@/lib/leads-constants";
import { BOOSTY_URL, TELEGRAM_URL } from "@/lib/site-links";

export type SiteContacts = {
  phone?: string;
  email?: string;
  telegram?: string;
  max?: string;
  whatsapp?: string;
  vk?: string;
  boosty?: string;
  youtube?: string;
  instagram?: string;
};

export type LeadSettings = {
  consentText: string;
  consentVersion: string;
  privacyPolicyUrl: string;
  primaryMessenger: "telegram" | "max" | "email";
  leadNotificationEnabled: boolean;
  leadNotificationEmail?: string;
  contactCtaLabel: string;
};

export type SiteSettingsData = {
  projectName: string;
  projectDescriptor: string;
  description: string;
  city: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  authorName: string;
  authorRole: string;
  authorShortText: string;
  authorPhotoUrl?: string;
  mainCta: { label: string; href: string; description?: string };
  secondaryCta?: { label: string; href: string };
  contact: SiteContacts;
  leadSettings: LeadSettings;
  footerText: string;
  footerTagline: string;
  socialDisclaimerText: string;
  legacyProjectName: string;
  metaDescription: string;
  ogImageUrl?: string;
};

const DEFAULTS: SiteSettingsData = {
  projectName: BRAND.projectName,
  projectDescriptor: BRAND.projectDescriptor,
  description:
    "Авторский навигатор по Иркутску: маршруты, экскурсии и материалы о городе без штампов.",
  city: "Иркутск",
  heroTitle: BRAND.slogan,
  heroSubtitle: BRAND.heroSubtitle,
  heroBadge: BRAND.heroBadge,
  authorName: BRAND.authorName,
  authorRole: BRAND.authorRole,
  authorShortText: BRAND.authorShortText,
  mainCta: {
    label: "Спланировать визит",
    href: "/business",
    description: "Экскурсии и программы под ваш визит",
  },
  secondaryCta: { label: "Маршруты", href: "/map" },
  contact: {
    phone: "+7 (3952) 000-00-00",
    email: "info@irkportal.ru",
    telegram: TELEGRAM_URL,
    instagram: "https://instagram.com/polezno.irkutsk",
    boosty: BOOSTY_URL,
  },
  leadSettings: {
    consentText: DEFAULT_CONSENT_TEXT,
    consentVersion: DEFAULT_CONSENT_VERSION,
    privacyPolicyUrl: DEFAULT_PRIVACY_POLICY_URL,
    primaryMessenger: "telegram",
    leadNotificationEnabled: true,
    leadNotificationEmail: "info@irkportal.ru",
    contactCtaLabel: "Связаться",
  },
  footerText:
    "Маршруты, экскурсии и материалы о городе — без туристических штампов.",
  footerTagline: "Авторский навигатор по Иркутску",
  socialDisclaimerText: DEFAULT_SOCIAL_DISCLAIMER,
  legacyProjectName: BRAND.legacyName,
  metaDescription:
    "Иркпортал — авторский навигатор по Иркутску: маршруты, экскурсии и материалы о городе без штампов.",
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
    const leadRaw = (raw.leadSettings || {}) as Record<string, string | boolean | undefined>;
    const mainCtaRaw = (raw.mainCta || {}) as Record<string, string | undefined>;
    const secondaryCtaRaw = (raw.secondaryCta || {}) as Record<
      string,
      string | undefined
    >;

    const authorName = String(
      raw.authorName || raw.founderName || DEFAULTS.authorName
    );

    return {
      projectName: String(raw.projectName || DEFAULTS.projectName),
      projectDescriptor: String(
        raw.projectDescriptor || DEFAULTS.projectDescriptor
      ),
      description: String(raw.description || DEFAULTS.description),
      city: String(raw.city || DEFAULTS.city),
      heroTitle: String(raw.heroTitle || DEFAULTS.heroTitle),
      heroSubtitle: String(raw.heroSubtitle || DEFAULTS.heroSubtitle),
      heroBadge: String(raw.heroBadge || DEFAULTS.heroBadge),
      authorName,
      authorRole: String(raw.authorRole || DEFAULTS.authorRole),
      authorShortText: String(raw.authorShortText || DEFAULTS.authorShortText),
      authorPhotoUrl:
        mediaUrl(raw.authorPhoto) || mediaUrl(raw.founderPhoto),
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
        max: contactRaw.max || contactRaw.maxUrl,
        whatsapp: contactRaw.whatsapp,
        vk: contactRaw.vk || socialRaw.vk,
        boosty: contactRaw.boosty || DEFAULTS.contact.boosty,
        youtube: contactRaw.youtube,
        instagram:
          contactRaw.instagram ||
          socialRaw.instagram ||
          DEFAULTS.contact.instagram,
      },
      leadSettings: {
        consentText: String(leadRaw.consentText || DEFAULTS.leadSettings.consentText),
        consentVersion: String(
          leadRaw.consentVersion || DEFAULTS.leadSettings.consentVersion
        ),
        privacyPolicyUrl: String(
          leadRaw.privacyPolicyUrl || DEFAULTS.leadSettings.privacyPolicyUrl
        ),
        primaryMessenger:
          (leadRaw.primaryMessenger as LeadSettings["primaryMessenger"]) ||
          DEFAULTS.leadSettings.primaryMessenger,
        leadNotificationEnabled:
          leadRaw.leadNotificationEnabled !== undefined
            ? Boolean(leadRaw.leadNotificationEnabled)
            : DEFAULTS.leadSettings.leadNotificationEnabled,
        leadNotificationEmail:
          (leadRaw.leadNotificationEmail as string | undefined) ||
          contactRaw.email ||
          DEFAULTS.leadSettings.leadNotificationEmail,
        contactCtaLabel: String(
          leadRaw.contactCtaLabel || DEFAULTS.leadSettings.contactCtaLabel
        ),
      },
      footerText: String(raw.footerText || DEFAULTS.footerText),
      footerTagline: String(raw.footerTagline || DEFAULTS.footerTagline),
      socialDisclaimerText: String(
        raw.socialDisclaimerText || DEFAULTS.socialDisclaimerText
      ),
      legacyProjectName: String(
        raw.legacyProjectName || DEFAULTS.legacyProjectName
      ),
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
