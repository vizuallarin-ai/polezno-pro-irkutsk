import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { eventSchema, breadcrumbSchema } from "@/lib/jsonld";
import { EVENT_CATEGORY_LABELS } from "@/lib/content-labels";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getEvent(slug: string) {
  try {
    if (!process.env.DATABASE_URL) return null;
    const { getPayloadClient } = await import("@/lib/payload");
    const { PUBLISHED_STATUS_WHERE } = await import("@/lib/cms-filters");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "events",
      where: {
        and: [{ slug: { equals: slug } }, PUBLISHED_STATUS_WHERE],
      },
      limit: 1,
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
  const event = await getEvent(slug);
  if (!event) return { title: "Событие не найдено" };
  return {
    title: String(event.title),
    description: String(event.description || ""),
  };
}


function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) notFound();

  const cover = event.coverImage as { url?: string; alt?: string } | undefined;

  const { getSiteUrl } = await import("@/lib/site-url");
  const BASE_URL = getSiteUrl();
  const coverEvent = event.coverImage as { url?: string } | undefined;
  const eventJsonLd = eventSchema({
    title: String(event.title),
    description: String(event.description || ""),
    url: `${BASE_URL}/events/${event.slug}`,
    startDate: String(event.startDate),
    endDate: event.endDate ? String(event.endDate) : undefined,
    location: `${String(event.venue)}${event.address ? `, ${event.address}` : ""}`,
    imageUrl: coverEvent?.url,
    offers: event.ticketUrl
      ? { price: String(event.price || "по запросу"), url: String(event.ticketUrl) }
      : undefined,
  });
  const breadcrumbEvent = breadcrumbSchema([
    { label: "Главная", href: "/" },
    { label: "События", href: "/events" },
    { label: String(event.title), href: `/events/${event.slug}` },
  ]);

  return (
    <article className="pt-24">
      <JsonLd data={[eventJsonLd, breadcrumbEvent]} />
      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200 mb-10"
        >
          <ArrowLeft size={12} />
          Все события
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant="outline">
              {EVENT_CATEGORY_LABELS[String(event.category)] || String(event.category)}
            </Badge>
            {event.isFeatured && (
              <Badge variant="baikal">Рекомендуем</Badge>
            )}
          </div>

          <h1 className="text-4xl lg:text-5xl font-light tracking-tight leading-[1.15] mb-6">
            {String(event.title)}
          </h1>

          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar size={14} className="shrink-0 text-baikal" />
              {formatDate(String(event.startDate))}
              {event.endDate && ` — ${formatDate(String(event.endDate))}`}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin size={14} className="shrink-0 text-baikal" />
              {String(event.venue)}
              {event.address && `, ${event.address}`}
            </p>
            {event.price && (
              <p className="text-sm font-medium text-foreground">
                Стоимость: {String(event.price)}
              </p>
            )}
          </div>
        </header>

        {cover?.url && (
          <div className="relative aspect-video overflow-hidden bg-muted mb-12">
            <Image
              src={cover.url}
              alt={cover.alt || String(event.title)}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {event.description && (
          <div className="prose prose-neutral max-w-none mb-12">
            <p className="text-base text-foreground leading-relaxed">
              {String(event.description)}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          {event.ticketUrl && (
            <a
              href={String(event.ticketUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 bg-foreground text-primary-foreground px-8 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
            >
              Купить билет
              <ExternalLink size={13} />
            </a>
          )}
          {event.hasApplicationForm && (
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center px-8 text-sm font-medium border border-border hover:bg-muted transition-colors duration-200"
            >
              Зарегистрироваться
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
