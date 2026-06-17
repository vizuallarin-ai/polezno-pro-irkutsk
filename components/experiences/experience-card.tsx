import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import type { ExperienceItem } from "@/lib/data/experiences";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatDuration(minutes: number): string {
  if (minutes >= 240) return "полдня";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m === 0) return `${h} ч`;
  if (h > 0) return `${h} ч ${m} мин`;
  return `${m} мин`;
}

function programHref(item: ExperienceItem, format?: string): string {
  const params = new URLSearchParams();
  if (item.routeSlug) params.set("route", item.routeSlug);
  if (item.excursionSlug) params.set("excursion", item.excursionSlug);
  if (format) params.set("format", format);
  const qs = params.toString();
  return qs ? `/program?${qs}` : "/program";
}

interface ExperienceCardProps {
  experience: ExperienceItem;
  className?: string;
}

export function ExperienceCard({ experience, className }: ExperienceCardProps) {
  const primaryLabel =
    experience.kind === "route" ? "Открыть маршрут" : "Подробнее";
  const guidedLabel = experience.bookingCta || "Обсудить дату";

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
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            {experience.kind === "route" ? "Маршрут" : "Экскурсия"}
            {experience.priceLabel ? ` · ${experience.priceLabel}` : ""}
          </p>
          <h2 className="text-lg font-medium leading-snug text-foreground">
            {experience.title}
          </h2>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {experience.description}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
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

        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
          <Link
            href={experience.href}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 bg-foreground text-primary-foreground px-4 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
          >
            {primaryLabel}
            <ArrowRight size={13} />
          </Link>
          {(experience.isGuidedAvailable || experience.kind === "excursion") && (
            <Link
              href={programHref(
                experience,
                experience.isCorporateAvailable ? "corporate" : "guided"
              )}
              className="inline-flex h-10 items-center justify-center border border-border px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
            >
              {guidedLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
