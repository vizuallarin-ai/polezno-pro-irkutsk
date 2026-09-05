"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function FinalCta({
  primaryHref = "/explore",
  primaryLabel = "Исследовать Иркутск",
  supportText = "Можно начать с материалов о городе или сразу написать — соберём программу под ваши даты.",
}: {
  primaryHref?: string;
  primaryLabel?: string;
  supportText?: string;
} = {}) {
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
          <p className="type-eyebrow text-white/45 mb-6">Следующий шаг</p>
          <h2
            id="cta-heading"
            className="type-display-l text-white mb-8 max-w-[14ch]"
          >
            Готовы гулять?
          </h2>
          <p className="type-lead text-white/60 mb-12 max-w-md">{supportText}</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={primaryHref}
              className="cta-label cta-on-dark-primary type-button group"
            >
              {primaryLabel}
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/contact?intent=walk&sourceBlock=final-cta#lead-form"
              className="cta-label cta-label-wrap-sm cta-on-dark-secondary type-button"
            >
              Подобрать мне прогулку
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
