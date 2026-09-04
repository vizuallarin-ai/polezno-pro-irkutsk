import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight } from "lucide-react";
import type { ExperienceItem } from "@/lib/data/experiences";
import { cn } from "@/lib/utils";
import {
  buildContactHref,
  excursionContactHref,
  routeContactHref,
  CTA,
} from "@/lib/cta-constants";

function formatDuration(minutes: number): string {
  if (minutes >= 240) return "полдня";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m === 0) return `${h} ч`;
  if (h > 0) return `${h} ч ${m} мин`;
  return `${m} мин`;
}

/** Guided (B2C) → /contact; corporate (B2B) → /business. */
function programHref(item: ExperienceItem, format?: string): string {
  if (format === "corporate") {
    const params = new URLSearchParams();
    if (item.routeSlug) params.set("route", item.routeSlug);
    if (item.excursionSlug) params.set("excursion", item.excursionSlug);
    params.set("format", "corporate");
    params.set("taskType", "route_program");
    params.set("sourceBlock", "experience-card");
    const qs = params.toString();
    return qs ? `/business?${qs}#business-form` : "/business";
  }

  if (item.excursionSlug) {
    return excursionContactHref(item.excursionSlug, "experience-card");
  }
  if (item.routeSlug) {
    return routeContactHref(item.routeSlug, "experience-card");
  }
  return buildContactHref({
    intent: "walk",
    sourceBlock: "experience-card",
  });
}

function formatLine(item: ExperienceItem): string {
  const parts: string[] = [];
  if (item.kind === "route") {
    if (item.isSelfGuided) parts.push("Самостоятельно");
    if (item.isGuidedAvailable) parts.push("С Алёной");
  } else {
    parts.push("С Алёной");
  }
  if (item.isCorporateAvailable) parts.push("Для компании");
  return parts.join(" · ");
}

interface ExperienceCardProps {
  experience: ExperienceItem;
  className?: string;
}

export function ExperienceCard({ experience, className }: ExperienceCardProps) {
  const primaryLabel =
    experience.kind === "route" ? "Открыть маршрут" : "Подробнее";
  const guidedLabel =
    experience.bookingCta?.trim() || CTA.guided.label;
  const showGuided =
    experience.isGuidedAvailable || experience.kind === "excursion";

  const metaParts: string[] = [];
  if (experience.duration != null) metaParts.push(formatDuration(experience.duration));
  if (experience.kind === "route" && experience.distance != null) {
    metaParts.push(`${experience.distance} км`);
  }
  if (experience.kind === "route" && experience.pointsCount != null) {
    metaParts.push(`${experience.pointsCount} точек`);
  }

  return (
    <article className={cn("editorial-card group", className)}>
      <Link
        href={experience.href}
        className="editorial-card-media img-reveal aspect-[16/10] block"
        aria-label={`${primaryLabel}: ${experience.title}`}
      >
        {experience.cover ? (
          <Image
            src={experience.cover}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <MapPin className="text-muted-foreground/60" size={22} strokeWidth={1.25} />
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 pt-5 gap-3">
        <div>
          <p className="type-meta uppercase text-muted-foreground mb-2">
            {experience.kind === "route" ? "Маршрут" : "Экскурсия"}
            {experience.priceLabel ? ` · ${experience.priceLabel}` : ""}
          </p>
          <h2 className="type-h3 text-foreground text-balance group-hover:text-baikal transition-colors duration-200">
            <Link href={experience.href} className="outline-none">
              {experience.title}
            </Link>
          </h2>
        </div>

        <p className="type-body-sm text-muted-foreground line-clamp-2 flex-1">
          {experience.description}
        </p>

        {(metaParts.length > 0 || formatLine(experience)) && (
          <p className="type-meta text-muted-foreground">
            {[metaParts.join(" · "), formatLine(experience)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          <Link
            href={experience.href}
            className="cta-ghost type-ui-label"
          >
            {primaryLabel}
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          {showGuided && (
            <Link
              href={programHref(experience, "guided")}
              className="type-ui-label text-muted-foreground hover:text-foreground transition-colors duration-200 min-h-[44px] inline-flex items-center"
            >
              {guidedLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
