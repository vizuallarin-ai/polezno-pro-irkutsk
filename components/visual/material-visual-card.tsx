import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CityImage } from "./city-image";
import { exploreCategoryLabel } from "@/lib/explore-constants";
import { resolveVisualImage } from "@/lib/visual-assets";
import type { ExploreMaterialView } from "@/lib/explore";

export function MaterialVisualCard({
  material,
}: {
  material: ExploreMaterialView;
}) {
  const visual = resolveVisualImage({
    coverUrl: material.coverUrl,
    fallback: "explore",
    alt: material.title,
  });

  return (
    <Link
      href={`/explore/${material.slug}`}
      className="group flex flex-col"
      aria-label={material.title}
    >
      <div className="relative mb-4">
        <CityImage
          src={visual.src}
          alt={visual.alt}
          aspectRatio="4/3"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="border border-border city-card"
          imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
          rounded
        />
        {material.isHiddenGem && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="ice">Неочевидное</Badge>
          </div>
        )}
      </div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {exploreCategoryLabel(material.category)}
        {material.readTime ? ` · ${material.readTime} мин` : ""}
      </p>
      <h3 className="text-base font-medium leading-snug text-foreground group-hover:text-baikal transition-colors duration-200">
        {material.title}
      </h3>
      {material.excerpt && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
          {material.excerpt}
        </p>
      )}
    </Link>
  );
}
