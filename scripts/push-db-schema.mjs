/**
 * Pushes Payload/Drizzle schema to PostgreSQL (dev recovery).
 * Run after adding collections: npm run db:push
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nextEnv from "@next/env";
import { buildConfig, getPayload } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import pg from "pg";

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

function isLocalDisposableDatabase(databaseUrl) {
  const parsed = new URL(databaseUrl);
  const dbName = parsed.pathname.replace(/^\//, "");
  const localHost = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  const disposableName =
    dbName.startsWith("adminf_") || dbName.startsWith("polezno_editor_");
  return localHost && disposableName;
}

async function applyLocalAdminMigration(databaseUrl) {
  if (!isLocalDisposableDatabase(databaseUrl)) {
    throw new Error(
      "Refusing ADMIN.F local schema bridge: DATABASE_URL must target localhost and an adminf_ or polezno_editor_ database."
    );
  }

  const migrationPath = path.join(
    root,
    "scripts",
    "migrations",
    "admin-f-prod-to-target.sql"
  );
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(fs.readFileSync(migrationPath, "utf8"));
  } finally {
    await client.end();
  }
}

async function main() {
  loadEnvFile(".env");
  loadEnvFile(".env.local");

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is missing in .env.local");
    process.exit(1);
  }
  if (!process.env.PAYLOAD_SECRET?.trim()) {
    console.error("PAYLOAD_SECRET is missing in .env.local");
    process.exit(1);
  }

  process.env.NODE_ENV = "development";

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
      push: true,
    }),
  });

  console.log("Pushing Payload schema to PostgreSQL...");
  await getPayload({ config });
  console.log("DB_SCHEMA_PUSH_OK");
  await applyLocalAdminMigration(process.env.DATABASE_URL);
  console.log("LOCAL_ADMIN_SCHEMA_BRIDGE_OK");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
