import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getFeaturedPhotos } from "@/lib/photos";

export async function PhotosPreviewSection() {
  const photos = await getFeaturedPhotos(4);
  if (photos.length < 3) return null;

  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              Фотоархив
            </p>
            <h2 className="text-2xl lg:text-3xl font-medium tracking-tight mb-3">
              Фото Иркутска
            </h2>
            <p className="text-muted-foreground max-w-xl leading-relaxed">
              Старые и современные снимки города: улицы, фасады, дворы и детали,
              по которым видно, как менялся Иркутск.
            </p>
          </div>
          <Link
            href="/explore/photos"
            className="inline-flex h-11 items-center gap-2 border border-border px-6 text-sm font-medium hover:bg-muted transition-colors shrink-0"
          >
            Смотреть фото
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Link
              key={photo.id}
              href={`/explore/photos/${photo.slug}`}
              className="group relative aspect-[4/3] overflow-hidden bg-muted border border-border"
            >
              <Image
                src={photo.thumbnailUrl}
                alt={photo.imageAlt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
