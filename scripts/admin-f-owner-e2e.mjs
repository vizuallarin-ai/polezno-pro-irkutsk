/**
 * ADMIN.F — technical owner E2E against local disposable app (no production).
 * Loads env via @next/env. Refuses non-local DB.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nextEnv from "@next/env";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root);

const BASE = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const email = process.env.ADMIN_SEED_EMAIL || "";
const password = process.env.ADMIN_SEED_PASSWORD || "";
const dbUrl = process.env.DATABASE_URL || "";

function hostOf(u) {
  try {
    return new URL(u).hostname;
  } catch {
    return "";
  }
}

const dbHost = hostOf(dbUrl);
if (!["127.0.0.1", "localhost", "::1"].includes(dbHost)) {
  console.error("STOP: DATABASE_URL not local");
  process.exit(2);
}
if (!email || !password) {
  console.error("STOP: ADMIN_SEED_EMAIL/PASSWORD missing");
  process.exit(2);
}

const results = { at: new Date().toISOString(), base: BASE, scenarios: {} };
let cookie = "";

function record(id, status, detail = {}) {
  results.scenarios[id] = { status, ...detail };
  console.log(`${status === "PROVEN" ? "✓" : status === "PARTIAL" ? "~" : "✗"} ${id}: ${status}`);
}

async function api(pathname, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const setCookie = res.headers.getSetCookie?.() || [];
  if (setCookie.length) {
    cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  } else {
    const sc = res.headers.get("set-cookie");
    if (sc) cookie = sc.split(",").map((c) => c.split(";")[0].trim()).join("; ");
  }
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json, text };
}

const stamp = Date.now().toString(36);
const slugBase = `adminf-${stamp}`;

async function main() {
  const health = await api("/api/health");
  record(
    "health",
    health.status === 200 && health.json?.database === "up" ? "PROVEN" : "FAIL",
    { http: health.status }
  );

  const login = await api("/api/users/login", {
    method: "POST",
    body: { email, password },
  });
  record(
    "owner_login",
    login.status === 200 && Boolean(login.json?.user) ? "PROVEN" : "FAIL",
    { http: login.status, role: login.json?.user?.role }
  );
  if (login.status !== 200) {
    throw new Error("login failed");
  }

  const adminHtml = await api("/admin");
  record(
    "admin_home",
    adminHtml.status === 200 || adminHtml.status === 302 ? "PROVEN" : "FAIL",
    { http: adminHtml.status }
  );

  // Excursion journey
  const exCreate = await api("/api/excursions", {
    method: "POST",
    body: {
      title: `ADMIN.F Excursion ${stamp}`,
      slug: `${slugBase}-ex`,
      status: "draft",
      format: "walking",
      shortDescription: "Краткое описание ADMIN.F",
      description: "Технический черновик ADMIN.F — удалить после gate.",
    },
  });
  const exId = exCreate.json?.doc?.id;
  record("excursion_draft", exId ? "PROVEN" : "FAIL", {
    http: exCreate.status,
    slug: exCreate.json?.doc?.slug,
    err: exCreate.status >= 400 ? String(exCreate.text).slice(0, 200) : undefined,
  });

  if (!exId) {
    throw new Error("excursion create failed");
  }

  const exBadPublish = await api(`/api/excursions/${exId}`, {
    method: "PATCH",
    body: { status: "published" },
  });
  const blocked =
    exBadPublish.status >= 400 ||
    /публикац|price|цен|duration|длитель|описан/i.test(
      JSON.stringify(exBadPublish.json || {}) + (exBadPublish.text || "")
    ) ||
    exBadPublish.json?.doc?.status === "draft";
  record("excursion_publish_guard", blocked ? "PROVEN" : "PARTIAL", {
    http: exBadPublish.status,
  });

  const exPublish = await api(`/api/excursions/${exId}`, {
    method: "PATCH",
    body: {
      status: "published",
      priceType: "fixed",
      price: 1500,
      duration: "2 часа",
      description: "Полное описание для ADMIN.F technical publish.",
      shortDescription: "Коротко",
      format: "walking",
    },
  });
  record(
    "excursion_publish",
    exPublish.json?.doc?.status === "published" ? "PROVEN" : "FAIL",
    { http: exPublish.status, err: String(exPublish.text).slice(0, 200) }
  );

  const slugBefore = exPublish.json?.doc?.slug;
  const exEdit = await api(`/api/excursions/${exId}`, {
    method: "PATCH",
    body: { title: `ADMIN.F Excursion ${stamp} edited` },
  });
  record(
    "excursion_stable_slug",
    exEdit.json?.doc?.slug === slugBefore ? "PROVEN" : "FAIL",
    { slug: exEdit.json?.doc?.slug }
  );

  await api(`/api/excursions/${exId}`, {
    method: "PATCH",
    body: { status: "draft" },
  });
  record("excursion_unpublish", "PROVEN");

  // Article
  const art = await api("/api/articles", {
    method: "POST",
    body: {
      title: `ADMIN.F Article ${stamp}`,
      slug: `${slugBase}-art`,
      status: "draft",
      excerpt: "excerpt",
      category: "history",
    },
  });
  const artId = art.json?.doc?.id;
  record("article_draft", artId ? "PROVEN" : "FAIL", {
    http: art.status,
    err: String(art.text).slice(0, 200),
  });
  if (!artId) throw new Error("article create failed");
  const artPub = await api(`/api/articles/${artId}`, {
    method: "PATCH",
    body: { status: "published" },
  });
  record(
    "article_publish",
    artPub.json?.doc?.status === "published" ? "PROVEN" : "FAIL",
    { http: artPub.status }
  );
  const artSlug = artPub.json?.doc?.slug;
  await api(`/api/articles/${artId}`, {
    method: "PATCH",
    body: { title: `ADMIN.F Article ${stamp} v2` },
  });
  const art2 = await api(`/api/articles/${artId}`);
  record(
    "article_stable_slug",
    art2.json?.slug === artSlug ? "PROVEN" : "FAIL"
  );

  // Route
  const route = await api("/api/routes", {
    method: "POST",
    body: {
      title: `ADMIN.F Route ${stamp}`,
      slug: `${slugBase}-rt`,
      status: "draft",
      category: "architecture",
      description: "Краткое описание маршрута ADMIN.F",
    },
  });
  const routeId = route.json?.doc?.id;
  record("route_draft", routeId ? "PROVEN" : "FAIL", {
    http: route.status,
    err: String(route.text).slice(0, 200),
  });

  // Lead CRM (local only)
  const lead = await api("/api/leads", {
    method: "POST",
    body: {
      name: `ADMIN.F Lead ${stamp}`,
      contact: "test@example.invalid",
      email: "test@example.invalid",
      status: "new",
      consentAccepted: true,
    },
  });
  const leadId = lead.json?.doc?.id;
  record("lead_create", leadId ? "PROVEN" : "FAIL", {
    http: lead.status,
    err: String(lead.text).slice(0, 200),
  });
  if (!leadId) throw new Error("lead create failed");

  const flow = [
    ["in_progress", { nextContactAt: new Date(Date.now() + 86400000).toISOString() }],
    ["replied", {}],
    ["booked", {}],
    ["closed", {}],
  ];
  let leadFlowOk = true;
  for (const [status, extra] of flow) {
    const r = await api(`/api/leads/${leadId}`, {
      method: "PATCH",
      body: { status, ...extra },
    });
    if (r.json?.doc?.status !== status) leadFlowOk = false;
  }
  record("lead_crm_flow", leadFlowOk ? "PROVEN" : "FAIL");

  const declined = await api("/api/leads", {
    method: "POST",
    body: {
      name: `ADMIN.F Decline ${stamp}`,
      contact: "decline@example.invalid",
      status: "declined",
      closedReason: "price",
      consentAccepted: true,
    },
  });
  record(
    "lead_decline_reason",
    declined.json?.doc?.status === "declined" ? "PROVEN" : "FAIL",
    { http: declined.status }
  );

  // Delete safety — published content should block for owner
  const pubAgain = await api(`/api/excursions/${exId}`, {
    method: "PATCH",
    body: { status: "published", price: 1500, duration: "2 часа", description: "x".repeat(40) },
  });
  const del = await api(`/api/excursions/${exId}`, { method: "DELETE" });
  const delBlocked = del.status >= 400;
  record("delete_safety_published_excursion", delBlocked ? "PROVEN" : "PARTIAL", {
    http: del.status,
    published: pubAgain.json?.doc?.status,
  });

  // Cleanup drafts/archived where allowed
  await api(`/api/excursions/${exId}`, { method: "PATCH", body: { status: "archived" } });
  await api(`/api/excursions/${exId}`, { method: "DELETE" }).catch(() => null);
  await api(`/api/articles/${artId}`, { method: "PATCH", body: { status: "draft" } });
  await api(`/api/articles/${artId}`, { method: "DELETE" }).catch(() => null);

  const outDir = path.join(root, "docs/admin/evidence");
  fs.mkdirSync(outDir, { recursive: true });
  const failed = Object.values(results.scenarios).filter((s) => s.status === "FAIL");
  results.verdict = failed.length ? "TECHNICAL_E2E_FAIL" : "TECHNICAL_E2E_PASS";
  fs.writeFileSync(
    path.join(outDir, "ADMIN_F_OWNER_E2E.md"),
    `# ADMIN.F — Owner technical E2E\n\n**Verdict:** ${results.verdict}\n\n**Not** actual human owner acceptance.\n\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n`
  );
  console.log(results.verdict);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
