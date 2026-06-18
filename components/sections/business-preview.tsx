"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

export function BusinessPreviewSection() {
  return (
    <section
      className="py-16 lg:py-20 border-y border-border bg-card"
      aria-labelledby="business-preview-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 border border-border bg-background p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Building2
              size={28}
              className="text-baikal shrink-0"
              strokeWidth={1.25}
              aria-hidden
            />
            <div className="flex flex-col gap-3 max-w-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                B2B
              </p>
              <h2
                id="business-preview-heading"
                className="text-2xl lg:text-3xl font-light tracking-tight"
              >
                Для <span className="font-serif italic">бизнеса</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Программы для отелей, ресторанов, турпроектов и делегаций —
                с авторским взглядом на Иркутск.
              </p>
            </div>
          </div>
          <Link
            href="/business"
            className="inline-flex h-11 items-center justify-center gap-2 border border-foreground px-6 text-sm font-medium hover:bg-foreground hover:text-primary-foreground transition-colors shrink-0"
          >
            Подробнее
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
