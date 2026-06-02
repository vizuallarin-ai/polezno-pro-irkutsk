import { NextRequest, NextResponse } from "next/server";
import type { Where } from "payload";
import { PUBLISHED_STATUS_WHERE } from "@/lib/cms-filters";
import { getRoutesForMap } from "@/lib/routes";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");

  const { mapRoutes } = await getRoutesForMap();

  let filtered = mapRoutes;
  if (category && category !== "all") {
    filtered = filtered.filter((r) => r.category === category);
  }
  if (type && type !== "all") {
    filtered = filtered.filter((r) => r.type === type);
  }

  if (filtered.length > 0) {
    return NextResponse.json(filtered);
  }

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([]);
    }

    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const conditions: Where[] = [PUBLISHED_STATUS_WHERE];
    if (category && category !== "all") {
      conditions.push({ category: { equals: category } });
    }
    if (type && type !== "all") {
      conditions.push({ type: { equals: type } });
    }

    const result = await payload.find({
      collection: "routes",
      where: { and: conditions },
      limit: 100,
      depth: 2,
    });

    if (result.docs.length > 0) {
      const { mapRoutes: cmsMapRoutes } = await getRoutesForMap();
      let cmsFiltered = cmsMapRoutes;
      if (category && category !== "all") {
        cmsFiltered = cmsFiltered.filter((r) => r.category === category);
      }
      if (type && type !== "all") {
        cmsFiltered = cmsFiltered.filter((r) => r.type === type);
      }
      return NextResponse.json(cmsFiltered);
    }
  } catch {
    // fallback
  }

  return NextResponse.json(filtered);
}
