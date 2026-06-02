"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { BOOSTY_URL } from "@/lib/site-links";

export function BoostyTeaser() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      gsap.from(".boosty-content > *", {
        opacity: 0,
        y: 36,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 border-y border-border"
      aria-labelledby="boosty-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="boosty-content grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Клуб на Boosty
            </p>
            <h2
              id="boosty-heading"
              className="text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-5"
            >
              Ближе к <span className="font-serif italic">автору</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Закрытые маршруты, разборы мест и эфиры для тех, кто хочет
              Иркутск глубже — без рекламного шума.
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:items-end">
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground lg:text-right">
              <li>Эксклюзивные PDF-маршруты</li>
              <li>Ранний доступ к материалам</li>
              <li>Закрытый чат и эфиры</li>
            </ul>
            <a
              href={BOOSTY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 px-8 text-sm font-medium bg-foreground text-primary-foreground hover:bg-foreground/90 transition-colors duration-200 w-fit"
            >
              Вступить в клуб
              <ArrowUpRight size={14} aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
