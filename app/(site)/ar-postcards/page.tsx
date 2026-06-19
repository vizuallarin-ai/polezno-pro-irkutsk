import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, QrCode, Sparkles } from "lucide-react";
import { CityHeroVisual } from "@/components/visual/city-hero-visual";
import { VisualEmptyState } from "@/components/visual/visual-empty-state";
import { PostcardCard } from "@/components/ar-postcards/postcard-card";
import { getFeaturedArPostcards, getPublishedArPostcards } from "@/lib/ar-postcards";
import { ContactCtaSection } from "@/components/contact/contact-cta-section";

export const metadata: Metadata = {
  title: "Ожившие открытки Иркутска — AR-открытки и цифровые истории",
  description:
    "Физические открытки с QR-кодом: видео, аудиоистории и цифровые слои про Иркутск. Заказ по заявке — без приложения и без штампов.",
  openGraph: {
    title: "Ожившие открытки Иркутска — AR-открытки и цифровые истории",
    description:
      "Отсканируйте QR на открытке — откроется история, маршрут и сувениры Иркпортала.",
  },
};

const STEPS = [
  {
    step: "01",
    title: "Получите открытку",
    text: "Печатная открытка с QR — в наборе сувениров Иркпортала или у партнёров.",
  },
  {
    step: "02",
    title: "Наведите камеру",
    text: "Обычный QR ведёт на страницу irkportal.ru — без установки AR-приложения.",
  },
  {
    step: "03",
    title: "Смотрите историю",
    text: "Видео, аудио или анимация — по желанию, без автозвука и без фейковых эффектов.",
  },
  {
    step: "04",
    title: "Идите дальше",
    text: "Маршрут, фотоархив, сувениры — всё связано с тем же местом в городе.",
  },
];

const FAQ = [
  {
    q: "Нужно ли скачивать приложение?",
    a: "Нет. QR открывает обычную веб-страницу в браузере телефона.",
  },
  {
    q: "Это полноценный AR с камерой?",
    a: "На этом этапе — цифровые истории на сайте. Расширенный WebAR появится позже, если будет востребован.",
  },
  {
    q: "Можно заказать открытки оптом?",
    a: "Да — оставьте заявку на странице открытки или напишите через контакты.",
  },
];

export default async function ArPostcardsLandingPage() {
  const [featured, all] = await Promise.all([
    getFeaturedArPostcards(6),
    getPublishedArPostcards(),
  ]);
  const grid = featured.length > 0 ? featured : all;

  return (
    <main>
      <CityHeroVisual
        badge="AR-открытки"
        title="Ожившие открытки Иркутска"
        subtitle="Физическая открытка с QR — и цифровая история: видео, звук, маршруты и сувениры без туристических штампов."
        imageSrc="/images/explore-history.svg"
        imageAlt="Иркутск — ожившие открытки"
        ctas={[
          { label: "Смотреть открытки", href: "#catalog", variant: "primary" },
          { label: "Сувениры", href: "/souvenirs", variant: "secondary" },
        ]}
      />

      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <h2 className="text-2xl font-medium mb-2 flex items-center gap-2">
            <QrCode size={20} className="text-baikal" />
            Как это работает
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-xl">
            Четыре шага от бумажной открытки до прогулки по городу.
          </p>
          <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((item) => (
              <li key={item.step} className="border border-border bg-background p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                  {item.step}
                </p>
                <p className="font-medium mb-2">{item.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="catalog" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-medium mb-2 flex items-center gap-2">
                <Sparkles size={20} className="text-baikal" />
                Каталог оживших открыток
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Каждая открытка — отдельная страница с эффектом и связями с городом.
              </p>
            </div>
          </div>

          {grid.length === 0 ? (
            <VisualEmptyState
              message="Первые ожившие открытки скоро появятся в каталоге."
              actionLabel="Сувениры"
              actionHref="/souvenirs"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {grid.map((postcard) => (
                <PostcardCard key={postcard.id} postcard={postcard} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <h2 className="text-xl font-medium mb-6">Куда ведут открытки</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/souvenirs"
              className="border border-border bg-background p-6 hover:border-foreground/20 transition-colors"
            >
              <p className="font-medium mb-2">Сувениры</p>
              <p className="text-sm text-muted-foreground">
                Заказать набор открыток или связанный мерч Иркпортала.
              </p>
            </Link>
            <Link
              href="/map"
              className="border border-border bg-background p-6 hover:border-foreground/20 transition-colors"
            >
              <p className="font-medium mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-baikal" />
                Маршруты
              </p>
              <p className="text-sm text-muted-foreground">
                Пройти тем же местом, что на открытке.
              </p>
            </Link>
            <Link
              href="/explore/photos"
              className="border border-border bg-background p-6 hover:border-foreground/20 transition-colors"
            >
              <p className="font-medium mb-2">Фотоархив</p>
              <p className="text-sm text-muted-foreground">
                Увидеть город в архивных и современных кадрах.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <div className="border border-border bg-muted/30 p-8 lg:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-medium mb-2">Предзаказ открыток</h2>
              <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                Напишите, какие сюжеты интересны — сообщим о старте печати и
                доставке по Иркутску и России.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 shrink-0"
            >
              Связаться
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <h2 className="text-xl font-medium mb-8">Частые вопросы</h2>
          <dl className="space-y-6 max-w-2xl">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="font-medium mb-2">{item.q}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-20 text-center">
          <h2 className="text-2xl lg:text-3xl font-light mb-4">
            Откройте Иркутск с открытки
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Выберите сюжет в каталоге или загляните в раздел сувениров.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="#catalog"
              className="inline-flex h-11 items-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90"
            >
              Каталог открыток
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/souvenirs"
              className="inline-flex h-11 items-center gap-2 border border-border px-6 text-sm font-medium hover:bg-muted"
            >
              Сувениры
            </Link>
          </div>
        </div>
      </section>

      <ContactCtaSection
        variant="ar_postcard"
        sourceType="ar_postcard"
        sourceBlock="ar-index"
      />
    </main>
  );
}
