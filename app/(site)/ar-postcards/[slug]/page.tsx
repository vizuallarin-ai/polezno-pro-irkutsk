import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { LexicalContent } from "@/components/cms/lexical-content";
import { RelatedRouteBlock } from "@/components/cms/related-blocks";
import { ArPostcardPreorderForm } from "@/components/ar-postcards/ar-postcard-preorder-form";
import { PostcardEffectPlayer } from "@/components/ar-postcards/postcard-effect-player";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/jsonld";
import { PHOTO_RIGHTS_LABELS } from "@/lib/content-labels";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteUrl } from "@/lib/site-url";
import {
  getArPostcardBySlug,
  getPublishedArPostcardSlugs,
} from "@/lib/ar-postcards";
import { effectTypeLabel } from "@/lib/ar-postcard-adapter";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedArPostcardSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const postcard = await getArPostcardBySlug(slug);
  if (!postcard) return { title: "Открытка не найдена", robots: { index: false } };

  const site = await getSiteSettings();
  return buildPageMetadata(
    {
      title: postcard.seo?.title || postcard.title,
      shortDescription: postcard.shortDescription || "",
      seo: {
        title: postcard.seo?.title,
        description: postcard.seo?.description,
        image: postcard.seo?.image,
      },
      coverUrl: postcard.coverImageUrl || postcard.postcardImageUrl || undefined,
    },
    postcard.title,
    site
  );
}

export default async function ArPostcardDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const postcard = await getArPostcardBySlug(slug);
  if (!postcard) notFound();

  const BASE_URL = getSiteUrl();
  const breadcrumb = breadcrumbSchema([
    { label: "Главная", href: "/" },
    { label: "AR-открытки", href: "/ar-postcards" },
    { label: postcard.title, href: `/ar-postcards/${postcard.slug}` },
  ]);

  const placeLabel = [postcard.street, postcard.place, postcard.year]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="pt-24">
      <JsonLd data={[breadcrumb]} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <Link
          href="/ar-postcards"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 mb-12"
        >
          <ArrowLeft size={12} />
          К каталогу открыток
        </Link>

        {postcard.isDiscontinued && (
          <div className="mb-8 border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            Эта открытка снята с печати, но цифровая история остаётся доступной.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            {postcard.postcardImageUrl && (
              <div className="relative aspect-[4/5] mb-6 overflow-hidden border border-border bg-muted">
                <Image
                  src={postcard.postcardImageUrl}
                  alt={postcard.postcardImageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            )}
            <PostcardEffectPlayer postcard={postcard} />
          </div>

          <div className="flex flex-col lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              {effectTypeLabel(postcard.effectType)}
            </p>
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4 leading-snug">
              {postcard.title}
            </h1>
            {postcard.shortDescription && (
              <p className="text-muted-foreground leading-relaxed mb-6">
                {postcard.shortDescription}
              </p>
            )}
            {placeLabel && (
              <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                <MapPin size={14} className="text-baikal shrink-0" />
                {placeLabel}
              </p>
            )}

            <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-8 border-t border-border pt-6">
              {postcard.authorName && (
                <>
                  <dt className="text-muted-foreground">Автор</dt>
                  <dd>{postcard.authorName}</dd>
                </>
              )}
              {postcard.sourceName && (
                <>
                  <dt className="text-muted-foreground">Источник</dt>
                  <dd>{postcard.sourceName}</dd>
                </>
              )}
              <dt className="text-muted-foreground">Права</dt>
              <dd>{PHOTO_RIGHTS_LABELS[postcard.rightsType] ?? postcard.rightsType}</dd>
            </dl>

            {postcard.fullDescription != null && (
              <div className="mb-10 prose prose-sm prose-neutral max-w-none text-foreground">
                <LexicalContent data={postcard.fullDescription as never} />
              </div>
            )}

            <ArPostcardPreorderForm postcard={postcard} sourceBlock="detail-preorder" />
          </div>
        </div>

        {postcard.relatedRoute && (
          <RelatedRouteBlock
            route={{
              slug: postcard.relatedRoute.slug,
              title: postcard.relatedRoute.title,
            }}
          />
        )}

        {(postcard.relatedMaterial ||
          postcard.relatedPhoto ||
          postcard.relatedProduct) && (
          <div className="mt-12 pt-10 border-t border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Связанные материалы
            </p>
            <div className="flex flex-wrap gap-3">
              {postcard.relatedProduct && (
                <Link
                  href={`/souvenirs/${postcard.relatedProduct.slug}`}
                  className="text-sm border border-border px-3 py-2 hover:bg-muted"
                >
                  Сувенир: {postcard.relatedProduct.title}
                </Link>
              )}
              {postcard.relatedPhoto && (
                <Link
                  href={`/explore/photos/${postcard.relatedPhoto.slug}`}
                  className="text-sm border border-border px-3 py-2 hover:bg-muted"
                >
                  Фото: {postcard.relatedPhoto.title}
                </Link>
              )}
              {postcard.relatedMaterial && (
                <Link
                  href={`/explore/${postcard.relatedMaterial.slug}`}
                  className="text-sm border border-border px-3 py-2 hover:bg-muted"
                >
                  Материал: {postcard.relatedMaterial.title}
                </Link>
              )}
              {postcard.relatedRoute && (
                <Link
                  href={`/map/${postcard.relatedRoute.slug}`}
                  className="text-sm border border-border px-3 py-2 hover:bg-muted"
                >
                  Маршрут: {postcard.relatedRoute.title}
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="mt-16 pt-10 border-t border-border">
          <h2 className="text-lg font-medium mb-4">Вопрос по открытке?</h2>
          <ArPostcardPreorderForm
            postcard={postcard}
            sourceType="ar_postcard_question"
            sourceBlock="detail-question"
          />
        </div>

        <div className="mt-16 bg-card p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium mb-1">Хотите пройти этим маршрутом?</p>
            <p className="text-sm text-muted-foreground">
              Спланируем прогулку или программу для вас и гостей.
            </p>
          </div>
          <Link
            href="/business"
            className="inline-flex h-10 items-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 shrink-0"
          >
            Для бизнеса и гостей
          </Link>
        </div>
      </div>
    </article>
  );
}
