/**
 * ADMIN.E — Local API role E2E on disposable local DB.
 * Creates temporary users, verifies access denials, then deletes fixtures.
 * Never touches production.
 *
 * Run: npx tsx scripts/admin-e-role-e2e.mjs
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

const stamp = Date.now();
const password = `AdminE-${stamp}-Xx9!`;
const fixtures = {
  owner: `admin-e-owner-${stamp}@example.local`,
  editor: `admin-e-editor-${stamp}@example.local`,
  developer: `admin-e-developer-${stamp}@example.local`,
};

const evidence = {
  at: new Date().toISOString(),
  gate: "ADMIN.E",
  status: "ROLE_E2E_PENDING",
  checks: [],
};

function note(name, ok, detail = "") {
  evidence.checks.push({ name, ok, detail });
  console.log(ok ? `PASS ${name}` : `FAIL ${name}`, detail || "");
  assert(ok, `${name}: ${detail}`);
}

const payload = await getPayload({ config });
const createdIds = [];

try {
  for (const [key, email] of Object.entries(fixtures)) {
    const role =
      key === "owner" ? "admin" : key === "editor" ? "editor" : "developer";
    const user = await payload.create({
      collection: "users",
      overrideAccess: true,
      context: { bypassDeleteGuards: true },
      data: { email, password, role, name: `ADMIN.E ${key}` },
    });
    createdIds.push(user.id);
  }

  const [owner, editor, developer] = await Promise.all(
    Object.values(fixtures).map((email) =>
      payload.login({
        collection: "users",
        data: { email, password },
      })
    )
  );

  note("owner login", Boolean(owner.user?.id));
  note("editor login", Boolean(editor.user?.id));
  note("developer login", Boolean(developer.user?.id));

  let editorLeadsDenied = false;
  const editorLeads = await payload
    .find({
      collection: "leads",
      limit: 1,
      user: editor.user,
      overrideAccess: false,
    })
    .catch(() => null);
  if (editorLeads === null) editorLeadsDenied = true;
  else if (editorLeads.docs.length === 0 && editorLeads.totalDocs === 0) {
    editorLeadsDenied = true;
  }
  note(
    "editor cannot read leads",
    editorLeadsDenied,
    `total=${editorLeads?.totalDocs}`
  );

  const ownerLeads = await payload.find({
    collection: "leads",
    limit: 1,
    user: owner.user,
    overrideAccess: false,
  });
  note("owner can read leads", ownerLeads != null);

  let editorUserCreateDenied = false;
  try {
    await payload.create({
      collection: "users",
      user: editor.user,
      overrideAccess: false,
      data: {
        email: `admin-e-escalation-${stamp}@example.local`,
        password,
        role: "developer",
      },
    });
  } catch {
    editorUserCreateDenied = true;
  }
  note("editor cannot create users", editorUserCreateDenied);

  let editorSelfEscalateDenied = false;
  try {
    await payload.update({
      collection: "users",
      id: editor.user.id,
      user: editor.user,
      overrideAccess: false,
      data: { role: "developer" },
    });
  } catch {
    editorSelfEscalateDenied = true;
  }
  const editorAfter = await payload.findByID({
    collection: "users",
    id: editor.user.id,
    overrideAccess: true,
  });
  note(
    "editor cannot escalate to developer",
    editorSelfEscalateDenied && editorAfter.role === "editor",
    `role=${editorAfter.role}`
  );

  let ownerAssignDevDenied = false;
  try {
    await payload.create({
      collection: "users",
      user: owner.user,
      overrideAccess: false,
      data: {
        email: `admin-e-owner-dev-${stamp}@example.local`,
        password,
        role: "developer",
      },
    });
  } catch (err) {
    ownerAssignDevDenied = String(err?.message || err).includes("Разработчик");
  }
  note("owner cannot assign developer role", ownerAssignDevDenied);

  const draft = await payload.create({
    collection: "excursions",
    user: editor.user,
    overrideAccess: false,
    data: {
      title: `ADMIN.E editor draft ${stamp}`,
      slug: `admin-e-editor-${stamp}`,
      status: "draft",
      shortDescription: "editor-ok",
      duration: "1 час",
      priceOnRequest: true,
      format: "walking",
    },
  });
  note("editor can create content", Boolean(draft?.id));
  await payload.delete({
    collection: "excursions",
    id: draft.id,
    overrideAccess: true,
    context: { bypassDeleteGuards: true },
  });

  let placesDenied = false;
  try {
    const places = await payload.find({
      collection: "places",
      limit: 1,
      user: editor.user,
      overrideAccess: false,
    });
    placesDenied = places.docs.length === 0;
  } catch {
    placesDenied = true;
  }
  note("editor cannot read system places", placesDenied);

  const placesDev = await payload.find({
    collection: "places",
    limit: 1,
    user: developer.user,
    overrideAccess: false,
  });
  note("developer can read system places", placesDev != null);

  evidence.status = "ROLE_E2E_PROVEN";
} finally {
  for (const id of createdIds) {
    try {
      await payload.delete({
        collection: "users",
        id,
        overrideAccess: true,
        context: { bypassDeleteGuards: true },
      });
    } catch (err) {
      console.warn("cleanup user failed", id, err?.message || err);
    }
  }
}

const out = path.join(root, "docs/admin/evidence/ADMIN_E_ROLE_E2E.md");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
  out,
  `# ADMIN.E — Role E2E evidence\n\n\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\`\n`
);
console.log(evidence.status);
process.exit(evidence.status === "ROLE_E2E_PROVEN" ? 0 : 1);
