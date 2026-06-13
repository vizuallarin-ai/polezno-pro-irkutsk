"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { ROUTE_CATEGORY_OPTIONS } from "@/lib/content-labels";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const routeCategories = ROUTE_CATEGORY_OPTIONS.map((option) => option.label);

export function MapTeaser() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      gsap.from(".map-teaser-content > *", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-36 bg-foreground overflow-hidden"
      aria-labelledby="map-teaser-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="map-teaser-content flex flex-col">
            <p className="text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">
              Карта маршрутов
            </p>
            <h2
              id="map-teaser-heading"
              className="text-4xl lg:text-5xl font-light tracking-tight text-primary-foreground mb-6"
            >
              Иркутск на{" "}
              <span className="font-serif italic text-ice">карте</span>
            </h2>
            <p className="text-primary-foreground/60 leading-relaxed mb-8 max-w-sm">
              Авторские прогулки по районам: точки, подсказки и темп — ваш.
              Без навязанной «обязательной» программы.
            </p>

            <div className="flex flex-wrap gap-2 mb-10">
              {routeCategories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs uppercase tracking-wider text-primary-foreground/40 border border-primary-foreground/15 px-3 py-1.5 hover:border-primary-foreground/40 hover:text-primary-foreground/70 transition-colors duration-200 cursor-default"
                >
                  {cat}
                </span>
              ))}
            </div>

            <Link
              href="/map"
              className="inline-flex items-center gap-3 text-sm font-medium text-primary-foreground group w-fit border border-primary-foreground/30 px-6 py-3 hover:bg-primary-foreground/10 transition-colors duration-200"
            >
              Открыть маршруты
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/images/map-preview.svg"
              alt="Карта маршрутов по Иркутску"
              fill
              className="object-cover opacity-60"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 border border-primary-foreground/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="text-5xl font-light text-primary-foreground/20 font-serif">
                  8
                </div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/40">
                  категорий маршрутов
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

