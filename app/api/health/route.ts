import { NextResponse } from "next/server";
import { buildReleaseIdentity } from "@/lib/release-identity";

export const dynamic = "force-dynamic";

export type DatabaseHealth = "up" | "down" | "unconfigured";

async function probeDatabase(): Promise<DatabaseHealth> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return "unconfigured";

  try {
    const pg = await import("pg");
    const client = new pg.Client({
      connectionString: url,
      connectionTimeoutMillis: 3000,
    });
    try {
      await client.connect();
      await client.query("SELECT 1");
      return "up";
    } finally {
      await client.end().catch(() => {});
    }
  } catch {
    return "down";
  }
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Public release identity + dependency probe — no env values, paths, or secrets. */
export async function GET() {
  const identity = buildReleaseIdentity();
  const database = await probeDatabase();

  // Production requires a live DB. Dev may run without DATABASE_URL.
  const criticalOk = isProductionRuntime()
    ? database === "up"
    : database !== "down";

  const body = {
    ...identity,
    status: criticalOk ? ("ok" as const) : ("degraded" as const),
    database,
    app: "up" as const,
  };

  return NextResponse.json(body, {
    status: criticalOk ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
