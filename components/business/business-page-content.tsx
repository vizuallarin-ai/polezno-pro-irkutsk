import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Route } from "@/lib/data/routes";
import type { ExploreMaterialView } from "@/lib/explore";
import {
  BUSINESS_AUDIENCES,
  BUSINESS_DIRECTIONS,
  BUSINESS_FAQ,
  BUSINESS_FORMATS,
  BUSINESS_TASK_EXAMPLES,
  BUSINESS_WHY_POINTS,
  BUSINESS_WORKFLOW_STEPS,
} from "@/lib/business-constants";
import { BusinessForm } from "@/components/forms/business-form";
import { ROUTE_FORMAT_LABELS } from "@/lib/data/routes";
import { ROUTE_CATEGORY_LABELS } from "@/types/map";
import { cn } from "@/lib/utils";

interface BusinessPageContentProps {
  corporateRoutes: Route[];
  businessArticles: ExploreMaterialView[];
  initialTaskType?: string;
  initialRouteSlug?: string;
  initialExcursionSlug?: string;
  initialSourceBlock?: string;
  initialMessage?: string;
}

function buildBusinessFormHref(taskType: string, sourceBlock: string) {
  const params = new URLSearchParams({ taskType, sourceBlock });
  return `/business?${params.toString()}#business-form`;
}

export function BusinessPageContent({
  corporateRoutes,
  businessArticles,
  initialTaskType,
  initialRouteSlug,
  initialExcursionSlug,
  initialSourceBlock,
  initialMessage,
}: BusinessPageContentProps) {
  return (
    <main className="pt-24 min-h-screen">
      {/* Hero */}
      <section className="py-16 lg:py-24 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                B2B-направление Иркпортала
              </p>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-light tracking-tight text-foreground mb-6">
                Для <span className="font-serif italic">бизнеса</span>
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-lg text-lg">
                Программы для компаний, отелей, ресторанов и турпроектов в
                Иркутске — с авторским взглядом Алёны Ямщиковой и базой
                маршрутов Иркпортала.
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:pb-2">
              {[
                "Делегации и корпоративные гости",
                "Сопровождение турпроектов",
                "Обучение персонала отелей и ресторанов",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-baikal shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
              <Link
                href="#business-form"
                className="inline-flex h-11 items-center justify-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 transition-colors w-fit mt-4"
              >
                Обсудить задачу
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Directions */}
      <section className="py-20 lg:py-28" aria-labelledby="directions-heading">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 lg:mb-20">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Направления
            </p>
            <h2
              id="directions-heading"
              className="text-3xl lg:text-4xl font-light tracking-tight text-foreground max-w-xl"
            >
              Три формата <span className="font-serif italic">работы</span>
            </h2>
          </div>

          <div className="flex flex-col gap-16 lg:gap-24">
            {BUSINESS_DIRECTIONS.map((direction, index) => {
              const Icon = direction.icon;
              const isEven = index % 2 === 0;
              return (
                <div
                  key={direction.id}
                  className={cn(
                    "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start",
                    !isEven && "lg:[&>div:first-child]:order-2"
                  )}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-4xl font-light text-muted-foreground/40">
                        {direction.number}
                      </span>
                      <Icon size={22} className="text-baikal" strokeWidth={1.25} />
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      {direction.subtitle}
                    </p>
                    <h3 className="text-2xl lg:text-3xl font-light tracking-tight">
                      {direction.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed max-w-md">
                      {direction.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
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
                      href={buildBusinessFormHref(direction.taskType, `direction-${direction.slug}`)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-foreground group w-fit mt-2"
                    >
                      Обсудить это направление
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                  <ul className="flex flex-col gap-3 border border-border bg-card p-6 lg:p-8">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      Примеры задач
                    </p>
                    {direction.examples.map((example) => (
                      <li
                        key={example}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <span className="w-1 h-1 rounded-full bg-baikal mt-2 shrink-0" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="py-16 lg:py-20 bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Для кого
          </p>
          <h2 className="text-2xl lg:text-3xl font-light tracking-tight mb-10">
            С кем мы <span className="font-serif italic">работаем</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {BUSINESS_AUDIENCES.map((item) => (
              <span
                key={item}
                className="text-sm border border-border bg-background px-4 py-2 text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Task examples */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Примеры задач
          </p>
          <h2 className="text-2xl lg:text-3xl font-light tracking-tight mb-10 max-w-lg">
            Что обычно <span className="font-serif italic">приходят решать</span>
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BUSINESS_TASK_EXAMPLES.map((task) => (
              <li
                key={task}
                className="flex items-start gap-3 text-sm text-muted-foreground border border-border p-4"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-baikal mt-1.5 shrink-0" />
                {task}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-16 lg:py-24 bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Процесс
          </p>
          <h2 className="text-2xl lg:text-3xl font-light tracking-tight mb-12">
            Как проходит <span className="font-serif italic">работа</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {BUSINESS_WORKFLOW_STEPS.map((step) => (
              <div key={step.step} className="flex flex-col gap-3">
                <span className="font-serif text-3xl font-light text-muted-foreground/40">
                  {step.step}
                </span>
                <h3 className="text-lg font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Alyona */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Экспертиза
          </p>
          <h2 className="text-2xl lg:text-3xl font-light tracking-tight mb-12 max-w-lg">
            Почему с <span className="font-serif italic">Алёной</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {BUSINESS_WHY_POINTS.map((point) => (
              <div key={point.title} className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">{point.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="py-16 lg:py-20 bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Форматы
          </p>
          <h2 className="text-2xl lg:text-3xl font-light tracking-tight mb-10">
            Как можем <span className="font-serif italic">подключиться</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {BUSINESS_FORMATS.map((format) => (
              <div
                key={format.title}
                className="border border-border bg-background p-6 flex flex-col gap-2"
              >
                <h3 className="font-medium">{format.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {format.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate routes */}
      {corporateRoutes.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                  Маршруты
                </p>
                <h2 className="text-2xl lg:text-3xl font-light tracking-tight">
                  Корпоративные <span className="font-serif italic">маршруты</span>
                </h2>
              </div>
              <Link
                href="/map?filter=corporate"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground group"
              >
                Все на карте
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {corporateRoutes.map((route) => (
                <CorporateRouteCard key={route.slug} route={route} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lead form */}
      <section
        id="business-form"
        className="py-16 lg:py-24 bg-card border-y border-border scroll-mt-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Заявка
              </p>
              <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-6">
                Расскажите о <span className="font-serif italic">задаче</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-sm mb-8">
                Опишите контекст — вернёмся с вопросами и предложением формата.
                Без обязательств на первом шаге.
              </p>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Или напишите через контакты
              </Link>
            </div>
            <BusinessForm
              initialTaskType={initialTaskType}
              initialRouteSlug={initialRouteSlug}
              initialExcursionSlug={initialExcursionSlug}
              initialSourceBlock={initialSourceBlock}
              initialMessage={initialMessage}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            FAQ
          </p>
          <h2 className="text-2xl lg:text-3xl font-light tracking-tight mb-10">
            Частые <span className="font-serif italic">вопросы</span>
          </h2>
          <div className="flex flex-col divide-y divide-border border-y border-border">
            {BUSINESS_FAQ.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer text-sm font-medium list-none flex items-center justify-between gap-4">
                  {item.question}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3 pr-8">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related articles */}
      {businessArticles.length > 0 && (
        <section className="py-16 lg:py-20 bg-card border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              Материалы
            </p>
            <h2 className="text-2xl lg:text-3xl font-light tracking-tight mb-10">
              Полезное для <span className="font-serif italic">бизнеса</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {businessArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/explore/${article.slug}`}
                  className="group flex flex-col border border-border bg-background hover:border-foreground/20 transition-colors"
                >
                  <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                    <Image
                      src={article.coverUrl}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <h3 className="text-base font-medium leading-snug group-hover:text-baikal transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {article.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium mt-2">
                      Читать
                      <ArrowRight
                        size={13}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/explore/business"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground mt-8 group"
            >
              Все материалы для бизнеса
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-baikal text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-6">
            Готовы обсудить <span className="font-serif italic">проект</span>?
          </h2>
          <p className="text-white/70 max-w-md mx-auto mb-10">
            Оставьте заявку — или посмотрите маршруты, которые можно адаптировать
            под вашу аудиторию.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#business-form"
              className="inline-flex h-12 items-center justify-center gap-2 px-8 text-sm font-medium bg-white text-baikal hover:bg-white/90 transition-colors"
            >
              Оставить заявку
            </Link>
            <Link
              href="/map"
              className="inline-flex h-12 items-center justify-center px-8 text-sm font-medium border border-white/30 hover:bg-white/10 transition-colors"
            >
              Смотреть маршруты
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function CorporateRouteCard({ route }: { route: Route }) {
  const params = new URLSearchParams({
    route: route.slug,
    taskType: "route_program",
    sourceBlock: "routes",
    sourceTitle: route.title,
  });

  return (
    <article className="flex flex-col border border-border bg-background hover:border-foreground/30 transition-colors">
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {route.coverImage ? (
          <Image
            src={route.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 50vw, 25vw"
          />
        ) : null}
      </div>
      <div className="flex flex-col flex-1 p-5 gap-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {ROUTE_CATEGORY_LABELS[route.mapCategory]} ·{" "}
          {ROUTE_FORMAT_LABELS[route.format]}
        </p>
        <h3 className="text-lg font-medium leading-snug">{route.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {route.description}
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href={`/map/${route.slug}`}
            className="inline-flex h-10 items-center justify-center gap-2 bg-foreground text-primary-foreground px-4 text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Открыть маршрут
            <ArrowRight size={13} />
          </Link>
          <Link
            href={`/business?${params.toString()}#business-form`}
            className="inline-flex h-10 items-center justify-center border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Запросить корпоративный формат
          </Link>
        </div>
      </div>
    </article>
  );
}
