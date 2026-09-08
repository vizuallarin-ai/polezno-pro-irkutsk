/**
 * Normalization: raw owner pack → cleaned candidate.
 * Never invents facts, prices, coordinates, or testimonials.
 */

import type { OwnerPack, OwnerMediaItem } from "./schemas";
import { ownerPackSchema } from "./schemas";

export function trimText(value: string | undefined | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.replace(/\u00a0/g, " ").trim();
  return trimmed.length ? trimmed : undefined;
}

export function normalizeLineBreaks(value: string | undefined | null): string | undefined {
  const t = trimText(value);
  if (!t) return undefined;
  return t.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
}

/** RU-friendly phone normalize: keep digits and leading +; empty → undefined. */
export function normalizePhone(value: string | undefined | null): string | undefined {
  const t = trimText(value);
  if (!t) return undefined;
  const digits = t.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 10) return t;
  return digits;
}

export function normalizeDate(value: string | undefined | null): string | undefined {
  const t = trimText(value);
  if (!t) return undefined;
  const iso = Date.parse(t);
  if (!Number.isNaN(iso)) return new Date(iso).toISOString().slice(0, 10);
  return t;
}

/** Slug candidate only — does not claim uniqueness or publish lock. */
export function normalizeSlugCandidate(value: string | undefined | null): string | undefined {
  const t = trimText(value);
  if (!t) return undefined;
  return t
    .toLowerCase()
    .replace(/[ё]/g, "e")
    .replace(/[^a-z0-9а-я\-_\s]/gi, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const AMBIGUOUS_PRICE_HINTS =
  /\b(от|примерно|около|договорн|по запросу|уточн|~|≈)\b/i;

/**
 * Structure price without inventing amount when ambiguous.
 * "от 15 тысяч" → amount undefined, pricingUnit from/ambiguous, raw preserved.
 */
export function normalizePriceStructure(input: {
  amount?: number;
  pricingUnit?: string;
  rawOwnerText?: string;
  displayText?: string;
  currency?: string;
}): {
  amount?: number;
  currency: string;
  pricingUnit: string;
  displayText?: string;
  rawOwnerText?: string;
  ambiguous: boolean;
} {
  const raw = trimText(input.rawOwnerText) ?? trimText(input.displayText);
  const currency = trimText(input.currency) ?? "RUB";
  let unit = input.pricingUnit ?? "unknown";
  let amount = input.amount;
  let ambiguous = false;

  if (raw && AMBIGUOUS_PRICE_HINTS.test(raw) && unit === "unknown") {
    unit = /по запросу/i.test(raw) ? "custom_quote" : "from";
    ambiguous = true;
  }

  if (raw && amount == null) {
    const match = raw.replace(/\s/g, "").match(/(\d[\d.,]*)/);
    if (match) {
      const n = Number(match[1].replace(",", ".").replace(/\./g, (m, offset, s) => {
        // keep last decimal-looking separator soft: treat dots as thousand sep if many digits
        return s.replace(/\D/g, "").length > 4 ? "" : m;
      }));
      // Safer: only parse plain integers from raw when unambiguous
      const plain = raw.match(/(\d[\d\s]*)/);
      if (plain) {
        const parsed = Number(plain[1].replace(/\s/g, ""));
        if (Number.isFinite(parsed) && parsed > 0) {
          amount = parsed;
        }
      }
      void n;
    }
    if (/\b(за группу|за всю группу)\b/i.test(raw)) unit = "per_group";
    else if (/\b(за человека|с человека|\/чел)\b/i.test(raw)) unit = "per_person";
    else if (/\bот\b/i.test(raw)) {
      unit = "from";
      ambiguous = true;
    }
  }

  if (unit === "unknown" || unit === "ambiguous") ambiguous = true;
  if (amount != null && (unit === "unknown" || unit === "from")) ambiguous = true;

  return {
    amount,
    currency,
    pricingUnit: unit,
    displayText: trimText(input.displayText) ?? raw,
    rawOwnerText: raw,
    ambiguous,
  };
}

export function detectDuplicateFilenames(media: OwnerMediaItem[]): string[] {
  const seen = new Map<string, number>();
  const dups: string[] = [];
  for (const item of media) {
    const key = (item.originalFilename || item.file || "").toLowerCase();
    if (!key) continue;
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);
    if (count === 2) dups.push(key);
  }
  return dups;
}

export function detectDuplicateChecksums(media: OwnerMediaItem[]): string[] {
  const seen = new Map<string, number>();
  const dups: string[] = [];
  for (const item of media) {
    const key = item.checksumSha256?.toLowerCase();
    if (!key) continue;
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);
    if (count === 2) dups.push(key);
  }
  return dups;
}

export function suggestCanonicalMediaName(input: {
  role?: string;
  index: number;
  originalFilename?: string;
}): string {
  const ext =
    (input.originalFilename?.match(/\.([a-z0-9]+)$/i)?.[1] ?? "jpg").toLowerCase();
  const role = (input.role ?? "other").replace(/_/g, "-");
  const n = String(input.index).padStart(2, "0");
  return `irkutsk-${role}-${n}.${ext}`;
}

/** Pure normalize: parse + trim; never fills missing business facts. */
export function normalizeOwnerPack(raw: unknown): OwnerPack {
  const parsed = ownerPackSchema.parse(raw);
  const pack: OwnerPack = {
    ...parsed,
    packVersion: trimText(parsed.packVersion ?? undefined) ?? null,
    source: trimText(parsed.source ?? undefined) ?? null,
    receivedAt: normalizeDate(parsed.receivedAt) ?? parsed.receivedAt,
    ownerConfirmedAt:
      normalizeDate(parsed.ownerConfirmedAt) ?? parsed.ownerConfirmedAt,
    excursions: parsed.excursions.map((e) => ({
      ...e,
      title: trimText(e.title),
      slug: normalizeSlugCandidate(e.slug),
      shortDescription: normalizeLineBreaks(e.shortDescription),
      fullDescription: normalizeLineBreaks(e.fullDescription),
      format: trimText(e.format),
      groupSize: trimText(e.groupSize),
      meetingPoint: normalizeLineBreaks(e.meetingPoint),
      bookingRules: normalizeLineBreaks(e.bookingRules),
      cancellationRules: normalizeLineBreaks(e.cancellationRules),
      included: e.included?.map((x) => trimText(x)!).filter(Boolean),
      notIncluded: e.notIncluded?.map((x) => trimText(x)!).filter(Boolean),
      price: e.price
        ? (() => {
            const n = normalizePriceStructure(e.price);
            return {
              ...e.price,
              amount: n.amount,
              currency: n.currency,
              pricingUnit: n.pricingUnit as typeof e.price.pricingUnit,
              displayText: n.displayText,
              rawOwnerText: n.rawOwnerText,
            };
          })()
        : undefined,
    })),
    routes: parsed.routes.map((r) => ({
      ...r,
      title: trimText(r.title),
      slug: normalizeSlugCandidate(r.slug),
      shortDescription: normalizeLineBreaks(r.shortDescription),
      fullDescription: normalizeLineBreaks(r.fullDescription),
      startPoint: trimText(r.startPoint),
      endPoint: trimText(r.endPoint),
      points: r.points?.map((p) => ({
        ...p,
        title: trimText(p.title)!,
        description: normalizeLineBreaks(p.description),
        geocodeStatus:
          p.geocodeStatus ??
          (p.lat != null && p.lng != null
            ? "COORDINATES_PROVIDED"
            : p.title
              ? "NEEDS_GEOCODING"
              : "MISSING"),
      })),
    })),
    reviews: parsed.reviews.map((r) => ({
      ...r,
      authorName: trimText(r.authorName),
      authorDisplay: trimText(r.authorDisplay),
      reviewText: normalizeLineBreaks(r.reviewText),
      date: normalizeDate(r.date) ?? trimText(r.date),
      source: trimText(r.source),
      city: trimText(r.city),
    })),
    guide: parsed.guide
      ? {
          ...parsed.guide,
          name: trimText(parsed.guide.name),
          slug: normalizeSlugCandidate(parsed.guide.slug),
          shortBio: normalizeLineBreaks(parsed.guide.shortBio),
          fullBio: normalizeLineBreaks(parsed.guide.fullBio),
          languages: parsed.guide.languages
            ?.map((x) => trimText(x)!)
            .filter(Boolean),
          credentials: parsed.guide.credentials
            ?.map((x) => trimText(x)!)
            .filter(Boolean),
        }
      : null,
    siteSettings: parsed.siteSettings
      ? {
          ...parsed.siteSettings,
          brandName: trimText(parsed.siteSettings.brandName),
          publicPhone: normalizePhone(parsed.siteSettings.publicPhone),
          publicEmail: trimText(parsed.siteSettings.publicEmail),
          authorName: trimText(parsed.siteSettings.authorName),
          authorShortText: normalizeLineBreaks(
            parsed.siteSettings.authorShortText
          ),
        }
      : null,
    media: parsed.media.map((m, index) => ({
      ...m,
      originalFilename: trimText(m.originalFilename),
      file: trimText(m.file),
      alt: trimText(m.alt),
      caption: trimText(m.caption),
      author: trimText(m.author),
      normalizedFilename:
        trimText(m.normalizedFilename) ??
        suggestCanonicalMediaName({
          role: m.role,
          index: index + 1,
          originalFilename: m.originalFilename ?? m.file,
        }),
    })),
    pricingAndBooking: parsed.pricingAndBooking
      ? {
          ...parsed.pricingAndBooking,
          howBookingWorks: normalizeLineBreaks(
            parsed.pricingAndBooking.howBookingWorks
          ),
          cancellation: normalizeLineBreaks(
            parsed.pricingAndBooking.cancellation
          ),
          refund: normalizeLineBreaks(parsed.pricingAndBooking.refund),
          meetingPoint: normalizeLineBreaks(
            parsed.pricingAndBooking.meetingPoint
          ),
          contactMethod: trimText(parsed.pricingAndBooking.contactMethod),
        }
      : null,
  };

  return pack;
}
