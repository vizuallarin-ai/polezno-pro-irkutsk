import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  formatProductPrice,
  type SouvenirProduct,
} from "@/lib/souvenirs-types";
import { CityImage } from "./city-image";
import { resolveVisualImage } from "@/lib/visual-assets";

export function SouvenirVisualCard({ product }: { product: SouvenirProduct }) {
  const showStockBadge =
    product.stockStatus !== "in_stock" && product.stockStatus !== "by_request";

  const visual = resolveVisualImage({
    coverUrl: product.imageUrl,
    fallback: "souvenir",
    alt: product.imageAlt || product.title,
  });

  return (
    <Link
      href={`/souvenirs/${product.slug}`}
      className="group flex flex-col"
      aria-label={product.title}
    >
      <div className="relative mb-4">
        <CityImage
          src={visual.src}
          alt={visual.alt}
          aspectRatio="square"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="border border-border city-card"
          imageClassName="transition-transform duration-700 group-hover:scale-[1.02]"
          rounded
        />
        {showStockBadge && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="outline" className="text-xs bg-background/90">
              {product.stockLabel}
            </Badge>
          </div>
        )}
        {!product.isOwnMerch && product.maker && (
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <Badge
              variant="secondary"
              className="text-xs bg-background/90 truncate max-w-full"
            >
              {product.maker.title}
            </Badge>
          </div>
        )}
      </div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
        {product.categoryLabel}
      </p>
      <p className="text-sm font-medium text-foreground leading-snug mb-2 group-hover:text-baikal transition-colors duration-200">
        {product.title}
      </p>
      {product.shortDescription && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {product.shortDescription}
        </p>
      )}
      <p className="text-sm font-medium mt-auto">
        {formatProductPrice(product)}
      </p>
    </Link>
  );
}
