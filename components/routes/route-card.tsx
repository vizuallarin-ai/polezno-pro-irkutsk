import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import type { Route } from "@/lib/data/routes";
import {
  ROUTE_DIFFICULTY_LABELS,
  ROUTE_FORMAT_LABELS,
} from "@/lib/data/routes";
import { ROUTE_CATEGORY_LABELS } from "@/types/map";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatRouteDuration(minutes: number): string {
  if (minutes >= 240) return "полдня";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m === 0) return `${h} ч`;
  if (h > 0) return `${h} ч ${m} мин`;
  return `${m} мин`;
}

interface RouteCardProps {
  route: Route;
  className?: string;
}

export function RouteCard({ route, className }: RouteCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col border border-border bg-background hover:border-foreground/30 transition-colors duration-200",
        className
      )}
    >
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {route.coverImage ? (
          <Image
            src={route.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="text-muted-foreground" size={24} />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={route.type === "free" ? "baikal" : "amber"}>
            {route.type === "free" ? "Бесплатно" : "Платный"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            {ROUTE_CATEGORY_LABELS[route.mapCategory]} ·{" "}
            {ROUTE_FORMAT_LABELS[route.format]}
          </p>
          <h2 className="text-lg font-medium leading-snug text-foreground">
            {route.title}
          </h2>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {route.description}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatRouteDuration(route.duration)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {route.distance} км
          </span>
          <span>{route.pointsCount} точек</span>
          <span>{ROUTE_DIFFICULTY_LABELS[route.difficulty]}</span>
        </div>

        {route.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {route.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wide px-2 py-0.5 bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
          <Link
            href={`/map/${route.slug}`}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 bg-foreground text-primary-foreground px-4 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
          >
            Открыть маршрут
            <ArrowRight size={13} />
          </Link>
          <Link
            href={`/program?route=${encodeURIComponent(route.slug)}`}
            className="inline-flex h-10 items-center justify-center border border-border px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
          >
            Пройти с гидом
          </Link>
        </div>
      </div>
    </article>
  );
}
