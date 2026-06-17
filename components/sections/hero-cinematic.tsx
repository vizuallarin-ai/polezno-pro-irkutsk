"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";
import { CITY_HISTORY_HREF } from "@/lib/brand-constants";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type HeroCta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type HeroCinematicProps = {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctas?: HeroCta[];
};

const DEFAULT_CTAS: HeroCta[] = [
  { label: "Смотреть маршруты", href: "/map", variant: "primary" },
  { label: "Спланировать визит", href: "/program", variant: "secondary" },
  { label: "Узнать о городе", href: CITY_HISTORY_HREF, variant: "secondary" },
];

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
        {after}
      </>
    );
  }
  if (title.includes("без") && title.includes("штампов")) {
    const parts = title.split(/\s+штампов/);
    return (
      <>
        {parts[0]}
        <br />
        <em className="italic">штампов</em>
        {parts[1] || ""}
      </>
    );
  }
  return title;
}

export function HeroCinematic({
  badge = "Авторский навигатор",
  title = "Иркутск без штампов",
  subtitle = "Маршруты, экскурсии и подборка мест — от Алёны Ямщиковой, которая живёт в этом городе.",
  ctas = DEFAULT_CTAS,
}: HeroCinematicProps) {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReduced) {
        gsap.set([headlineRef.current, subtitleRef.current, ctaRef.current], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(headlineRef.current, {
        opacity: 0,
        y: 60,
        duration: 1.2,
        delay: 0.3,
      })
        .from(
          subtitleRef.current,
          { opacity: 0, y: 30, duration: 0.9 },
          "-=0.6"
        )
        .from(ctaRef.current, { opacity: 0, y: 20, duration: 0.7 }, "-=0.5");

      if (videoRef.current) {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => {
            if (videoRef.current) {
              gsap.set(videoRef.current, {
                y: self.progress * 120,
                scale: 1 + self.progress * 0.05,
              });
            }
          },
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="grain relative flex h-[100svh] min-h-[600px] items-end overflow-hidden bg-foreground"
      aria-label="Добро пожаловать в Иркутск"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/explore-history.svg"
        aria-hidden="true"
      >
        <source src="/videos/hero.webm" type="video/webm" />
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 lg:px-8 lg:pb-28">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-primary-foreground/60">
            {badge}
          </p>
          <h1
            ref={headlineRef}
            className="font-serif text-5xl font-light leading-[1.1] tracking-tight text-primary-foreground md:text-6xl lg:text-7xl xl:text-8xl"
          >
            {renderTitle(title)}
          </h1>
          <p
            ref={subtitleRef}
            className="mt-6 max-w-lg text-base font-light text-primary-foreground/70 leading-relaxed"
          >
            {subtitle}
          </p>
          <div
            ref={ctaRef}
            className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
          >
            {ctas.map((cta) => (
              <Link
                key={cta.href + cta.label}
                href={cta.href}
                className={
                  cta.variant === "primary"
                    ? "inline-flex h-12 items-center justify-center px-8 text-sm font-medium bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors duration-200 active:scale-[0.98]"
                    : "inline-flex h-12 items-center justify-center px-8 text-sm font-medium border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 transition-colors duration-200 active:scale-[0.98]"
                }
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() =>
          window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
        }
        className="absolute bottom-8 right-8 z-10 hidden sm:flex flex-col items-center gap-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-200"
        aria-label="Прокрутить вниз"
      >
        <span className="text-xs uppercase tracking-widest">Смотреть</span>
        <ArrowDown size={16} className="animate-bounce" />
      </button>
    </section>
  );
}
