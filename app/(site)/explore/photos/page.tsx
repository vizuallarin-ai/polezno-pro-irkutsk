import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PHOTOS_PAGE_DESCRIPTION,
  PHOTOS_PAGE_TITLE,
} from "@/lib/photo-constants";
import { getPublishedPhotos } from "@/lib/photos";
import type { PhotoCategory, PhotoType } from "@/types/photos";
import { PhotosPageClient } from "@/components/photos/photos-page-client";
import { ContactCtaSection } from "@/components/contact/contact-cta-section";

export const metadata: Metadata = {
  title: PHOTOS_PAGE_TITLE,
  description: PHOTOS_PAGE_DESCRIPTION,
  alternates: { canonical: "/explore/photos" },
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    type?: string;
    year?: string;
    street?: string;
    author?: string;
  }>;
}

export default async function PhotosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category =
    params.category && params.category !== "all"
      ? (params.category as PhotoCategory)
      : undefined;
  const photoType =
    params.type === "old" || params.type === "modern"
      ? (params.type as PhotoType)
      : undefined;

  const photos = await getPublishedPhotos({
    category: category ?? "all",
    photoType: photoType ?? "all",
    year: params.year ? Number(params.year) : undefined,
    street: params.street,
    author: params.author,
  });

  return (
    <>
      <Suspense>
        <PhotosPageClient photos={photos} />
      </Suspense>
      <ContactCtaSection variant="photo" sourceType="photos" sourceBlock="photos-index" />
    </>
  );
}
