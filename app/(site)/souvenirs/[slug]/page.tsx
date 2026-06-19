import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LexicalContent } from "@/components/cms/lexical-content";
import { RelatedRouteBlock } from "@/components/cms/related-blocks";
import { MakerChip } from "@/components/souvenirs/maker-card";
import { ProductOrderForm } from "@/components/souvenirs/product-order-form";
import { JsonLd } from "@/components/seo/json-ld";
import { productSchema, breadcrumbSchema } from "@/lib/jsonld";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteUrl } from "@/lib/site-url";
import { RelatedArPostcardBlock } from "@/components/ar-postcards/related-ar-postcard-block";
import {
  formatProductPrice,
  getProductBySlug,
  getPublishedProductSlugs,
} from "@/lib/souvenirs";
import { getArPostcardByProductRelation } from "@/lib/ar-postcards";
import { ContactCtaSection } from "@/components/contact/contact-cta-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function getProduct(slug: string) {
  return getProductBySlug(slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Товар не найден" };

  const site = await getSiteSettings();
  return buildPageMetadata(
    {
      title: product.seo?.title || product.title,
      shortDescription: product.shortDescription || "",
      seo: {
        title: product.seo?.title,
        description: product.seo?.description,
        image: product.seo?.image,
      },
      gallery: product.gallery.map((g) => ({ image: { url: g.url } })),
    },
    product.title,
    site
  );
}

export default async function SouvenirProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const arPostcard = await getArPostcardByProductRelation(slug);

  const BASE_URL = getSiteUrl();
  const inStock =
    product.stockStatus === "in_stock" ||
    product.stockStatus === "pre_order" ||
    product.stockStatus === "by_request";

  const productJsonLd = productSchema({
    title: product.title,
    description: product.shortDescription || "",
    url: `${BASE_URL}/souvenirs/${product.slug}`,
    price: product.price || 0,
    imageUrl: product.imageUrl || undefined,
    sku: product.id,
    inStock,
  });
  const breadcrumb = breadcrumbSchema([
    { label: "Главная", href: "/" },
    { label: "Сувениры", href: "/souvenirs" },
    { label: product.title, href: `/souvenirs/${product.slug}` },
  ]);

  const firstRoute = product.relatedRoutes[0];

  return (
    <article className="pt-24">
      <JsonLd data={[productJsonLd, breadcrumb]} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <Link
          href="/souvenirs"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 mb-12"
        >
          <ArrowLeft size={12} />
          К сувенирам
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="flex flex-col gap-3">
            {product.gallery.length > 0 ? (
              <>
                <div className="relative aspect-square overflow-hidden bg-card border border-border">
                  <Image
                    src={product.gallery[0].url}
                    alt={product.gallery[0].alt || product.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {product.gallery.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {product.gallery.slice(1).map((item, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden bg-card border border-border"
                      >
                        <Image
                          src={item.url}
                          alt={item.alt || product.title}
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
              <div className="aspect-square bg-card border border-border flex items-center justify-center text-muted-foreground/30">
                <span className="text-6xl font-serif">—</span>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-wrap gap-2 mb-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {product.categoryLabel}
              </p>
              {product.isOwnMerch && (
                <Badge variant="outline" className="text-xs">
                  Иркпортал
                </Badge>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4 leading-snug">
              {product.title}
            </h1>

            {product.shortDescription && (
              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.shortDescription}
              </p>
            )}

            <p className="text-3xl font-light tracking-tight mb-4">
              {formatProductPrice(product)}
            </p>

            <Badge variant="outline" className="mb-6 w-fit">
              {product.stockLabel}
            </Badge>

            {product.maker && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Мастер
                </p>
                <MakerChip maker={product.maker} />
              </div>
            )}

            {product.externalLink ? (
              <a
                href={product.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 bg-foreground text-primary-foreground px-8 text-sm font-medium hover:bg-foreground/90 mb-8"
              >
                Подробнее у мастера
                <ExternalLink size={13} />
              </a>
            ) : (
              <div className="mb-10">
                <ProductOrderForm product={product} />
              </div>
            )}

            {product.cityConnectionText && (
              <div className="mb-8 p-4 border border-border bg-muted/30 text-sm leading-relaxed">
                {product.cityConnectionText}
              </div>
            )}

            {product.story != null && (
              <div className="mt-6 pt-8 border-t border-border">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  История
                </p>
                <LexicalContent
                  data={product.story as never}
                  className="prose prose-sm prose-neutral max-w-none text-foreground"
                />
              </div>
            )}
          </div>
        </div>

        {firstRoute && (
          <RelatedRouteBlock
            route={{
              slug: firstRoute.slug,
              title: firstRoute.title,
            }}
          />
        )}

        {arPostcard && <RelatedArPostcardBlock postcard={arPostcard} variant="product" />}

        {(product.relatedArticles.length > 0 || product.relatedPhotos.length > 0) && (
          <div className="mt-12 pt-10 border-t border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Связанные материалы
            </p>
            <div className="flex flex-wrap gap-3">
              {product.relatedArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/explore/${a.slug}`}
                  className="text-sm border border-border px-3 py-2 hover:bg-muted"
                >
                  {a.title}
                </Link>
              ))}
              {product.relatedPhotos.map((p) => (
                <Link
                  key={p.slug}
                  href={`/explore/photos/${p.slug}`}
                  className="text-sm border border-border px-3 py-2 hover:bg-muted"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ContactCtaSection
        variant="souvenir"
        sourceType="product"
        sourceSlug={product.slug}
        sourceTitle={product.title}
        sourceId={product.id}
        sourceBlock="product-bottom"
        productContext={{
          id: product.id,
          slug: product.slug,
          title: product.title,
          makerId: product.maker?.id,
        }}
        messengersOnly
      />
    </article>
  );
}
