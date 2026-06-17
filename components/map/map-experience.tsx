"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import type { MapRoute, RouteCategory } from "@/types/map";
import { RouteSidebar } from "@/components/map/route-sidebar";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const RouteMap = dynamic(
  () => import("@/components/map/route-map").then((m) => m.RouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          Загрузка карты…
        </p>
      </div>
    ),
  }
);

interface MapExperienceProps {
  initialRoutes: MapRoute[];
}

export function MapExperience({ initialRoutes }: MapExperienceProps) {
  const [routes, setRoutes] = useState<MapRoute[]>(initialRoutes);
  const [activeRoute, setActiveRoute] = useState<MapRoute | null>(null);
  const [activeCategory, setActiveCategory] = useState<RouteCategory | "all">("all");
  const [activeType, setActiveType] = useState<"all" | "free" | "paid">("all");
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeType !== "all") params.set("type", activeType);

    fetch(`/api/routes?${params.toString()}`)
      .then((r) => r.json())
      .then((data: MapRoute[]) => setRoutes(data))
      .catch(() => {});
  }, [activeCategory, activeType]);

  const handleRouteSelect = (route: MapRoute | null) => {
    setActiveRoute(route);
    if (route) setIsMobileSheetOpen(true);
  };

  return (
    <div className="flex h-full">
      <aside className="hidden lg:flex w-[380px] shrink-0 flex-col border-r border-border bg-background h-full overflow-hidden">
        <RouteSidebar
          routes={routes}
          activeRoute={activeRoute}
          activeCategory={activeCategory}
          activeType={activeType}
          onRouteSelect={handleRouteSelect}
          onCategoryChange={setActiveCategory}
          onTypeChange={setActiveType}
          className="h-full"
        />
      </aside>

      <div className="flex-1 relative h-full">
        <RouteMap
          mode="overview"
          mapRoutes={routes}
          activeRouteId={activeRoute?.id ?? null}
          onRouteSelect={handleRouteSelect}
          className="w-full h-full"
        />
      </div>

      <div
        className={cn(
          "lg:hidden fixed inset-x-0 bottom-0 z-30 bg-background border-t border-border transition-transform duration-300 ease-out",
          isMobileSheetOpen ? "translate-y-0" : "translate-y-[calc(100%-80px)]"
        )}
        style={{ maxHeight: "80vh" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 cursor-pointer"
          onClick={() => {
            if (!isMobileSheetOpen) {
              setIsMobileSheetOpen(true);
            } else if (!activeRoute) {
              setIsMobileSheetOpen(false);
            }
          }}
          role="button"
          aria-expanded={isMobileSheetOpen}
          aria-label={isMobileSheetOpen ? "Скрыть список маршрутов" : "Показать список маршрутов"}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-border rounded-full mx-auto" />
            <p className="text-sm font-medium">
              {activeRoute ? activeRoute.title : `${routes.length} маршрутов`}
            </p>
          </div>
          <ChevronDown
            size={16}
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              isMobileSheetOpen && "rotate-180"
            )}
          />
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 60px)" }}>
          <RouteSidebar
            routes={routes}
            activeRoute={activeRoute}
            activeCategory={activeCategory}
            activeType={activeType}
            onRouteSelect={handleRouteSelect}
            onCategoryChange={setActiveCategory}
            onTypeChange={setActiveType}
          />
        </div>
      </div>
    </div>
  );
}
