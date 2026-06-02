import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  EXCURSION_FORMAT_LABELS,
  formatExcursionDuration,
  excursionCoverUrl,
  getPublishedExcursions,
} from "@/lib/excursions";

export const metadata: Metadata = {
  title: "Экскурсии по Иркутску и Байкалу",
  description:
    "Авторские экскурсии: пешие, гастро, корпоративные и выезды на Байкал. Формат, длительность и цена — обсудим дату под вашу группу.",
};

export default async function ExcursionsPage() {
  const excursions = await getPublishedExcursions();

  return (
    <main className="pt-24">
      <section className="border-b border-border py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            С гидом
          </p>
          <h1 className="text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-6 max-w-2xl">
            Экскурсии <span className="font-serif italic">с автором</span>
          </h1>
          <p className="text-muted-foreground max-w-lg leading-relaxed">
            Готовые форматы или программа под ваш день. Выберите экскурсию —
            уточним дату и состав группы.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        {excursions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border">
            <p className="text-lg text-muted-foreground mb-4">
              Скоро здесь появятся экскурсии
            </p>
            <Link
              href="/program"
              className="text-sm font-medium text-baikal hover:underline"
            >
              Обсудить программу →
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {excursions.map((excursion) => {
              const cover = excursionCoverUrl(excursion);

              return (
                <article
                  key={excursion.id}
                  className="group flex flex-col border border-border bg-card"
                >
                  <Link
                    href={`/excursions/${excursion.slug}`}
                    className="relative aspect-[4/3] overflow-hidden bg-muted"
                  >
                    {cover ? (
                      <Image
                        src={cover}
                        alt={excursion.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 font-serif text-4xl">
                        —
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-6 gap-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {EXCURSION_FORMAT_LABELS[excursion.format] ||
                          excursion.format}
                      </Badge>
                      {excursion.duration != null && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={12} />
                          {formatExcursionDuration(excursion.duration)}
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-foreground group-hover:text-baikal transition-colors duration-200">
                        <Link href={`/excursions/${excursion.slug}`}>
                          {excursion.title}
                        </Link>
                      </h2>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                        {excursion.shortDescription}
                      </p>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-4 pt-2 border-t border-border">
                      {excursion.price != null && excursion.price > 0 ? (
                        <p className="text-sm font-medium text-foreground">
                          от {excursion.price.toLocaleString("ru-RU")} ₽
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Цена по запросу
                        </p>
                      )}
                      <Link
                        href="/program"
                        className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-baikal hover:underline shrink-0"
                      >
                        Обсудить дату
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
