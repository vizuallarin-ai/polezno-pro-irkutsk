import Link from "next/link";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import type { Route } from "@/lib/data/routes";
import {
  ROUTE_DIFFICULTY_LABELS,
  ROUTE_FORMAT_LABELS,
} from "@/lib/data/routes";
import { ROUTE_CATEGORY_LABELS } from "@/types/map";
import { CityImage } from "./city-image";
import { resolveVisualImage } from "@/lib/visual-assets";
import { cn } from "@/lib/utils";
import { routeContactHref, CTA } from "@/lib/cta-constants";

function formatRouteDuration(minutes: number): string {
  if (minutes >= 240) return "полдня";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m === 0) return `${h} ч`;
  if (h > 0) return `${h} ч ${m} мин`;
  return `${m} мин`;
}

interface RouteVisualCardProps {
  route: Route;
  className?: string;
}

export function RouteVisualCard({ route, className }: RouteVisualCardProps) {
  const visual = resolveVisualImage({
    coverUrl: route.coverImage,
    fallback: "route",
    alt: route.title,
    place: route.tags[0],
  });

  const meta = [
    formatRouteDuration(route.duration),
    `${route.distance} км`,
    `${route.pointsCount} точек`,
    ROUTE_DIFFICULTY_LABELS[route.difficulty],
  ].join(" · ");

  return (
    <article className={cn("editorial-card group", className)}>
      <Link
        href={`/map/${route.slug}`}
        className="editorial-card-media img-reveal block"
        aria-label={`Открыть маршрут: ${route.title}`}
      >
        <CityImage
          src={visual.src}
          alt={visual.alt}
          aspectRatio="16/10"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>

      <div className="flex flex-col flex-1 pt-5 gap-3">
        <div>
          <p className="type-meta uppercase text-muted-foreground mb-2">
            {ROUTE_CATEGORY_LABELS[route.mapCategory]} ·{" "}
            {ROUTE_FORMAT_LABELS[route.format]}
            {route.type === "free" ? " · Бесплатно" : ""}
          </p>
          <h2 className="type-h3 text-foreground text-balance group-hover:text-baikal transition-colors duration-200">
            <Link href={`/map/${route.slug}`}>{route.title}</Link>
          </h2>
        </div>

        <p className="type-body-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {route.description}
        </p>

        <p className="type-meta text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1">
            <Clock size={11} aria-hidden />
            {meta}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          <Link href={`/map/${route.slug}`} className="cta-ghost type-ui-label">
            Открыть маршрут
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            href={routeContactHref(route.slug, "route-card")}
            className="type-ui-label text-muted-foreground hover:text-foreground transition-colors duration-200 min-h-[44px] inline-flex items-center"
          >
            {CTA.guided.label}
          </Link>
        </div>
      </div>
    </article>
  );
}
