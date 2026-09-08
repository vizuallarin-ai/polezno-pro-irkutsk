/**
 * Owner intake Zod schemas — describe what the owner must provide.
 * Distinct from Payload storage schemas (see mapping.ts).
 */

import { z } from "zod";
import { PUBLICATION_RIGHTS, PRICING_UNITS } from "./types";

const nonempty = z.string().trim().min(1);
const optionalText = z.string().trim().optional();

export const textProvenanceSchema = z.object({
  source: optionalText,
  ownerConfirmed: z.boolean().optional(),
  lastUpdated: optionalText,
});

export const priceSchema = z.object({
  amount: z.number().nonnegative().optional(),
  currency: z.string().default("RUB"),
  pricingUnit: z.enum(PRICING_UNITS).default("unknown"),
  conditions: optionalText,
  validityNote: optionalText,
  ownerConfirmationDate: optionalText,
  displayText: optionalText,
  rawOwnerText: optionalText,
});

export const seoFieldsSchema = z.object({
  title: optionalText,
  description: optionalText,
  origin: z
    .enum(["OWNER_PROVIDED", "EDITORIAL_DERIVED", "SYSTEM_GENERATED"])
    .optional(),
});

export const mediaItemSchema = z.object({
  ownerContentId: nonempty,
  file: optionalText,
  originalFilename: optionalText,
  normalizedFilename: optionalText,
  source: optionalText,
  author: optionalText,
  copyright: optionalText,
  publicationRights: z.enum(PUBLICATION_RIGHTS).default("UNKNOWN"),
  relatedEntityOwnerContentId: optionalText,
  caption: optionalText,
  alt: optionalText,
  focalPoint: optionalText,
  orientation: z.enum(["landscape", "portrait", "square", "unknown"]).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
  checksumSha256: optionalText,
  publicationApproval: z.boolean().optional(),
  role: z
    .enum(["hero", "gallery", "portrait", "route_stop", "og", "other"])
    .optional(),
});

export const excursionSchema = z.object({
  ownerContentId: nonempty,
  title: optionalText,
  slug: optionalText,
  shortDescription: optionalText,
  fullDescription: optionalText,
  format: optionalText,
  heroImageOwnerContentId: optionalText,
  galleryOwnerContentIds: z.array(z.string()).optional(),
  price: priceSchema.optional(),
  priceOnRequest: z.boolean().optional(),
  durationMinutes: z.number().int().positive().optional(),
  durationText: optionalText,
  groupSize: optionalText,
  transport: optionalText,
  meetingPoint: optionalText,
  routeOwnerContentId: optionalText,
  included: z.array(z.string()).optional(),
  notIncluded: z.array(z.string()).optional(),
  bookingRules: optionalText,
  cancellationRules: optionalText,
  guideOwnerContentId: optionalText,
  contactCta: optionalText,
  seo: seoFieldsSchema.optional(),
  publicationApproval: z.boolean().optional(),
  ownerConfirmed: z.boolean().optional(),
  provenance: textProvenanceSchema.optional(),
});

export const routePointSchema = z.object({
  title: nonempty,
  lat: z.number().optional(),
  lng: z.number().optional(),
  description: optionalText,
  whatToNotice: optionalText,
  timeOnSite: optionalText,
  order: z.number().int().optional(),
  geocodeStatus: z
    .enum([
      "COORDINATES_PROVIDED",
      "NEEDS_GEOCODING",
      "OWNER_CONFIRMATION_REQUIRED",
      "MISSING",
    ])
    .optional(),
});

export const routeSchema = z.object({
  ownerContentId: nonempty,
  title: optionalText,
  slug: optionalText,
  shortDescription: optionalText,
  fullDescription: optionalText,
  category: optionalText,
  format: optionalText,
  durationMinutes: z.number().int().positive().optional(),
  distanceKm: z.number().nonnegative().optional(),
  difficulty: optionalText,
  startPoint: optionalText,
  endPoint: optionalText,
  points: z.array(routePointSchema).optional(),
  photoOwnerContentIds: z.array(z.string()).optional(),
  linkedExcursionOwnerContentId: optionalText,
  guideOwnerContentId: optionalText,
  seasonality: optionalText,
  accessibilityNotes: optionalText,
  seo: seoFieldsSchema.optional(),
  publicationApproval: z.boolean().optional(),
  ownerConfirmed: z.boolean().optional(),
  provenance: textProvenanceSchema.optional(),
});

export const reviewSchema = z.object({
  ownerContentId: nonempty,
  authorName: optionalText,
  authorDisplay: optionalText,
  reviewText: optionalText,
  date: optionalText,
  source: optionalText,
  sourceUrl: optionalText,
  relatedExcursionOwnerContentId: optionalText,
  relatedGuideOwnerContentId: optionalText,
  permissionToPublish: z.boolean().optional(),
  photoOwnerContentId: optionalText,
  ownerVerificationStatus: z
    .enum(["OWNER_VERIFIED", "UNVERIFIED", "REJECTED"])
    .optional(),
  city: optionalText,
  rating: z.enum(["3", "4", "5"]).optional(),
  publicationApproval: z.boolean().optional(),
});

export const guideSchema = z.object({
  ownerContentId: nonempty,
  name: optionalText,
  slug: optionalText,
  shortBio: optionalText,
  fullBio: optionalText,
  experienceYears: z.number().int().nonnegative().optional(),
  specialization: z.array(z.string()).optional(),
  credentials: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  portraitOwnerContentId: optionalText,
  galleryOwnerContentIds: z.array(z.string()).optional(),
  contactRole: optionalText,
  socialLinks: z
    .object({
      telegram: optionalText,
      vk: optionalText,
      instagram: optionalText,
      other: optionalText,
    })
    .optional(),
  personalPositioning: optionalText,
  marketingClaimsRequireConfirmation: z.array(z.string()).optional(),
  seo: seoFieldsSchema.optional(),
  publicationApproval: z.boolean().optional(),
  ownerConfirmed: z.boolean().optional(),
  provenance: textProvenanceSchema.optional(),
});

export const siteSettingsSchema = z.object({
  ownerContentId: z.string().default("site-settings.primary"),
  brandName: optionalText,
  publicPhone: optionalText,
  publicEmail: optionalText,
  messengerLinks: z
    .object({
      telegram: optionalText,
      whatsapp: optionalText,
      max: optionalText,
      vk: optionalText,
    })
    .optional(),
  bookingContact: optionalText,
  businessDetails: optionalText,
  legalEntity: optionalText,
  privacyPolicyContact: optionalText,
  socialLinks: z
    .object({
      youtube: optionalText,
      boosty: optionalText,
      instagram: optionalText,
    })
    .optional(),
  publicAddress: optionalText,
  workingHours: optionalText,
  defaultSeo: seoFieldsSchema.optional(),
  defaultOgImageOwnerContentId: optionalText,
  analyticsIdsNote: optionalText,
  authorName: optionalText,
  authorRole: optionalText,
  authorShortText: optionalText,
  publicationApproval: z.boolean().optional(),
  ownerConfirmed: z.boolean().optional(),
});

export const pricingBookingSchema = z.object({
  ownerContentId: z.string().default("pricing-booking.primary"),
  howBookingWorks: optionalText,
  advancePayment: optionalText,
  paymentMethods: z.array(z.string()).optional(),
  cancellation: optionalText,
  refund: optionalText,
  minimumNotice: optionalText,
  maximumGroup: optionalText,
  childrenRules: optionalText,
  transportRules: optionalText,
  weatherCancellation: optionalText,
  lateArrival: optionalText,
  meetingPoint: optionalText,
  contactMethod: optionalText,
  responseTimePromise: optionalText,
  ownerConfirmed: z.boolean().optional(),
  legalConfirmationRequired: z.boolean().optional(),
});

export const ownerPackSchema = z.object({
  packVersion: z.string().nullable(),
  receivedAt: z.string().nullable(),
  source: z.string().nullable(),
  ownerConfirmedAt: z.string().nullable(),
  isTestFixture: z.boolean().default(false),
  status: z
    .enum([
      "NOT_RECEIVED",
      "RECEIVED",
      "IN_VALIDATION",
      "NEEDS_CLARIFICATION",
      "READY_FOR_INGEST",
    ])
    .default("NOT_RECEIVED"),
  excursions: z.array(excursionSchema).default([]),
  routes: z.array(routeSchema).default([]),
  reviews: z.array(reviewSchema).default([]),
  guide: guideSchema.nullable().default(null),
  siteSettings: siteSettingsSchema.nullable().default(null),
  media: z.array(mediaItemSchema).default([]),
  pricingAndBooking: pricingBookingSchema.nullable().default(null),
  /** Mapping of ownerContentId → known CMS id (staging only; not a CMS field). */
  cmsIdMapping: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

export type OwnerPack = z.infer<typeof ownerPackSchema>;
export type OwnerExcursion = z.infer<typeof excursionSchema>;
export type OwnerRoute = z.infer<typeof routeSchema>;
export type OwnerReview = z.infer<typeof reviewSchema>;
export type OwnerGuide = z.infer<typeof guideSchema>;
export type OwnerSiteSettings = z.infer<typeof siteSettingsSchema>;
export type OwnerMediaItem = z.infer<typeof mediaItemSchema>;
export type OwnerPricingBooking = z.infer<typeof pricingBookingSchema>;

export const EMPTY_OWNER_PACK: OwnerPack = {
  packVersion: null,
  receivedAt: null,
  source: null,
  ownerConfirmedAt: null,
  isTestFixture: false,
  status: "NOT_RECEIVED",
  excursions: [],
  routes: [],
  reviews: [],
  guide: null,
  siteSettings: null,
  media: [],
  pricingAndBooking: null,
  cmsIdMapping: {},
};
