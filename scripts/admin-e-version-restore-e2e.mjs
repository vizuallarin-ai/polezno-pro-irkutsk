/**
 * ADMIN.E — version restore E2E on local disposable DB.
 * Run: node --import tsx scripts/admin-e-version-restore-e2e.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nextEnv from "@next/env";
import { buildConfig, getPayload } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
nextEnv.loadEnvConfig(root);

function loadEnvFile(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) return;
  const text = fs.readFileSync(full, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const u = new URL(process.env.DATABASE_URL || "");
if (!["127.0.0.1", "localhost", "::1"].includes(u.hostname)) {
  console.error("STOP: non-local DATABASE_URL");
  process.exit(2);
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const { Users } = await import("../payload/collections/Users.ts");
const { Media } = await import("../payload/collections/Media.ts");
const { Routes } = await import("../payload/collections/Routes.ts");
const { Places } = await import("../payload/collections/Places.ts");
const { Articles } = await import("../payload/collections/Articles.ts");
const { Events } = await import("../payload/collections/Events.ts");
const { Products } = await import("../payload/collections/Products.ts");
const { Makers } = await import("../payload/collections/Makers.ts");
const { Photos } = await import("../payload/collections/Photos.ts");
const { Excursions } = await import("../payload/collections/Excursions.ts");
const { Reviews } = await import("../payload/collections/Reviews.ts");
const { Partners } = await import("../payload/collections/Partners.ts");
const { Leads } = await import("../payload/collections/Leads.ts");
const { Guides } = await import("../payload/collections/Guides.ts");
const { ArPostcards } = await import("../payload/collections/ArPostcards.ts");
const { SiteSettings } = await import("../payload/globals/SiteSettings.ts");
const { Navigation } = await import("../payload/globals/Navigation.ts");

const config = buildConfig({
  secret: process.env.PAYLOAD_SECRET,
  collections: [
    Users,
    Routes,
    Leads,
    Articles,
    Photos,
    Events,
    Media,
    Places,
    Excursions,
    Makers,
    ArPostcards,
    Products,
    Guides,
    Reviews,
    Partners,
  ],
  globals: [SiteSettings, Navigation],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    push: false,
  }),
});

const payload = await getPayload({ config });
const evidenceDir = path.join(root, "docs/admin/evidence");
fs.mkdirSync(evidenceDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const titleA = `ADMIN.E restore A ${stamp}`;
const titleB = `ADMIN.E restore B ${stamp}`;

const created = await payload.create({
  collection: "excursions",
  overrideAccess: true,
  data: {
    title: titleA,
    slug: `admin-e-restore-${Date.now()}`,
    status: "draft",
    shortDescription: "version-one",
    duration: "2 часа",
    priceOnRequest: true,
    format: "walking",
  },
});

await payload.update({
  collection: "excursions",
  id: created.id,
  overrideAccess: true,
  data: {
    title: titleB,
    shortDescription: "version-two-bad",
  },
});

const versions = await payload.findVersions({
  collection: "excursions",
  where: { parent: { equals: created.id } },
  limit: 10,
  sort: "-updatedAt",
  overrideAccess: true,
});

assert(versions.docs.length >= 1, "expected at least one version row");

const older =
  versions.docs.find((v) => v.version?.title === titleA) ||
  versions.docs[versions.docs.length - 1];

assert(older?.id, "older version id missing");

await payload.restoreVersion({
  collection: "excursions",
  id: older.id,
  overrideAccess: true,
});

const restored = await payload.findByID({
  collection: "excursions",
  id: created.id,
  overrideAccess: true,
});

assert(
  restored.title === titleA || restored.shortDescription === "version-one",
  `restore did not bring back prior content (title=${restored.title})`
);

const review = await payload.create({
  collection: "reviews",
  overrideAccess: true,
  data: {
    author: `ADMIN.E ${stamp}`,
    text: "first-version-text",
    rating: 5,
    status: "draft",
  },
});

await payload.update({
  collection: "reviews",
  id: review.id,
  overrideAccess: true,
  data: { text: "corrupted-text" },
});

const reviewVersions = await payload.findVersions({
  collection: "reviews",
  where: { parent: { equals: review.id } },
  limit: 10,
  sort: "-updatedAt",
  overrideAccess: true,
});
assert(reviewVersions.docs.length >= 1, "review versions missing");
const reviewOlder =
  reviewVersions.docs.find((v) => v.version?.text === "first-version-text") ||
  reviewVersions.docs[reviewVersions.docs.length - 1];
await payload.restoreVersion({
  collection: "reviews",
  id: reviewOlder.id,
  overrideAccess: true,
});
const reviewRestored = await payload.findByID({
  collection: "reviews",
  id: review.id,
  overrideAccess: true,
});
assert(
  reviewRestored.text === "first-version-text",
  `review restore failed: ${reviewRestored.text}`
);

await payload.delete({
  collection: "excursions",
  id: created.id,
  overrideAccess: true,
  context: { bypassDeleteGuards: true },
});
await payload.delete({
  collection: "reviews",
  id: review.id,
  overrideAccess: true,
  context: { bypassDeleteGuards: true },
});

const evidence = {
  at: new Date().toISOString(),
  gate: "ADMIN.E",
  status: "VERSION_RESTORE_PROVEN",
  excursionId: created.id,
  reviewId: review.id,
  excursionVersions: versions.totalDocs,
  reviewVersions: reviewVersions.totalDocs,
  restoredExcursionTitle: restored.title,
  restoredReviewText: reviewRestored.text,
};

fs.writeFileSync(
  path.join(evidenceDir, "ADMIN_E_VERSION_RESTORE.md"),
  `# ADMIN.E — Version restore evidence\n\n\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\`\n`
);
console.log("VERSION_RESTORE_PROVEN", evidence);
process.exit(0);
