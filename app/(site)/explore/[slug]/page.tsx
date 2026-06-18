import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LexicalContent } from "@/components/cms/lexical-content";
import {
  ArticleCtaBlock,
  RelatedRouteBlock,
} from "@/components/cms/related-blocks";
import { RelatedSouvenirsBlock } from "@/components/souvenirs/related-souvenirs-block";
import {
  ExploreBreadcrumbs,
  ExploreSimilarMaterials,
} from "@/components/explore/explore-breadcrumbs";
import { ExploreMaterialCard } from "@/components/explore/explore-material-card";
import { JsonLd } from "@/components/seo/json-ld";
import {
  categoryPageTitle,
  exploreCategoryLabel,
  exploreCategoryMeta,
  isExploreCategorySlug,
} from "@/lib/explore-constants";
import {
  getExploreMaterial,
  getExploreMaterialsByCategory,
  getSimilarExploreMaterials,
} from "@/lib/explore";
import { articleSchema, breadcrumbSchema } from "@/lib/jsonld";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteUrl } from "@/lib/site-url";
import { getProductsForArticle } from "@/lib/souvenirs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isExploreCategorySlug(slug)) {
    const meta = exploreCategoryMeta(slug)!;
    return {
      title: categoryPageTitle(meta.label),
      description: meta.seoDescription,
      openGraph: {
        title: categoryPageTitle(meta.label),
        description: meta.seoDescription,
      },
    };
  }

  const article = await getExploreMaterial(slug);
  if (!article) return { title: "Страница не найдена" };

  const site = await getSiteSettings();
  return buildPageMetadata(
    {
      title: article.seoTitle || String(article.title),
      excerpt: String(article.excerpt || ""),
      seo: {
        title: article.seoTitle,
        description: article.seoDescription,
      },
      coverUrl: article.coverUrl,
    },
    String(article.title),
    site
  );
}

export default async function ExploreSlugPage({ params }: PageProps) {
  const { slug } = await params;

  if (isExploreCategorySlug(slug)) {
    const categoryMeta = exploreCategoryMeta(slug)!;
    const materials = await getExploreMaterialsByCategory(slug);

    return (
      <main className="pt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 mb-10"
          >
            <ArrowLeft size={12} />
            Все разделы
          </Link>

          <header className="mb-16 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Исследовать Иркутск
            </p>
            <h1 className="text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-4">
              {categoryMeta.label}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {categoryMeta.description}
            </p>
          </header>

          {materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4 border border-dashed border-border">
              <p className="text-lg text-muted-foreground">
                Материалы в этом разделе появятся совсем скоро
              </p>
              <Link
                href="/explore"
                className="text-sm text-baikal hover:underline"
              >
                Смотреть все материалы
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {materials.map((material) => (
                <ExploreMaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  const article = await getExploreMaterial(slug);
  if (!article) notFound();

  const similar = await getSimilarExploreMaterials(
    slug,
    article.category,
    3
  );
  const relatedSouvenirs = await getProductsForArticle(slug);

  const BASE_URL = getSiteUrl();
  const articleJsonLd = articleSchema({
    title: String(article.title),
    description: String(article.excerpt || ""),
    url: `${BASE_URL}/explore/${article.slug}`,
    imageUrl: article.coverUrl,
    publishedAt: article.publishedAt,
  });
  const breadcrumb = breadcrumbSchema([
    { label: "Главная", href: "/" },
    { label: "Исследовать", href: "/explore" },
    {
      label: exploreCategoryLabel(article.category),
      href: `/explore/${article.category}`,
    },
    { label: String(article.title), href: `/explore/${article.slug}` },
  ]);

  return (
    <article className="pt-24">
      <JsonLd data={[articleJsonLd, breadcrumb]} />
      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12">
        <ExploreBreadcrumbs
          items={[
            { label: "Исследовать", href: "/explore" },
            {
              label: exploreCategoryLabel(article.category),
              href: `/explore/${article.category}`,
            },
            { label: String(article.title) },
          ]}
        />

        <Link
          href={`/explore/${String(article.category)}`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 mb-10"
        >
          <ArrowLeft size={12} />
          {exploreCategoryLabel(article.category)}
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {exploreCategoryLabel(article.category)}
            </p>
            {article.readTime && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={11} />
                  {article.readTime} мин чтения
                </span>
              </>
            )}
            {article.isHiddenGem && (
              <Badge variant="ice">Неочевидное</Badge>
            )}
          </div>

          <h1 className="text-4xl lg:text-5xl font-light tracking-tight leading-[1.15] mb-6">
            {String(article.title)}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed font-serif italic">
              {String(article.excerpt)}
            </p>
          )}
        </header>

        {article.coverUrl && (
          <div className="relative aspect-video overflow-hidden bg-muted mb-12">
            <Image
              src={article.coverUrl}
              alt={String(article.title)}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {article.authorName && (
          <p className="text-sm text-muted-foreground mb-8">
            Автор: {article.authorName}
          </p>
        )}

        <LexicalContent
          data={article.content as never}
          className="prose prose-neutral max-w-none text-foreground leading-relaxed"
        />

        {article.relatedRoute && (
          <RelatedRouteBlock route={article.relatedRoute} />
        )}

        <RelatedSouvenirsBlock products={relatedSouvenirs} />

        <ExploreSimilarMaterials
          materials={similar}
          category={article.category}
        />

        <ArticleCtaBlock />
      </div>
    </article>
  );
}
