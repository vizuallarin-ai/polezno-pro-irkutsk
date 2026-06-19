import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LexicalContent } from "@/components/cms/lexical-content";
import { ProductCard } from "@/components/souvenirs/product-card";
import { VISUAL_EMPTY_COPY } from "@/lib/visual-assets";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { getSiteSettings } from "@/lib/site-settings";
import {
  getMakerBySlug,
  getProductsByMaker,
  getPublishedMakerSlugs,
} from "@/lib/souvenirs";
import { ContactCtaSection } from "@/components/contact/contact-cta-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedMakerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const maker = await getMakerBySlug(slug);
  if (!maker) return { title: "Мастер не найден" };

  const site = await getSiteSettings();
  return buildPageMetadata(
    {
      title: maker.seo?.title || `${maker.title} — мастер Иркутска`,
      shortDescription: maker.shortDescription,
      seo: {
        title: maker.seo?.title,
        description: maker.seo?.description,
        image: maker.seo?.image,
      },
      coverUrl: maker.coverUrl || maker.avatarUrl || undefined,
    },
    maker.title,
    site
  );
}

export default async function MakerDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const maker = await getMakerBySlug(slug);
  if (!maker) notFound();

  const products = await getProductsByMaker(maker.id);
  const cover = maker.coverUrl || maker.avatarUrl;

  return (
    <article className="pt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <Link
          href="/souvenirs"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground mb-10"
        >
          <ArrowLeft size={12} />
          К сувенирам
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted border border-border">
            {cover ? (
              <Image
                src={cover}
                alt={maker.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-5xl font-serif text-muted-foreground/30">
                {maker.title.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">{maker.craftLabel}</Badge>
              {maker.advertisingLabelNeeded && (
                <Badge variant="secondary">Партнёрское размещение</Badge>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-light mb-4">{maker.title}</h1>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {maker.shortDescription}
            </p>
            {(maker.city || maker.district) && (
              <p className="text-sm text-muted-foreground mb-6">
                {[maker.city, maker.district].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              {maker.websiteUrl && (
                <a
                  href={maker.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-baikal hover:underline"
                >
                  Сайт
                </a>
              )}
              {maker.telegram && (
                <a
                  href={maker.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-baikal hover:underline"
                >
                  Telegram
                </a>
              )}
            </div>
            {maker.legalNote && (
              <p className="text-xs text-muted-foreground mt-6 border-l-2 border-border pl-3">
                {maker.legalNote}
              </p>
            )}
          </div>
        </div>

        {maker.story != null && (
          <div className="max-w-3xl mb-16">
            <h2 className="text-lg font-medium mb-4">О мастере</h2>
            <LexicalContent
              data={maker.story as never}
              className="prose prose-neutral max-w-none"
            />
          </div>
        )}

        {products.length > 0 && (
          <section>
            <h2 className="text-xl font-medium mb-8">Товары в каталоге</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {products.length === 0 && (
          <p className="text-muted-foreground text-sm border border-dashed border-border p-8 text-center">
            {VISUAL_EMPTY_COPY.souvenirsMaker}{" "}
            <Link href="/contact" className="text-baikal hover:underline">
              Напишите нам
            </Link>
            , если хотите узнать о наличии.
          </p>
        )}
      </div>

      <ContactCtaSection
        variant="maker"
        sourceType="maker"
        sourceSlug={maker.slug}
        sourceTitle={maker.title}
        sourceId={maker.id}
        sourceBlock="maker-detail"
      />
    </article>
  );
}
