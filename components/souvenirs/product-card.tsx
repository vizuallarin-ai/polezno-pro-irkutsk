import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  formatProductPrice,
  type SouvenirProduct,
} from "@/lib/souvenirs-types";

export function ProductCard({ product }: { product: SouvenirProduct }) {
  const showStockBadge =
    product.stockStatus !== "in_stock" && product.stockStatus !== "by_request";

  return (
    <Link
      href={`/souvenirs/${product.slug}`}
      className="group flex flex-col"
      aria-label={product.title}
    >
      <div className="relative aspect-square overflow-hidden bg-card mb-4 border border-border">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
            <span className="text-4xl font-serif">—</span>
          </div>
        )}
        {showStockBadge && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="text-xs bg-background/90">
              {product.stockLabel}
            </Badge>
          </div>
        )}
        {!product.isOwnMerch && product.maker && (
          <div className="absolute bottom-2 left-2 right-2">
            <Badge variant="secondary" className="text-xs bg-background/90 truncate max-w-full">
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
      <p className="text-sm font-medium mt-auto">{formatProductPrice(product)}</p>
    </Link>
  );
}
