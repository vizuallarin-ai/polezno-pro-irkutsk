"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function FinalCta() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      gsap.from(".cta-content > *", {
        opacity: 0,
        y: 50,
        duration: 0.9,
        stagger: 0.15,
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
      className="relative py-32 lg:py-48 bg-baikal overflow-hidden"
      aria-labelledby="cta-heading"
    >
      <div className="absolute inset-0 opacity-5">
        <svg
          className="h-full w-full"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <filter id="cta-grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#cta-grain)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="cta-content max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6">
            Следующий шаг
          </p>
          <h2
            id="cta-heading"
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-white leading-[1.1] mb-8"
          >
            Готовы
            <br />
            <span className="font-serif italic">гулять?</span>
          </h2>
          <p className="text-white/60 leading-relaxed mb-12 max-w-md text-base">
            Выберите маршрут на карте или напишите — соберём программу под ваши
            даты.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/map"
              className="inline-flex h-12 items-center justify-center gap-2 px-8 text-sm font-medium bg-white text-baikal hover:bg-white/90 transition-colors duration-200 active:scale-[0.98] group"
            >
              К маршрутам
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center px-8 text-sm font-medium border border-white/30 text-white hover:bg-white/10 transition-colors duration-200 active:scale-[0.98]"
            >
              Написать нам
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

