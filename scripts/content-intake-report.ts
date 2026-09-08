#!/usr/bin/env npx tsx
/**
 * CONTENT.0 — human reports (status + missing + clarification).
 * Usage: npm run content:intake:report
 */

import fs from "node:fs";
import path from "node:path";
import {
  loadOwnerPackFromFile,
  validateOwnerPack,
  buildIngestPlan,
  formatValidationReport,
  formatClientClarification,
  formatIntakeStatusMarkdown,
  DEFAULT_PACK_PATH,
} from "../lib/content-intake";

const pack = loadOwnerPackFromFile(DEFAULT_PACK_PATH);
const result = validateOwnerPack(pack);
const plan = buildIngestPlan(pack);

const outDir = path.join(process.cwd(), "docs", "owner-content");
const statusMd = formatIntakeStatusMarkdown(result);
const missingMd = [
  "# Что нужно уточнить у владельца",
  "",
  "_Генерируется из validation — не правьте вручную в нескольких местах. Источник: `npm run content:intake:report`._",
  "",
  formatClientClarification(result),
  "",
  "## Технический summary",
  "",
  "```",
  formatValidationReport(result).split("\n").slice(0, 30).join("\n"),
  "```",
  "",
  `Ready for ingest: **${result.readyForIngest ? "YES" : "NO"}**`,
  `Minimum launch: **${result.minimumLaunch.result}**`,
].join("\n");

fs.writeFileSync(path.join(outDir, "intake-status.md"), statusMd + "\n", "utf8");
fs.writeFileSync(path.join(outDir, "OWNER_MISSING_FIELDS.md"), missingMd + "\n", "utf8");

console.log(statusMd);
console.log("\n── Clarification ──\n");
console.log(formatClientClarification(result));
console.log(`\nWrote docs/owner-content/intake-status.md`);
console.log(`Wrote docs/owner-content/OWNER_MISSING_FIELDS.md`);
console.log(`Plan readyForIngest=${plan.readyForIngest} productionWrite=${plan.productionWrite}`);
