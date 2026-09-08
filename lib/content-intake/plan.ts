/**
 * Dry-run ingest plan — never writes DB.
 * Default target safety: production write always false in CONTENT.0.
 */

import { normalizeOwnerPack } from "./normalize";
import { validateOwnerPack } from "./validate";
import type { IngestPlan, IngestTarget, PlanItem } from "./types";

function emptySummary() {
  return { create: 0, update: 0, blocked: 0, skip: 0, link: 0 };
}

function bump(
  summary: IngestPlan["summary"],
  key: string,
  action: PlanItem["action"]
) {
  if (!summary[key]) summary[key] = emptySummary();
  const s = summary[key];
  if (action === "WOULD_CREATE") s.create += 1;
  else if (action === "WOULD_UPDATE" || action === "UPDATE_CANDIDATE") s.update += 1;
  else if (action === "BLOCKED") s.blocked += 1;
  else if (action === "WOULD_SKIP") s.skip += 1;
  else if (action === "WOULD_LINK") s.link += 1;
}

/**
 * Build idempotent dry-run plan.
 * cmsIdMapping / existingSlugs simulate known CMS records without DB access.
 */
export function buildIngestPlan(
  raw: unknown,
  options?: {
    target?: IngestTarget;
    existingSlugs?: Record<string, string[]>;
    /** When true, refuse even dry-run labeling as production-safe mutation path. */
    allowExecute?: boolean;
  }
): IngestPlan {
  const pack = normalizeOwnerPack(raw);
  const validation = validateOwnerPack(pack);
  const target = options?.target ?? "local";
  const existing = options?.existingSlugs ?? {};
  const items: PlanItem[] = [];
  const summary: IngestPlan["summary"] = {};

  if (options?.allowExecute) {
    items.push({
      collection: "safety",
      ownerContentId: "content.0",
      action: "BLOCKED",
      reason: "CONTENT.0 forbids execute mode — write path not enabled",
    });
    bump(summary, "safety", "BLOCKED");
    return {
      packVersion: pack.packVersion,
      target,
      productionWrite: false,
      items,
      summary,
      readyForIngest: false,
    };
  }

  if (!validation.received) {
    return {
      packVersion: pack.packVersion,
      target,
      productionWrite: false,
      items: [
        {
          collection: "pack",
          ownerContentId: "pack",
          action: "WOULD_SKIP",
          reason: "Owner pack not received",
        },
      ],
      summary: { pack: { ...emptySummary(), skip: 1 } },
      readyForIngest: false,
    };
  }

  const map = pack.cmsIdMapping ?? {};

  for (const e of pack.excursions) {
    const entity = validation.entities.find(
      (x) => x.ownerContentId === e.ownerContentId
    );
    const slug = e.slug;
    const mapped = map[e.ownerContentId];
    const slugHit =
      slug && (existing.excursions ?? []).includes(slug);
    let action: PlanItem["action"] = "WOULD_CREATE";
    let reason = "New excursion candidate";
    if (entity && !entity.readyForIngest && entity.issues.some((i) => i.severity === "BLOCKER")) {
      action = "BLOCKED";
      reason = "Blocking validation issues";
    } else if (mapped != null || slugHit) {
      action = "UPDATE_CANDIDATE";
      reason = mapped != null
        ? `Mapped CMS id ${mapped}`
        : `Existing slug match: ${slug}`;
    }
    items.push({
      collection: "excursions",
      ownerContentId: e.ownerContentId,
      action,
      reason,
      cmsMatchHint: mapped != null ? String(mapped) : slugHit ? slug : undefined,
    });
    bump(summary, "excursions", action);
  }

  for (const r of pack.routes) {
    const entity = validation.entities.find(
      (x) => x.ownerContentId === r.ownerContentId
    );
    const slug = r.slug;
    const mapped = map[r.ownerContentId];
    const slugHit = slug && (existing.routes ?? []).includes(slug);
    let action: PlanItem["action"] = "WOULD_CREATE";
    let reason = "New route candidate";
    if (entity?.issues.some((i) => i.severity === "BLOCKER")) {
      action = "BLOCKED";
      reason = "Blocking validation issues (often geocoding)";
    } else if (mapped != null || slugHit) {
      action = "UPDATE_CANDIDATE";
      reason = "Existing CMS match by mapping/slug";
    }
    items.push({
      collection: "routes",
      ownerContentId: r.ownerContentId,
      action,
      reason,
      cmsMatchHint: mapped != null ? String(mapped) : slug,
    });
    bump(summary, "routes", action);
  }

  for (const r of pack.reviews) {
    const entity = validation.entities.find(
      (x) => x.ownerContentId === r.ownerContentId
    );
    const mapped = map[r.ownerContentId];
    let action: PlanItem["action"] = "WOULD_CREATE";
    let reason = "New review candidate";
    if (entity?.issues.some((i) => i.severity === "BLOCKER")) {
      action = "BLOCKED";
      reason = "Source/permission/author blockers";
    } else if (mapped != null) {
      action = "UPDATE_CANDIDATE";
      reason = "Mapped existing review";
    }
    items.push({
      collection: "reviews",
      ownerContentId: r.ownerContentId,
      action,
      reason,
    });
    bump(summary, "reviews", action);
  }

  if (pack.guide) {
    const entity = validation.entities.find((x) => x.entity === "guide");
    const mapped = map[pack.guide.ownerContentId];
    const slugHit =
      pack.guide.slug && (existing.guides ?? []).includes(pack.guide.slug);
    let action: PlanItem["action"] = "WOULD_CREATE";
    let reason = "New guide candidate";
    if (entity?.issues.some((i) => i.severity === "BLOCKER")) {
      action = "BLOCKED";
      reason = "Guide blockers";
    } else if (mapped != null || slugHit) {
      action = "UPDATE_CANDIDATE";
      reason = "Existing guide match";
    }
    items.push({
      collection: "guides",
      ownerContentId: pack.guide.ownerContentId,
      action,
      reason,
    });
    bump(summary, "guides", action);
  }

  for (const m of pack.media) {
    const entity = validation.entities.find(
      (x) => x.ownerContentId === m.ownerContentId
    );
    const mapped = map[m.ownerContentId];
    let action: PlanItem["action"] = "WOULD_CREATE";
    let reason = "New media upload candidate";
    if (entity?.issues.some((i) => i.code === "RIGHTS_BLOCKED")) {
      action = "BLOCKED";
      reason = "BLOCKED RIGHTS";
    } else if (mapped != null || m.checksumSha256) {
      if (mapped != null) {
        action = "UPDATE_CANDIDATE";
        reason = "Mapped media id / checksum dedupe candidate";
      }
    }
    items.push({
      collection: "media",
      ownerContentId: m.ownerContentId,
      action,
      reason,
    });
    bump(summary, "media", action);
  }

  if (pack.siteSettings) {
    const mapped = map[pack.siteSettings.ownerContentId];
    items.push({
      collection: "site-settings",
      ownerContentId: pack.siteSettings.ownerContentId,
      action: mapped != null || true ? "UPDATE_CANDIDATE" : "WOULD_CREATE",
      reason: "Global site-settings is update-only (single global)",
    });
    bump(summary, "site-settings", "UPDATE_CANDIDATE");
  }

  // relation links
  for (const e of pack.excursions) {
    if (e.guideOwnerContentId) {
      items.push({
        collection: "excursions→guides",
        ownerContentId: e.ownerContentId,
        action: "WOULD_LINK",
        reason: `Link guide ${e.guideOwnerContentId}`,
      });
      bump(summary, "links", "WOULD_LINK");
    }
    if (e.routeOwnerContentId) {
      items.push({
        collection: "excursions→routes",
        ownerContentId: e.ownerContentId,
        action: "WOULD_LINK",
        reason: `Link route ${e.routeOwnerContentId}`,
      });
      bump(summary, "links", "WOULD_LINK");
    }
  }

  if (target === "production") {
    items.push({
      collection: "safety",
      ownerContentId: "target",
      action: "BLOCKED",
      reason: "Production target requires explicit CONTENT.1 authorization — plan only",
    });
    bump(summary, "safety", "BLOCKED");
  }

  return {
    packVersion: pack.packVersion,
    target,
    productionWrite: false,
    items,
    summary,
    readyForIngest: validation.readyForIngest && target !== "production",
  };
}

export function formatIngestPlan(plan: IngestPlan): string {
  const lines: string[] = [];
  lines.push(`PACK: ${plan.packVersion ?? "(none)"}`);
  lines.push(`TARGET: ${plan.target}`);
  lines.push(`PRODUCTION WRITE: ${plan.productionWrite ? "YES" : "NO"}`);
  lines.push(`READY FOR INGEST: ${plan.readyForIngest ? "YES" : "NO"}`);
  lines.push("");

  for (const [key, s] of Object.entries(plan.summary)) {
    lines.push(key.toUpperCase());
    lines.push(`CREATE: ${s.create}`);
    lines.push(`UPDATE: ${s.update}`);
    lines.push(`BLOCKED: ${s.blocked}`);
    lines.push(`SKIP: ${s.skip}`);
    lines.push(`LINK: ${s.link}`);
    lines.push("");
  }

  lines.push("ITEMS:");
  for (const item of plan.items) {
    lines.push(
      `- [${item.action}] ${item.collection} ${item.ownerContentId}: ${item.reason}`
    );
  }
  return lines.join("\n");
}
