import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { RelatedRouteBlock } from "@/components/cms/related-blocks";
import { JsonLd } from "@/components/seo/json-ld";
import { productSchema, breadcrumbSchema } from "@/lib/jsonld";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { getSiteSettings } from "@/lib/site-settings";
import {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_STOCK_LABELS,
} from "@/lib/content-labels";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    if (!process.env.DATABASE_URL) return null;
    const { getPayloadClient } = await import("@/lib/payload");
    const { PUBLISHED_STATUS_WHERE } = await import("@/lib/cms-filters");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "products",
      where: {
        and: [{ slug: { equals: slug } }, PUBLISHED_STATUS_WHERE],
      },
      limit: 1,
      depth: 2,
    });
    return result.docs[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Товар не найден" };

  const site = await getSiteSettings();
  const gallery = product.gallery as
    | Array<{ image: { url?: string } }>
    | undefined;
  return buildPageMetadata(
    {
      title: String(product.title),
      shortDescription: String(product.shortDescription || ""),
      seo: product.seo as {
        title?: string;
        description?: string;
        image?: { url?: string } | null;
      },
      gallery,
    },
    String(product.title),
    site
  );
}


export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const gallery = product.gallery as
    | Array<{ image: { url?: string; alt?: string } }>
    | undefined;
  const stockStatus = String(product.stockStatus || "in_stock");
  const inStock =
    stockStatus === "in_stock" || stockStatus === "pre_order" || Boolean(product.inStock);
  const relatedRoute =
    product.relatedRoute &&
    typeof product.relatedRoute === "object" &&
    "slug" in product.relatedRoute
      ? (product.relatedRoute as {
          slug: string;
          title: string;
          description?: string;
        })
      : null;

  const { getSiteUrl } = await import("@/lib/site-url");
  const BASE_URL = getSiteUrl();
  const productJsonLd = productSchema({
    title: String(product.title),
    description: String(product.shortDescription || ""),
    url: `${BASE_URL}/shop/${product.slug}`,
    price: Number(product.price),
    imageUrl: gallery?.[0]?.image?.url,
    sku: String(product.id),
    inStock,
  });
  const breadcrumbProduct = breadcrumbSchema([
    { label: "Главная", href: "/" },
    { label: "Магазин", href: "/shop" },
    { label: String(product.title), href: `/shop/${product.slug}` },
  ]);

  return (
    <article className="pt-24">
      <JsonLd data={[productJsonLd, breadcrumbProduct]} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 mb-12"
        >
          <ArrowLeft size={12} />
          В магазин
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="flex flex-col gap-3">
            {gallery && gallery.length > 0 ? (
              <>
                <div className="relative aspect-square overflow-hidden bg-card">
                  <Image
                    src={gallery[0].image.url || ""}
                    alt={gallery[0].image.alt || String(product.title)}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {gallery.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {gallery.slice(1).map((item, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden bg-card"
                      >
                        <Image
                          src={item.image.url || ""}
                          alt={item.image.alt || String(product.title)}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-card flex items-center justify-center text-muted-foreground/30">
                <span className="text-6xl font-serif">—</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-start lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              {PRODUCT_CATEGORY_LABELS[String(product.category)] ||
                String(product.category)}
            </p>

            <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4 leading-snug">
              {String(product.title)}
            </h1>

            {product.shortDescription && (
              <p className="text-muted-foreground leading-relaxed mb-6">
                {String(product.shortDescription)}
              </p>
            )}

            <p className="text-3xl font-light tracking-tight mb-8">
              {Number(product.price).toLocaleString("ru-RU")} ₽
            </p>

            <Badge variant="outline" className="mb-4 w-fit">
              {PRODUCT_STOCK_LABELS[stockStatus] || stockStatus}
            </Badge>

            {product.externalLink ? (
              <a
                href={String(product.externalLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 bg-foreground text-primary-foreground px-8 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
              >
                Купить
                <ExternalLink size={13} />
              </a>
            ) : inStock && stockStatus !== "soon" ? (
              <AddToCartButton
                productId={String(product.id)}
                stripePriceId={
                  product.stripePriceId ? String(product.stripePriceId) : undefined
                }
                title={String(product.title)}
                price={Number(product.price)}
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border px-5 py-3 w-fit">
                <ShoppingBag size={14} />
                {PRODUCT_STOCK_LABELS[stockStatus] || "Недоступно"}
              </div>
            )}

            {relatedRoute && (
              <div className="mt-10">
                <RelatedRouteBlock route={relatedRoute} />
              </div>
            )}

            {product.story && (
              <div className="mt-10 pt-10 border-t border-border">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  История предмета
                </p>
                <div className="text-sm text-foreground leading-relaxed prose prose-sm prose-neutral max-w-none">
                  <p>
                    {typeof product.story === "string"
                      ? product.story
                      : "Коллекционный предмет с историей"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
