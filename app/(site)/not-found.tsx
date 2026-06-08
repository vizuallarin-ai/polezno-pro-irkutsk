import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
      <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-6">
        404
      </p>
      <h1 className="text-5xl md:text-6xl font-serif font-light italic text-foreground mb-4 leading-tight">
        Страница не найдена
      </h1>
      <p className="text-muted-foreground max-w-xs leading-relaxed mb-12">
        Возможно, она была перемещена или никогда не существовала. Иркутск
        гораздо интереснее — давайте вернёмся.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 bg-foreground text-primary-foreground px-7 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200 group"
        >
          На главную
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
        <Link
          href="/map"
          className="inline-flex h-11 items-center px-7 text-sm font-medium border border-border hover:bg-muted transition-colors duration-200"
        >
          Смотреть маршруты
        </Link>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[120px] font-serif font-light text-muted/30 select-none pointer-events-none leading-none">
        404
      </div>
    </div>
  );
}
