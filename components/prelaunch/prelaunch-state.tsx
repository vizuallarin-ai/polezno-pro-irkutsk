"use client";

import Link from "next/link";
import { MapPin, Compass, Camera, Sparkles, Gift, Users } from "lucide-react";
import { CTA, assistWalkHref, buildContactHref } from "@/lib/cta-constants";
import { trackAnalyticsEvent } from "@/lib/analytics-events";

type PrelaunchSurface =
  | "map"
  | "excursions"
  | "souvenirs"
  | "ar"
  | "photos"
  | "guides"
  | "events"
  | "club";

const COPY: Record<
  PrelaunchSurface,
  {
    title: string;
    body: string;
    formats?: string[];
    primary: "assist" | "discovery" | "contact" | "explore";
    secondary?: "assist" | "discovery" | "explore" | "souvenir" | "contact";
  }
> = {
  map: {
    title: "Маршруты по Иркутску",
    body: "Здесь появятся авторские прогулки по историческому центру, деревянному Иркутску, городским деталям и местам, которые легко пройти мимо. Можно будет выбрать формат: самостоятельно или с Алёной.",
    formats: [
      "Самостоятельные маршруты",
      "Прогулки с Алёной",
      "Короткие и дневные форматы",
    ],
    primary: "assist",
    secondary: "explore",
  },
  excursions: {
    title: "Прогулки с Алёной",
    body: "Авторские экскурсии появятся в каталоге после редакционной подготовки. Пока можно написать — подберём формат под ваш день и компанию.",
    formats: ["Пешие форматы", "Под даты визита", "Для небольшой компании"],
    primary: "assist",
    secondary: "explore",
  },
  souvenirs: {
    title: "Локальные вещи с историей города",
    body: "Раздел сувениров сохраняет связь с Иркутском: изделие → мастер или история → место. Подтверждённые позиции откроются в каталоге без вымышленных остатков.",
    formats: ["Открытки и карты", "Работы мастеров", "Связь с маршрутами"],
    primary: "contact",
    secondary: "souvenir",
  },
  ar: {
    title: "Открытки, которые продолжаются в цифровом формате",
    body: "Смысл раздела: печатная открытка → QR → цифровая история или эффект → место или маршрут. Готовые материалы появятся здесь после публикации — без имитации работающего AR.",
    formats: ["Печатная открытка", "QR-переход", "История места"],
    primary: "contact",
    secondary: "discovery",
  },
  photos: {
    title: "Архив визуальной истории Иркутска",
    body: "Здесь будут старые и современные кадры, сравнения прошлого и настоящего, улицы и места — с связью к маршрутам и материалам. Архив наполняется редакционно, без стоковых подделок.",
    formats: ["Архивные фото", "Современные кадры", "Улицы и места"],
    primary: "explore",
    secondary: "assist",
  },
  guides: {
    title: "Кто проводит прогулки",
    body: "Профили гидов появятся здесь после публикации в CMS. Автор проекта — Алёна Ямщикова; раздел готов принять готовые карточки без перестройки интерфейса.",
    formats: ["Профиль", "Форматы", "Как записаться"],
    primary: "assist",
    secondary: "contact",
  },
  events: {
    title: "События города в одном месте",
    body: "Календарь фестивалей, выставок и городских встреч появится здесь. Пока ближайших дат нет — можно следить за анонсами в Telegram или написать, если хотите предложить событие.",
    formats: ["Фестивали", "Выставки", "Городские встречи"],
    primary: "contact",
    secondary: "explore",
  },
  club: {
    title: "Клуб вокруг Иркутска",
    body: "Закрытые материалы, маршруты и разговоры о городе — на Boosty. Раздел на сайте сохраняет место для клубной линии продукта.",
    formats: ["Закрытые маршруты", "Материалы", "Сообщество"],
    primary: "contact",
    secondary: "discovery",
  },
};

function IconFor({ surface }: { surface: PrelaunchSurface }) {
  const props = { size: 28, "aria-hidden": true as const };
  switch (surface) {
    case "map":
    case "excursions":
      return <MapPin {...props} />;
    case "photos":
      return <Camera {...props} />;
    case "ar":
      return <Sparkles {...props} />;
    case "souvenirs":
      return <Gift {...props} />;
    case "guides":
    case "club":
    case "events":
      return <Users {...props} />;
    default:
      return <Compass {...props} />;
  }
}

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
  const assistHref = assistWalkHref(`prelaunch-${surface}`);
  const contactHref = buildContactHref({
    intent:
      surface === "souvenirs"
        ? "souvenir"
        : surface === "ar"
          ? "ar"
          : surface === "photos"
            ? "photo"
            : "walk",
    sourceBlock: `prelaunch-${surface}`,
  });

  const primaryHref =
    copy.primary === "discovery"
      ? CTA.discovery.href
      : copy.primary === "explore"
        ? CTA.mapExplore.href
        : copy.primary === "assist"
          ? assistHref
          : contactHref;

  const primaryLabel =
    copy.primary === "discovery"
      ? CTA.discovery.label
      : copy.primary === "explore"
        ? CTA.mapExplore.label
        : copy.primary === "assist"
          ? CTA.assist.label
          : CTA.prelaunchContact.label;

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
      <div className="mb-4 text-muted-foreground">
        <IconFor surface={surface} />
      </div>
      <h2 className="type-h2 text-foreground mb-3 max-w-xl text-balance">
        {copy.title}
      </h2>
      <p className="type-body-sm text-muted-foreground max-w-lg mb-6">
        {copy.body}
      </p>
      {copy.formats && copy.formats.length > 0 && !compact && (
        <ul className="flex flex-wrap justify-center gap-2 mb-8 max-w-lg">
          {copy.formats.map((item) => (
            <li
              key={item}
              className="type-meta border border-border bg-background px-3 py-1.5 text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={primaryHref}
          onClick={() =>
            trackAnalyticsEvent("hero_cta_click", {
              sourceBlock: `prelaunch-${surface}`,
              cta: primaryLabel,
            })
          }
          className="cta-label cta-label-wrap-sm inline-flex h-11 min-h-[44px] items-center justify-center bg-foreground text-primary-foreground px-6 type-button hover:bg-foreground/90 transition-colors duration-200"
        >
          {primaryLabel}
        </Link>
        {copy.secondary === "explore" && (
          <Link
            href={CTA.mapExplore.href}
            className="cta-label cta-label-wrap-sm inline-flex h-11 min-h-[44px] items-center justify-center border border-border px-6 type-button text-foreground hover:bg-muted transition-colors duration-200"
          >
            {CTA.mapExplore.label}
          </Link>
        )}
        {copy.secondary === "discovery" && (
          <Link
            href={CTA.discovery.href}
            className="cta-label cta-label-wrap-sm inline-flex h-11 min-h-[44px] items-center justify-center border border-border px-6 type-button text-foreground hover:bg-muted transition-colors duration-200"
          >
            {CTA.discovery.label}
          </Link>
        )}
        {copy.secondary === "assist" && (
          <Link
            href={assistHref}
            className="cta-label cta-label-wrap-sm inline-flex h-11 min-h-[44px] items-center justify-center border border-border px-6 type-button text-foreground hover:bg-muted transition-colors duration-200"
          >
            {CTA.assist.label}
          </Link>
        )}
        {copy.secondary === "souvenir" && (
          <Link
            href={buildContactHref({
              intent: "souvenir",
              sourceBlock: "prelaunch-souvenirs",
            })}
            className="cta-label cta-label-wrap-sm inline-flex h-11 min-h-[44px] items-center justify-center border border-border px-6 type-button text-foreground hover:bg-muted transition-colors duration-200"
          >
            {CTA.souvenirPrelaunch.label}
          </Link>
        )}
        {copy.secondary === "contact" && copy.primary !== "contact" && (
          <Link
            href={contactHref}
            className="cta-label cta-label-wrap-sm inline-flex h-11 min-h-[44px] items-center justify-center border border-border px-6 type-button text-foreground hover:bg-muted transition-colors duration-200"
          >
            {CTA.prelaunchContact.label}
          </Link>
        )}
      </div>
    </div>
  );
}
