import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RelatedRouteBlock } from "@/components/cms/related-blocks";
import {
  EXCURSION_FORMAT_LABELS,
  excursionCoverUrl,
  formatExcursionDuration,
  getExcursionBySlug,
} from "@/lib/excursions";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { getSiteSettings } from "@/lib/site-settings";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const excursion = await getExcursionBySlug(slug);
  if (!excursion) return { title: "Экскурсия не найдена" };
  const site = await getSiteSettings();
  return buildPageMetadata(
    {
      title: excursion.title,
      shortDescription: excursion.shortDescription,
      cover: excursion.cover,
      coverUrl: excursion.coverUrl,
    },
    excursion.title,
    site
  );
}

export default async function ExcursionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const excursion = await getExcursionBySlug(slug);

  if (!excursion) notFound();

  const cover = excursionCoverUrl(excursion);
  const showPrice =
    !excursion.priceOnRequest &&
    excursion.price != null &&
    excursion.price > 0;

  return (
    <article className="pt-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12">
        <Link
          href="/excursions"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Все экскурсии
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">
            {EXCURSION_FORMAT_LABELS[excursion.format] || excursion.format}
          </Badge>
          {excursion.duration != null && (
            <Badge variant="outline" className="gap-1">
              <Clock size={12} />
              {formatExcursionDuration(excursion.duration)}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl lg:text-4xl font-medium text-foreground mb-4">
          {excursion.title}
        </h1>

        {cover && (
          <div className="relative aspect-[16/10] overflow-hidden bg-muted mb-8 border border-border">
            <Image
              src={cover}
              alt={excursion.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <p className="text-muted-foreground leading-relaxed mb-6">
          {excursion.shortDescription}
        </p>

        {excursion.fullDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">
            {excursion.fullDescription}
          </p>
        )}

        <dl className="flex flex-wrap gap-6 text-sm mb-10 pb-10 border-b border-border">
          {showPrice ? (
            <div>
              <dt className="text-muted-foreground mb-1">Цена</dt>
              <dd className="font-medium">
                от {excursion.price!.toLocaleString("ru-RU")} ₽
              </dd>
            </div>
          ) : (
            <div>
              <dt className="text-muted-foreground mb-1">Цена</dt>
              <dd className="font-medium">По запросу</dd>
            </div>
          )}
          {excursion.groupSize && (
            <div>
              <dt className="text-muted-foreground mb-1">Группа</dt>
              <dd className="font-medium">{excursion.groupSize}</dd>
            </div>
          )}
        </dl>

        {excursion.includes && excursion.includes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">
              Включено
            </h2>
            <ul className="list-disc pl-5 text-sm text-foreground space-y-1">
              {excursion.includes.map((item, i) => (
                <li key={i}>{item.item}</li>
              ))}
            </ul>
          </div>
        )}

        {excursion.excludes && excursion.excludes.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">
              Не включено
            </h2>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              {excursion.excludes.map((item, i) => (
                <li key={i}>{item.item}</li>
              ))}
            </ul>
          </div>
        )}

        {excursion.relatedRoutes?.map((route) => (
          <RelatedRouteBlock key={route.slug} route={route} />
        ))}

        <Link
          href={`/program?excursion=${excursion.slug}`}
          className="inline-flex h-11 items-center justify-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 mt-8"
        >
          Обсудить дату
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
