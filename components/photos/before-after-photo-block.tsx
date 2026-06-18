import Image from "next/image";
import { formatPhotoYearLabel } from "@/lib/photo-adapter";
import type { PublicPhoto } from "@/types/photos";

interface BeforeAfterPhotoBlockProps {
  photo: PublicPhoto;
  paired: PublicPhoto;
}

export function BeforeAfterPhotoBlock({ photo, paired }: BeforeAfterPhotoBlockProps) {
  return (
    <section className="border border-border bg-card p-4 lg:p-6" aria-label="Было и стало">
      <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
        <figure>
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            <Image
              src={photo.imageUrl}
              alt={photo.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <figcaption className="mt-3 text-sm">
            <span className="font-medium">Было</span>
            {formatPhotoYearLabel(photo) ? (
              <span className="text-muted-foreground"> · {formatPhotoYearLabel(photo)}</span>
            ) : null}
          </figcaption>
        </figure>
        <figure>
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            <Image
              src={paired.imageUrl}
              alt={paired.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <figcaption className="mt-3 text-sm">
            <span className="font-medium">Стало</span>
            {formatPhotoYearLabel(paired) || photo.pairedPhotoYear ? (
              <span className="text-muted-foreground">
                {" "}
                · {formatPhotoYearLabel(paired) || photo.pairedPhotoYear}
              </span>
            ) : null}
          </figcaption>
        </figure>
      </div>
      {photo.beforeAfterCaption ? (
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          {photo.beforeAfterCaption}
        </p>
      ) : null}
    </section>
  );
}
