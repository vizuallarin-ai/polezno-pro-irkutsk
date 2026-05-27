import type { Metadata } from "next";
import { MapExperience } from "@/components/map/map-experience";
import type { MapRoute } from "@/types/map";

export const metadata: Metadata = {
  title: "Маршруты по Иркутску — интерактивная карта",
  description:
    "Интерактивная карта авторских маршрутов по Иркутску: архитектура, история, гастрономия, деревянное зодчество, hidden places. Бесплатные и платные маршруты с аудиогидом.",
};

async function getInitialRoutes(): Promise<MapRoute[]> {
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "routes",
      limit: 100,
      depth: 2,
    });
    return result.docs as unknown as MapRoute[];
  } catch {
    return [];
  }
}

export default async function MapPage() {
  const initialRoutes = await getInitialRoutes();

  return (
    <div className="h-[100svh] flex flex-col">
      <div className="flex-1 overflow-hidden mt-16">
        <MapExperience initialRoutes={initialRoutes} />
      </div>
    </div>
  );
}
