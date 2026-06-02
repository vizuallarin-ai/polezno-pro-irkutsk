import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
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
    "admin@polezno-irkutsk.local";

  let password =
    process.env.ADMIN_SEED_PASSWORD || process.env.ADMIN_PASSWORD || "";

  const generated = !password;
  if (generated) {
    password = crypto.randomBytes(18).toString("base64url");
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
    }),
  });

  const payload = await getPayload({ config });

  const existingByEmail = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });

  if (existingByEmail.docs.length > 0) {
    const user = existingByEmail.docs[0];
    console.log("ADMIN_EXISTS");
    console.log("email=" + email);
    console.log("id=" + user.id);
    console.log("role=" + user.role);
    return;
  }

  const allUsers = await payload.find({
    collection: "users",
    limit: 1,
    overrideAccess: true,
  });

  if (allUsers.totalDocs > 0) {
    console.error("Other users exist; email not found: " + email);
    process.exit(1);
  }

  const user = await payload.create({
    collection: "users",
    data: {
      email,
      password,
      role: "admin",
      name: "Administrator",
    },
    overrideAccess: true,
  });

  console.log("ADMIN_CREATED");
  console.log("email=" + email);
  console.log("id=" + user.id);
  if (generated) {
    console.log("password=" + password);
  }
  const base =
    process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  console.log("login_url=" + base + "/admin");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});