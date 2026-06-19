import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  formatPhotoPlaceLabel,
  formatPhotoYearLabel,
} from "@/lib/photo-adapter";
import {
  PHOTO_CATEGORY_LABELS,
  PHOTO_RIGHTS_LABELS,
} from "@/lib/content-labels";
import { PHOTO_TYPE_BADGE } from "@/lib/photo-constants";
import type { PublicPhoto } from "@/types/photos";
import { BeforeAfterPhotoBlock } from "./before-after-photo-block";
import { PhotoCard } from "./photo-card";
import { SouvenirsCtaLink } from "@/components/souvenirs/related-souvenirs-block";
import { RelatedArPostcardBlock } from "@/components/ar-postcards/related-ar-postcard-block";
import type { PublicArPostcard } from "@/types/ar-postcards";

interface PhotoDetailClientProps {
  photo: PublicPhoto;
  similar: PublicPhoto[];
  arPostcard?: PublicArPostcard | null;
}

export function PhotoDetailClient({ photo, similar, arPostcard }: PhotoDetailClientProps) {
  const relatedRoute = photo.relatedRoutes[0];

  return (
    <article>
      <section className="border-b border-border bg-background pt-24 lg:pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8 lg:py-12">
          <nav className="text-sm text-muted-foreground mb-6" aria-label="Хлебные крошки">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Главная
                </Link>
              </li>
              <li aria-hidden>→</li>
              <li>
                <Link href="/explore" className="hover:text-foreground">
                  Исследовать
                </Link>
              </li>
              <li aria-hidden>→</li>
              <li>
                <Link href="/explore/photos" className="hover:text-foreground">
                  Фото Иркутска
                </Link>
              </li>
              <li aria-hidden>→</li>
              <li className="text-foreground">{photo.title}</li>
            </ol>
          </nav>

          <h1 className="text-2xl lg:text-3xl font-medium mb-6 max-w-3xl">
            {photo.title}
          </h1>

          {photo.pairedPhoto ? (
            <BeforeAfterPhotoBlock photo={photo} paired={photo.pairedPhoto} />
          ) : (
            <div className="relative aspect-[16/10] max-h-[70vh] bg-muted overflow-hidden border border-border">
              <Image
                src={photo.imageUrl}
                alt={photo.imageAlt}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </div>
          )}

          <dl className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <Meta label="Год / период" value={formatPhotoYearLabel(photo) || "—"} />
            <Meta label="Место" value={formatPhotoPlaceLabel(photo) || "—"} />
            <Meta label="Категория" value={PHOTO_CATEGORY_LABELS[photo.category]} />
            <Meta label="Тип" value={PHOTO_TYPE_BADGE[photo.photoType] ?? "—"} />
            <Meta label="Автор" value={photo.authorName || "—"} />
            <Meta label="Источник" value={photo.sourceName || "—"} />
            <Meta label="Права" value={PHOTO_RIGHTS_LABELS[photo.rightsType] ?? "—"} />
          </dl>

          {photo.description ? (
            <div className="mt-8 max-w-3xl">
              <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
                Описание
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {photo.description}
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {relatedRoute ? (
              <Link
                href={`/map/${relatedRoute.slug}`}
                className="inline-flex h-11 items-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Увидеть в маршруте
                <ArrowRight size={14} />
              </Link>
            ) : (
              <Link
                href="/map"
                className="inline-flex h-11 items-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Смотреть маршруты
                <ArrowRight size={14} />
              </Link>
            )}
            <Link
              href="/explore/photos/submit"
              className="inline-flex h-11 items-center justify-center border border-border px-6 text-sm font-medium hover:bg-muted transition-colors"
            >
              Предложить фото
            </Link>
            <Link
              href="/business"
              className="inline-flex h-11 items-center justify-center border border-border px-6 text-sm font-medium hover:bg-muted transition-colors"
            >
              Спланировать прогулку
            </Link>
          </div>
        </div>
      </section>

      {photo.relatedArticles.length > 0 ? (
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
            <h2 className="text-lg font-medium mb-4">Связанные материалы</h2>
            <ul className="space-y-2">
              {photo.relatedArticles.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/explore/${item.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {arPostcard ? (
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
            <RelatedArPostcardBlock postcard={arPostcard} variant="photo" />
          </div>
        </section>
      ) : null}

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
          <SouvenirsCtaLink />
        </div>
      </section>

      {similar.length > 0 ? (
        <section>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 lg:py-14">
            <h2 className="text-lg font-medium mb-6">Похожие фото</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((item) => (
                <PhotoCard key={item.id} photo={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground mb-1">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
