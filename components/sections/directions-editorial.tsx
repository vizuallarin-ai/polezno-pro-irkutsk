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

const mainProducts = [
  {
    id: "routes",
    number: "01",
    title: "Авторские маршруты",
    subtitle: "Свободный темп",
    description:
      "Точки, подсказки и логика прогулки — без толпы и без «обязательной» программы.",
    href: "/map",
    cta: "Открыть карту",
    image: "/images/direction-education.svg",
    tags: ["Пешком", "Аудио", "PDF"],
  },
  {
    id: "excursions",
    number: "02",
    title: "Экскурсии",
    subtitle: "С гидом",
    description:
      "Город, гастро и история — групповые и частные форматы. Запись через форму.",
    href: "/map?filter=guided",
    cta: "Смотреть экскурсии",
    image: "/images/direction-excursions.svg",
    tags: ["Город", "Гастро", "Private"],
  },
  {
    id: "corporate",
    number: "03",
    title: "Для компаний",
    subtitle: "Команды и делегации",
    description:
      "Тимбилдинги, приёмы гостей и программы под задачу — от идеи до сопровождения.",
    href: "/program",
    cta: "Обсудить программу",
    image: "/images/direction-tours.svg",
    tags: ["Корпоратив", "Делегации", "Под ключ"],
  },
];

function ProductCard({
  product,
  index,
}: {
  product: (typeof mainProducts)[0];
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
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute top-4 left-4 z-10 font-serif text-5xl font-light text-white/20 select-none">
          {product.number}
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
          {product.subtitle}
        </p>
        <h3 className="text-3xl lg:text-4xl font-light tracking-tight text-foreground mb-4">
          {product.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6 max-w-sm">
          {product.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs uppercase tracking-widest text-muted-foreground border border-border px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={product.href}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground group w-fit"
        >
          {product.cta}
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

      gsap.from(".products-header", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".products-header",
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
      aria-labelledby="products-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="products-header mb-20 lg:mb-28">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Главное
          </p>
          <h2
            id="products-heading"
            className="text-4xl lg:text-5xl font-light tracking-tight text-foreground max-w-lg"
          >
            Три способа <br />
            <span className="font-serif italic">увидеть город</span>
          </h2>
        </div>

        <div className="flex flex-col gap-24 lg:gap-36">
          {mainProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
