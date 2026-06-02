"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Route, RouteFilterId } from "@/lib/data/routes";
import { filterRoutes } from "@/lib/data/routes";
import type { MapRoute } from "@/types/map";
import { RouteFilters } from "@/components/routes/route-filters";
import { RouteCard } from "@/components/routes/route-card";
import { RouteIndexCtaBlock } from "@/components/routes/route-cta-block";

const RouteMap = dynamic(
  () => import("@/components/routes/route-map").then((m) => m.RouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[320px] lg:min-h-[480px] bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          Загрузка карты…
        </p>
      </div>
    ),
  }
);

interface RoutesPageClientProps {
  routes: Route[];
  mapRoutes: MapRoute[];
}

export function RoutesPageClient({ routes, mapRoutes }: RoutesPageClientProps) {
  const [activeFilter, setActiveFilter] = useState<RouteFilterId>("all");
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);

  const filteredRoutes = useMemo(
    () => filterRoutes(routes, activeFilter),
    [routes, activeFilter]
  );

  const filteredMapRoutes = useMemo(() => {
    const slugs = new Set(filteredRoutes.map((r) => r.slug));
    return mapRoutes.filter((m) => slugs.has(m.slug));
  }, [filteredRoutes, mapRoutes]);

  const handleRouteSelect = (mapRoute: MapRoute | null) => {
    setActiveRouteId(mapRoute?.id ?? null);
  };

  return (
    <>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 lg:py-14">
          <h1 className="text-3xl lg:text-4xl font-medium text-foreground mb-3">
            Маршруты по Иркутску
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base max-w-2xl leading-relaxed">
            Готовые прогулки по городу: точки, истории, время и возможность
            пройти маршрут с гидом.
          </p>
          <div className="mt-6">
            <RouteFilters
              activeFilter={activeFilter}
              onFilterChange={(id) => {
                setActiveFilter(id);
                setActiveRouteId(null);
              }}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-10">
          <div className="order-1 lg:order-1">
            {filteredRoutes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-border text-center">
                <MapPin className="text-muted-foreground mb-4" size={28} />
                <p className="text-base font-medium text-foreground mb-2">
                  Маршруты не найдены
                </p>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Попробуйте другой фильтр или посмотрите все маршруты.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className="text-sm font-medium text-baikal hover:underline"
                >
                  Показать все
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {filteredRoutes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    className={
                      activeRouteId === route.id
                        ? "ring-2 ring-baikal ring-offset-2"
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div className="order-2 lg:order-2 mt-8 lg:mt-0">
            <div className="sticky top-20">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 hidden lg:block">
                Карта маршрутов
              </p>
              <div className="h-[320px] sm:h-[400px] lg:h-[min(70vh,560px)] border border-border overflow-hidden">
                <RouteMap
                  mode="overview"
                  mapRoutes={filteredMapRoutes}
                  activeRouteId={activeRouteId}
                  onRouteSelect={handleRouteSelect}
                />
              </div>
              {activeRouteId && (
                <div className="mt-4 p-4 border border-border bg-muted/30">
                  {(() => {
                    const active = filteredRoutes.find(
                      (r) => r.id === activeRouteId
                    );
                    if (!active) return null;
                    return (
                      <>
                        <p className="text-sm font-medium mb-2">
                          {active.title}
                        </p>
                        <Link
                          href={`/map/${active.slug}`}
                          className="text-sm text-baikal font-medium hover:underline"
                        >
                          Открыть маршрут →
                        </Link>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <RouteIndexCtaBlock />
    </>
  );
}
