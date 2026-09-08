/**
 * Owner pack validation: field statuses, blockers vs warnings, minimum launch.
 * Does not mutate CMS. CONTENT.0 never sets PUBLISHED.
 */

import type { OwnerPack } from "./schemas";
import { normalizeOwnerPack, detectDuplicateFilenames, detectDuplicateChecksums, normalizePriceStructure } from "./normalize";
import type {
  EntityAssessment,
  EntityStatus,
  FieldAssessment,
  FieldRequirement,
  FieldStatus,
  Issue,
  MinimumLaunchPackStatus,
  PackValidationResult,
} from "./types";

function present(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "boolean") return true;
  if (typeof v === "number") return Number.isFinite(v);
  return true;
}

function field(
  name: string,
  value: unknown,
  requirement: FieldRequirement,
  statusOverride?: FieldStatus,
  note?: string,
  legal?: boolean
): FieldAssessment {
  const status: FieldStatus =
    statusOverride ?? (present(value) ? "PRESENT" : "MISSING");
  if (status === "MISSING" && requirement === "optional") {
    // keep MISSING; optional missing is not a blocker
  }
  return {
    field: name,
    status,
    requirement,
    valuePreview:
      typeof value === "string"
        ? value.slice(0, 80)
        : value == null
          ? undefined
          : String(value).slice(0, 80),
    note,
    legalConfirmationRequired: legal,
  };
}

function issue(
  severity: Issue["severity"],
  code: string,
  entity: string,
  message: string,
  extra?: Partial<Issue>
): Issue {
  return { severity, code, entity, message, ...extra };
}

function fieldOkForIngest(f: FieldAssessment): boolean {
  if (f.requirement !== "required_for_ingest") return true;
  return (
    f.status === "PRESENT" ||
    f.status === "READY" ||
    f.status === "DERIVED" ||
    f.status === "SYSTEM_GENERATED"
  );
}

function fieldOkForPublish(f: FieldAssessment): boolean {
  if (
    f.requirement !== "required_for_publish" &&
    f.requirement !== "owner_confirmed"
  ) {
    return true;
  }
  if (
    f.status === "OWNER_CONFIRMATION_REQUIRED" ||
    f.status === "AMBIGUOUS" ||
    f.status === "UNVERIFIED" ||
    f.status === "INVALID" ||
    f.status === "MISSING"
  ) {
    return false;
  }
  return (
    f.status === "PRESENT" ||
    f.status === "READY" ||
    f.status === "DERIVED" ||
    f.status === "SYSTEM_GENERATED"
  );
}

function entityStatusFromFields(
  fields: FieldAssessment[],
  issues: Issue[],
  received: boolean
): EntityStatus {
  if (!received) return "NOT_RECEIVED";
  const hasBlocker = issues.some((i) => i.severity === "BLOCKER");
  const needsClarify = fields.some(
    (f) =>
      f.status === "AMBIGUOUS" ||
      (f.status === "UNVERIFIED" && f.requirement !== "optional") ||
      (f.status === "OWNER_CONFIRMATION_REQUIRED" &&
        f.requirement === "required_for_ingest")
  );
  const ingestReady = fields.every(fieldOkForIngest) && !hasBlocker;
  const publishReady =
    ingestReady && fields.every(fieldOkForPublish) && !needsClarify;

  if (!ingestReady) {
    if (needsClarify || fields.some((f) => f.status === "AMBIGUOUS")) {
      return "NEEDS_CLARIFICATION";
    }
    return "INCOMPLETE";
  }
  // CONTENT.0 never returns PUBLISHED; READY_FOR_PUBLISH is theoretical only
  if (publishReady) return "READY_FOR_PUBLISH";
  if (
    fields.some(
      (f) =>
        f.status === "OWNER_CONFIRMATION_REQUIRED" ||
        f.status === "AMBIGUOUS" ||
        f.status === "UNVERIFIED"
    )
  ) {
    // Ingest-capable draft, but publish/clarify still open
    return "READY_FOR_INGEST";
  }
  return "READY_FOR_INGEST";
}

function assessExcursion(pack: OwnerPack, e: OwnerPack["excursions"][number]): EntityAssessment {
  const issues: Issue[] = [];
  const fields: FieldAssessment[] = [
    field("title", e.title, "required_for_ingest"),
    field("slug", e.slug, "system_generated", e.slug ? "PRESENT" : "SYSTEM_GENERATED", "Generated at ingest if missing"),
    field("shortDescription", e.shortDescription, "required_for_ingest"),
    field("fullDescription", e.fullDescription, "required_for_publish"),
    field("format", e.format, "required_for_ingest"),
  ];

  if (e.priceOnRequest) {
    fields.push(field("price", "on_request", "required_for_publish", "PRESENT"));
    fields.push(field("priceRule", "custom_quote", "owner_confirmed", "PRESENT"));
  } else if (!e.price) {
    fields.push(field("price", undefined, "required_for_publish"));
    fields.push(field("priceRule", undefined, "owner_confirmed"));
    issues.push(
      issue("BLOCKER", "PRICE_MISSING", "excursion", "Цена не указана", {
        entityId: e.ownerContentId,
        field: "price",
      })
    );
  } else {
    const n = normalizePriceStructure(e.price);
    if (n.ambiguous || n.pricingUnit === "unknown" || n.pricingUnit === "ambiguous") {
      fields.push(field("price", n.amount ?? n.rawOwnerText, "required_for_publish", "AMBIGUOUS", "Цена неоднозначна"));
      fields.push(
        field(
          "priceRule",
          n.pricingUnit,
          "owner_confirmed",
          "AMBIGUOUS",
          "Уточнить: за группу / за человека / от"
        )
      );
      issues.push(
        issue(
          "BLOCKER",
          "PRICE_AMBIGUOUS",
          "excursion",
          "Цена неоднозначна — нельзя автоматически интерпретировать",
          { entityId: e.ownerContentId, field: "price" }
        )
      );
    } else if (n.amount == null) {
      fields.push(field("price", n.rawOwnerText, "required_for_publish", "INVALID"));
      issues.push(
        issue("BLOCKER", "PRICE_INVALID", "excursion", "Нет числовой суммы цены", {
          entityId: e.ownerContentId,
          field: "price",
        })
      );
    } else {
      fields.push(field("price", n.amount, "required_for_publish", "PRESENT"));
      fields.push(field("priceRule", n.pricingUnit, "owner_confirmed", "READY"));
    }
  }

  fields.push(
    field("duration", e.durationMinutes ?? e.durationText, "required_for_publish"),
    field("groupSize", e.groupSize, "required_for_publish"),
    field("meetingPoint", e.meetingPoint, "required_for_publish"),
    field(
      "bookingRules",
      e.bookingRules,
      "required_for_publish",
      e.bookingRules ? "PRESENT" : "MISSING",
      e.bookingRules ? "LEGAL_CONFIRMATION_REQUIRED before publish" : undefined,
      true
    ),
    field(
      "cancellationRules",
      e.cancellationRules,
      "required_for_publish",
      e.cancellationRules ? "PRESENT" : "MISSING",
      e.cancellationRules ? "LEGAL_CONFIRMATION_REQUIRED before publish" : undefined,
      true
    ),
    field("included", e.included, "optional"),
    field("notIncluded", e.notIncluded, "optional"),
    field("heroImage", e.heroImageOwnerContentId, "required_for_publish"),
    field("guide", e.guideOwnerContentId, "optional"),
    field("seo.title", e.seo?.title, "derived"),
    field("seo.description", e.seo?.description, "derived"),
    field(
      "publicationApproval",
      e.publicationApproval,
      "required_for_publish",
      e.publicationApproval === true ? "PRESENT" : "OWNER_CONFIRMATION_REQUIRED"
    )
  );

  if (!e.title) {
    issues.push(issue("BLOCKER", "TITLE_MISSING", "excursion", "Нет названия", { entityId: e.ownerContentId, field: "title" }));
  }
  if (!e.shortDescription) {
    issues.push(issue("BLOCKER", "SHORT_DESC_MISSING", "excursion", "Нет краткого описания", { entityId: e.ownerContentId, field: "shortDescription" }));
  }
  if (!e.format) {
    issues.push(issue("WARNING", "FORMAT_MISSING", "excursion", "Формат не указан — нужен для ingest", { entityId: e.ownerContentId, field: "format" }));
    issues.push(issue("BLOCKER", "FORMAT_REQUIRED", "excursion", "Формат обязателен для ingest", { entityId: e.ownerContentId, field: "format" }));
  }
  if (!e.groupSize) {
    issues.push(issue("BLOCKER", "GROUP_SIZE_MISSING", "excursion", "Не указан размер группы", { entityId: e.ownerContentId, field: "groupSize" }));
  }
  if (!e.meetingPoint) {
    issues.push(issue("BLOCKER", "MEETING_POINT_MISSING", "excursion", "Не указана точка встречи", { entityId: e.ownerContentId, field: "meetingPoint" }));
  }
  if (!e.seo?.description) {
    issues.push(issue("WARNING", "SEO_DESC_MISSING", "excursion", "SEO description можно derived later", { entityId: e.ownerContentId, field: "seo.description" }));
  }
  if (e.shortDescription && e.shortDescription.length < 40) {
    issues.push(issue("WARNING", "DESC_TOO_SHORT", "excursion", "Краткое описание слишком короткое", { entityId: e.ownerContentId, field: "shortDescription" }));
  }
  if (e.title && e.title.length > 90) {
    issues.push(issue("WARNING", "TITLE_TOO_LONG", "excursion", "Название длиннее 90 символов", { entityId: e.ownerContentId, field: "title" }));
  }
  if (e.bookingRules) {
    issues.push(
      issue(
        "WARNING",
        "LEGAL_CONFIRMATION_REQUIRED",
        "excursion",
        "Правила бронирования требуют подтверждения владельца перед публикацией",
        { entityId: e.ownerContentId, field: "bookingRules" }
      )
    );
  }

  const status = entityStatusFromFields(fields, issues, true);
  // CONTENT.0 never READY_FOR_PUBLISH without full confirmation chain — clamp publish
  const readyForIngest =
    status === "READY_FOR_INGEST" || status === "READY_FOR_PUBLISH";
  const readyForPublish = false; // CONTENT.0 boundary

  return {
    entity: "excursion",
    ownerContentId: e.ownerContentId,
    status: readyForIngest && status === "READY_FOR_PUBLISH" ? "READY_FOR_INGEST" : status,
    fields,
    issues,
    readyForIngest,
    readyForPublish,
  };
}

function assessRoute(r: OwnerPack["routes"][number]): EntityAssessment {
  const issues: Issue[] = [];
  const fields: FieldAssessment[] = [
    field("title", r.title, "required_for_ingest"),
    field("slug", r.slug, "system_generated", r.slug ? "PRESENT" : "SYSTEM_GENERATED"),
    field("shortDescription", r.shortDescription, "required_for_ingest"),
    field("fullDescription", r.fullDescription, "optional"),
    field("category", r.category, "required_for_ingest"),
    field("duration", r.durationMinutes, "optional"),
    field("distance", r.distanceKm, "optional"),
    field("startPoint", r.startPoint, "optional"),
    field("points", r.points, "required_for_publish"),
  ];

  if (!r.title) {
    issues.push(issue("BLOCKER", "TITLE_MISSING", "route", "Нет названия маршрута", { entityId: r.ownerContentId }));
  }
  if (!r.shortDescription) {
    issues.push(issue("BLOCKER", "DESC_MISSING", "route", "Нет краткого описания", { entityId: r.ownerContentId }));
  }
  if (!r.category) {
    issues.push(issue("BLOCKER", "CATEGORY_MISSING", "route", "Нет категории", { entityId: r.ownerContentId }));
  }

  for (const p of r.points ?? []) {
    if (p.lat == null || p.lng == null) {
      fields.push(
        field(
          `point:${p.title}`,
          p.title,
          "required_for_publish",
          "OWNER_CONFIRMATION_REQUIRED",
          "NEEDS GEOCODING / OWNER CONFIRMATION"
        )
      );
      issues.push(
        issue(
          "BLOCKER",
          "NEEDS_GEOCODING",
          "route",
          `Точка «${p.title}»: координаты не подтверждены`,
          { entityId: r.ownerContentId, field: p.title }
        )
      );
    } else if (
      p.lat < -90 ||
      p.lat > 90 ||
      p.lng < -180 ||
      p.lng > 180
    ) {
      issues.push(
        issue("BLOCKER", "INVALID_COORDINATES", "route", `Некорректные координаты у «${p.title}»`, {
          entityId: r.ownerContentId,
        })
      );
      fields.push(field(`point:${p.title}`, `${p.lat},${p.lng}`, "required_for_publish", "INVALID"));
    } else {
      fields.push(field(`point:${p.title}`, `${p.lat},${p.lng}`, "required_for_publish", "PRESENT"));
    }
  }

  if (!r.points?.length) {
    issues.push(issue("BLOCKER", "POINTS_MISSING", "route", "Нет точек маршрута", { entityId: r.ownerContentId }));
  }

  const status = entityStatusFromFields(fields, issues, true);
  return {
    entity: "route",
    ownerContentId: r.ownerContentId,
    status: status === "READY_FOR_PUBLISH" ? "READY_FOR_INGEST" : status,
    fields,
    issues,
    readyForIngest: status === "READY_FOR_INGEST" || status === "READY_FOR_PUBLISH",
    readyForPublish: false,
  };
}

function assessReview(r: OwnerPack["reviews"][number]): EntityAssessment {
  const issues: Issue[] = [];
  const fields: FieldAssessment[] = [
    field("authorName", r.authorName, "required_for_ingest"),
    field("reviewText", r.reviewText, "required_for_ingest"),
    field("date", r.date, "optional"),
    field(
      "source",
      r.source,
      "owner_confirmed",
      r.source ? "PRESENT" : "UNVERIFIED",
      r.source ? undefined : "SOURCE UNVERIFIED"
    ),
    field(
      "permissionToPublish",
      r.permissionToPublish,
      "required_for_publish",
      r.permissionToPublish === true ? "PRESENT" : "OWNER_CONFIRMATION_REQUIRED"
    ),
    field(
      "ownerVerificationStatus",
      r.ownerVerificationStatus,
      "owner_confirmed",
      r.ownerVerificationStatus === "OWNER_VERIFIED"
        ? "PRESENT"
        : "UNVERIFIED"
    ),
  ];

  if (!r.authorName) {
    issues.push(issue("BLOCKER", "AUTHOR_MISSING", "review", "Непонятен автор отзыва", { entityId: r.ownerContentId }));
  }
  if (!r.reviewText) {
    issues.push(issue("BLOCKER", "TEXT_MISSING", "review", "Нет текста отзыва", { entityId: r.ownerContentId }));
  }
  if (!r.source) {
    issues.push(
      issue("BLOCKER", "SOURCE_UNVERIFIED", "review", "SOURCE UNVERIFIED — нельзя публиковать", {
        entityId: r.ownerContentId,
        field: "source",
      })
    );
  }
  if (r.permissionToPublish !== true) {
    issues.push(
      issue("BLOCKER", "NO_PERMISSION", "review", "Нет разрешения на публикацию", {
        entityId: r.ownerContentId,
        field: "permissionToPublish",
      })
    );
  }

  const status = entityStatusFromFields(fields, issues, true);
  return {
    entity: "review",
    ownerContentId: r.ownerContentId,
    status: status === "READY_FOR_PUBLISH" ? "READY_FOR_INGEST" : status,
    fields,
    issues,
    readyForIngest: status === "READY_FOR_INGEST" || status === "READY_FOR_PUBLISH",
    readyForPublish: false,
  };
}

function assessGuide(g: NonNullable<OwnerPack["guide"]>): EntityAssessment {
  const issues: Issue[] = [];
  const bio = g.fullBio || g.shortBio;
  const fields: FieldAssessment[] = [
    field("name", g.name, "required_for_ingest"),
    field("slug", g.slug, "system_generated", g.slug ? "PRESENT" : "SYSTEM_GENERATED"),
    field("bio", bio, "required_for_ingest"),
    field("portrait", g.portraitOwnerContentId, "required_for_ingest"),
    field("experience", g.experienceYears, "optional"),
    field("specialization", g.specialization, "optional"),
    field("languages", g.languages, "optional"),
    field(
      "publicationApproval",
      g.publicationApproval,
      "owner_confirmed",
      g.publicationApproval === true ? "PRESENT" : "OWNER_CONFIRMATION_REQUIRED"
    ),
  ];

  if (!g.name) {
    issues.push(issue("BLOCKER", "NAME_MISSING", "guide", "Нет имени гида", { entityId: g.ownerContentId }));
  }
  if (!bio) {
    issues.push(issue("BLOCKER", "BIO_MISSING", "guide", "Нет биографии", { entityId: g.ownerContentId }));
  }
  for (const claim of g.marketingClaimsRequireConfirmation ?? []) {
    fields.push(
      field(`claim:${claim.slice(0, 40)}`, claim, "owner_confirmed", "OWNER_CONFIRMATION_REQUIRED", "Не публиковать как факт без подтверждения")
    );
    issues.push(
      issue("WARNING", "MARKETING_CLAIM", "guide", `Маркетинговое утверждение требует подтверждения: «${claim}»`, {
        entityId: g.ownerContentId,
      })
    );
  }
  if (!g.portraitOwnerContentId) {
    issues.push(issue("BLOCKER", "PORTRAIT_MISSING", "guide", "Нет портретного фото", { entityId: g.ownerContentId }));
  }

  const status = entityStatusFromFields(fields, issues, true);
  return {
    entity: "guide",
    ownerContentId: g.ownerContentId,
    status: status === "READY_FOR_PUBLISH" ? "READY_FOR_INGEST" : status,
    fields,
    issues,
    readyForIngest: status === "READY_FOR_INGEST" || status === "READY_FOR_PUBLISH",
    readyForPublish: false,
  };
}

function assessSiteSettings(s: NonNullable<OwnerPack["siteSettings"]>): EntityAssessment {
  const issues: Issue[] = [];
  const fields: FieldAssessment[] = [
    field("brandName", s.brandName, "optional"),
    field("publicPhone", s.publicPhone, "required_for_publish"),
    field("publicEmail", s.publicEmail, "optional"),
    field("telegram", s.messengerLinks?.telegram, "required_for_publish"),
    field("bookingContact", s.bookingContact, "optional"),
    field("authorName", s.authorName, "optional"),
    field(
      "legalEntity",
      s.legalEntity,
      "owner_confirmed",
      s.legalEntity ? "OWNER_CONFIRMATION_REQUIRED" : "MISSING",
      undefined,
      true
    ),
  ];

  if (!s.publicPhone && !s.messengerLinks?.telegram && !s.publicEmail) {
    issues.push(
      issue("BLOCKER", "CONTACT_MISSING", "site_settings", "Нет публичного контакта (телефон / Telegram / email)", {
        entityId: s.ownerContentId,
      })
    );
  }
  if (!s.messengerLinks?.telegram) {
    issues.push(issue("WARNING", "TELEGRAM_MISSING", "site_settings", "Telegram не указан", { entityId: s.ownerContentId }));
  }

  const status = entityStatusFromFields(fields, issues, true);
  return {
    entity: "site_settings",
    ownerContentId: s.ownerContentId,
    status: status === "READY_FOR_PUBLISH" ? "READY_FOR_INGEST" : status,
    fields,
    issues,
    readyForIngest: Boolean(s.publicPhone || s.messengerLinks?.telegram || s.publicEmail),
    readyForPublish: false,
  };
}

function assessMedia(pack: OwnerPack, m: OwnerPack["media"][number]): EntityAssessment {
  const issues: Issue[] = [];
  const rightsOk =
    m.publicationRights === "OWNER_CONFIRMED" ||
    m.publicationRights === "CLIENT_PROVIDED";
  const fields: FieldAssessment[] = [
    field("file", m.file || m.originalFilename, "required_for_ingest"),
    field(
      "publicationRights",
      m.publicationRights,
      "required_for_publish",
      rightsOk ? "PRESENT" : m.publicationRights === "UNKNOWN" ? "UNVERIFIED" : "OWNER_CONFIRMATION_REQUIRED"
    ),
    field("alt", m.alt, "optional"),
    field("author", m.author, "optional"),
    field("checksum", m.checksumSha256, "optional"),
  ];

  if (!m.file && !m.originalFilename) {
    issues.push(issue("BLOCKER", "FILE_MISSING", "media", "Нет файла", { entityId: m.ownerContentId }));
  }
  if (!rightsOk) {
    issues.push(
      issue("BLOCKER", "RIGHTS_BLOCKED", "media", "Права на публикацию не подтверждены", {
        entityId: m.ownerContentId,
        field: "publicationRights",
      })
    );
  }
  if (m.width && m.height && m.role === "hero" && (m.width < 1200 || m.height < 800)) {
    issues.push(
      issue("WARNING", "LOW_RES_HERO", "media", "Низкое разрешение для hero", {
        entityId: m.ownerContentId,
      })
    );
  }

  const status = entityStatusFromFields(fields, issues, true);
  return {
    entity: "media",
    ownerContentId: m.ownerContentId,
    status: status === "READY_FOR_PUBLISH" ? "READY_FOR_INGEST" : status,
    fields,
    issues,
    readyForIngest: Boolean(m.file || m.originalFilename) && rightsOk,
    readyForPublish: false,
  };
}

function assessPricing(p: NonNullable<OwnerPack["pricingAndBooking"]>): EntityAssessment {
  const issues: Issue[] = [];
  const fields: FieldAssessment[] = [
    field("howBookingWorks", p.howBookingWorks, "required_for_ingest"),
    field(
      "cancellation",
      p.cancellation,
      "required_for_publish",
      p.cancellation ? "PRESENT" : "MISSING",
      p.cancellation ? "LEGAL_CONFIRMATION_REQUIRED before publish" : undefined,
      true
    ),
    field(
      "refund",
      p.refund,
      "required_for_publish",
      p.refund ? "PRESENT" : "MISSING",
      p.refund ? "LEGAL_CONFIRMATION_REQUIRED before publish" : undefined,
      true
    ),
    field("paymentMethods", p.paymentMethods, "optional"),
    field("maximumGroup", p.maximumGroup, "required_for_publish"),
    field("meetingPoint", p.meetingPoint, "required_for_publish"),
    field("contactMethod", p.contactMethod, "required_for_publish"),
    field(
      "ownerConfirmed",
      p.ownerConfirmed,
      "required_for_publish",
      p.ownerConfirmed === true ? "PRESENT" : "OWNER_CONFIRMATION_REQUIRED",
      undefined,
      true
    ),
  ];

  if (!p.howBookingWorks) {
    issues.push(issue("BLOCKER", "BOOKING_MISSING", "pricing_booking", "Не описано, как бронировать", { entityId: p.ownerContentId }));
  }
  if (!p.cancellation) {
    issues.push(issue("BLOCKER", "CANCEL_MISSING", "pricing_booking", "Нет условий отмены", { entityId: p.ownerContentId, field: "cancellation" }));
  }
  if (p.ownerConfirmed !== true) {
    issues.push(
      issue("BLOCKER", "LEGAL_CONFIRMATION_REQUIRED", "pricing_booking", "Юридически значимые правила не подтверждены владельцем", {
        entityId: p.ownerContentId,
      })
    );
  }

  const status = entityStatusFromFields(fields, issues, true);
  const readyForIngest =
    Boolean(p.howBookingWorks) &&
    Boolean(p.cancellation) &&
    p.ownerConfirmed === true &&
    !issues.some((i) => i.severity === "BLOCKER");
  return {
    entity: "pricing_booking",
    ownerContentId: p.ownerContentId,
    status: readyForIngest
      ? "READY_FOR_INGEST"
      : status === "READY_FOR_PUBLISH"
        ? "READY_FOR_INGEST"
        : status,
    fields,
    issues,
    readyForIngest,
    readyForPublish: false,
  };
}

function notReceived(entity: string): EntityAssessment {
  return {
    entity,
    status: "NOT_RECEIVED",
    fields: [],
    issues: [
      issue("INFO", "NOT_RECEIVED", entity, "Материалы владельца ещё не получены"),
    ],
    readyForIngest: false,
    readyForPublish: false,
  };
}

export function buildClarificationQuestions(result: PackValidationResult): string[] {
  const q: string[] = [];
  for (const e of result.entities) {
    for (const i of e.issues) {
      if (i.severity !== "BLOCKER" && i.code !== "MARKETING_CLAIM") continue;
      if (i.code === "PRICE_AMBIGUOUS") {
        q.push("Цена указана за группу или за человека?");
      } else if (i.code === "GROUP_SIZE_MISSING") {
        q.push("Максимальное количество гостей?");
      } else if (i.code === "MEETING_POINT_MISSING") {
        q.push("Точная точка встречи?");
      } else if (i.code === "NO_PERMISSION" && e.entity === "review") {
        q.push(`Можно ли публиковать отзыв${e.ownerContentId ? ` (${e.ownerContentId})` : ""}?`);
      } else if (i.code === "RIGHTS_BLOCKED") {
        q.push(`Есть ли разрешение на публикацию фото ${e.ownerContentId ?? ""}?`.trim());
      } else if (i.code === "NEEDS_GEOCODING") {
        q.push(`Подтвердите координаты точки: ${i.field ?? i.message}`);
      } else if (i.code === "SOURCE_UNVERIFIED") {
        q.push("Откуда этот отзыв и можно ли его публиковать?");
      }
    }
  }
  return [...new Set(q)];
}

export function validateOwnerPack(raw: unknown): PackValidationResult {
  const pack = normalizeOwnerPack(raw);
  const entities: EntityAssessment[] = [];

  if (pack.isTestFixture !== true && pack.status === "NOT_RECEIVED" && !pack.packVersion) {
    // empty awaiting pack
  }

  if (pack.excursions.length === 0) entities.push(notReceived("excursion"));
  else for (const e of pack.excursions) entities.push(assessExcursion(pack, e));

  if (pack.routes.length === 0) entities.push(notReceived("route"));
  else for (const r of pack.routes) entities.push(assessRoute(r));

  if (pack.reviews.length === 0) entities.push(notReceived("review"));
  else for (const r of pack.reviews) entities.push(assessReview(r));

  if (!pack.guide) entities.push(notReceived("guide"));
  else entities.push(assessGuide(pack.guide));

  if (!pack.siteSettings) entities.push(notReceived("site_settings"));
  else entities.push(assessSiteSettings(pack.siteSettings));

  if (pack.media.length === 0) entities.push(notReceived("media"));
  else for (const m of pack.media) entities.push(assessMedia(pack, m));

  if (!pack.pricingAndBooking) entities.push(notReceived("pricing_booking"));
  else entities.push(assessPricing(pack.pricingAndBooking));

  const dupFiles = detectDuplicateFilenames(pack.media);
  const dupChecksums = detectDuplicateChecksums(pack.media);
  const packIssues: Issue[] = [];
  for (const d of dupFiles) {
    packIssues.push(issue("BLOCKER", "DUPLICATE_MEDIA_FILENAME", "media", `Дубликат имени файла: ${d}`));
  }
  for (const d of dupChecksums) {
    packIssues.push(issue("BLOCKER", "DUPLICATE_MEDIA_CHECKSUM", "media", `Дубликат checksum: ${d}`));
  }

  const ownerIds = [
    ...pack.excursions.map((e) => e.ownerContentId),
    ...pack.routes.map((r) => r.ownerContentId),
    ...pack.reviews.map((r) => r.ownerContentId),
    ...pack.media.map((m) => m.ownerContentId),
    pack.guide?.ownerContentId,
  ].filter(Boolean) as string[];
  const idSeen = new Set<string>();
  for (const id of ownerIds) {
    if (idSeen.has(id)) {
      packIssues.push(issue("BLOCKER", "DUPLICATE_ENTITY", "pack", `Дубликат ownerContentId: ${id}`));
    }
    idSeen.add(id);
  }

  const allIssues = [...packIssues, ...entities.flatMap((e) => e.issues)];
  const blockers = allIssues.filter((i) => i.severity === "BLOCKER" || i.severity === "ERROR");
  const warnings = allIssues.filter((i) => i.severity === "WARNING");

  const received = Boolean(pack.packVersion || pack.receivedAt || pack.excursions.length || pack.routes.length);

  const by = (name: string) => entities.filter((e) => e.entity === name);
  const statusOf = (name: string): EntityStatus => {
    const list = by(name);
    if (!list.length || list.every((e) => e.status === "NOT_RECEIVED")) return "NOT_RECEIVED";
    if (list.some((e) => e.readyForIngest)) {
      if (list.every((e) => e.readyForIngest)) return "READY_FOR_INGEST";
    }
    if (list.some((e) => e.status === "NEEDS_CLARIFICATION")) return "NEEDS_CLARIFICATION";
    if (list.some((e) => e.status === "INCOMPLETE")) return "INCOMPLETE";
    return list[0]?.status ?? "NOT_RECEIVED";
  };

  const photoEntities = by("media");
  const photosReady =
    photoEntities.filter((e) => e.readyForIngest).length >= 3 &&
    photoEntities.every((e) => e.status !== "NOT_RECEIVED");

  const minimumLaunch: MinimumLaunchPackStatus = {
    flagshipExcursion: statusOf("excursion"),
    route: statusOf("route"),
    guide: statusOf("guide"),
    review: statusOf("review"),
    photos: photosReady
      ? "READY_FOR_INGEST"
      : photoEntities.some((e) => e.status === "NOT_RECEIVED")
        ? "NOT_RECEIVED"
        : "INCOMPLETE",
    siteSettings: statusOf("site_settings"),
    pricingBooking: statusOf("pricing_booking"),
    result: "OWNER_CONTENT_STILL_BLOCKED",
  };

  // Structural minimum: each required entity type has an ingest-ready candidate.
  const structuralMinReady =
    by("excursion").some((e) => e.readyForIngest) &&
    by("route").some((e) => e.readyForIngest) &&
    by("guide").some((e) => e.readyForIngest) &&
    by("review").some((e) => e.readyForIngest) &&
    photosReady &&
    by("site_settings").some((e) => e.readyForIngest) &&
    by("pricing_booking").some((e) => e.readyForIngest);

  const allMinReady = structuralMinReady && blockers.length === 0;

  if (allMinReady) {
    minimumLaunch.result = "MINIMUM_LAUNCH_PACK_READY";
  }

  // CONTENT.0: never claim publish; real ingest only if min pack ready and not a test fixture
  const readyForIngest = allMinReady && !pack.isTestFixture;
  const readyForPublish = false;

  const packStatus: EntityStatus = !received
    ? "NOT_RECEIVED"
    : blockers.length
      ? "NEEDS_CLARIFICATION"
      : readyForIngest
        ? "READY_FOR_INGEST"
        : "INCOMPLETE";

  const result: PackValidationResult = {
    packVersion: pack.packVersion,
    packStatus,
    received,
    isTestFixture: pack.isTestFixture,
    entities,
    issues: allIssues,
    blockers,
    warnings,
    readyForIngest,
    readyForPublish,
    minimumLaunch,
    clarificationQuestions: [],
  };
  result.clarificationQuestions = buildClarificationQuestions(result);
  return result;
}

/** Exit code helper: 0 for empty/awaiting or valid; 1 only for blocking invalid received pack. */
export function validationExitCode(result: PackValidationResult): number {
  if (!result.received) return 0;
  if (result.isTestFixture) return result.blockers.length ? 1 : 0;
  if (result.blockers.length) return 1;
  return 0;
}
