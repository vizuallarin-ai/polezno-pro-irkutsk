import type { Metadata } from "next";
import Link from "next/link";
import { VisualEmptyState } from "@/components/visual/visual-empty-state";
import { VISUAL_EMPTY_COPY } from "@/lib/visual-assets";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getSiteSettings } from "@/lib/site-settings";
import {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_STOCK_LABELS,
} from "@/lib/content-labels";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Магазин — байкальская эстетика в предметах",
    description:
      settings.metaDescription ||
      "Мерч и сувениры с иркутской и байкальской идентичностью.",
  };
}


const STOCK_LABELS = PRODUCT_STOCK_LABELS;

async function getProducts() {
  try {
    if (!process.env.DATABASE_URL) return [];
    const { getPayloadClient } = await import("@/lib/payload");
    const { PUBLISHED_STATUS_WHERE } = await import("@/lib/cms-filters");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "products",
      where: PUBLISHED_STATUS_WHERE,
      limit: 100,
      sort: "-createdAt",
      depth: 1,
    });
    return result.docs;
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const products = await getProducts();
  const settings = await getSiteSettings();
  const telegram = settings.contact.telegram;

  return (
    <main className="pt-24">
      <section className="border-b border-border py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Concept store
          </p>
          <h1 className="text-5xl lg:text-7xl font-light tracking-tight text-foreground mb-6 max-w-xl">
            Байкальская <span className="font-serif italic">эстетика</span>
          </h1>
          <p className="text-muted-foreground max-w-sm leading-relaxed">
            Предметы с характером. Каждая вещь — история места, материала и
            человека, который её создал.
          </p>

          {products.length === 0 && (
            <div className="mt-8 inline-flex items-center gap-3 border border-baikal/30 bg-baikal/5 px-5 py-3">
              <span className="w-2 h-2 rounded-full bg-baikal animate-pulse" />
              <p className="text-sm text-baikal">
                Магазин открывается — подпишитесь на{" "}
                {telegram ? (
                  <a
                    href={telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:no-underline"
                  >
                    Telegram
                  </a>
                ) : (
                  "Telegram"
                )}
                , чтобы узнать первым
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        {products.length === 0 ? (
          <VisualEmptyState message={VISUAL_EMPTY_COPY.shop} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const gallery = product.gallery as
                | Array<{ image: { url?: string; alt?: string } }>
                | undefined;
              const firstImage = gallery?.[0]?.image;
              const stockStatus = String(product.stockStatus || "in_stock");
              const isAvailable = stockStatus !== "out_of_stock";

              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group flex flex-col"
                  aria-label={String(product.title)}
                >
                  <div className="relative aspect-square overflow-hidden bg-card mb-4">
                    {firstImage?.url ? (
                      <Image
                        src={firstImage.url}
                        alt={firstImage.alt || String(product.title)}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                        <span className="text-4xl font-serif">—</span>
                      </div>
                    )}
                    {stockStatus !== "in_stock" && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="outline" className="text-xs bg-background/90">
                          {STOCK_LABELS[stockStatus] || stockStatus}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {PRODUCT_CATEGORY_LABELS[String(product.category)] ||
                      String(product.category)}
                  </p>
                  <p className="text-sm font-medium text-foreground leading-snug mb-2 group-hover:text-baikal transition-colors duration-200">
                    {String(product.title)}
                  </p>
                  {product.shortDescription && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {String(product.shortDescription)}
                    </p>
                  )}
                  <p className="text-sm font-medium mt-auto">
                    {isAvailable
                      ? `${Number(product.price).toLocaleString("ru-RU")} ₽`
                      : STOCK_LABELS[stockStatus]}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
