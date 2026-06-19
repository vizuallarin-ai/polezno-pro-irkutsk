import Link from "next/link";
import type { PublicPhoto } from "@/types/photos";
import { CityImage } from "./city-image";
import { cn } from "@/lib/utils";

interface EditorialPhotoGridProps {
  photos: PublicPhoto[];
  className?: string;
  columns?: 2 | 3 | 4;
}

export function EditorialPhotoGrid({
  photos,
  className,
  columns = 4,
}: EditorialPhotoGridProps) {
  if (photos.length === 0) return null;

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {photos.map((photo, index) => (
        <Link
          key={photo.id}
          href={`/explore/photos/${photo.slug}`}
          className="group img-reveal"
        >
          <CityImage
            src={photo.thumbnailUrl}
            alt={photo.imageAlt}
            aspectRatio="4/3"
            sizes={
              columns === 4
                ? "(max-width: 1024px) 50vw, 25vw"
                : "(max-width: 768px) 50vw, 33vw"
            }
            priority={index < 2}
            rounded
            className="border border-border city-card"
            imageClassName="transition-transform duration-300 group-hover:scale-[1.02]"
            caption={photo.title}
            year={photo.year ?? photo.period}
            place={photo.place ?? photo.street}
            credit={photo.authorName}
          />
        </Link>
      ))}
    </div>
  );
}
