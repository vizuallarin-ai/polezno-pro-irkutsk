import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Магазин — байкальская эстетика в предметах",
  description:
    "Мерч и сувениры с иркутской и байкальской идентичностью: одежда, постеры, открытки, книги и арт-объекты. Concept store.",
};

const CATEGORY_LABELS: Record<string, string> = {
  clothing: "Одежда",
  posters: "Постеры",
  postcards: "Открытки",
  art: "Арт-объекты",
  books: "Книги",
  souvenirs: "Сувениры",
};

async function getProducts() {
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "products",
      where: { inStock: { equals: true } },
      limit: 100,
      sort: "-createdAt",
    });
    return result.docs;
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const products = await getProducts();

  const categories = [
    "all",
    ...Array.from(
      new Set(products.map((p) => String(p.category)).filter(Boolean))
    ),
  ];

  return (
    <main className="pt-24">
      <section className="border-b border-border py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Concept store
          </p>
          <h1 className="text-5xl lg:text-7xl font-light tracking-tight text-foreground mb-6 max-w-xl">
            Байкальская{" "}
            <span className="font-serif italic">эстетика</span>
          </h1>
          <p className="text-muted-foreground max-w-sm leading-relaxed">
            Предметы с характером. Каждая вещь — это история места, материала
            и человека, который её создал.
          </p>

          {products.length === 0 && (
            <div className="mt-8 inline-flex items-center gap-3 border border-baikal/30 bg-baikal/5 px-5 py-3">
              <span className="w-2 h-2 rounded-full bg-baikal animate-pulse" />
              <p className="text-sm text-baikal">
                Магазин открывается — подпишитесь на{" "}
                <a
                  href="https://t.me/polezno_irkutsk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:no-underline"
                >
                  Telegram
                </a>
                , чтобы узнать первым
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Магазин открывается — скоро здесь будут коллекции
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const gallery = product.gallery as
                | Array<{ image: { url?: string; alt?: string } }>
                | undefined;
              const firstImage = gallery?.[0]?.image;

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
                  </div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {CATEGORY_LABELS[String(product.category)] ||
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
                    {Number(product.price).toLocaleString("ru-RU")} ₽
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
