import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ExplorePhotoPlaceholder() {
  return (
    <section
      className="mb-24 border border-border bg-card p-10 lg:p-14"
      aria-labelledby="explore-photos-heading"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
        Фотоархив
      </p>
      <h2
        id="explore-photos-heading"
        className="text-2xl font-light tracking-tight mb-3"
      >
        Фото Иркутска
      </h2>
      <p className="text-muted-foreground max-w-lg leading-relaxed mb-6">
        Старые и современные снимки улиц, дворов и деталей города — с фильтрами
        по периоду и месту. Можно предложить своё фото.
      </p>
      <Link
        href="/explore/photos"
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
      >
        Смотреть фото
        <ArrowRight size={14} />
      </Link>
    </section>
  );
}

export function ExploreBottomCta() {
  return (
    <section
      className="bg-card border border-border p-8 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
      aria-labelledby="explore-cta-heading"
    >
      <div>
        <h2
          id="explore-cta-heading"
          className="text-xl font-medium tracking-tight mb-2"
        >
          Хотите увидеть город с гидом?
        </h2>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          Подберём маршрут, экскурсию или программу под ваш визит — без
          туристических штампов.
        </p>
      </div>
      <Link
        href="/business"
        className="inline-flex h-11 items-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 transition-colors shrink-0"
      >
        Спланировать визит
        <ArrowRight size={14} />
      </Link>
    </section>
  );
}
