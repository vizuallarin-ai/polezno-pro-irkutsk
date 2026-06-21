import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nextEnv from "@next/env";
import { buildConfig, getPayload } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";

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

async function main() {
  loadEnvFile(".env");
  loadEnvFile(".env.local");

  const email =
    process.env.ADMIN_SEED_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "";

  const password =
    process.env.ADMIN_SEED_PASSWORD || process.env.ADMIN_PASSWORD || "";

  if (!email.trim()) {
    console.error("ADMIN_SEED_EMAIL is missing in .env.local");
    process.exit(1);
  }
  if (!password.trim()) {
    console.error("ADMIN_SEED_PASSWORD is missing in .env.local");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is missing in .env.local");
    process.exit(1);
  }
  if (!process.env.PAYLOAD_SECRET?.trim()) {
    console.error("PAYLOAD_SECRET is missing in .env.local");
    process.exit(1);
  }

  const { Users } = await import("../payload/collections/Users.ts");

  const config = buildConfig({
    secret: process.env.PAYLOAD_SECRET,
    collections: [Users],
    db: postgresAdapter({
      pool: { connectionString: process.env.DATABASE_URL },
      push: false,
    }),
  });

  const payload = await getPayload({ config });

  const existingByEmail = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });

  if (existingByEmail.docs.length === 0) {
    console.error("USER_NOT_FOUND email=" + email);
    process.exit(1);
  }

  const user = existingByEmail.docs[0];

  await payload.update({
    collection: "users",
    id: user.id,
    data: {
      password,
      role: "admin",
    },
    overrideAccess: true,
  });

  console.log("PASSWORD_RESET");
  console.log("email=" + email);
  console.log("id=" + user.id);
  console.log("password=" + password);
  const base =
    process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  console.log("login_url=" + base + "/admin");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});