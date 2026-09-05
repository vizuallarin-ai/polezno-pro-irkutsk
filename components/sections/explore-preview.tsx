import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedExploreMaterials } from "@/lib/explore";
import { ExploreMaterialCard } from "@/components/explore/explore-material-card";
import { CTA } from "@/lib/cta-constants";

/**
 * Home DISCOVER rail — only renders when real published articles exist.
 * Never fabricates editorial cards.
 */
export async function ExplorePreviewSection({ limit = 3 }: { limit?: number }) {
  const materials = await getFeaturedExploreMaterials(limit);
  if (materials.length === 0) return null;

  return (
    <section
      className="section-pad"
      aria-labelledby="home-explore-heading"
      id="discover"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 lg:mb-12">
          <div className="max-w-2xl">
            <p className="type-caption uppercase tracking-[0.22em] text-muted-foreground mb-3">
              Исследовать Иркутск
            </p>
            <h2
              id="home-explore-heading"
              className="type-section-title text-foreground"
            >
              Истории, с которых начинается желание увидеть город
            </h2>
            <p className="type-body-sm text-muted-foreground mt-3 text-pretty max-w-xl">
              Редакторские материалы о местах, эпохах и повседневности — без
              туристических штампов.
            </p>
          </div>
          <Link
            href={CTA.mapExplore.href}
            className="cta-ghost type-button shrink-0 self-start md:self-auto"
          >
            {CTA.mapExplore.label}
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {materials.map((material) => (
            <ExploreMaterialCard key={material.id} material={material} />
          ))}
        </div>
      </div>
    </section>
  );
}
