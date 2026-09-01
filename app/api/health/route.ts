import { NextResponse } from "next/server";
import { buildReleaseIdentity } from "@/lib/release-identity";

export const dynamic = "force-dynamic";

/** Public release identity — no env values, DB details, paths, or secrets. */
export async function GET() {
  const identity = buildReleaseIdentity();
  return NextResponse.json(identity, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
