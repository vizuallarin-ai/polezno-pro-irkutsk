"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  MapPin,
  Footprints,
} from "lucide-react";
import type { Route, RoutePoint } from "@/lib/data/routes";
import {
  ROUTE_DIFFICULTY_LABELS,
  ROUTE_FORMAT_LABELS,
} from "@/lib/data/routes";
import { ROUTE_CATEGORY_LABELS } from "@/types/map";
import { Badge } from "@/components/ui/badge";
import { RoutePointsList } from "@/components/routes/route-points-list";
import { RouteSalesBlock } from "@/components/routes/route-cta-block";
import { RouteCard } from "@/components/routes/route-card";

const RouteMap = dynamic(
  () => import("@/components/routes/route-map").then((m) => m.RouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[360px] bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          Загрузка карты…
        </p>
      </div>
    ),
  }
);

function formatDuration(minutes: number): string {
  if (minutes >= 240) return "Полдня";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} ч`;
  if (h === 0) return `${m} мин`;
  return `${h} ч ${m} мин`;
}

interface RouteDetailClientProps {
  route: Route;
  similar: Route[];
  relatedExcursionSlug?: string | null;
}

function programHref(
  route: Route,
  format: "self-guided" | "guided" | "corporate"
): string {
  const params = new URLSearchParams({
    route: route.slug,
    format,
    sourceTitle: route.title,
  });
  return `/program?${params.toString()}`;
}

function RoutePassageBlock({
  route,
  relatedExcursionSlug,
}: {
  route: Route;
  relatedExcursionSlug?: string | null;
}) {
  const guidedHref = relatedExcursionSlug
    ? `/excursions/${relatedExcursionSlug}`
    : programHref(route, "guided");

  const variants = [
    {
      key: "self-guided",
      title: "Самостоятельно",
      text: "Откройте точки на карте и двигайтесь в своём темпе — без группы и фиксированного времени.",
      available: route.isSelfGuided !== false,
      cta: { label: "Открыть на карте", href: "#route-map", scroll: true },
    },
    {
      key: "guided",
      title: "С гидом",
      text:
        route.bookingDescription ||
        "Гид добавит контекст, истории и детали, которые не видны с тротуара.",
      available: route.isGuidedAvailable !== false,
      cta: {
        label: route.bookingCta || "Пройти с гидом",
        href: guidedHref,
        scroll: false,
      },
    },
    {
      key: "corporate",
      title: "Корпоратив / программа",
      text: "Соберём день под команду или делегацию: маршрут, еда, логистика — одной связкой.",
      available: Boolean(route.isCorporateAvailable),
      cta: {
        label: "Обсудить программу",
        href: programHref(route, "corporate"),
        scroll: false,
      },
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {variants.map((variant) => (
        <div
          key={variant.key}
          className={`border border-border p-6 bg-card ${
            !variant.available ? "opacity-50" : ""
          }`}
        >
          <h3 className="text-sm font-medium text-foreground mb-2">
            {variant.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {variant.text}
          </p>
          {variant.available && (
            variant.cta.scroll ? (
              <a
                href={variant.cta.href}
                className="text-sm font-medium text-baikal hover:underline"
              >
                {variant.cta.label} →
              </a>
            ) : (
              <Link
                href={variant.cta.href}
                className="text-sm font-medium text-baikal hover:underline"
              >
                {variant.cta.label} →
              </Link>
            )
          )}
        </div>
      ))}
    </div>
  );
}

export function RouteDetailClient({
  route,
  similar,
  relatedExcursionSlug,
}: RouteDetailClientProps) {
  const guideHref = relatedExcursionSlug
    ? `/excursions/${relatedExcursionSlug}`
    : programHref(route, "guided");
  const [activePointId, setActivePointId] = useState<string | null>(null);

  const handlePointSelect = useCallback((point: RoutePoint | null) => {
    if (!point) {
      setActivePointId(null);
      return;
    }
    setActivePointId(point.id);
    const el = document.getElementById(`point-${point.id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const scrollToMap = () => {
    document.getElementById("route-map")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="border-b border-border bg-background pt-24 lg:pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 lg:py-14">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Маршруты и экскурсии
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={route.type === "free" ? "baikal" : "amber"}>
              {route.type === "free" ? "Бесплатно" : "Платный"}
            </Badge>
            <Badge variant="outline">
              {ROUTE_CATEGORY_LABELS[route.mapCategory]}
            </Badge>
            <Badge variant="outline">{ROUTE_FORMAT_LABELS[route.format]}</Badge>
            {route.isSelfGuided !== false && (
              <Badge variant="outline">Самостоятельно</Badge>
            )}
            {route.isGuidedAvailable !== false && (
              <Badge variant="outline">С гидом</Badge>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-medium text-foreground mb-4 max-w-3xl">
            {route.title}
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base max-w-2xl leading-relaxed mb-8">
            {route.fullDescription}
          </p>

          <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{formatDuration(route.duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{route.distance} км</span>
            </div>
            <div className="flex items-center gap-2">
              <Footprints size={14} />
              <span>{route.pointsCount} точек</span>
            </div>
            <div>
              <span className="text-foreground/70">Сложность: </span>
              {ROUTE_DIFFICULTY_LABELS[route.difficulty]}
            </div>
          </dl>

          <div className="flex flex-col sm:flex-row gap-3">
            {route.isGuidedAvailable !== false && (
              <Link
                href={guideHref}
                className="inline-flex h-11 items-center justify-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
              >
                {route.bookingCta || "Пройти с гидом"}
                <ArrowRight size={14} />
              </Link>
            )}
            {route.isSelfGuided !== false && (
              <button
                type="button"
                onClick={scrollToMap}
                className="inline-flex h-11 items-center justify-center gap-2 border border-border px-6 text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
              >
                Открыть на карте
              </button>
            )}
          </div>
        </div>
      </section>

      <section id="route-map" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8 lg:py-12">
          <h2 className="text-xl font-medium mb-6">Карта маршрута</h2>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="h-[min(50vh,320px)] sm:h-[360px] lg:h-[480px] border border-border overflow-hidden order-2 lg:order-1">
              <RouteMap
                mode="detail"
                route={route}
                activePointId={activePointId}
                onPointSelect={handlePointSelect}
              />
            </div>
            <div className="order-1 lg:order-2 lg:max-h-[480px] lg:overflow-y-auto">
              <RoutePointsList
                points={route.points}
                activePointId={activePointId}
                onPointSelect={handlePointSelect}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
          <h2 className="text-xl font-medium mb-6">Как можно пройти</h2>
          <RoutePassageBlock
            route={route}
            relatedExcursionSlug={relatedExcursionSlug}
          />
        </div>
      </section>

      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
          <RouteSalesBlock route={route} />
        </div>
      </section>

      {similar.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
            <h2 className="text-xl font-medium mb-8">Похожие маршруты</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((r) => (
                <RouteCard key={r.id} route={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
