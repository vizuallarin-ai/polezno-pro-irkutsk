"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const directions = [
  {
    id: "tours",
    number: "01",
    title: "Туристические программы",
    subtitle: "Под ключ",
    description:
      "Индивидуальные туры, корпоративные программы, авторские маршруты и сопровождение делегаций. Каждый маршрут — это история, рассказанная через место.",
    href: "/program",
    cta: "Создать программу",
    image: "/images/direction-tours.svg",
    tags: ["Индивидуально", "Корпоративно", "Авторски"],
  },
  {
    id: "excursions",
    number: "02",
    title: "Экскурсии",
    subtitle: "По городу и окрестностям",
    description:
      "Городские, исторические, гастрономические и архитектурные прогулки. Групповые и private-форматы. Иркутск, который знают только местные.",
    href: "/explore/excursions",
    cta: "Выбрать экскурсию",
    image: "/images/direction-excursions.svg",
    tags: ["Городские", "Гастро", "Private"],
  },
  {
    id: "consulting",
    number: "03",
    title: "Консалтинг",
    subtitle: "В туризме и брендинге",
    description:
      "Разработка турпродуктов, сопровождение проектов, брендинг территорий и событийный туризм для бизнеса и государственных структур.",
    href: "/contact",
    cta: "Обсудить проект",
    image: "/images/direction-consulting.svg",
    tags: ["Турпродукт", "Территория", "События"],
  },
  {
    id: "education",
    number: "04",
    title: "Образование",
    subtitle: "Гиды, статьи, маршруты",
    description:
      "Путеводители, PDF-маршруты, лекции и материалы о локальной культуре. Контент для тех, кто хочет узнать Иркутск глубже.",
    href: "/explore",
    cta: "Читать и скачать",
    image: "/images/direction-education.svg",
    tags: ["Гиды", "PDF", "Лекции"],
  },
  {
    id: "shop",
    number: "05",
    title: "Мерч и сувениры",
    subtitle: "Локальная идентичность",
    description:
      "Одежда, постеры, открытки и предметы с байкальской и иркутской эстетикой. Вещи, которые хочется везти домой и дарить.",
    href: "/shop",
    cta: "В магазин",
    image: "/images/direction-shop.svg",
    tags: ["Одежда", "Постеры", "Сувениры"],
  },
];

function DirectionCard({
  direction,
  index,
}: {
  direction: (typeof directions)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      gsap.from(cardRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
        },
      });
    },
    { scope: cardRef }
  );

  const isEven = index % 2 === 0;

  return (
    <div
      ref={cardRef}
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center",
        !isEven && "lg:flex lg:flex-row-reverse"
      )}
    >
      <div className="img-reveal relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={direction.image}
          alt={direction.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute top-4 left-4 z-10 font-serif text-5xl font-light text-white/20 select-none">
          {direction.number}
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
          {direction.subtitle}
        </p>
        <h3 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4">
          {direction.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6 max-w-sm">
          {direction.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {direction.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs uppercase tracking-widest text-muted-foreground border border-border px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={direction.href}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground group w-fit"
        >
          {direction.cta}
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}

export function DirectionsEditorial() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      gsap.from(".directions-header", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".directions-header",
          start: "top 85%",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-36"
      aria-labelledby="directions-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="directions-header mb-20 lg:mb-28">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Что мы делаем
          </p>
          <h2
            id="directions-heading"
            className="text-4xl lg:text-5xl font-light tracking-tight text-foreground max-w-lg"
          >
            Пять направлений <br />
            <span className="font-serif italic">одного проекта</span>
          </h2>
        </div>

        <div className="flex flex-col gap-24 lg:gap-36">
          {directions.map((direction, i) => (
            <DirectionCard key={direction.id} direction={direction} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

