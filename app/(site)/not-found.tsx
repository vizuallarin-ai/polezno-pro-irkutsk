import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background overflow-hidden">
      <p className="type-eyebrow text-muted-foreground mb-6">404</p>
      <h1 className="type-page-title text-foreground mb-4">
        Страница не найдена
      </h1>
      <p className="type-body text-muted-foreground max-w-xs mb-12">
        Возможно, она была перемещена или никогда не существовала. Иркутск
        гораздо интереснее — давайте вернёмся.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link
          href="/"
          className="cta-primary type-button group"
        >
          На главную
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
        <Link
          href="/map"
          className="cta-secondary type-button"
        >
          Смотреть маршруты
        </Link>
      </div>

      <div
        className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 select-none font-serif text-[clamp(4.5rem,28vw,7.5rem)] leading-none text-muted/25"
        aria-hidden
      >
        404
      </div>
    </div>
  );
}
