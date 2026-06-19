import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RouteDetailClient } from "@/components/routes/route-detail-client";
import { ContactCtaSection } from "@/components/contact/contact-cta-section";
import { getExcursionForRoute } from "@/lib/excursions";
import { getRoutePageData, getPublishedRouteSlugs } from "@/lib/routes";
import { getProductsForRoute } from "@/lib/souvenirs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedRouteSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { route } = await getRoutePageData(slug);
  if (!route) return { title: "Маршрут не найден" };

  return {
    title: `${route.title} — маршрут по Иркутску`,
    description: route.description,
  };
}

export default async function RouteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [{ route, similar }, relatedExcursion, relatedSouvenirs] = await Promise.all([
    getRoutePageData(slug),
    getExcursionForRoute(slug),
    getProductsForRoute(slug),
  ]);

  if (!route) notFound();

  return (
    <>
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
        showForm={false}
      />
    </>
  );
}
