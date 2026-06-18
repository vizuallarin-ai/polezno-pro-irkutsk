import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/souvenirs/product-card";
import { getFeaturedProducts } from "@/lib/souvenirs";

export async function SouvenirsPreviewSection() {
  const products = await getFeaturedProducts(4);
  if (products.length < 2) return null;

  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              Сувениры
            </p>
            <h2 className="text-2xl lg:text-3xl font-medium tracking-tight mb-3">
              Вещи и открытки с Иркутском
            </h2>
            <p className="text-muted-foreground max-w-xl leading-relaxed">
              Мерч Иркпортала и работы местных мастеров — карты, постеры и мини-гиды.
              Заказ по заявке, без оплаты на сайте.
            </p>
          </div>
          <Link
            href="/souvenirs"
            className="inline-flex h-11 items-center gap-2 border border-border px-6 text-sm font-medium hover:bg-muted transition-colors shrink-0"
          >
            В каталог
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
