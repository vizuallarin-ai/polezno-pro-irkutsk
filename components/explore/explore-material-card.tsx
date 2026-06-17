import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { exploreCategoryLabel } from "@/lib/explore-constants";
import type { ExploreMaterialView } from "@/lib/explore";

export function ExploreMaterialCard({
  material,
}: {
  material: ExploreMaterialView;
}) {
  return (
    <Link
      href={`/explore/${material.slug}`}
      className="group flex flex-col"
      aria-label={material.title}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted mb-4">
        <Image
          src={material.coverUrl}
          alt={material.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        {material.isHiddenGem && (
          <div className="absolute top-3 left-3">
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
