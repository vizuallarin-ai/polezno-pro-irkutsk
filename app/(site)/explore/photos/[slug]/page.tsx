import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { getSiteSettings } from "@/lib/site-settings";
import { getPhotoBySlug, getPublishedPhotoSlugs, getSimilarPhotos } from "@/lib/photos";
import { getArPostcardForPhoto } from "@/lib/ar-postcards";
import { PhotoDetailClient } from "@/components/photos/photo-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedPhotoSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const photo = await getPhotoBySlug(slug);
  if (!photo) return { title: "Фото не найдено" };

  const site = await getSiteSettings();
  return buildPageMetadata(
    {
      title: photo.title,
      description: photo.description,
      coverUrl: photo.imageUrl,
      seo: {
        title: `${photo.title} — Фото Иркутска`,
        description: photo.description,
      },
    },
    photo.title,
    site
  );
}

export default async function PhotoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const photo = await getPhotoBySlug(slug);
  if (!photo) notFound();

  const similar = await getSimilarPhotos(photo, 4);
  const arPostcard = await getArPostcardForPhoto(photo.id);

  return <PhotoDetailClient photo={photo} similar={similar} arPostcard={arPostcard} />;
}
