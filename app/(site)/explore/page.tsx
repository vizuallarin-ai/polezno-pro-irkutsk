import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ExploreMaterialCard } from "@/components/explore/explore-material-card";
import { ExploreRoutesPreview } from "@/components/explore/explore-routes-preview";
import {
  ExploreBottomCta,
  ExplorePhotoPlaceholder,
} from "@/components/explore/explore-sections";
import {
  EXPLORE_CATEGORIES,
  EXPLORE_H1,
  EXPLORE_PAGE_DESCRIPTION,
  EXPLORE_PAGE_TITLE,
  EXPLORE_SUBTITLE,
} from "@/lib/explore-constants";
import { getFeaturedExploreMaterials } from "@/lib/explore";
import { getRoutesForMap } from "@/lib/routes";

export const metadata: Metadata = {
  title: EXPLORE_PAGE_TITLE,
  description: EXPLORE_PAGE_DESCRIPTION,
  openGraph: {
    title: EXPLORE_PAGE_TITLE,
    description: EXPLORE_PAGE_DESCRIPTION,
  },
};

export default async function ExplorePage() {
  const [materials, { routes }] = await Promise.all([
    getFeaturedExploreMaterials(6),
    getRoutesForMap(),
  ]);

  const routePreview = routes.slice(0, 4);

  return (
    <main className="pt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <header className="mb-16 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            База знаний
          </p>
          <h1 className="text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-4">
            {EXPLORE_H1.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="font-serif italic">
              {EXPLORE_H1.split(" ").slice(-1)}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {EXPLORE_SUBTITLE}
          </p>
        </header>

        <section className="mb-24" aria-labelledby="explore-categories-heading">
          <h2 id="explore-categories-heading" className="sr-only">
            Категории
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-border">
            {EXPLORE_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/explore/${cat.slug}`}
                className="group relative aspect-square overflow-hidden bg-background hover:z-10"
                aria-label={cat.label}
              >
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  className="object-cover opacity-35 group-hover:opacity-55 transition-opacity duration-300"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-background/90 via-background/20 to-transparent">
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {cat.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {materials.length > 0 && (
          <section className="mb-24" aria-labelledby="explore-featured-heading">
            <h2
              id="explore-featured-heading"
              className="text-2xl font-light tracking-tight mb-10"
            >
              Избранные материалы
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {materials.map((material) => (
                <ExploreMaterialCard key={material.id} material={material} />
              ))}
            </div>
          </section>
        )}

        <ExploreRoutesPreview routes={routePreview} />
        <ExplorePhotoPlaceholder />
        <ExploreBottomCta />
      </div>
    </main>
  );
}
