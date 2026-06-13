import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { LexicalContent } from "@/components/cms/lexical-content";
import {
  ArticleCtaBlock,
  RelatedExcursionBlock,
  RelatedRouteBlock,
} from "@/components/cms/related-blocks";
import { articleSchema, breadcrumbSchema } from "@/lib/jsonld";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { getSiteSettings } from "@/lib/site-settings";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/content-labels";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Category definitions ────────────────────────────────────────────────────
const CATEGORY_META: Record<
  string,
  { label: string; description: string; seoDescription: string }
> = {
  sights: {
    label: "Что посмотреть",
    description: "Достопримечательности, музеи и обязательные места Иркутска",
    seoDescription:
      "Что посмотреть в Иркутске: достопримечательности, музеи, исторические места.",
  },
  walks: {
    label: "Где гулять",
    description: "Набережные, парки и пешеходные маршруты",
    seoDescription:
      "Где гулять в Иркутске: набережные, бульвары, парки и лучшие пешеходные маршруты.",
  },
  food: {
    label: "Где поесть",
    description: "Рестораны, кафе, рынки и гастрономия Иркутска",
    seoDescription:
      "Где поесть в Иркутске: лучшие рестораны, кафе и гастрономические места.",
  },
  stay: {
    label: "Где остановиться",
    description: "Отели, хостелы и апартаменты с характером",
    seoDescription:
      "Где остановиться в Иркутске: лучшие отели, уютные хостелы и апартаменты.",
  },
  history: {
    label: "История города",
    description: "От казачьего острога до культурной столицы Сибири",
    seoDescription:
      "История Иркутска: декабристы, купечество, советский период.",
  },
  facts: {
    label: "Интересные факты",
    description: "Неочевидное об Иркутске",
    seoDescription: "Интересные факты об Иркутске, которые удивят даже местных.",
  },
  baikal: {
    label: "Байкал рядом",
    description: "Что и как смотреть на Байкале из Иркутска",
    seoDescription:
      "Байкал из Иркутска: как добраться, что посмотреть, когда ехать.",
  },
  hidden: {
    label: ARTICLE_CATEGORY_LABELS.hidden,
    description: "Места, которые знают только местные",
    seoDescription:
      "Секретные места Иркутска — локации вне путеводителей.",
  },
  gastronomy: {
    label: "Гастрономия",
    description: "Вкусы и запахи Иркутска и Байкала",
    seoDescription:
      "Гастрономический Иркутск: омуль, позы, местные продукты и лучшие рестораны.",
  },
  architecture: {
    label: "Архитектура",
    description: "Деревянное зодчество, модерн и советский конструктивизм",
    seoDescription:
      "Архитектура Иркутска: деревянные дома с резными наличниками и купеческие особняки.",
  },
  excursions: {
    label: "Экскурсии",
    description: "Городские, исторические и гастрономические прогулки",
    seoDescription:
      "Экскурсии по Иркутску: авторские маршруты, исторические и гастрономические туры.",
  },
};

// ─── Data fetchers ────────────────────────────────────────────────────────────
async function getArticle(slug: string) {
  try {
    if (!process.env.DATABASE_URL) return null;
    const { getPayloadClient } = await import("@/lib/payload");
    const { ARTICLE_PUBLISHED_WHERE } = await import("@/lib/cms-filters");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "articles",
      where: {
        and: [{ slug: { equals: slug } }, ARTICLE_PUBLISHED_WHERE],
      },
      limit: 1,
      depth: 2,
    });
    return result.docs[0] || null;
  } catch {
    return null;
  }
}

async function getArticlesByCategory(category: string) {
  try {
    if (!process.env.DATABASE_URL) return [];
    const { getPayloadClient } = await import("@/lib/payload");
    const { ARTICLE_PUBLISHED_WHERE } = await import("@/lib/cms-filters");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "articles",
      where: {
        and: [{ category: { equals: category } }, ARTICLE_PUBLISHED_WHERE],
      },
      limit: 50,
      sort: "-publishedAt",
      depth: 1,
    });
    return result.docs;
  } catch {
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Is it a category?
  const categoryMeta = CATEGORY_META[slug];
  if (categoryMeta) {
    return {
      title: `${categoryMeta.label} в Иркутске`,
      description: categoryMeta.seoDescription,
    };
  }

  // Is it an article?
  const article = await getArticle(slug);
  if (!article) return { title: "Страница не найдена" };

  const site = await getSiteSettings();
  return buildPageMetadata(
    {
      title: String(article.title),
      excerpt: String(article.excerpt || ""),
      seo: article.seo as {
        title?: string;
        description?: string;
        image?: { url?: string } | null;
      },
      coverImage: article.coverImage as { url?: string } | undefined,
      coverUrl: article.coverUrl ? String(article.coverUrl) : undefined,
    },
    String(article.title),
    site
  );
}

function articleCoverUrl(article: {
  coverImage?: { url?: string } | null;
  coverUrl?: string | null;
}): string | undefined {
  if (article.coverImage && typeof article.coverImage === "object" && article.coverImage.url) {
    return String(article.coverImage.url);
  }
  if (article.coverUrl) return String(article.coverUrl);
  return undefined;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ExploreSlugPage({ params }: PageProps) {
  const { slug } = await params;

  // ── Category view ──────────────────────────────────────────────────────────
  const categoryMeta = CATEGORY_META[slug];
  if (categoryMeta) {
    const articles = await getArticlesByCategory(slug);

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

          <div className="mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Исследовать Иркутск
            </p>
            <h1 className="text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-4">
              {categoryMeta.label}
            </h1>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              {categoryMeta.description}
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
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
              {articles.map((article) => {
                const cover = article.coverImage as
                  | { url?: string; alt?: string }
                  | undefined;
                return (
                  <Link
                    key={article.id}
                    href={`/explore/${article.slug}`}
                    className="group flex flex-col"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted mb-4">
                      {cover?.url && (
                        <Image
                          src={cover.url}
                          alt={cover.alt || String(article.title)}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                      )}
                      {article.isHiddenGem && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="ice">Hidden gem</Badge>
                        </div>
                      )}
                    </div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      {article.readTime ? `${article.readTime} мин` : ""}
                    </p>
                    <h2 className="text-base font-medium leading-snug text-foreground group-hover:text-baikal transition-colors duration-200 mb-2">
                      {String(article.title)}
                    </h2>
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {String(article.excerpt)}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    );
  }

  // ── Article view ───────────────────────────────────────────────────────────
  const article = await getArticle(slug);
  if (!article) notFound();

  const coverUrl = articleCoverUrl({
    coverImage: article.coverImage as { url?: string; alt?: string } | undefined,
    coverUrl: article.coverUrl ? String(article.coverUrl) : undefined,
  });
  const coverAlt =
    (article.coverImage as { alt?: string } | undefined)?.alt || String(article.title);

  const relatedRoute =
    article.relatedRoute &&
    typeof article.relatedRoute === "object" &&
    "slug" in article.relatedRoute
      ? (article.relatedRoute as {
          slug: string;
          title: string;
          description?: string;
          coverImage?: { url?: string; alt?: string };
        })
      : null;

  const relatedExcursion =
    article.relatedExcursion &&
    typeof article.relatedExcursion === "object" &&
    "slug" in article.relatedExcursion
      ? (article.relatedExcursion as {
          slug: string;
          title: string;
          shortDescription?: string;
          cover?: { url?: string };
          coverUrl?: string;
          price?: number;
        })
      : null;

  const BASE_URL =
    (await import("@/lib/site-url")).getSiteUrl();
  const articleJsonLd = articleSchema({
    title: String(article.title),
    description: String(article.excerpt || ""),
    url: `${BASE_URL}/explore/${article.slug}`,
    imageUrl: coverUrl,
    publishedAt: article.publishedAt ? String(article.publishedAt) : undefined,
    updatedAt: String(article.updatedAt),
  });
  const breadcrumb = breadcrumbSchema([
    { label: "Главная", href: "/" },
    { label: "Исследовать", href: "/explore" },
    {
      label: ARTICLE_CATEGORY_LABELS[String(article.category)] || "Статьи",
      href: `/explore/${article.category}`,
    },
    { label: String(article.title), href: `/explore/${article.slug}` },
  ]);

  return (
    <article className="pt-24">
      <JsonLd data={[articleJsonLd, breadcrumb]} />
      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12">
        <Link
          href={`/explore/${String(article.category)}`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 mb-10"
        >
          <ArrowLeft size={12} />
          {ARTICLE_CATEGORY_LABELS[String(article.category)] || "Назад"}
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {ARTICLE_CATEGORY_LABELS[String(article.category)] ||
                String(article.category)}
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
            {article.isHiddenGem && <Badge variant="ice">Hidden gem</Badge>}
            {article.season && article.season !== "all" && (
              <Badge variant="outline" className="text-xs capitalize">
                {
                  { winter: "Зима", spring: "Весна", summer: "Лето", autumn: "Осень" }[
                    String(article.season)
                  ]
                }
              </Badge>
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

        {coverUrl && (
          <div className="relative aspect-video overflow-hidden bg-muted mb-12">
            <Image
              src={coverUrl}
              alt={coverAlt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {article.author && (
          <p className="text-sm text-muted-foreground mb-8">
            Автор: {String(article.author)}
          </p>
        )}

        <LexicalContent
          data={article.content as never}
          className="prose prose-neutral max-w-none text-foreground leading-relaxed"
        />
        {!article.content && (
          <p className="text-muted-foreground">
            Содержание статьи будет добавлено в CMS.
          </p>
        )}

        {Array.isArray(article.relatedPlaces) &&
          article.relatedPlaces.length > 0 && (
            <aside className="mt-16 pt-10 border-t border-border">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                <MapPin size={16} className="text-baikal" />
                Упомянутые места
              </h2>
              <ul className="flex flex-col gap-3">
                {(
                  article.relatedPlaces as Array<{
                    id: string;
                    title: string;
                    address?: string;
                    isLocalGem?: boolean;
                  }>
                ).map((place) => (
                  <li
                    key={place.id}
                    className="flex items-start justify-between gap-4 py-3 border-b border-border/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{place.title}</p>
                      {place.address && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {place.address}
                        </p>
                      )}
                    </div>
                    {place.isLocalGem && (
                      <Badge variant="ice" className="shrink-0 text-xs">
                        Место локалов
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </aside>
          )}

        {relatedRoute && <RelatedRouteBlock route={relatedRoute} />}
        {relatedExcursion && (
          <RelatedExcursionBlock excursion={relatedExcursion} />
        )}

        <ArticleCtaBlock
          ctaText={article.ctaText ? String(article.ctaText) : undefined}
          ctaLink={article.ctaLink ? String(article.ctaLink) : undefined}
        />
      </div>
    </article>
  );
}
