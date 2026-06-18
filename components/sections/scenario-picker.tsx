"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Building2, BookOpen, Compass, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { CITY_HISTORY_HREF } from "@/lib/brand-constants";

const scenarios = [
  {
    id: "guest",
    title: "Приехать в гости",
    description: "Маршруты и программа на 2–5 дней без штампов.",
    href: "/map",
    cta: "К маршрутам",
    icon: Compass,
  },
  {
    id: "local",
    title: "Живу в Иркутске",
    description: "Дворы, гиды и места, которые пропускают в путеводителях.",
    href: "/explore",
    cta: "Исследовать",
    icon: MapPin,
  },
  {
    id: "team",
    title: "Для команды",
    description: "Корпоративы, делегации и программы под вашу задачу.",
    href: "/business",
    cta: "Обсудить",
    icon: Building2,
  },
  {
    id: "learn",
    title: "Узнать город",
    description: "История, контекст и неочевидные факты об Иркутске.",
    href: CITY_HISTORY_HREF,
    cta: "Читать",
    icon: BookOpen,
  },
] as const;

export function ScenarioPicker() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      gsap.from(".scenario-header", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".scenario-header",
          start: "top 85%",
        },
      });

      gsap.from(".scenario-card", {
        opacity: 0,
        y: 36,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".scenario-grid",
          start: "top 82%",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 bg-card border-y border-border"
      aria-labelledby="scenario-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="scenario-header mb-12 lg:mb-14">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            С чего начать
          </p>
          <h2
            id="scenario-heading"
            className="text-3xl lg:text-4xl font-light tracking-tight text-foreground max-w-xl"
          >
            Что вы хотите <span className="font-serif italic">сделать</span>
          </h2>
        </div>

        <div className="scenario-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            const className = cn(
              "scenario-card group flex flex-col gap-4 border border-border bg-background p-6 transition-colors duration-200",
              "hover:border-foreground/20 hover:bg-background"
            );
            const content = (
              <>
                <Icon
                  size={22}
                  className="text-baikal"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="text-lg font-medium tracking-tight text-foreground">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {scenario.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground mt-auto">
                  {scenario.cta}
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </>
            );

            if ("external" in scenario && scenario.external) {
              return (
                <a
                  key={scenario.id}
                  href={scenario.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={scenario.id} href={scenario.href} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
