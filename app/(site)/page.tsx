import type { Metadata } from "next";
import { HeroCinematic } from "@/components/sections/hero-cinematic";
import { ScenarioPicker } from "@/components/sections/scenario-picker";
import { AuthorBlock } from "@/components/sections/author-block";
import { SocialProof, type Stat } from "@/components/sections/social-proof";
import { ExplorePreviewSection } from "@/components/sections/explore-preview";
import { BusinessPreviewSection } from "@/components/sections/business-preview";
import { FinalCta } from "@/components/sections/final-cta";
import { ContactCtaSection } from "@/components/contact/contact-cta-section";
import { PhotosPreviewSection } from "@/components/sections/photos-preview";
import { SouvenirsPreviewSection } from "@/components/sections/souvenirs-preview";
import { getSiteSettings } from "@/lib/site-settings";
import { getFeaturedPhotos } from "@/lib/photos";
import { getFeaturedPublicReviews } from "@/lib/public-reviews";
import { hasPublicExperiences } from "@/lib/experiences";
import { CURATED_FALLBACKS } from "@/lib/visual-assets";
import { formatPhotoPlaceLabel, formatPhotoYearLabel } from "@/lib/photo-adapter";
import { BRAND } from "@/lib/brand-constants";
import { CTA, assistWalkHref } from "@/lib/cta-constants";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.projectName} — ${settings.footerTagline}`,
    description: settings.metaDescription,
    alternates: { canonical: "/" },
    openGraph: {
      title: settings.projectName,
      description: settings.description,
      ...(settings.ogImageUrl ? { images: [{ url: settings.ogImageUrl }] } : {}),
    },
  };
}

async function getHomeStats(): Promise<Stat[] | undefined> {
  try {
    if (!process.env.DATABASE_URL) return undefined;
    const { getPayloadClient } = await import("@/lib/payload");
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({ slug: "site-settings" });
    return Array.isArray(settings?.stats) ? (settings.stats as Stat[]) : [];
  } catch {
    return undefined;
  }
}

export default async function HomePage() {
  const [settings, stats, reviews, featuredPhotos, catalogReady] =
    await Promise.all([
      getSiteSettings(),
      getHomeStats(),
      getFeaturedPublicReviews(3),
      getFeaturedPhotos(1),
      hasPublicExperiences(),
    ]);

  const heroPhoto = featuredPhotos[0];

  const heroCtas = catalogReady
    ? [
        {
          label: CTA.discovery.label,
          href: CTA.discovery.href,
          variant: "primary" as const,
        },
        {
          label: CTA.assist.label,
          href: assistWalkHref("hero"),
          variant: "secondary" as const,
        },
      ]
    : [
        {
          label: CTA.mapExplore.label,
          href: CTA.mapExplore.href,
          variant: "primary" as const,
        },
        {
          label: CTA.assist.label,
          href: assistWalkHref("hero"),
          variant: "secondary" as const,
        },
      ];

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
        ctas={heroCtas}
      />
      <ScenarioPicker />
      <ExplorePreviewSection limit={3} />
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
      <ContactCtaSection
        variant="default"
        sourceType="home"
        sourceBlock="home-cta"
      />
      <FinalCta
        primaryHref={catalogReady ? CTA.discovery.href : CTA.mapExplore.href}
        primaryLabel={
          catalogReady ? CTA.discovery.label : CTA.mapExplore.label
        }
        supportText={
          catalogReady
            ? "Выберите маршрут на карте или напишите — соберём программу под ваши даты."
            : "Можно начать с материалов о городе или сразу написать — соберём программу под ваши даты."
        }
      />
    </>
  );
}
