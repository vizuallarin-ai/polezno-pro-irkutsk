# Полезно про Иркутск — Premium Travel Platform

Цифровая культурная платформа про Иркутск и Байкал. Next.js 15 + Payload CMS 3.

---

## Стек

| Слой | Технология |
|------|------------|
| Framework | Next.js 16 App Router, TypeScript strict |
| Стили | Tailwind CSS v4, shadcn/ui |
| CMS | Payload CMS 3 + PostgreSQL |
| Карта | Яндекс Maps JavaScript API 3.0 |
| Деплой | Beget VPS, PM2, Nginx |
| Анимации | Lenis, GSAP + ScrollTrigger, Framer Motion |
| Оплата | Stripe Checkout (опционально) |
| Формы | React Hook Form + Zod |

Production: [irkportal.ru](https://irkportal.ru). Деплой — `docs/DEPLOY-BEGET.md`.

---

## Быстрый старт

### 1. Требования
- Node.js 20+
- PostgreSQL 14+ (локально или на VPS)

### 2. Установка

```bash
npm install
```

### 3. Настройка переменных среды

Скопируйте `.env.example` в `.env.local` и заполните:

```bash
cp .env.example .env.local
```

| Переменная | Где взять |
|------------|-----------|
| `DATABASE_URL` | Строка подключения к PostgreSQL |
| `PAYLOAD_SECRET` | Любая строка 32+ символов |
| `NEXT_PUBLIC_SERVER_URL` | URL деплоя (например, `https://irkportal.ru`) |

### 4. Создать базу данных

```bash
# PostgreSQL
createdb polezno_irkutsk
```

### 5. Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — сайт.  
Откройте [http://localhost:3000/admin](http://localhost:3000/admin) — CMS-панель.

При первом запуске Payload создаёт все таблицы автоматически и предложит создать первого администратора.

---

## Структура проекта

```
app/
  (site)/         # Публичный сайт
    page.tsx      # Главная
    map/          # Интерактивная карта
    explore/      # Digital magazine
    events/       # Календарь событий
    shop/         # Concept store
    about/        # О проекте
    program/      # Конструктор тура
    contact/      # Контакты
  (payload)/      # Payload admin
  api/
    routes/       # API маршрутов для карты
    leads/        # Сохранение заявок
    checkout/     # Stripe Checkout
    revalidate/   # ISR revalidation

components/
  layout/         # Header, Footer, LenisProvider
  sections/       # Секции главной страницы
  map/            # Компоненты карты
  shop/           # Компоненты магазина
  forms/          # Формы (Program, Contact)
  ui/             # Base UI (Button, Badge, Input и др.)

payload/
  collections/    # Схемы данных Payload
  globals/        # Глобальные настройки

lib/
  utils.ts        # cn() helper
  payload.ts      # Payload client
  jsonld.ts       # JSON-LD схемы для SEO
```

---

## CMS — редактирование контента

Все сущности редактируются через `/admin` без деплоя кода:

| Раздел | Что редактировать |
|--------|-------------------|
| **Маршруты** | Название, категория, GeoJSON, аудиогид, PDF, цена |
| **Места** | Координаты, фото, описание, «место от локалов» |
| **Статьи** | Заголовок, текст (rich text), категория, сезон |
| **События** | Дата, место, ссылка на билеты, категория |
| **Товары** | Фотогалерея, история предмета, Stripe Price ID |
| **Отзывы** | Текст, автор, рейтинг |
| **Партнёры** | Логотип, ссылка |
| **Настройки сайта** | Hero-видео, манифест, статистика, соцсети |

### Добавить платный маршрут
1. Создайте продукт в Stripe Dashboard → Products
2. Скопируйте **Price ID** (начинается с `price_`)
3. В CMS → Маршруты → установите тип «Платный», вставьте Price ID

### Добавить видео на Hero
1. Загрузите `.webm` и `.mp4` в Media
2. В CMS → Настройки сайта → Hero-видео

---

## Карта маршрутов

Для работы карты нужен ключ Яндекс Карт в `.env.local`:

```
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=ваш-ключ
```

Ключ: [developer.tech.yandex.ru](https://developer.tech.yandex.ru/) — ограничьте доменом `irkportal.ru`.

GeoJSON маршрутов создаётся в [Mapbox Studio](https://studio.mapbox.com) или любом GeoJSON-редакторе. Формат — `LineString`:

```json
{
  "type": "LineString",
  "coordinates": [
    [104.2964, 52.2978],
    [104.3020, 52.3010]
  ]
}
```

---

## Деплой (Vercel + Neon)

1. Создайте БД на [neon.tech](https://neon.tech) (бесплатный план)
2. Скопируйте `DATABASE_URL` из Neon dashboard
3. Подключите репозиторий к Vercel
4. Добавьте все переменные из `.env.example` в Vercel Environment Variables
5. Деплой → автоматически

---

## Контент для запуска

Минимальный набор медиафайлов (размещать в `/public/images/`):

| Файл | Размер | Описание |
|------|--------|----------|
| `hero-poster.jpg` | 1920×1080 | Постер для hero-видео |
| `founder-portrait.jpg` | 800×1067 | Портрет основателя |
| `/videos/hero.webm` | — | Фоновое видео 10-20с |
| `/videos/hero.mp4` | — | Резервное видео |

Изображения для направлений, статей и товаров загружаются через CMS Media.
