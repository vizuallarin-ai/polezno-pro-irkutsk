import type { PublicPhoto } from "@/types/photos";
import { PhotoCard } from "./photo-card";
import { VisualEmptyState } from "@/components/visual/visual-empty-state";
import { VISUAL_EMPTY_COPY } from "@/lib/visual-assets";

interface PhotoGalleryProps {
  photos: PublicPhoto[];
}

function PhotoGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/3] bg-muted animate-pulse border border-border city-card"
        />
      ))}
    </div>
  );
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <VisualEmptyState
        message={VISUAL_EMPTY_COPY.photosFiltered}
        actionLabel="Сбросить фильтры"
        actionHref="/explore/photos"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo, index) => (
        <PhotoCard key={photo.id} photo={photo} priority={index < 3} />
      ))}
    </div>
  );
}

export { PhotoGallerySkeleton };
