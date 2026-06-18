import Link from "next/link";
import { Gift } from "lucide-react";
import { ProductCard } from "@/components/souvenirs/product-card";
import type { SouvenirProduct } from "@/lib/souvenirs-types";

export function RelatedSouvenirsBlock({
  products,
  title = "Связанные сувениры",
}: {
  products: SouvenirProduct[];
  title?: string;
}) {
  if (products.length === 0) return null;

  return (
    <aside className="mt-16 pt-10 border-t border-border">
      <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
        <Gift size={16} className="text-baikal" />
        {title}
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-6">
        <Link
          href="/souvenirs"
          className="text-sm text-baikal hover:underline underline-offset-2"
        >
          Все сувениры
        </Link>
      </div>
    </aside>
  );
}

export function SouvenirsCtaLink() {
  return (
    <div className="mt-10 border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">Сувениры с характером Иркутска</p>
        <p className="text-sm text-muted-foreground mt-1">
          Открытки, карты, мерч и работы местных мастеров — по заявке, без корзины.
        </p>
      </div>
      <Link
        href="/souvenirs"
        className="inline-flex h-10 items-center justify-center bg-foreground text-primary-foreground px-5 text-sm font-medium hover:bg-foreground/90 shrink-0"
      >
        Смотреть сувениры
      </Link>
    </div>
  );
}
