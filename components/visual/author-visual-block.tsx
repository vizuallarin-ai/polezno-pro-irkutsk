import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CityImage } from "./city-image";
import { resolveVisualImage } from "@/lib/visual-assets";
import { BRAND } from "@/lib/brand-constants";

export type AuthorVisualBlockProps = {
  name?: string;
  role?: string;
  shortText?: string;
  photoUrl?: string;
};

export function AuthorVisualBlock({
  name = BRAND.authorName,
  role = BRAND.authorRole,
  shortText = BRAND.authorShortText,
  photoUrl,
}: AuthorVisualBlockProps) {
  const visual = resolveVisualImage({
    coverUrl: photoUrl,
    fallback: "author",
    alt: name,
    place: "Иркутск",
  });

  return (
    <section
      className="py-24 lg:py-36 bg-card"
      aria-labelledby="author-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <CityImage
            src={visual.src}
            alt={visual.alt}
            aspectRatio="3/4"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="border border-border city-card"
            rounded
            caption={name}
            place="Иркутск"
          />

          <div className="flex flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Кто показывает вам Иркутск
            </p>

            <h2
              id="author-heading"
              className="text-3xl lg:text-4xl font-light tracking-tight text-foreground"
            >
              {name}
            </h2>

            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              {role}
            </p>

            <p className="text-muted-foreground leading-relaxed">{shortText}</p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center gap-2 px-6 text-sm font-medium bg-foreground text-primary-foreground hover:bg-foreground/90 transition-colors group"
              >
                О проекте
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center px-6 text-sm font-medium border border-border hover:bg-muted transition-colors"
              >
                Написать / Спланировать
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
