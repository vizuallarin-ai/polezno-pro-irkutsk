import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { eventSchema, breadcrumbSchema } from "@/lib/jsonld";
import { EVENT_CATEGORY_LABELS } from "@/lib/content-labels";
import {
  commercialInputFromDoc,
  isPublicPublishedReady,
} from "@/lib/content-readiness";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { getSiteSettings } from "@/lib/site-settings";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

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
    const doc = result.docs[0];
    if (!doc) return null;
    if (
      !isPublicPublishedReady(
        commercialInputFromDoc("event", doc as Record<string, unknown>)
      )
    ) {
      return null;
    }
    return doc;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    if (!process.env.DATABASE_URL) return [];
    const { getPayloadClient } = await import("@/lib/payload");
    const { PUBLISHED_STATUS_WHERE } = await import("@/lib/cms-filters");
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "events",
      where: PUBLISHED_STATUS_WHERE,
      limit: 1000,
      depth: 0,
    });
    return result.docs
      .filter((doc) =>
        isPublicPublishedReady(
          commercialInputFromDoc("event", doc as Record<string, unknown>)
        )
      )
      .map((doc) => ({ slug: String(doc.slug) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  const site = await getSiteSettings();
  return buildPageMetadata(
    {
      title: String(event.title),
      description: String(event.description || ""),
      coverImage: event.coverImage as { url?: string } | undefined,
    },
    String(event.title),
    site,
    { path: `/events/${event.slug}` }
  );
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
  const numericPrice =
    event.price != null && /^\d+([.,]\d+)?$/.test(String(event.price).trim())
      ? String(event.price).trim()
      : undefined;
  const eventJsonLd = eventSchema({
    title: String(event.title),
    description: String(event.description || ""),
    url: `${BASE_URL}/events/${event.slug}`,
    startDate: String(event.startDate),
    endDate: event.endDate ? String(event.endDate) : undefined,
    location: `${String(event.venue)}${event.address ? `, ${event.address}` : ""}`,
    imageUrl: coverEvent?.url,
    offers:
      event.ticketUrl && numericPrice
        ? { price: numericPrice, url: String(event.ticketUrl) }
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

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">
            {EVENT_CATEGORY_LABELS[String(event.category)] ||
              String(event.category)}
          </Badge>
        </div>

        <h1 className="text-3xl lg:text-4xl font-medium text-foreground mb-4">
          {String(event.title)}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDate(String(event.startDate))}
            {event.endDate ? ` — ${formatDate(String(event.endDate))}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} />
            {String(event.venue)}
            {event.address ? `, ${String(event.address)}` : ""}
          </span>
        </div>

        {cover?.url && (
          <div className="relative aspect-[16/10] overflow-hidden bg-muted mb-8 border border-border">
            <Image
              src={cover.url}
              alt={cover.alt || String(event.title)}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        {event.description && (
          <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">
            {String(event.description)}
          </p>
        )}

        {event.ticketUrl && (
          <a
            href={String(event.ticketUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Билеты / регистрация
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </article>
  );
}
