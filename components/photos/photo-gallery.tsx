import type { PublicPhoto } from "@/types/photos";
import { PhotoCard } from "./photo-card";

interface PhotoGalleryProps {
  photos: PublicPhoto[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="border border-dashed border-border p-10 text-center text-muted-foreground">
        По выбранным фильтрам фото не найдены. Попробуйте другую категорию.
      </div>
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
