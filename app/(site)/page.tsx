import type { Metadata } from "next";
import { HeroCinematic } from "@/components/sections/hero-cinematic";
import { DirectionsEditorial } from "@/components/sections/directions-editorial";
import { MapTeaser } from "@/components/sections/map-teaser";
import { ExplorePreview } from "@/components/sections/explore-preview";
import { EventsPreview } from "@/components/sections/events-preview";
import { ShopPreview } from "@/components/sections/shop-preview";
import { AboutManifesto } from "@/components/sections/about-manifesto";
import { SocialProof, type Stat, type Review } from "@/components/sections/social-proof";
import { FinalCta } from "@/components/sections/final-cta";

export const metadata: Metadata = {
  title: "Полезно про Иркутск — туристический гид и культурная платформа",
  description:
    "Иркутск и Байкал: авторские маршруты, экскурсии, событийный туризм и культурные проекты. Организация путешествий под ключ.",
  openGraph: {
    title: "Полезно про Иркутск",
    description:
      "Цифровая культурная платформа про Иркутск и Байкал. Маршруты, экскурсии, события и мерч.",
  },
};

async function getHomeData() {
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const [articlesRes, eventsRes, productsRes, reviewsRes, settings] =
      await Promise.all([
        payload.find({
          collection: "articles",
          where: { isFeatured: { equals: true } },
          limit: 4,
          sort: "-publishedAt",
        }),
        payload.find({
          collection: "events",
          where: { startDate: { greater_than_equal: new Date().toISOString() } },
          limit: 6,
          sort: "startDate",
        }),
        payload.find({
          collection: "products",
          where: { isFeatured: { equals: true } },
          limit: 4,
        }),
        payload.find({
          collection: "reviews",
          where: { isFeatured: { equals: true } },
          limit: 3,
          depth: 1,
        }),
        payload.findGlobal({ slug: "site-settings" }),
      ]);

    const stats: Stat[] = Array.isArray(settings?.stats)
      ? (settings.stats as Stat[])
      : [];

    const reviews: Review[] = reviewsRes.docs.map((r) => ({
      id: String(r.id),
      text: String(r.text),
      author: String(r.author),
      city: r.city ? String(r.city) : undefined,
      photo:
        r.photo && typeof r.photo === "object" && "url" in r.photo
          ? { url: String((r.photo as { url: string }).url) }
          : undefined,
    }));

    return {
      articles: articlesRes.docs,
      events: eventsRes.docs,
      products: productsRes.docs,
      stats,
      reviews,
    };
  } catch {
    return {
      articles: undefined,
      events: undefined,
      products: undefined,
      stats: undefined,
      reviews: undefined,
    };
  }
}

export default async function HomePage() {
  const { articles, events, products, stats, reviews } = await getHomeData();

  return (
    <>
      <HeroCinematic />
      <DirectionsEditorial />
      <MapTeaser />
      <ExplorePreview articles={articles as never} />
      <EventsPreview events={events as never} />
      <ShopPreview products={products as never} />
      <AboutManifesto />
      <SocialProof stats={stats} reviews={reviews} />
      <FinalCta />
    </>
  );
}
