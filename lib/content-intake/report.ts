/**
 * Human-readable validation / missing-field / client clarification reports.
 */

import type { PackValidationResult, EntityAssessment } from "./types";
import type { IngestPlan } from "./types";
import { formatIngestPlan } from "./plan";

function fieldLine(a: EntityAssessment): string {
  return a.fields
    .map((f) => {
      const extra =
        f.field.includes("photo") || f.field === "gallery"
          ? ""
          : "";
      void extra;
      return `${f.field}: ${f.status}${f.note ? ` (${f.note})` : ""}`;
    })
    .join("\n");
}

export function formatEntityReport(a: EntityAssessment): string {
  const title = a.entity.toUpperCase().replace(/_/g, " ");
  const id = a.ownerContentId ? ` (${a.ownerContentId})` : "";
  const lines = [
    title + id,
    "",
    fieldLine(a) || "(no fields — not received)",
    "",
    `RESULT: ${a.status}`,
    a.readyForIngest ? "READY FOR INGEST: YES" : "READY FOR INGEST: NO",
  ];

  const actions = a.issues
    .filter((i) => i.severity === "BLOCKER" || i.severity === "WARNING")
    .map((i) => `- ${i.message}`);
  if (actions.length) {
    lines.push("", "ACTION REQUIRED:");
    lines.push(...actions);
  }
  return lines.join("\n");
}

export function formatValidationReport(result: PackValidationResult): string {
  const lines: string[] = [
    "OWNER CONTENT INTAKE VALIDATION",
    `PACK: ${result.packVersion ?? "(not received)"}`,
    `STATUS: ${result.packStatus}`,
    `RECEIVED: ${result.received ? "YES" : "NO"}`,
    `TEST FIXTURE: ${result.isTestFixture ? "YES" : "NO"}`,
    `READY FOR INGEST: ${result.readyForIngest ? "YES" : "NO"}`,
    `READY FOR PUBLISH: ${result.readyForPublish ? "YES" : "NO"} (CONTENT.0 always NO)`,
    "",
    "MINIMUM LAUNCH PACK",
    `Flagship excursion: ${result.minimumLaunch.flagshipExcursion}`,
    `Route: ${result.minimumLaunch.route}`,
    `Guide: ${result.minimumLaunch.guide}`,
    `Review: ${result.minimumLaunch.review}`,
    `Photos: ${result.minimumLaunch.photos}`,
    `Site settings: ${result.minimumLaunch.siteSettings}`,
    `Pricing/booking: ${result.minimumLaunch.pricingBooking}`,
    "",
    `RESULT: ${result.minimumLaunch.result}`,
    "",
  ];

  for (const e of result.entities) {
    lines.push("─".repeat(40));
    lines.push(formatEntityReport(e));
    lines.push("");
  }

  if (result.blockers.length) {
    lines.push("BLOCKERS:");
    for (const b of result.blockers) {
      lines.push(`- [${b.code}] ${b.entity}: ${b.message}`);
    }
    lines.push("");
  }

  if (result.warnings.length) {
    lines.push("WARNINGS:");
    for (const w of result.warnings) {
      lines.push(`- [${w.code}] ${w.entity}: ${w.message}`);
    }
  }

  return lines.join("\n");
}

export function formatClientClarification(result: PackValidationResult): string {
  if (!result.received) {
    return [
      "Материалы для сайта пока не получены.",
      "",
      "Когда будут готовы тексты, фото, цены, отзывы и правила записи — пришлите пакет ответов по шаблону.",
      "После этого мы пришлём короткий список уточнений, если чего-то не хватает.",
    ].join("\n");
  }

  if (!result.clarificationQuestions.length) {
    return "Сейчас нет обязательных уточнений по полученному пакету (или пакет ещё в обработке).";
  }

  const lines = ["Нужно уточнить:"];
  result.clarificationQuestions.forEach((q, i) => {
    lines.push(`${i + 1}. ${q}`);
  });
  return lines.join("\n");
}

export function formatIntakeStatusMarkdown(result: PackValidationResult): string {
  const rows = [
    "| Entity | Received | Valid | Missing | Owner confirmation | Ready for ingest |",
    "| ------ | -------: | ----: | ------- | ------------------ | ---------------- |",
  ];

  const groups = [
    "excursion",
    "route",
    "guide",
    "review",
    "media",
    "site_settings",
    "pricing_booking",
  ];

  for (const g of groups) {
    const list = result.entities.filter((e) => e.entity === g);
    const received = list.some((e) => e.status !== "NOT_RECEIVED") ? "yes" : "no";
    const valid =
      received === "no"
        ? "—"
        : list.length &&
            list.every((e) => e.issues.filter((i) => i.severity === "BLOCKER").length === 0)
          ? "yes"
          : "no";
    const missing = list
      .flatMap((e) => e.fields.filter((f) => f.status === "MISSING").map((f) => f.field))
      .slice(0, 5)
      .join(", ") || (received === "no" ? "all" : "—");
    const confirm = list
      .flatMap((e) =>
        e.fields
          .filter(
            (f) =>
              f.status === "OWNER_CONFIRMATION_REQUIRED" ||
              f.status === "AMBIGUOUS" ||
              f.status === "UNVERIFIED"
          )
          .map((f) => f.field)
      )
      .slice(0, 5)
      .join(", ") || "—";
    const ready = list.some((e) => e.readyForIngest) ? "yes" : "no";
    rows.push(
      `| ${g} | ${received} | ${valid} | ${missing} | ${confirm} | ${ready} |`
    );
  }

  return [
    "# Owner content intake status",
    "",
    `Pack: \`${result.packVersion ?? "none"}\``,
    `Gate: CONTENT.0`,
    `Overall: **${result.minimumLaunch.result}**`,
    `Ready for ingest: **${result.readyForIngest ? "YES" : "NO"}**`,
    "",
    ...rows,
    "",
    "> Staging only. No production CMS mutation from this dashboard.",
  ].join("\n");
}

export function formatFullCliOutput(
  result: PackValidationResult,
  plan: IngestPlan
): string {
  return [formatValidationReport(result), "", formatIngestPlan(plan)].join("\n");
}
