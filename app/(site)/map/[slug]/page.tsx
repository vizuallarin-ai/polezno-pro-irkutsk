import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RouteDetailClient } from "@/components/routes/route-detail-client";
import { getExcursionForRoute } from "@/lib/excursions";
import { getRoutePageData } from "@/lib/routes";
import { getProductsForRoute } from "@/lib/souvenirs";
import { DEMO_ROUTES } from "@/lib/data/routes";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DEMO_ROUTES.map((route) => ({ slug: route.slug }));
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
    <RouteDetailClient
      route={route}
      similar={similar}
      relatedExcursionSlug={relatedExcursion?.slug ?? null}
      relatedSouvenirs={relatedSouvenirs}
    />
  );
}
