import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RouteDetailClient } from "@/components/routes/route-detail-client";
import { ContactCtaSection } from "@/components/contact/contact-cta-section";
import { RouteViewTracker } from "@/components/analytics/view-trackers";
import { JsonLd } from "@/components/seo/json-ld";
import { getExcursionForRoute } from "@/lib/excursions";
import { getRoutePageData, getPublishedRouteSlugs } from "@/lib/routes";
import { getProductsForRoute } from "@/lib/souvenirs";
import { breadcrumbSchema, touristTripSchema } from "@/lib/jsonld";
import { getSiteUrl } from "@/lib/site-url";
import { buildPageMetadata } from "@/lib/seo-metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Unknown slugs 404 at the routing layer (avoids streamed soft-404 200). */
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPublishedRouteSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { route } = await getRoutePageData(slug);
  if (!route) notFound();

  return buildPageMetadata(
    {
      title: route.title,
      description: route.description,
      coverUrl: route.coverImage,
    },
    `${route.title} — маршрут по Иркутску`,
    undefined,
    { path: `/map/${route.slug}` }
  );
}

export default async function RouteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [{ route, similar }, relatedExcursion, relatedSouvenirs] = await Promise.all([
    getRoutePageData(slug),
    getExcursionForRoute(slug),
    getProductsForRoute(slug),
  ]);

  if (!route) notFound();

  const siteUrl = getSiteUrl();
  const coverUrl = route.coverImage
    ? route.coverImage.startsWith("http")
      ? route.coverImage
      : `${siteUrl}${route.coverImage}`
    : undefined;

  return (
    <>
      <JsonLd
        data={[
          touristTripSchema({
            title: route.title,
            description: route.description,
            url: `${siteUrl}/map/${route.slug}`,
            duration: route.duration,
            imageUrl: coverUrl,
          }),
          breadcrumbSchema([
            { label: "Главная", href: "/" },
            { label: "Маршруты", href: "/map" },
            { label: route.title, href: `/map/${route.slug}` },
          ]),
        ]}
      />
      <RouteViewTracker slug={route.slug} title={route.title} />
      <RouteDetailClient
        route={route}
        similar={similar}
        relatedExcursionSlug={relatedExcursion?.slug ?? null}
        relatedSouvenirs={relatedSouvenirs}
      />
      <ContactCtaSection
        variant="route_detail"
        sourceType="route"
        sourceSlug={route.slug}
        sourceTitle={route.title}
        sourceId={route.id}
        sourceBlock="route-detail-cta"
        routeContext={{ id: route.id, slug: route.slug, title: route.title }}
        compact
        showForm
        formId="lead-form"
      />
    </>
  );
}
