import type { Metadata } from "next";
import Link from "next/link";
import { VisualEmptyState } from "@/components/visual/visual-empty-state";
import { VISUAL_EMPTY_COPY } from "@/lib/visual-assets";
import { ArrowRight, MapPin, Package, Users } from "lucide-react";
import { ProductCard } from "@/components/souvenirs/product-card";
import { MakerCard } from "@/components/souvenirs/maker-card";
import {
  getPublishedMakers,
  getPublishedProducts,
} from "@/lib/souvenirs";
import { SOUVENIR_CATEGORY_FILTERS } from "@/lib/souvenirs";

export const metadata: Metadata = {
  title: "Сувениры Иркутска — мерч, открытки, карты и местные мастера",
  description:
    "Сувениры и мерч Иркпортала, открытки, карты-прогулки и каталог местных мастеров Иркутска. Заказ по заявке — без корзины и оплаты на сайте.",
  openGraph: {
    title: "Сувениры Иркутска — мерч, открытки, карты и местные мастера",
    description:
      "Мерч Иркпортала и работы местных мастеров. Заказ по заявке.",
  },
};

export default async function SouvenirsPage() {
  const [products, makers] = await Promise.all([
    getPublishedProducts(),
    getPublishedMakers(),
  ]);

  const ownMerch = products.filter((p) => p.isOwnMerch);

  return (
    <main className="pt-24">
      <section className="border-b border-border py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Сувениры
          </p>
          <h1 className="text-4xl lg:text-6xl font-light tracking-tight text-foreground mb-6 max-w-3xl">
            Память об Иркутске —{" "}
            <span className="font-serif italic">не из сувенирной лавки</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed mb-8">
            Открытки, карты-прогулки, постеры и мини-гиды от Иркпортала — плюс
            каталог местных мастеров. Без корзины: оставляете заявку, мы
            связываемся и уточняем детали.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#catalog"
              className="inline-flex h-11 items-center gap-2 bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90"
            >
              Смотреть каталог
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/souvenirs/submit-maker"
              className="inline-flex h-11 items-center gap-2 border border-border px-6 text-sm font-medium hover:bg-muted"
            >
              Стать мастером в каталоге
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <h2 className="text-xl font-medium mb-8">Два направления</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border bg-background p-6 lg:p-8">
              <Package size={20} className="text-baikal mb-4" />
              <h3 className="text-lg font-medium mb-3">Мерч и издания Иркпортала</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Карты маршрутов, открытки без штампов, постеры деревянного
                Иркутска и мини-гиды — то, что мы делаем сами, в связке с
                маршрутами и материалами проекта.
              </p>
              <p className="text-xs text-muted-foreground">
                {ownMerch.length > 0
                  ? `${ownMerch.length} позиций в каталоге`
                  : "Первые издания уже в работе"}
              </p>
            </div>
            <div className="border border-border bg-background p-6 lg:p-8">
              <Users size={20} className="text-baikal mb-4" />
              <h3 className="text-lg font-medium mb-3">Местные мастера</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Керамика, печать, текстиль и другие вещи с иркутским характером —
                от людей, которые живут здесь и делают руками.
              </p>
              <p className="text-xs text-muted-foreground">
                {makers.length > 0
                  ? `${makers.length} мастеров в каталоге`
                  : "Принимаем заявки на размещение"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-medium mb-2">Каталог</h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Открытки, постеры, карты, мини-гиды и товары мастеров.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SOUVENIR_CATEGORY_FILTERS.map((filter) => (
                <span
                  key={filter.value}
                  className="text-xs uppercase tracking-widest border border-border px-3 py-1.5 text-muted-foreground"
                >
                  {filter.label}
                </span>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <VisualEmptyState
              message={VISUAL_EMPTY_COPY.souvenirs}
              actionLabel="Написать нам"
              actionHref="/contact"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {makers.length > 0 && (
        <section className="border-b border-border bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
            <h2 className="text-2xl font-medium mb-2">Мастера Иркутска</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-xl">
              Люди и мастерские, чьи работы можно заказать через заявку на сайте.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {makers.map((maker) => (
                <MakerCard key={maker.id} maker={maker} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <h2 className="text-2xl font-medium mb-8">Как заказать</h2>
          <ol className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Выберите товар",
                text: "Откройте карточку — там описание, связь с маршрутами и форма заявки.",
              },
              {
                step: "02",
                title: "Оставьте заявку",
                text: "Укажите контакт и количество. Оплаты на сайте нет — только запрос.",
              },
              {
                step: "03",
                title: "Согласуем детали",
                text: "Мы ответим лично: наличие, сроки, доставка или самовывоз в Иркутске.",
              },
            ].map((item) => (
              <li key={item.step} className="border border-border p-6">
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

      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border border-border bg-background p-8">
            <div>
              <h2 className="text-xl font-medium mb-2">Вы мастер из Иркутска?</h2>
              <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                Размещение в каталоге — по заявке и модерации. Без регистрации
                продавца и комиссии маркетплейса на этом этапе.
              </p>
            </div>
            <Link
              href="/souvenirs/submit-maker"
              className="inline-flex h-11 items-center justify-center bg-foreground text-primary-foreground px-6 text-sm font-medium hover:bg-foreground/90 shrink-0"
            >
              Подать заявку
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
            <MapPin size={18} className="text-baikal" />
            Связанные материалы
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/map" className="text-sm border border-border px-4 py-2 hover:bg-muted">
              Маршруты по Иркутску
            </Link>
            <Link href="/explore" className="text-sm border border-border px-4 py-2 hover:bg-muted">
              Материалы «Исследовать»
            </Link>
            <Link
              href="/explore/photos"
              className="text-sm border border-border px-4 py-2 hover:bg-muted"
            >
              Фотоархив
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-20 text-center">
          <h2 className="text-2xl lg:text-3xl font-light mb-4">
            Хотите что-то конкретное?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Напишите — подскажем по наличию, предзаказу или мастерам.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center gap-2 border border-border px-6 text-sm font-medium hover:bg-muted"
          >
            Связаться
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
