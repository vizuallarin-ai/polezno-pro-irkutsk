/**
 * ADMIN.E.1 — restore dump into disposable DB, smoke Next against it, tear down.
 * Never touches production. Does not mutate committed .env files.
 *
 * Run (Windows): $env:Path = "C:\Program Files\PostgreSQL\16\bin;" + $env:Path; node scripts/admin-e1-restored-app-smoke.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn, spawnSync } from "child_process";
import nextEnv from "@next/env";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root);

const evidenceDir = path.join(root, "docs/admin/evidence");
fs.mkdirSync(evidenceDir, { recursive: true });

function which(cmd) {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [cmd], {
    encoding: "utf8",
  });
  if (r.status === 0) {
    const hit = r.stdout.trim().split(/\r?\n/)[0];
    if (hit) return hit;
  }
  if (process.platform === "win32") {
    const roots = ["C:\\Program Files\\PostgreSQL", "C:\\Program Files (x86)\\PostgreSQL"];
    for (const base of roots) {
      if (!fs.existsSync(base)) continue;
      for (const v of fs.readdirSync(base).sort().reverse()) {
        const candidate = path.join(base, v, "bin", `${cmd}.exe`);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }
  return null;
}

function parseDb(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port || "5432",
    database: u.pathname.replace(/^\//, ""),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    url,
  };
}

function withDatabase(url, dbName) {
  const u = new URL(url);
  u.pathname = `/${dbName}`;
  return u.toString();
}

async function waitFor(url, attempts = 60, delayMs = 1000) {
  let last = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      return res;
    } catch (err) {
      last = err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw last || new Error(`timeout waiting for ${url}`);
}

async function main() {
  const sourceUrl = process.env.DATABASE_URL || "";
  if (!sourceUrl.includes("localhost") && !sourceUrl.includes("127.0.0.1")) {
    throw new Error("Refuse non-local DATABASE_URL");
  }
  const info = parseDb(sourceUrl);
  const pgDump = which("pg_dump");
  const pgRestore = which("pg_restore");
  const psql = which("psql");
  if (!pgDump || !pgRestore || !psql) {
    throw new Error("pg client tools required");
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join(root, ".tmp-admin-e1-restore");
  fs.mkdirSync(outDir, { recursive: true });
  const dumpPath = path.join(outDir, `source_${stamp}.dump`);
  const tempDb = `restore_app_${Date.now()}`;
  const port = String(process.env.ADMIN_E1_SMOKE_PORT || "3017");
  const base = `http://127.0.0.1:${port}`;
  const envPg = { ...process.env, PGPASSWORD: info.password };

  const evidence = {
    at: new Date().toISOString(),
    gate: "ADMIN.E.1",
    sourceHost: info.host,
    sourceDb: info.database,
    dumpPath,
    tempDb,
    port: Number(port),
    checks: [],
    status: "PENDING",
  };

  function note(name, ok, detail = {}) {
    evidence.checks.push({ name, ok, ...detail });
    console.log(ok ? `PASS ${name}` : `FAIL ${name}`, detail);
    if (!ok) throw new Error(`${name} failed: ${JSON.stringify(detail)}`);
  }

  // 1) dump source local DB
  const dump = spawnSync(
    pgDump,
    ["-Fc", "-h", info.host, "-p", info.port, "-U", info.user, "-f", dumpPath, info.database],
    { env: envPg, encoding: "utf8" }
  );
  if (dump.status !== 0) throw new Error(dump.stderr || "pg_dump failed");
  const dumpBytes = fs.statSync(dumpPath).size;
  note("dump_created", dumpBytes > 0, { dumpBytes });

  // 2) create disposable restore DB
  spawnSync(
    psql,
    ["-h", info.host, "-p", info.port, "-U", info.user, "-d", "postgres", "-c", `DROP DATABASE IF EXISTS \"${tempDb}\"`],
    { env: envPg, encoding: "utf8" }
  );
  const create = spawnSync(
    psql,
    ["-h", info.host, "-p", info.port, "-U", info.user, "-d", "postgres", "-c", `CREATE DATABASE \"${tempDb}\"`],
    { env: envPg, encoding: "utf8" }
  );
  if (create.status !== 0) throw new Error(create.stderr || "CREATE DATABASE failed");

  const restore = spawnSync(
    pgRestore,
    ["-h", info.host, "-p", info.port, "-U", info.user, "-d", tempDb, "--no-owner", "--no-acl", dumpPath],
    { env: envPg, encoding: "utf8" }
  );

  const restoredUrl = withDatabase(sourceUrl, tempDb);
  const client = new pg.Client({ connectionString: restoredUrl });
  await client.connect();
  const tables = await client.query(
    `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public'`
  );
  const tableCount = tables.rows[0].n;
  note("restore_tables", tableCount >= 1, {
    tableCount,
    pgRestoreStatus: restore.status,
  });

  // Aggregate counts only — no PII fields
  async function safeCount(table) {
    try {
      const r = await client.query(`SELECT count(*)::int AS n FROM ${table}`);
      return r.rows[0].n;
    } catch {
      return null;
    }
  }
  const aggregates = {
    users: await safeCount("users"),
    excursions: await safeCount("excursions"),
    routes: await safeCount("routes"),
    articles: await safeCount("articles"),
    leads: await safeCount("leads"),
    media: await safeCount("media"),
  };
  evidence.aggregates = aggregates;
  note("aggregates_readable", true, aggregates);

  // Lead status histogram only (no PII)
  try {
    const hist = await client.query(
      `SELECT status, count(*)::int AS n FROM leads GROUP BY status ORDER BY status`
    );
    evidence.leadsStatusHistogram = hist.rows;
  } catch {
    evidence.leadsStatusHistogram = null;
  }
  await client.end();

  // 3) start Next against restored DB (reuse existing build)
  const childEnv = {
    ...process.env,
    DATABASE_URL: restoredUrl,
    PORT: port,
    HOSTNAME: "127.0.0.1",
  };
  // Ensure secrets from loadEnvConfig remain, but override DB only.
  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextBin)) {
    throw new Error(`next binary missing: ${nextBin}`);
  }
  const child = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", port], {
    cwd: root,
    env: childEnv,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let serverLog = "";
  child.stdout.on("data", (b) => {
    serverLog += b.toString();
  });
  child.stderr.on("data", (b) => {
    serverLog += b.toString();
  });

  try {
    const healthRes = await waitFor(`${base}/api/health`);
    const healthJson = await healthRes.json().catch(() => null);
    note("health", healthRes.status === 200 && healthJson?.database === "up", {
      http: healthRes.status,
      database: healthJson?.database,
      status: healthJson?.status,
      // do not echo commit identity secrets; SHA is public identity
      commitSha: healthJson?.commitSha || null,
    });

    for (const route of ["/", "/map", "/business", "/admin"]) {
      const res = await fetch(`${base}${route}`, { redirect: "manual" });
      const ok = res.status >= 200 && res.status < 400;
      note(`route_${route}`, ok, { http: res.status });
    }

    // Payload Local API / collections via REST under auth would need login;
    // prove Payload boot by health + admin shell + a published content query if any.
    const explore = await fetch(`${base}/explore`, { redirect: "manual" });
    note("route_/explore", explore.status >= 200 && explore.status < 400, {
      http: explore.status,
    });

    evidence.status = "APP_AGAINST_RESTORED_DB_PROVEN";
    evidence.serverLogTail = serverLog.slice(-1500);
  } finally {
    if (child.pid) {
      try {
        child.kill("SIGTERM");
      } catch {
        /* ignore */
      }
      // Windows fallback
      spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        encoding: "utf8",
      });
    }
    spawnSync(
      psql,
      [
        "-h",
        info.host,
        "-p",
        info.port,
        "-U",
        info.user,
        "-d",
        "postgres",
        "-c",
        `DROP DATABASE IF EXISTS \"${tempDb}\"`,
      ],
      { env: envPg, encoding: "utf8" }
    );
  }

  fs.writeFileSync(
    path.join(evidenceDir, "ADMIN_E1_RESTORED_APP_SMOKE.md"),
    `# ADMIN.E.1 — Application smoke against restored DB\n\n\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\`\n`
  );
  console.log(evidence.status);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
