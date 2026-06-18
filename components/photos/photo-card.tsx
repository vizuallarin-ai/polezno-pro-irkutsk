"use client";

import Image from "next/image";
import Link from "next/link";
import { PHOTO_TYPE_BADGE } from "@/lib/photo-constants";
import { formatPhotoPlaceLabel, formatPhotoYearLabel } from "@/lib/photo-adapter";
import { PHOTO_CATEGORY_LABELS } from "@/lib/content-labels";
import type { PublicPhoto } from "@/types/photos";
import { cn } from "@/lib/utils";

interface PhotoCardProps {
  photo: PublicPhoto;
  className?: string;
  priority?: boolean;
}

export function PhotoCard({ photo, className, priority }: PhotoCardProps) {
  const yearLabel = formatPhotoYearLabel(photo);
  const placeLabel = formatPhotoPlaceLabel(photo);

  return (
    <article
      className={cn(
        "group border border-border bg-card overflow-hidden transition-shadow duration-200 hover:shadow-sm",
        className
      )}
    >
      <Link
        href={`/explore/photos/${photo.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={photo.thumbnailUrl}
            alt={photo.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority={priority}
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="bg-background/90 backdrop-blur px-2 py-1 text-[10px] uppercase tracking-wide">
              {PHOTO_TYPE_BADGE[photo.photoType] ?? "Фото"}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-medium leading-snug line-clamp-2">
            {photo.title}
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {yearLabel ? <span>{yearLabel}</span> : null}
            {placeLabel ? <span className="line-clamp-1">{placeLabel}</span> : null}
          </div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {PHOTO_CATEGORY_LABELS[photo.category]}
          </p>
        </div>
      </Link>
    </article>
  );
}
