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
import { mapArticleForPreview, mapProductForPreview } from "@/lib/cms-mappers";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.projectName} — авторский навигатор по городу`,
    description: settings.metaDescription,
    openGraph: {
      title: settings.projectName,
      description: settings.description,
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl }] } : {}),
    },
  };
}

async function getHomeData() {
  try {
    if (!process.env.DATABASE_URL) return null;
    const { getPayloadClient } = await import("@/lib/payload");
    const { ARTICLE_PUBLISHED_WHERE, catalogProductsWhere } = await import(
      "@/lib/cms-filters"
    );
    const payload = await getPayloadClient();

    const [articlesRes, productsRes, reviewsRes, settings] =
      await Promise.all([
        payload.find({
          collection: "articles",
          where: {
            and: [
              ARTICLE_PUBLISHED_WHERE,
              { isFeatured: { equals: true } },
            ],
          },
          limit: 4,
          sort: "-publishedAt",
          depth: 1,
        }),
        payload.find({
          collection: "products",
          where: {
            and: [
              catalogProductsWhere(),
              { isFeatured: { equals: true } },
            ],
          },
          limit: 4,
          depth: 1,
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
      articles: articlesRes.docs.map((doc) =>
        mapArticleForPreview(doc as Parameters<typeof mapArticleForPreview>[0])
      ),
      products: productsRes.docs.map((doc) =>
        mapProductForPreview(doc as Parameters<typeof mapProductForPreview>[0])
      ),
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
  const homeData = await getHomeData();
  const articles = homeData?.articles;
  const products = homeData?.products;
  const stats = homeData?.stats;
  const reviews = homeData?.reviews;

  return (
    <>
      <HeroCinematic />
      <ScenarioPicker />
      <DirectionsEditorial />
      <MapTeaser />
      <ExplorePreview articles={articles} />
      <BoostyTeaser />
      <ShopPreview products={products} />
      <SocialProof stats={stats} reviews={reviews} />
      <FinalCta />
    </>
  );
}
