/**
 * Mapping: owner intake fields ↔ Payload CMS storage fields.
 * Intake describes owner obligations; Payload describes storage.
 */

export type FieldMapping = {
  intakeField: string;
  payloadCollection: string;
  payloadField: string | null;
  requirement: "required_for_ingest" | "required_for_publish" | "optional" | "derived" | "owner_confirmed" | "system_generated";
  notes?: string;
};

export const CMS_INVENTORY = {
  excursions: {
    slug: "excursions",
    draftPublish: "status select (draft|published|hidden|archived)",
    versions: false,
    required: ["title", "slug", "status", "format", "shortDescription"],
    optional: [
      "fullDescription",
      "price",
      "priceOnRequest",
      "duration",
      "groupSize",
      "includes",
      "excludes",
      "cover",
      "coverUrl",
      "relatedRoutes",
      "guide",
      "content",
      "isFeatured",
      "showInRoutesPage",
      "seo",
    ],
    relations: ["routes", "guides", "media"],
    notes:
      "No meetingPoint/bookingRules/cancellation fields in CMS — stage in intake until CONTENT.1 decides storage (content richtext or site settings).",
  },
  routes: {
    slug: "routes",
    draftPublish: "status select",
    versions: false,
    required: ["title", "slug", "status", "category", "type", "description"],
    optional: [
      "format",
      "price",
      "fullDescription",
      "duration",
      "distance",
      "difficulty",
      "routePoints",
      "cover",
      "guide",
      "seo",
      "routeGeometry",
    ],
    relations: ["guides", "media"],
    notes: "routePoints require lat/lng when present; do not invent coordinates.",
  },
  reviews: {
    slug: "reviews",
    draftPublish: "none (always readable; admin hidden)",
    versions: false,
    required: ["author", "text"],
    optional: ["city", "photo", "rating", "serviceType", "isFeatured"],
    relations: ["media"],
    notes:
      "No source/permission/status fields in CMS — gate publish via intake until schema extended.",
  },
  guides: {
    slug: "guides",
    draftPublish: "isActive checkbox (admin hidden collection)",
    versions: false,
    required: ["name", "slug", "photo", "bio"],
    optional: [
      "specialization",
      "quote",
      "experience",
      "languages",
      "routes",
      "isFeatured",
      "order",
    ],
    relations: ["media", "routes"],
  },
  photos: {
    slug: "photos",
    draftPublish: "status + moderationStatus + rights gates",
    versions: false,
    required: [
      "title",
      "slug",
      "status",
      "moderationStatus",
      "image",
      "category",
      "photoType",
      "rightsType",
    ],
    optional: [
      "description",
      "year",
      "street",
      "place",
      "authorName",
      "sourceName",
      "permissionConfirmed",
      "imageAlt",
      "seo",
    ],
    relations: ["media", "articles", "routes"],
  },
  media: {
    slug: "media",
    draftPublish: "visibility public|private",
    versions: false,
    required: [],
    optional: ["alt", "caption", "visibility"],
    relations: [],
  },
  siteSettings: {
    slug: "site-settings",
    kind: "global",
    draftPublish: "none (global always readable)",
    versions: false,
    required: [],
    optional: [
      "projectName",
      "contact.*",
      "authorName",
      "authorRole",
      "authorShortText",
      "authorPhoto",
      "defaultSeo",
      "leadSettings",
    ],
    relations: ["media"],
  },
  events: {
    slug: "events",
    draftPublish: "status select",
    notes: "Not part of minimum launch owner pack for CONTENT.0.",
  },
  articles: {
    slug: "articles",
    draftPublish: "status + Payload drafts/versions",
    notes: "Explore materials; not minimum launch pack for CONTENT.0.",
  },
  business: {
    slug: null,
    notes:
      "No dedicated business collection — B2B is page + leads + site settings copy.",
  },
  contacts: {
    slug: null,
    notes: "No contacts collection — contact group lives in site-settings global.",
  },
} as const;

export const EXCURSION_FIELD_MAP: FieldMapping[] = [
  { intakeField: "title", payloadCollection: "excursions", payloadField: "title", requirement: "required_for_ingest" },
  { intakeField: "slug", payloadCollection: "excursions", payloadField: "slug", requirement: "system_generated" },
  { intakeField: "shortDescription", payloadCollection: "excursions", payloadField: "shortDescription", requirement: "required_for_ingest" },
  { intakeField: "fullDescription", payloadCollection: "excursions", payloadField: "fullDescription", requirement: "required_for_publish" },
  { intakeField: "format", payloadCollection: "excursions", payloadField: "format", requirement: "required_for_ingest" },
  { intakeField: "price", payloadCollection: "excursions", payloadField: "price", requirement: "required_for_publish" },
  { intakeField: "price.pricingUnit", payloadCollection: "excursions", payloadField: null, requirement: "owner_confirmed", notes: "Staging-only until unambiguous; maps to price + priceOnRequest" },
  { intakeField: "durationMinutes", payloadCollection: "excursions", payloadField: "duration", requirement: "required_for_publish" },
  { intakeField: "groupSize", payloadCollection: "excursions", payloadField: "groupSize", requirement: "required_for_publish" },
  { intakeField: "meetingPoint", payloadCollection: "excursions", payloadField: null, requirement: "required_for_publish", notes: "No CMS field — store in content/staging until decided" },
  { intakeField: "included", payloadCollection: "excursions", payloadField: "includes", requirement: "optional" },
  { intakeField: "notIncluded", payloadCollection: "excursions", payloadField: "excludes", requirement: "optional" },
  { intakeField: "bookingRules", payloadCollection: "excursions", payloadField: null, requirement: "owner_confirmed" },
  { intakeField: "cancellationRules", payloadCollection: "excursions", payloadField: null, requirement: "owner_confirmed" },
  { intakeField: "heroImage", payloadCollection: "excursions", payloadField: "cover", requirement: "required_for_publish" },
  { intakeField: "guide", payloadCollection: "excursions", payloadField: "guide", requirement: "optional" },
  { intakeField: "route", payloadCollection: "excursions", payloadField: "relatedRoutes", requirement: "optional" },
  { intakeField: "seo.title", payloadCollection: "excursions", payloadField: "seo.title", requirement: "derived" },
  { intakeField: "seo.description", payloadCollection: "excursions", payloadField: "seo.description", requirement: "derived" },
  { intakeField: "status", payloadCollection: "excursions", payloadField: "status", requirement: "system_generated", notes: "Ingest → draft only" },
];

export const ROUTE_FIELD_MAP: FieldMapping[] = [
  { intakeField: "title", payloadCollection: "routes", payloadField: "title", requirement: "required_for_ingest" },
  { intakeField: "slug", payloadCollection: "routes", payloadField: "slug", requirement: "system_generated" },
  { intakeField: "shortDescription", payloadCollection: "routes", payloadField: "description", requirement: "required_for_ingest" },
  { intakeField: "fullDescription", payloadCollection: "routes", payloadField: "fullDescription", requirement: "optional" },
  { intakeField: "category", payloadCollection: "routes", payloadField: "category", requirement: "required_for_ingest" },
  { intakeField: "points[].lat/lng", payloadCollection: "routes", payloadField: "routePoints", requirement: "required_for_publish", notes: "NEEDS_GEOCODING if title-only" },
  { intakeField: "durationMinutes", payloadCollection: "routes", payloadField: "duration", requirement: "optional" },
  { intakeField: "distanceKm", payloadCollection: "routes", payloadField: "distance", requirement: "optional" },
  { intakeField: "guide", payloadCollection: "routes", payloadField: "guide", requirement: "optional" },
];

export const REVIEW_FIELD_MAP: FieldMapping[] = [
  { intakeField: "authorName", payloadCollection: "reviews", payloadField: "author", requirement: "required_for_ingest" },
  { intakeField: "reviewText", payloadCollection: "reviews", payloadField: "text", requirement: "required_for_ingest" },
  { intakeField: "source", payloadCollection: "reviews", payloadField: null, requirement: "owner_confirmed" },
  { intakeField: "permissionToPublish", payloadCollection: "reviews", payloadField: null, requirement: "required_for_publish" },
  { intakeField: "city", payloadCollection: "reviews", payloadField: "city", requirement: "optional" },
  { intakeField: "rating", payloadCollection: "reviews", payloadField: "rating", requirement: "optional" },
];

export const GUIDE_FIELD_MAP: FieldMapping[] = [
  { intakeField: "name", payloadCollection: "guides", payloadField: "name", requirement: "required_for_ingest" },
  { intakeField: "slug", payloadCollection: "guides", payloadField: "slug", requirement: "system_generated" },
  { intakeField: "fullBio|shortBio", payloadCollection: "guides", payloadField: "bio", requirement: "required_for_ingest" },
  { intakeField: "portrait", payloadCollection: "guides", payloadField: "photo", requirement: "required_for_publish" },
  { intakeField: "experienceYears", payloadCollection: "guides", payloadField: "experience", requirement: "optional" },
  { intakeField: "specialization", payloadCollection: "guides", payloadField: "specialization", requirement: "optional" },
  { intakeField: "languages", payloadCollection: "guides", payloadField: "languages", requirement: "optional" },
  { intakeField: "marketingClaims", payloadCollection: "guides", payloadField: null, requirement: "owner_confirmed", notes: "Never auto-publish unverified superlatives" },
];

export const SITE_SETTINGS_FIELD_MAP: FieldMapping[] = [
  { intakeField: "brandName", payloadCollection: "site-settings", payloadField: "projectName", requirement: "optional" },
  { intakeField: "publicPhone", payloadCollection: "site-settings", payloadField: "contact.phone", requirement: "required_for_publish" },
  { intakeField: "publicEmail", payloadCollection: "site-settings", payloadField: "contact.email", requirement: "optional" },
  { intakeField: "messengerLinks.telegram", payloadCollection: "site-settings", payloadField: "contact.telegram", requirement: "required_for_publish" },
  { intakeField: "authorName", payloadCollection: "site-settings", payloadField: "authorName", requirement: "optional" },
  { intakeField: "leadNotificationEmail", payloadCollection: "site-settings", payloadField: "leadSettings.leadNotificationEmail", requirement: "optional", notes: "Admin-only; never put secrets in owner pack git" },
];

export const MEDIA_FIELD_MAP: FieldMapping[] = [
  { intakeField: "file", payloadCollection: "media", payloadField: "filename", requirement: "required_for_ingest" },
  { intakeField: "alt", payloadCollection: "media", payloadField: "alt", requirement: "optional" },
  { intakeField: "caption", payloadCollection: "media", payloadField: "caption", requirement: "optional" },
  { intakeField: "publicationRights", payloadCollection: "photos", payloadField: "rightsType/permissionConfirmed", requirement: "required_for_publish" },
];

export const AI_COPY_POLICY = {
  allowed: [
    "orthography fixes",
    "structuring",
    "shortening",
    "readability",
    "UX adaptation",
    "SEO title suggestions from confirmed facts only",
  ],
  forbidden: [
    "inventing facts",
    "inventing historical claims",
    "inventing guide credentials",
    "inventing reviews",
    "inventing prices",
    "inventing booking rules",
    "inventing coordinates",
  ],
} as const;

export const SLUG_POLICY = {
  ownerProvided: "accepted if valid kebab-case and unique",
  systemGenerated: "from title via transliteration/slugify when owner omits",
  lockedAfterPublish: true,
  redirectIfChanged: "required for CONTENT.1+ if public URL changes",
} as const;

export const PUBLICATION_FLOW = {
  withDraftStatus: [
    "excursions",
    "routes",
    "photos",
    "events",
    "articles",
    "products",
    "reviews",
  ],
  withoutDraftStatus: ["guides", "site-settings"],
  recommended: ["INGEST", "DRAFT", "PREVIEW", "OWNER_QA", "PUBLISH"] as const,
  gap: "guides use isActive (not draft status); placeholder profiles are fail-closed in access + readiness. Reviews use status + isFeatured (ADMIN.B).",
} as const;
