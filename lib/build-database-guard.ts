/** Guards isolated build from connecting to production PostgreSQL. */

const PRODUCTION_HOST_MARKERS = [
  "90.156.170.182",
  "irkportal.ru",
  "polezno_irkutsk@",
] as const;

const DISPOSABLE_DB_PREFIX = "irkportal_phase15_";
const DISPOSABLE_ROLE_PREFIX = "phase15_builder_";
const TUNNEL_HOSTS = new Set(["127.0.0.1", "localhost"]);

export interface ParsedDatabaseUrl {
  host: string;
  port: string;
  username: string;
  database: string;
}

export function parseDatabaseUrl(url: string): ParsedDatabaseUrl {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new Error("Invalid disposable database URL");
  }
  if (!parsed.protocol.startsWith("postgres")) {
    throw new Error("Invalid disposable database URL");
  }
  const database = parsed.pathname.replace(/^\//, "").split("?")[0];
  const username = decodeURIComponent(parsed.username);
  if (!database || !username) {
    throw new Error("Invalid disposable database URL");
  }
  return {
    host: parsed.hostname,
    port: parsed.port || "5432",
    username,
    database,
  };
}

export function isBlockedProductionDatabaseUrl(url: string): boolean {
  const normalized = url.trim().toLowerCase();
  if (!normalized.startsWith("postgres")) return true;
  return PRODUCTION_HOST_MARKERS.some((marker) =>
    normalized.includes(marker.toLowerCase())
  );
}

export function isAllowedSshTunnelDatabaseUrl(url: string): boolean {
  const { host, port, username, database } = parseDatabaseUrl(url);
  if (!TUNNEL_HOSTS.has(host)) return false;
  if (port === "5432") return false;
  if (!database.startsWith(DISPOSABLE_DB_PREFIX)) return false;
  if (!username.startsWith(DISPOSABLE_ROLE_PREFIX)) return false;
  if (isBlockedProductionDatabaseUrl(url)) return false;
  return true;
}

export function assertDisposableDatabaseUrl(url: string): void {
  if (!url.trim()) {
    throw new Error("PHASE15_DISPOSABLE_DATABASE_URL is required");
  }
  if (isBlockedProductionDatabaseUrl(url)) {
    throw new Error("Refusing production-like DATABASE_URL for isolated build");
  }
  if (!isAllowedSshTunnelDatabaseUrl(url)) {
    throw new Error(
      "Disposable URL must use SSH tunnel (127.0.0.1, non-5432 port, irkportal_phase15_* DB, phase15_builder_* role)"
    );
  }
}

export interface RuntimeHandshake {
  currentDatabase: string;
  currentUser: string;
  isSuperuser: boolean;
}

export function assertRuntimeDatabaseHandshake(
  url: string,
  runtime: RuntimeHandshake
): void {
  const expected = parseDatabaseUrl(url);
  if (runtime.currentDatabase !== expected.database) {
    throw new Error("Runtime database does not match disposable URL");
  }
  if (runtime.currentUser !== expected.username) {
    throw new Error("Runtime user does not match disposable URL");
  }
  if (runtime.isSuperuser) {
    throw new Error("Disposable role must not be superuser");
  }
}

export async function verifyRuntimeDatabaseHandshake(
  url: string
): Promise<RuntimeHandshake> {
  const pg = await import("pg");
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    const result = await client.query<{
      current_database: string;
      current_user: string;
      is_superuser: boolean;
    }>(
      "SELECT current_database() AS current_database, current_user AS current_user, (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) AS is_superuser"
    );
    const row = result.rows[0];
    const runtime: RuntimeHandshake = {
      currentDatabase: row.current_database,
      currentUser: row.current_user,
      isSuperuser: row.is_superuser === true,
    };
    assertRuntimeDatabaseHandshake(url, runtime);
    return runtime;
  } finally {
    await client.end().catch(() => {});
  }
}
