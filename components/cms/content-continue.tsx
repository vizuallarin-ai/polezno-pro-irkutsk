import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTA, assistWalkHref } from "@/lib/cta-constants";

type ContentContinueProps = {
  /** Article slug for BOOK CTA context */
  articleSlug?: string;
  /** When true, catalog has at least one publishable route/excursion */
  hasExperiences: boolean;
  /** Hide BOOK assist when a primary commercial CTA already covers it */
  showAssist?: boolean;
};

/**
 * Stage-aware next steps after editorial substance.
 * DISCOVER → more stories; TRUST → author; DESIRE → routes if ready; BOOK → assist.
 * Does not invent routes or reviews.
 */
export function ContentContinue({
  articleSlug,
  hasExperiences,
  showAssist = true,
}: ContentContinueProps) {
  const assistHref = articleSlug
    ? `/contact?intent=explore&article=${encodeURIComponent(articleSlug)}&sourceBlock=article-continue#lead-form`
    : assistWalkHref("content-continue");

  return (
    <aside
      className="mt-16 pt-10 border-t border-border"
      aria-labelledby="content-continue-heading"
    >
      <h2 id="content-continue-heading" className="text-lg font-medium mb-6">
        Куда дальше
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <li>
          <Link
            href={CTA.mapExplore.href}
            className="group flex items-start justify-between gap-3 border border-border p-4 hover:bg-card transition-colors duration-200 h-full"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Узнать больше
              </p>
              <p className="font-medium group-hover:text-baikal transition-colors">
                Другие материалы о городе
              </p>
            </div>
            <ArrowRight
              size={14}
              className="shrink-0 text-muted-foreground mt-1 group-hover:text-baikal"
            />
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className="group flex items-start justify-between gap-3 border border-border p-4 hover:bg-card transition-colors duration-200 h-full"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Подход
              </p>
              <p className="font-medium group-hover:text-baikal transition-colors">
                Как Алёна показывает Иркутск
              </p>
            </div>
            <ArrowRight
              size={14}
              className="shrink-0 text-muted-foreground mt-1 group-hover:text-baikal"
            />
          </Link>
        </li>
        {hasExperiences ? (
          <li>
            <Link
              href={CTA.discovery.href}
              className="group flex items-start justify-between gap-3 border border-border p-4 hover:bg-card transition-colors duration-200 h-full"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Опыт
                </p>
                <p className="font-medium group-hover:text-baikal transition-colors">
                  {CTA.discovery.label}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="shrink-0 text-muted-foreground mt-1 group-hover:text-baikal"
              />
            </Link>
          </li>
        ) : null}
        {showAssist ? (
          <li>
            <Link
              href={assistHref}
              className="group flex items-start justify-between gap-3 border border-border p-4 hover:bg-card transition-colors duration-200 h-full"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Заявка
                </p>
                <p className="font-medium group-hover:text-baikal transition-colors">
                  {CTA.assist.label}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="shrink-0 text-muted-foreground mt-1 group-hover:text-baikal"
              />
            </Link>
          </li>
        ) : null}
      </ul>
    </aside>
  );
}
