"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { CityImage } from "./city-image";
import { cn } from "@/lib/utils";
import { CITY_HISTORY_HREF } from "@/lib/brand-constants";
import { trackAnalyticsEvent } from "@/lib/analytics-events";

export type HeroCta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type CityHeroVisualProps = {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctas?: HeroCta[];
  imageSrc?: string;
  imageAlt?: string;
  caption?: string;
  credit?: string;
  year?: string | number;
  place?: string;
  className?: string;
};

function renderTitle(title: string) {
  if (title.includes("Иркутск")) {
    const [before, ...rest] = title.split("Иркутск");
    const after = rest.join("Иркутск");
    return (
      <>
        {before}
        <Link
          href={CITY_HISTORY_HREF}
          className="underline-offset-4 hover:underline"
        >
          Иркутск
        </Link>
        {after.includes("штампов") ? (
          <>
            {after.replace(/\s*штампов.*/, " ")}
            <em className="italic">штампов</em>
            {after.match(/штампов(.*)/)?.[1] ?? ""}
          </>
        ) : (
          after
        )}
      </>
    );
  }
  if (title.includes("без") && title.includes("штампов")) {
    const parts = title.split(/\s+штампов/);
    return (
      <>
        {parts[0]}{" "}
        <em className="italic">штампов</em>
        {parts[1] || ""}
      </>
    );
  }
  return title;
}

export function CityHeroVisual({
  badge = "Авторский навигатор",
  title = "Иркутск без штампов",
  subtitle = "Маршруты, экскурсии и подборка мест — от Алёны Ямщиковой, которая живёт в этом городе.",
  ctas = [],
  imageSrc = "/images/explore-history.svg",
  imageAlt = "Иркутск — вид города",
  caption,
  credit,
  year,
  place,
  className,
}: CityHeroVisualProps) {
  return (
    <section
      className={cn(
        "grain relative flex h-[100svh] min-h-[600px] items-end overflow-hidden bg-city-ink",
        className
      )}
      aria-label="Добро пожаловать в Иркутск"
    >
      <div className="absolute inset-0">
        <CityImage
          src={imageSrc}
          alt={imageAlt}
          aspectRatio="auto"
          className="h-full w-full"
          imageClassName="opacity-75"
          sizes="100vw"
          priority
          overlay
          caption={caption}
          credit={credit}
          year={year}
          place={place}
          captionClassName="px-6 pb-4 lg:px-8 lg:pb-6"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 lg:px-8 lg:pb-28">
        <div className="max-w-3xl">
          <p className="mb-4 type-caption uppercase tracking-[0.2em] text-primary-foreground/60">
            {badge}
          </p>
          <h1 className="type-display-xl text-primary-foreground max-w-[16ch] sm:max-w-[18ch] md:max-w-none">
            {renderTitle(title)}
          </h1>
          <p className="mt-6 max-w-lg type-body-lg font-light text-primary-foreground/75">
            {subtitle}
          </p>
          {ctas.length > 0 && (
            <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              {ctas.map((cta) => (
                <Link
                  key={cta.href + cta.label}
                  href={cta.href}
                  onClick={() => {
                    const isBusiness = cta.href.startsWith("/business");
                    trackAnalyticsEvent(
                      isBusiness ? "business_cta_click" : "hero_cta_click",
                      {
                        sourceBlock: "hero",
                        cta: cta.label,
                        path: cta.href,
                      }
                    );
                  }}
                  className={
                    cta.variant === "primary"
                      ? "cta-label cta-label-wrap-sm inline-flex h-12 min-h-[44px] items-center justify-center px-8 type-button bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors duration-200 active:scale-[0.98]"
                      : "cta-label cta-label-wrap-sm inline-flex h-12 min-h-[44px] items-center justify-center px-8 type-button border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 transition-colors duration-200 active:scale-[0.98]"
                  }
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
        }
        className="absolute bottom-8 right-8 z-10 hidden sm:flex flex-col items-center gap-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-200"
        aria-label="Прокрутить вниз"
      >
        <span className="type-caption uppercase tracking-widest">Смотреть</span>
        <ArrowDown size={16} className="animate-bounce" />
      </button>
    </section>
  );
}
