"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicPhoto } from "@/types/photos";
import { PhotoFiltersBar } from "./photo-filters";
import { PhotoGallery } from "./photo-gallery";

interface PhotosPageClientProps {
  photos: PublicPhoto[];
}

export function PhotosPageClient({ photos }: PhotosPageClientProps) {
  return (
    <>
      <section className="border-b border-border bg-background pt-24 lg:pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 lg:py-14">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Исследовать
          </p>
          <h1 className="text-3xl lg:text-4xl font-medium tracking-tight mb-4 max-w-3xl">
            Фото Иркутска
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed mb-8">
            Старые и современные фотографии города: улицы, фасады, дворы, детали
            и места, по которым можно увидеть, как менялся Иркутск.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/explore/photos/submit"
              className="inline-flex h-11 items-center justify-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Предложить фото
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/explore/photos?type=old"
              className="inline-flex h-11 items-center justify-center border border-border px-6 text-sm font-medium hover:bg-muted transition-colors"
            >
              Смотреть старые фото
            </Link>
            <Link
              href="/explore/photos?type=modern"
              className="inline-flex h-11 items-center justify-center border border-border px-6 text-sm font-medium hover:bg-muted transition-colors"
            >
              Смотреть современные фото
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-10 lg:py-14">
        <Suspense fallback={<div className="h-20" />}>
          <PhotoFiltersBar />
        </Suspense>
        <div className="mt-8">
          <PhotoGallery photos={photos} />
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 lg:py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-medium mb-2">Есть фото Иркутска?</h2>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              Предложите снимок в архив — после проверки мы опубликуем его с
              указанием авторства и вашего описания.
            </p>
          </div>
          <Link
            href="/explore/photos/submit"
            className="inline-flex h-11 items-center gap-2 border border-border px-6 text-sm font-medium hover:bg-muted transition-colors shrink-0"
          >
            Предложить фото
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 lg:py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-medium mb-2">Хотите увидеть город вживую?</h2>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              Перейдите к маршрутам или спланируйте визит с гидом.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/map"
              className="inline-flex h-11 items-center justify-center bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              К маршрутам
            </Link>
            <Link
              href="/business"
              className="inline-flex h-11 items-center justify-center border border-border px-6 text-sm font-medium hover:bg-muted transition-colors"
            >
              Спланировать визит
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
