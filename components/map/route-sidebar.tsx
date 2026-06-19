"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Clock, MapPin, ArrowRight, Lock, Headphones, CalendarDays, Users } from "lucide-react";
import type { MapRoute, RouteCategory } from "@/types/map";
import { ROUTE_CATEGORY_LABELS } from "@/types/map";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/map/audio-player";
import { cn } from "@/lib/utils";

interface RouteSidebarProps {
  routes: MapRoute[];
  activeRoute: MapRoute | null;
  activeCategory: RouteCategory | "all";
  activeType: "all" | "free" | "paid";
  onRouteSelect: (route: MapRoute | null) => void;
  onCategoryChange: (cat: RouteCategory | "all") => void;
  onTypeChange: (type: "all" | "free" | "paid") => void;
  className?: string;
}

const categories: Array<{ value: RouteCategory | "all"; label: string }> = [
  { value: "all", label: "Все" },
  { value: "architecture", label: "Архитектура" },
  { value: "gastronomy", label: "Гастро" },
  { value: "history", label: "История" },
  { value: "decembrists", label: "Декабристы" },
  { value: "wooden", label: "Зодчество" },
  { value: "hidden", label: "Hidden" },
  { value: "soviet", label: "Советский" },
  { value: "night", label: "Ночной" },
];

export function RouteSidebar({
  routes,
  activeRoute,
  activeCategory,
  activeType,
  onRouteSelect,
  onCategoryChange,
  onTypeChange,
  className,
}: RouteSidebarProps) {
  if (activeRoute) {
    return (
      <div className={cn("flex flex-col h-full overflow-y-auto", className)}>
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm flex items-center justify-between px-5 py-4 border-b border-border">
          <button
            onClick={() => onRouteSelect(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            aria-label="Назад к списку маршрутов"
          >
            <X size={14} />
            Назад
          </button>
          <Badge
            variant={activeRoute.type === "free" ? "baikal" : "amber"}
            className="text-xs"
          >
            {activeRoute.type === "free" ? "Бесплатно" : `${activeRoute.price?.toLocaleString("ru-RU")} ₽`}
          </Badge>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {activeRoute.cover && (
            <div className="relative aspect-video overflow-hidden bg-muted rounded-none">
              <Image
                src={activeRoute.cover.url}
                alt={activeRoute.cover.alt || activeRoute.title}
                fill
                className="object-cover"
                sizes="380px"
              />
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {ROUTE_CATEGORY_LABELS[activeRoute.category]}
            </p>
            <h2 className="text-xl font-medium text-foreground leading-snug">
              {activeRoute.title}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {activeRoute.duration && (
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {activeRoute.duration} мин
              </span>
            )}
            {activeRoute.distance && (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} />
                {activeRoute.distance} км
              </span>
            )}
            {activeRoute.audioGuide && (
              <span className="flex items-center gap-1.5">
                <Headphones size={12} />
                Аудиогид
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {activeRoute.description}
          </p>

          {activeRoute.guide && (
            <div className="flex items-center gap-3 py-3 border-y border-border">
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0">
                {activeRoute.guide.photo?.url && (
                  <Image
                    src={activeRoute.guide.photo.url}
                    alt={activeRoute.guide.name}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Автор маршрута</p>
                <p className="text-sm font-medium">{activeRoute.guide.name}</p>
              </div>
            </div>
          )}

          {activeRoute.audioGuide && (
            <AudioPlayer
              src={activeRoute.audioGuide.url}
              title={`Аудиогид: ${activeRoute.title}`}
            />
          )}

          {activeRoute.schedule && activeRoute.schedule.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <CalendarDays size={11} />
                Ближайшие даты
              </p>
              <ul className="flex flex-col gap-2">
                {activeRoute.schedule
                  .filter((s) => s.isOpen !== false)
                  .slice(0, 4)
                  .map((slot, i) => {
                    const d = new Date(slot.date);
                    const dateStr = d.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                    });
                    const hasSpots =
                      slot.spotsLeft !== undefined && slot.spotsLeft > 0;
                    const isFull =
                      slot.spotsLeft !== undefined && slot.spotsLeft === 0;
                    return (
                      <li
                        key={i}
                        className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0"
                      >
                        <span className="text-foreground">
                          {dateStr}
                          {slot.time && (
                            <span className="text-muted-foreground ml-2">
                              {slot.time}
                            </span>
                          )}
                        </span>
                        {isFull ? (
                          <span className="text-xs text-muted-foreground">
                            Нет мест
                          </span>
                        ) : hasSpots ? (
                          <span className="text-xs text-baikal flex items-center gap-1">
                            <Users size={10} />
                            {slot.spotsLeft} мест
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {activeRoute.places && activeRoute.places.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Точки маршрута ({activeRoute.places.length})
              </p>
              <ul className="flex flex-col gap-2">
                {activeRoute.places.map((place, i) => (
                  <li
                    key={place.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="text-xs tabular-nums text-muted-foreground mt-0.5 w-4 shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">
                        {place.title}
                      </p>
                      {place.isLocalGem && (
                        <p className="text-xs text-baikal mt-0.5">
                          Место от локалов
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* QR-код для самостоятельного маршрута */}
          <div className="flex items-start gap-4 p-4 bg-card border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr?slug=${encodeURIComponent(activeRoute.slug)}`}
              alt={`QR-код маршрута «${activeRoute.title}»`}
              width={72}
              height={72}
              className="shrink-0"
            />
            <div>
              <p className="text-xs font-medium text-foreground mb-1">
                Сканируйте QR на маршруте
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Откройте карту с точками прямо на месте
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-border">
            {activeRoute.type === "free" ? (
              <>
                {activeRoute.pdfGuide && (
                  <a
                    href={activeRoute.pdfGuide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 border border-border px-5 text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
                  >
                    Скачать PDF-маршрут
                  </a>
                )}
                <Link
                  href="/business"
                  className="inline-flex h-10 items-center justify-center gap-2 bg-foreground text-primary-foreground px-5 text-sm font-medium hover:bg-foreground/90 transition-colors duration-200"
                >
                  Забронировать экскурсию
                  <ArrowRight size={13} />
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock size={12} />
                  <span>Платный авторский маршрут</span>
                </div>
                <Link
                  href={`/souvenirs/${activeRoute.slug}`}
                  className="inline-flex h-10 items-center justify-center gap-2 bg-baikal text-white px-5 text-sm font-medium hover:bg-baikal-light transition-colors duration-200"
                >
                  Купить маршрут — {activeRoute.price?.toLocaleString("ru-RU")} ₽
                  <ArrowRight size={13} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="px-5 py-5 border-b border-border">
        <h1 className="text-base font-medium mb-1">Маршруты по Иркутску</h1>
        <p className="text-xs text-muted-foreground">
          {routes.length} {routes.length === 1 ? "маршрут" : routes.length < 5 ? "маршрута" : "маршрутов"}
        </p>
      </div>

      <div className="px-5 py-4 border-b border-border flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={cn(
                "text-xs px-2.5 py-1.5 border transition-colors duration-150",
                activeCategory === cat.value
                  ? "bg-foreground text-primary-foreground border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {(["all", "free", "paid"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTypeChange(t)}
              className={cn(
                "text-xs px-3 py-1.5 border transition-colors duration-150",
                activeType === t
                  ? "bg-foreground text-primary-foreground border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              {t === "all" ? "Все" : t === "free" ? "Бесплатные" : "Платные"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {routes.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            Маршруты не найдены
          </div>
        ) : (
          <ul>
            {routes.map((route, i) => (
              <li key={route.id}>
                {i > 0 && <div className="h-px bg-border mx-5" />}
                <button
                  onClick={() => onRouteSelect(route)}
                  className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-muted/50 transition-colors duration-150 group"
                  aria-label={`Маршрут: ${route.title}`}
                >
                  {route.cover ? (
                    <div className="relative w-16 h-16 shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={route.cover.url}
                        alt={route.cover.alt || route.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 shrink-0 bg-muted flex items-center justify-center">
                      <MapPin size={16} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {ROUTE_CATEGORY_LABELS[route.category]}
                    </p>
                    <p className="text-sm font-medium text-foreground leading-snug group-hover:text-baikal transition-colors duration-150 line-clamp-2">
                      {route.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {route.duration && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {route.duration} мин
                        </span>
                      )}
                      <span className={cn(
                        "font-medium",
                        route.type === "free" ? "text-baikal" : "text-amber"
                      )}>
                        {route.type === "free" ? "Бесплатно" : `${route.price?.toLocaleString("ru-RU")} ₽`}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
