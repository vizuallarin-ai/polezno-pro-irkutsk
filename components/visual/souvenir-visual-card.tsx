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
      <div className="relative mb-5 overflow-hidden img-reveal">
        <CityImage
          src={visual.src}
          alt={visual.alt}
          aspectRatio="square"
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="city-card overflow-hidden"
          rounded
        />
        {showStockBadge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="outline" className="type-caption bg-background/90">
              {product.stockLabel}
            </Badge>
          </div>
        )}
      </div>
      <p className="type-meta uppercase text-muted-foreground mb-2">
        {product.categoryLabel}
        {!product.isOwnMerch && product.maker
          ? ` · ${product.maker.title}`
          : ""}
      </p>
      <p className="type-h3 text-foreground leading-snug mb-2 group-hover:text-baikal transition-colors duration-200">
        {product.title}
      </p>
      {product.shortDescription && (
        <p className="type-body-sm text-muted-foreground line-clamp-2 mb-3">
          {product.shortDescription}
        </p>
      )}
      <p className="type-ui-label mt-auto">
        {formatProductPrice(product)}
      </p>
    </Link>
  );
}
