import type { Metadata } from "next";
import { HeroCinematic } from "@/components/sections/hero-cinematic";
import { ScenarioPicker } from "@/components/sections/scenario-picker";
import { AuthorBlock } from "@/components/sections/author-block";
import { SocialProof, type Stat, type Review } from "@/components/sections/social-proof";
import { BusinessPreviewSection } from "@/components/sections/business-preview";
import { FinalCta } from "@/components/sections/final-cta";
import { ContactCtaSection } from "@/components/contact/contact-cta-section";
import { PhotosPreviewSection } from "@/components/sections/photos-preview";
import { SouvenirsPreviewSection } from "@/components/sections/souvenirs-preview";
import { getSiteSettings } from "@/lib/site-settings";
import { getFeaturedPhotos } from "@/lib/photos";
import { CURATED_FALLBACKS } from "@/lib/visual-assets";
import { formatPhotoPlaceLabel, formatPhotoYearLabel } from "@/lib/photo-adapter";
import { BRAND } from "@/lib/brand-constants";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.projectName} — ${settings.footerTagline}`,
    description: settings.metaDescription,
    verification: {
      google: "LLEp_6ENwdLy4ubS0_YoCB6e4J0xmz5IoGs2iJHrQTk",
    },
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
    const payload = await getPayloadClient();

    const [reviewsRes, settings] = await Promise.all([
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

    return { stats, reviews };
  } catch {
    return { stats: undefined, reviews: undefined };
  }
}

export default async function HomePage() {
  const [settings, homeData, featuredPhotos] = await Promise.all([
    getSiteSettings(),
    getHomeData(),
    getFeaturedPhotos(1),
  ]);

  const stats = homeData?.stats;
  const reviews = homeData?.reviews;
  const heroPhoto = featuredPhotos[0];

  return (
    <>
      <HeroCinematic
        badge={settings.heroBadge || BRAND.heroBadge}
        title={settings.heroTitle || BRAND.slogan}
        subtitle={settings.heroSubtitle || BRAND.heroSubtitle}
        imageSrc={heroPhoto?.imageUrl || CURATED_FALLBACKS.hero}
        imageAlt={heroPhoto?.imageAlt || "Иркутск — вид города"}
        caption={heroPhoto?.title}
        credit={heroPhoto?.authorName}
        year={heroPhoto ? formatPhotoYearLabel(heroPhoto) : undefined}
        place={heroPhoto ? formatPhotoPlaceLabel(heroPhoto) : undefined}
        ctas={[
          {
            label: "Подобрать прогулку",
            href: "/contact",
            variant: "primary",
          },
          {
            label: "Для бизнеса",
            href: "/business",
            variant: "secondary",
          },
        ]}
      />
      <ScenarioPicker />
      <AuthorBlock
        name={settings.authorName}
        role={settings.authorRole}
        shortText={settings.authorShortText}
        photoUrl={settings.authorPhotoUrl}
      />
      <SocialProof stats={stats} reviews={reviews} />
      <PhotosPreviewSection />
      <SouvenirsPreviewSection />
      <BusinessPreviewSection />
      <ContactCtaSection variant="default" sourceType="home" sourceBlock="home-cta" />
      <FinalCta />
    </>
  );
}
