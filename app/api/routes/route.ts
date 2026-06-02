import { NextRequest, NextResponse } from "next/server";
import type { MapRoute } from "@/types/map";
import type { Where } from "payload";
import { getRoutesForMap } from "@/lib/routes";

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

    const cms = result.docs as unknown as MapRoute[];
    if (cms.length > 0) {
      const { mapRoutes } = await getRoutesForMap();
      let filtered = mapRoutes;
      if (category && category !== "all") {
        filtered = filtered.filter((r) => r.category === category);
      }
      if (type && type !== "all") {
        filtered = filtered.filter((r) => r.type === type);
      }
      return NextResponse.json(filtered);
    }
  } catch {
    // fallback below
  }

  const { mapRoutes } = await getRoutesForMap();
  let filtered = mapRoutes;
  if (category && category !== "all") {
    filtered = filtered.filter((r) => r.category === category);
  }
  if (type && type !== "all") {
    filtered = filtered.filter((r) => r.type === type);
  }
  return NextResponse.json(filtered);
}
