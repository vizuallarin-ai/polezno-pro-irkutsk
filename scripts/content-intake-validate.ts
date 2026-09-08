#!/usr/bin/env npx tsx
/**
 * CONTENT.0 — validate owner pack (dry-run, no DB).
 * Usage: npm run content:intake:validate
 */

import {
  loadOwnerPackFromFile,
  validateOwnerPack,
  validationExitCode,
  formatValidationReport,
  formatClientClarification,
  DEFAULT_PACK_PATH,
} from "../lib/content-intake";

const packPath = process.argv[2] ?? DEFAULT_PACK_PATH;
const pack = loadOwnerPackFromFile(packPath);
const result = validateOwnerPack(pack);

console.log(formatValidationReport(result));
console.log("\n── Client clarification ──\n");
console.log(formatClientClarification(result));
console.log(`\npack file: ${packPath}`);

process.exit(validationExitCode(result));
