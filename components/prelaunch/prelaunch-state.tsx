"use client";

import Link from "next/link";
import { MapPin, Compass } from "lucide-react";
import { CTA, buildContactHref } from "@/lib/cta-constants";
import { trackAnalyticsEvent } from "@/lib/analytics-events";

type PrelaunchSurface =
  | "map"
  | "excursions"
  | "souvenirs"
  | "ar"
  | "photos"
  | "guides";

const COPY: Record<
  PrelaunchSurface,
  { title: string; body: string; showExplore?: boolean }
> = {
  map: {
    title: "Маршруты готовятся к публикации",
    body: "Самостоятельные прогулки и экскурсии появятся здесь после редакционной подготовки. Пока можно написать — подберём формат под ваш день.",
    showExplore: true,
  },
  excursions: {
    title: "Экскурсии готовятся",
    body: "Авторские форматы с гидом появятся после публикации в каталоге. Можете написать заранее — соберём персональный подбор.",
    showExplore: true,
  },
  souvenirs: {
    title: "Коллекция готовится",
    body: "Раздел сувениров и локальных изделий сохраняется в архитектуре проекта. Когда появятся подтверждённые позиции, каталог откроется автоматически.",
    showExplore: false,
  },
  ar: {
    title: "AR-направление в подготовке",
    body: "Концепция оживающих открыток остаётся частью проекта. Готовые материалы появятся здесь после публикации — без демонстрационных подделок.",
    showExplore: false,
  },
  photos: {
    title: "Фотоархив наполняется",
    body: "Редакционная подборка городских кадров появится после модерации и публикации. Пока можно читать материалы о городе в разделе «Исследовать».",
    showExplore: true,
  },
  guides: {
    title: "Профили гидов появятся здесь",
    body: "Когда в CMS будут опубликованы готовые профили, этот раздел заполнится автоматически. Автор проекта — Алёна Ямщикова.",
    showExplore: false,
  },
};

interface PrelaunchStateProps {
  surface: PrelaunchSurface;
  className?: string;
  compact?: boolean;
}

export function PrelaunchState({
  surface,
  className,
  compact = false,
}: PrelaunchStateProps) {
  const copy = COPY[surface];
  const contactHref = buildContactHref({
    intent: surface === "souvenirs" ? "souvenir" : surface === "ar" ? "ar" : "walk",
    sourceBlock: `prelaunch-${surface}`,
  });

  return (
    <div
      className={
        className ??
        `flex flex-col items-center justify-center text-center border border-border bg-card ${
          compact ? "py-12 px-6" : "py-16 lg:py-20 px-6"
        }`
      }
      role="status"
    >
      <div className="mb-4 text-muted-foreground" aria-hidden>
        {surface === "map" || surface === "excursions" ? (
          <MapPin size={28} />
        ) : (
          <Compass size={28} />
        )}
      </div>
      <h2 className="text-xl lg:text-2xl font-medium text-foreground mb-3 max-w-lg">
        {copy.title}
      </h2>
      <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-md mb-8">
        {copy.body}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={contactHref}
          onClick={() =>
            trackAnalyticsEvent("hero_cta_click", {
              sourceBlock: `prelaunch-${surface}`,
              cta: CTA.b2cPrimary.label,
            })
          }
          className="inline-flex h-11 min-h-[44px] items-center justify-center bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
        >
          {CTA.b2cPrimary.label}
        </Link>
        {copy.showExplore && (
          <Link
            href={CTA.mapExplore.href}
            className="inline-flex h-11 min-h-[44px] items-center justify-center border border-border px-6 text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
          >
            {CTA.mapExplore.label}
          </Link>
        )}
        {surface === "souvenirs" && (
          <Link
            href={buildContactHref({
              intent: "souvenir",
              sourceBlock: "prelaunch-souvenirs",
            })}
            className="inline-flex h-11 min-h-[44px] items-center justify-center border border-border px-6 text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
          >
            {CTA.souvenirPrelaunch.label}
          </Link>
        )}
      </div>
    </div>
  );
}
