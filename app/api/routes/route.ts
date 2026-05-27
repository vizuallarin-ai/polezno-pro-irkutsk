import { NextRequest, NextResponse } from "next/server";
import type { MapRoute } from "@/types/map";
import type { Where } from "payload";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");

  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const conditions: Where[] = [];
    if (category && category !== "all") {
      conditions.push({ category: { equals: category } });
    }
    if (type && type !== "all") {
      conditions.push({ type: { equals: type } });
    }

    const where: Where =
      conditions.length > 0 ? { and: conditions } : {};

    const result = await payload.find({
      collection: "routes",
      where,
      limit: 100,
      depth: 2,
    });

    return NextResponse.json(result.docs as unknown as MapRoute[]);
  } catch {
    return NextResponse.json([] as MapRoute[]);
  }
}
