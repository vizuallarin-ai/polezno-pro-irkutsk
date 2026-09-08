#!/usr/bin/env npx tsx
/**
 * CONTENT.0 — dry-run ingest plan (never writes DB).
 * Usage: npm run content:intake:plan [-- --target local|staging|production]
 */

import {
  loadOwnerPackFromFile,
  buildIngestPlan,
  formatIngestPlan,
  DEFAULT_PACK_PATH,
} from "../lib/content-intake";
import type { IngestTarget } from "../lib/content-intake";

const args = process.argv.slice(2);
let packPath = DEFAULT_PACK_PATH;
let target: IngestTarget = "local";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--target" && args[i + 1]) {
    target = args[++i] as IngestTarget;
  } else if (args[i] === "--execute" || args[i] === "--confirm-pack") {
    console.error("CONTENT.0 refuses execute flags. No DB writes.");
    process.exit(2);
  } else if (!args[i].startsWith("--")) {
    packPath = args[i];
  }
}

const pack = loadOwnerPackFromFile(packPath);
const plan = buildIngestPlan(pack, { target });
console.log(formatIngestPlan(plan));
process.exit(plan.readyForIngest ? 0 : 0);
