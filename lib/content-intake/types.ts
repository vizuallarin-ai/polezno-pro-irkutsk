/**
 * CONTENT.0 — owner intake status model.
 * Field/entity statuses are staging-only; never invent facts from UNKNOWN.
 */

export const FIELD_STATUSES = [
  "PRESENT",
  "MISSING",
  "AMBIGUOUS",
  "UNVERIFIED",
  "INVALID",
  "DERIVED",
  "SYSTEM_GENERATED",
  "OWNER_CONFIRMATION_REQUIRED",
  "READY",
] as const;

export type FieldStatus = (typeof FIELD_STATUSES)[number];

export const ENTITY_STATUSES = [
  "NOT_RECEIVED",
  "INCOMPLETE",
  "NEEDS_CLARIFICATION",
  "READY_FOR_NORMALIZATION",
  "READY_FOR_INGEST",
  "READY_FOR_PUBLISH",
  "PUBLISHED",
] as const;

export type EntityStatus = (typeof ENTITY_STATUSES)[number];

export const ISSUE_SEVERITIES = ["INFO", "WARNING", "ERROR", "BLOCKER"] as const;
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

export const PUBLICATION_RIGHTS = [
  "OWNER_CONFIRMED",
  "CLIENT_PROVIDED",
  "THIRD_PARTY_UNVERIFIED",
  "UNKNOWN",
] as const;
export type PublicationRights = (typeof PUBLICATION_RIGHTS)[number];

export const PRICING_UNITS = [
  "fixed",
  "per_group",
  "per_person",
  "from",
  "weekday_weekend",
  "vehicle_included",
  "vehicle_separate",
  "extra_hour",
  "extra_guest",
  "custom_quote",
  "ambiguous",
  "unknown",
] as const;
export type PricingUnit = (typeof PRICING_UNITS)[number];

export const CHANGE_KINDS = ["NEW", "CHANGED", "UNCHANGED", "REMOVED"] as const;
export type ChangeKind = (typeof CHANGE_KINDS)[number];

export const INGEST_ACTIONS = [
  "WOULD_CREATE",
  "WOULD_UPDATE",
  "WOULD_LINK",
  "WOULD_SKIP",
  "BLOCKED",
  "UPDATE_CANDIDATE",
] as const;
export type IngestAction = (typeof INGEST_ACTIONS)[number];

export const INGEST_TARGETS = ["local", "staging", "production"] as const;
export type IngestTarget = (typeof INGEST_TARGETS)[number];

export type FieldRequirement =
  | "required_for_ingest"
  | "required_for_publish"
  | "optional"
  | "derived"
  | "owner_confirmed"
  | "system_generated";

export type FieldAssessment = {
  field: string;
  status: FieldStatus;
  requirement: FieldRequirement;
  valuePreview?: string;
  note?: string;
  legalConfirmationRequired?: boolean;
};

export type Issue = {
  severity: IssueSeverity;
  code: string;
  entity: string;
  entityId?: string;
  field?: string;
  message: string;
};

export type EntityAssessment = {
  entity: string;
  ownerContentId?: string;
  status: EntityStatus;
  fields: FieldAssessment[];
  issues: Issue[];
  readyForIngest: boolean;
  readyForPublish: boolean;
};

export type MinimumLaunchPackStatus = {
  flagshipExcursion: EntityStatus;
  route: EntityStatus;
  guide: EntityStatus;
  review: EntityStatus;
  photos: EntityStatus;
  siteSettings: EntityStatus;
  pricingBooking: EntityStatus;
  result: "OWNER_CONTENT_STILL_BLOCKED" | "MINIMUM_LAUNCH_PACK_READY";
};

export type PackValidationResult = {
  packVersion: string | null;
  packStatus: EntityStatus;
  received: boolean;
  isTestFixture: boolean;
  entities: EntityAssessment[];
  issues: Issue[];
  blockers: Issue[];
  warnings: Issue[];
  readyForIngest: boolean;
  readyForPublish: boolean;
  minimumLaunch: MinimumLaunchPackStatus;
  clarificationQuestions: string[];
};

export type PlanItem = {
  collection: string;
  ownerContentId: string;
  action: IngestAction;
  reason: string;
  cmsMatchHint?: string;
};

export type IngestPlan = {
  packVersion: string | null;
  target: IngestTarget;
  productionWrite: false;
  items: PlanItem[];
  summary: Record<
    string,
    { create: number; update: number; blocked: number; skip: number; link: number }
  >;
  readyForIngest: boolean;
};
