"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  slug: string;
  image: string;
  story?: string;
};

export function ShopPreview({ products }: { products?: Product[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const items = products ?? [];

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced || items.length === 0) return;

      gsap.from(".shop-header", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".shop-header", start: "top 85%" },
      });

      gsap.from(".product-card", {
        opacity: 0,
        y: 50,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".products-grid",
          start: "top 80%",
        },
      });
    },
    { scope: sectionRef, dependencies: [items.length] }
  );

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-36"
      aria-labelledby="shop-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="shop-header flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Магазин
            </p>
            <h2
              id="shop-heading"
              className="text-4xl lg:text-5xl font-light tracking-tight text-foreground"
            >
              Вещи с <br />
              <span className="font-serif italic">характером</span>
            </h2>
          </div>
          <Link
            href="/souvenirs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group shrink-0"
          >
            В каталог
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border">
            <p className="text-muted-foreground mb-2">
              Магазин открывается — коллекции готовим вместе с маршрутами проекта
            </p>
            <Link href="/souvenirs" className="text-sm text-baikal hover:underline">
              Страница магазина
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-10 max-w-md">
              Подборка из каталога. Полный ассортимент — в магазине.
            </p>
            <div className="products-grid grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {items.map((product) => (
                <Link
                  key={product.id}
                  href={`/souvenirs/${product.slug}`}
                  className="product-card group flex flex-col"
                  aria-label={product.title}
                >
                  <div className="img-reveal relative aspect-square overflow-hidden bg-card mb-4">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      {product.category}
                    </p>
                    <p className="text-sm font-medium text-foreground leading-snug mb-1 group-hover:text-baikal transition-colors duration-200">
                      {product.title}
                    </p>
                    {product.story && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {product.story}
                      </p>
                    )}
                    <p className="text-sm font-medium">
                      {product.price.toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
