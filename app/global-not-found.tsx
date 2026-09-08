import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Golos_Text } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const golos = Golos_Text({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    absolute: "Страница не найдена | Иркпортал",
  },
  description: "Запрашиваемая страница не существует.",
  robots: { index: false, follow: true },
};

/**
 * Routing-level 404 (experimental.globalNotFound).
 * Avoids the streamed segment notFound soft-404 (HTTP 200) path for unmatched URLs.
 */
export default function GlobalNotFound() {
  return (
    <html lang="ru" className={golos.className}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center overflow-hidden">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
            404
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
            Страница не найдена
          </h1>
          <p className="text-muted-foreground max-w-xs mb-12 text-sm leading-relaxed">
            Возможно, она была перемещена или никогда не существовала. Иркутск
            гораздо интереснее — давайте вернёмся.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium"
            >
              На главную
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/map"
              className="inline-flex h-11 items-center justify-center border border-border px-6 text-sm"
            >
              Смотреть маршруты
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
