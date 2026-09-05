import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CityImage } from "./city-image";
import { resolveVisualImage } from "@/lib/visual-assets";
import { BRAND } from "@/lib/brand-constants";
import { assistWalkHref } from "@/lib/cta-constants";

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
      className="section-pad-lg surface-recessed"
      aria-labelledby="author-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <CityImage
            src={visual.src}
            alt={visual.alt}
            aspectRatio="3/4"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="city-card overflow-hidden"
            rounded
            caption={name}
            place="Иркутск"
          />

          <div className="flex flex-col gap-6">
            <p className="type-eyebrow text-muted-foreground">
              Кто показывает вам Иркутск
            </p>

            <h2
              id="author-heading"
              className="type-section-title text-foreground"
            >
              {name}
            </h2>

            <p className="type-meta text-muted-foreground">
              {role}
            </p>

            <p className="type-body text-muted-foreground text-pretty max-w-md">
              {shortText}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/about"
                className="cta-primary type-button group"
              >
                О проекте
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href={assistWalkHref("author-visual")}
                className="cta-secondary type-button"
              >
                Подобрать мне прогулку
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
