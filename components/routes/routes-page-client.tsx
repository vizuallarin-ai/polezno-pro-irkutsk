"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import {
  filterExperiences,
  isExperienceFilterId,
  type ExperienceFilterId,
  type ExperienceItem,
} from "@/lib/data/experiences";
import type { MapRoute } from "@/types/map";
import { ExperienceFilters } from "@/components/experiences/experience-filters";
import { ExperienceCard } from "@/components/experiences/experience-card";
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
  experiences: ExperienceItem[];
  mapRoutes: MapRoute[];
}

export function RoutesPageClient({
  experiences,
  mapRoutes,
}: RoutesPageClientProps) {
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<ExperienceFilterId>("all");
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam && isExperienceFilterId(filterParam)) {
      setActiveFilter(filterParam);
    }
  }, [searchParams]);

  const filteredExperiences = useMemo(
    () => filterExperiences(experiences, activeFilter),
    [experiences, activeFilter]
  );

  const guidedExcursions = useMemo(
    () => experiences.filter((e) => e.kind === "excursion"),
    [experiences]
  );

  const filteredMapRoutes = useMemo(() => {
    const routeSlugs = new Set(
      filteredExperiences
        .filter((e) => e.kind === "route" && e.hasGeo)
        .map((e) => e.slug)
    );
    return mapRoutes.filter((m) => routeSlugs.has(m.slug));
  }, [filteredExperiences, mapRoutes]);

  const handleRouteSelect = (mapRoute: MapRoute | null) => {
    setActiveRouteId(mapRoute?.id ?? null);
  };

  return (
    <>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 lg:py-14">
          <h1 className="text-3xl lg:text-4xl font-medium text-foreground mb-3">
            Маршруты и экскурсии
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base max-w-2xl leading-relaxed">
            Готовые прогулки по Иркутску и авторские экскурсии с гидом: точки на
            карте, форматы прохождения и запись на дату.
          </p>
          <div className="mt-6">
            <ExperienceFilters
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
            {filteredExperiences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-border text-center">
                <MapPin className="text-muted-foreground mb-4" size={28} />
                <p className="text-base font-medium text-foreground mb-2">
                  Ничего не найдено
                </p>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Попробуйте другой фильтр или посмотрите все маршруты и
                  экскурсии.
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
                {filteredExperiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    className={
                      experience.kind === "route" &&
                      experience.mapRouteId === activeRouteId
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
              <div className="h-[min(45vh,300px)] sm:h-[400px] lg:h-[min(70vh,560px)] border border-border overflow-hidden">
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
                    const active = filteredExperiences.find(
                      (e) =>
                        e.kind === "route" && e.mapRouteId === activeRouteId
                    );
                    if (!active) return null;
                    return (
                      <>
                        <p className="text-sm font-medium mb-2">
                          {active.title}
                        </p>
                        <Link
                          href={active.href}
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

      {guidedExcursions.length > 0 && (
        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              С гидом
            </p>
            <h2 className="text-2xl lg:text-3xl font-medium text-foreground mb-4">
              С Алёной
            </h2>
            <p className="text-sm lg:text-base text-muted-foreground max-w-2xl leading-relaxed mb-8">
              Авторские экскурсии по городу, гастро-маршруты и программы для
              групп — без шаблонных «обзорок». Выберите формат или напишите, и
              соберём день под вас.
            </p>
            <Link
              href="/map?filter=guided"
              className="inline-flex h-11 items-center justify-center gap-2 border border-border bg-background px-6 text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
            >
              Смотреть экскурсии с гидом
            </Link>
          </div>
        </section>
      )}

      <RouteIndexCtaBlock />
    </>
  );
}
