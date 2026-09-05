import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Compass } from "lucide-react";
import { resolveExploreCommercialHref } from "@/lib/cta-constants";

type RouteRef = {
  slug: string;
  title: string;
  description?: string | null;
  coverImage?: { url?: string; alt?: string } | null;
};

type ExcursionRef = {
  slug: string;
  title: string;
  shortDescription?: string | null;
  cover?: { url?: string } | null;
  coverUrl?: string | null;
  price?: number | null;
};

export function RelatedRouteBlock({ route }: { route: RouteRef }) {
  const cover = route.coverImage?.url;

  return (
    <aside className="mt-16 pt-10 border-t border-border">
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
        <MapPin size={16} className="text-baikal" />
        Связанный маршрут
      </h2>
      <Link
        href={`/map/${route.slug}`}
        className="group flex gap-4 items-start border border-border p-4 hover:bg-card transition-colors duration-200"
      >
        {cover && (
          <div className="relative w-24 h-24 shrink-0 overflow-hidden bg-muted">
            <Image
              src={cover}
              alt={route.coverImage?.alt || route.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground group-hover:text-baikal transition-colors">
            {route.title}
          </p>
          {route.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {route.description}
            </p>
          )}
        </div>
        <ArrowRight
          size={14}
          className="shrink-0 text-muted-foreground group-hover:text-baikal mt-1"
        />
      </Link>
    </aside>
  );
}

export function RelatedExcursionBlock({
  excursion,
}: {
  excursion: ExcursionRef;
}) {
  const cover = excursion.cover?.url || excursion.coverUrl;

  return (
    <aside className="mt-16 pt-10 border-t border-border">
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Compass size={16} className="text-baikal" />
        Экскурсия по теме
      </h2>
      <Link
        href={`/excursions/${excursion.slug}`}
        className="group flex gap-4 items-start border border-border p-4 hover:bg-card transition-colors duration-200"
      >
        {cover && (
          <div className="relative w-24 h-24 shrink-0 overflow-hidden bg-muted">
            <Image src={cover} alt={excursion.title} fill className="object-cover" sizes="96px" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground group-hover:text-baikal transition-colors">
            {excursion.title}
          </p>
          {excursion.shortDescription && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {excursion.shortDescription}
            </p>
          )}
          {excursion.price != null && excursion.price > 0 && (
            <p className="text-sm font-medium mt-2">
              от {excursion.price.toLocaleString("ru-RU")} ₽
            </p>
          )}
        </div>
        <ArrowRight
          size={14}
          className="shrink-0 text-muted-foreground group-hover:text-baikal mt-1"
        />
      </Link>
    </aside>
  );
}

export function ArticleCtaBlock({
  ctaText,
  ctaLink,
  relatedRouteSlug,
  relatedExcursionSlug,
  articleSlug,
  hasExperiences = false,
}: {
  ctaText?: string | null;
  ctaLink?: string | null;
  relatedRouteSlug?: string | null;
  relatedExcursionSlug?: string | null;
  articleSlug?: string | null;
  hasExperiences?: boolean;
}) {
  const resolved = resolveExploreCommercialHref({
    relatedRouteSlug,
    relatedExcursionSlug,
    articleSlug,
    ctaLink,
  });

  const isDesire =
    resolved.kind === "route" || resolved.kind === "excursion";
  const text =
    ctaText?.trim() ||
    (isDesire
      ? "Хотите увидеть это вживую?"
      : hasExperiences
        ? "Готовы подобрать прогулку под ваш визит?"
        : "Хотите пройти Иркутск с автором навигатора?");
  const support = isDesire
    ? "Откройте связанный опыт или оставьте заявку на прогулку с Алёной."
    : hasExperiences
      ? "Можно сначала посмотреть маршруты — или сразу попросить подобрать формат."
      : "Маршруты на сайте ещё наполняются. Заявка поможет согласовать индивидуальную прогулку.";

  return (
    <div className="mt-16 bg-card p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <p className="text-sm font-medium mb-1">{text}</p>
        <p className="text-sm text-muted-foreground">{support}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
        {hasExperiences && !isDesire ? (
          <Link
            href="/map"
            className="inline-flex h-10 items-center justify-center gap-2 border border-border px-6 text-sm font-medium hover:bg-muted transition-colors duration-200"
          >
            Смотреть маршруты
          </Link>
        ) : null}
        <Link
          href={resolved.href}
          className="inline-flex h-10 items-center justify-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
        >
          {resolved.label}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
