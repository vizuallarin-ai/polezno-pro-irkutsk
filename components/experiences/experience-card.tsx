import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import type { ExperienceItem } from "@/lib/data/experiences";
import { Badge } from "@/components/ui/badge";
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

  return (
    <article
      className={cn(
        "flex flex-col border border-border bg-background hover:border-foreground/30 transition-colors duration-200",
        className
      )}
    >
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {experience.cover ? (
          <Image
            src={experience.cover}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="text-muted-foreground" size={24} />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[90%]">
          {experience.badges.slice(0, 3).map((badge) => (
            <Badge key={badge.label} variant={badge.variant ?? "outline"}>
              {badge.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <p className="type-meta uppercase text-muted-foreground mb-1">
            {experience.kind === "route" ? "Маршрут" : "Экскурсия"}
            {experience.priceLabel ? ` · ${experience.priceLabel}` : ""}
          </p>
          <h2 className="type-h3 text-foreground text-balance">
            {experience.title}
          </h2>
        </div>

        <p className="type-body-sm text-muted-foreground line-clamp-2 flex-1">
          {experience.description}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 type-meta text-muted-foreground">
          {experience.duration != null && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDuration(experience.duration)}
            </span>
          )}
          {experience.kind === "route" && experience.distance != null && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {experience.distance} км
            </span>
          )}
          {experience.kind === "route" && experience.pointsCount != null && (
            <span>{experience.pointsCount} точек</span>
          )}
        </div>

        <p className="type-caption text-foreground/70">{formatLine(experience)}</p>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
          <Link
            href={experience.href}
            className="cta-label inline-flex h-10 flex-1 items-center justify-center gap-2 bg-foreground text-primary-foreground px-4 type-button hover:bg-foreground/90 transition-colors duration-200"
          >
            {primaryLabel}
            <ArrowRight size={13} />
          </Link>
          {(experience.isGuidedAvailable || experience.kind === "excursion") && (
            <Link
              href={programHref(experience, "guided")}
              className="cta-label cta-label-wrap-sm inline-flex h-10 items-center justify-center border border-border px-4 type-button text-foreground hover:bg-muted transition-colors duration-200"
            >
              {guidedLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
