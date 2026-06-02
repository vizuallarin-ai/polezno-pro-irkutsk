import type { Metadata } from "next";
import { HeroCinematic } from "@/components/sections/hero-cinematic";
import { ScenarioPicker } from "@/components/sections/scenario-picker";
import { DirectionsEditorial } from "@/components/sections/directions-editorial";
import { MapTeaser } from "@/components/sections/map-teaser";
import { ExplorePreview } from "@/components/sections/explore-preview";
import { BoostyTeaser } from "@/components/sections/boosty-teaser";
import { ShopPreview } from "@/components/sections/shop-preview";
import { SocialProof, type Stat, type Review } from "@/components/sections/social-proof";
import { FinalCta } from "@/components/sections/final-cta";

export const metadata: Metadata = {
  title: "Полезно про Иркутск — авторский навигатор по городу",
  description:
    "Маршруты, экскурсии и материалы об Иркутске и Байкале от местного автора. Без туристических штампов.",
  openGraph: {
    title: "Полезно про Иркутск",
    description:
      "Авторский навигатор по Иркутску: маршруты, экскурсии, медиа и клуб на Boosty.",
  },
};

async function getHomeData() {
  try {
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();

    const [articlesRes, productsRes, reviewsRes, settings] =
      await Promise.all([
        payload.find({
          collection: "articles",
          where: { isFeatured: { equals: true } },
          limit: 4,
          sort: "-publishedAt",
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
      products: productsRes.docs,
      stats,
      reviews,
    };
  } catch {
    return {
      articles: undefined,
      products: undefined,
      stats: undefined,
      reviews: undefined,
    };
  }
}

export default async function HomePage() {
  const { articles, products, stats, reviews } = await getHomeData();

  return (
    <>
      <HeroCinematic />
      <ScenarioPicker />
      <DirectionsEditorial />
      <MapTeaser />
      <ExplorePreview articles={articles as never} />
      <BoostyTeaser />
      <ShopPreview products={products as never} />
      <SocialProof stats={stats} reviews={reviews} />
      <FinalCta />
    </>
  );
}
