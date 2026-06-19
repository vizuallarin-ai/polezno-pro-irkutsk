import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Route } from "@/lib/data/routes";
import { CityImage } from "@/components/visual/city-image";
import { resolveVisualImage } from "@/lib/visual-assets";

export function ExploreRoutesPreview({ routes }: { routes: Route[] }) {
  if (routes.length === 0) return null;

  return (
    <section className="mb-24" aria-labelledby="explore-routes-heading">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Маршруты
          </p>
          <h2
            id="explore-routes-heading"
            className="text-2xl font-light tracking-tight"
          >
            Прогулки по теме
          </h2>
        </div>
        <Link
          href="/map"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Все маршруты
          <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routes.map((route) => {
          const visual = resolveVisualImage({
            coverUrl: route.coverImage,
            fallback: "route",
            alt: route.title,
          });

          return (
            <Link
              key={route.slug}
              href={`/map/${route.slug}`}
              className="group flex gap-4 border border-border p-4 hover:bg-card transition-colors city-card overflow-hidden"
            >
              <div className="relative w-28 h-28 shrink-0 overflow-hidden">
                <CityImage
                  src={visual.src}
                  alt={visual.alt}
                  aspectRatio="square"
                  sizes="112px"
                  className="h-full w-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin size={11} />
                  Маршрут
                </p>
                <p className="font-medium group-hover:text-baikal transition-colors">
                  {route.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {route.description}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="shrink-0 text-muted-foreground group-hover:text-baikal mt-1"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
