/**
 * Gate C readiness audit — read-only CMS inventory.
 * Does not publish or invent content.
 *
 * Run: npm run check:gate-c
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nextEnv from "@next/env";

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

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          reason: "DATABASE_URL missing — cannot audit CMS",
          gateC: "BLOCKED",
        },
        null,
        2
      )
    );
    process.exitCode = 1;
    return;
  }

  const { getPayload } = await import("payload");
  const config = (await import("../payload.config.ts")).default;
  const payload = await getPayload({ config });

  const [routes, excursions, products, ar, photos, reviews] = await Promise.all([
    payload.find({
      collection: "routes",
      where: { status: { equals: "published" } },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: "excursions",
      where: { status: { equals: "published" } },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: "products",
      where: { status: { equals: "published" } },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: "ar-postcards",
      where: { status: { equals: "published" } },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: "photos",
      where: {
        and: [
          { status: { equals: "published" } },
          { moderationStatus: { equals: "approved" } },
        ],
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: "reviews",
      limit: 100,
      depth: 0,
      overrideAccess: true,
    }),
  ]);

  const demoTitle = (t) =>
    typeof t === "string" && /демо|demo|seed|placeholder|имя гида/i.test(t);

  const demoProducts = products.docs.filter((d) => demoTitle(d.title));
  const demoAr = ar.docs.filter((d) => demoTitle(d.title));
  const demoRoutes = routes.docs.filter((d) => demoTitle(d.title));
  const demoExcursions = excursions.docs.filter((d) => demoTitle(d.title));

  const auto = excursions.docs.filter((e) => e.format === "auto");
  const walking = excursions.docs.filter((e) => e.format === "walking");

  const ready =
    routes.docs.length >= 2 &&
    excursions.docs.length >= 2 &&
    auto.length >= 1 &&
    walking.length >= 1 &&
    demoProducts.length === 0 &&
    demoAr.length === 0 &&
    demoRoutes.length === 0 &&
    demoExcursions.length === 0;

  const report = {
    gateC: ready ? "READY_TO_CLOSE" : "CONTENT_BLOCKED",
    published: {
      routes: routes.docs.map((d) => ({ slug: d.slug, title: d.title })),
      excursions: excursions.docs.map((d) => ({
        slug: d.slug,
        title: d.title,
        format: d.format,
        price: d.price,
      })),
      products: products.totalDocs,
      arPostcards: ar.totalDocs,
      photos: photos.totalDocs,
      reviews: reviews.totalDocs,
    },
    gaps: {
      needRoutes: Math.max(0, 2 - routes.docs.length),
      needExcursions: Math.max(0, 2 - excursions.docs.length),
      needAuto: Math.max(0, 1 - auto.length),
      needWalking: Math.max(0, 1 - walking.length),
      demoStillPublished: {
        products: demoProducts.map((d) => d.slug),
        ar: demoAr.map((d) => d.slug),
        routes: demoRoutes.map((d) => d.slug),
        excursions: demoExcursions.map((d) => d.slug),
      },
    },
    next: ready
      ? "Smoke /map and excursion pages, then Gate D deploy"
      : "Collect owner materials per docs/phase15-content-input-manifest.md",
  };

  console.log(JSON.stringify(report, null, 2));
  if (!ready) process.exitCode = 2;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
