import type { Metadata } from "next";
import { RoutesPageClient } from "@/components/routes/routes-page-client";
import { getRoutesForMap } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Маршруты по Иркутску — интерактивная карта",
  description:
    "Готовые прогулки по Иркутску: точки, истории, время и возможность пройти маршрут с гидом. Бесплатные и платные авторские маршруты.",
};

export default async function MapPage() {
  const { routes, mapRoutes } = await getRoutesForMap();

  return <RoutesPageClient routes={routes} mapRoutes={mapRoutes} />;
}
