"use client";

import { CityImage } from "@/components/visual/city-image";
import { cn } from "@/lib/utils";
import type { RoutePoint } from "@/lib/data/routes";

interface RoutePointsListProps {
  points: RoutePoint[];
  activePointId?: string | null;
  onPointSelect?: (point: RoutePoint) => void;
  className?: string;
}

export function RoutePointsList({
  points,
  activePointId,
  onPointSelect,
  className,
}: RoutePointsListProps) {
  const sorted = [...points].sort((a, b) => a.order - b.order);

  return (
    <ol className={cn("flex flex-col gap-0", className)}>
      {sorted.map((point, index) => {
        const isActive = activePointId === point.id;
        return (
          <li key={point.id}>
            {index > 0 && <div className="h-px bg-border mx-5 lg:mx-0" />}
            <button
              type="button"
              id={`point-${point.id}`}
              onClick={() => onPointSelect?.(point)}
              className={cn(
                "w-full text-left flex gap-4 p-5 lg:px-0 transition-colors duration-150",
                isActive ? "bg-muted/80" : "hover:bg-muted/40",
                onPointSelect && "cursor-pointer"
              )}
            >
              <span
                className={cn(
                  "shrink-0 w-8 h-8 flex items-center justify-center text-xs font-medium border",
                  isActive
                    ? "bg-foreground text-primary-foreground border-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {point.order}
              </span>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-medium text-foreground">
                    {point.title}
                  </h3>
                  {point.time && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {point.time}
                    </span>
                  )}
                </div>

                <div className="relative aspect-[16/9] max-w-sm overflow-hidden border border-border">
                  {point.image ? (
                    <CityImage
                      src={point.image}
                      alt={point.title}
                      aspectRatio="16/9"
                      sizes="(max-width: 640px) 100vw, 320px"
                      place={point.title}
                    />
                  ) : (
                    <CityImage
                      src={null}
                      alt=""
                      aspectRatio="16/9"
                      showPlaceholder
                      place={point.title}
                    />
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>

                {point.whatToNotice && (
                  <p className="text-sm text-foreground/90 leading-relaxed border-l-2 border-baikal pl-3">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                      Что заметить
                    </span>
                    {point.whatToNotice}
                  </p>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
