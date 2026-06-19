# Фаза 14 — стабилизация и готовность к наполнению

Дата: 2026-06-19  
Сайт: https://irkportal.ru

## 1. Что проверено

- Публичные разделы (главная, маршруты, explore, фото, business, сувениры, AR, контакты)
- CMS-коллекции и статусы публикации
- Формы заявок и `/admin/collections/leads`
- SEO: `sitemap.xml`, `robots.txt` (Host для Яндекса)
- Редиректы: `/shop`, `/program`, `/for-companies`, `/excursions`
- Яндекс.Метрика (ID 109995467)
- Деплой VPS: полная пересборка `.next`

## 2. Что исправлено без участия клиента

| Изменение | Зачем |
|-----------|--------|
| Sitemap без demo-URL при подключённой БД | Не индексировать фиктивные страницы из кода |
| `generateStaticParams` маршрутов из CMS | SSG совпадает с опубликованными slug |
| Скрытие «События» в меню/футере без published events | Нет пустого пункта навигации |
| Скрытие телефона-заглушки `000-00-00` | Не показывать фейковый контакт |
| `sharp` в Payload | Ресайз обложек в админке на VPS |
| `robots.txt` + `Host: irkportal.ru` | Яндекс Вебмастер |
| Чистая пересборка на проде | Исправлены 500 на `/business`, `/admin` |

## 3. Что осталось на будущее

- Отключить demo-fallback в `lib/data/*` после 100% наполнения CMS
- Настроить Resend для email-уведомлений о заявках
- Реальные фото вместо seed SVG (фото, сувениры, AR)
- Видео для AR-открыток
- Мастера в каталоге сувениров
- Отзывы в CMS для блока на главной
- Stripe: legacy-код можно удалить после подтверждения
- `docs/release-phase-14.md` — обновлять после каждого крупного релиза

## 4. Ключевые URL

| Раздел | URL |
|--------|-----|
| Главная | https://irkportal.ru/ |
| Маршруты | https://irkportal.ru/map |
| Исследовать | https://irkportal.ru/explore |
| Фото | https://irkportal.ru/explore/photos |
| Для бизнеса | https://irkportal.ru/business |
| Сувениры | https://irkportal.ru/souvenirs |
| AR-открытки | https://irkportal.ru/ar-postcards |
| Админка | https://irkportal.ru/admin |
| Sitemap | https://irkportal.ru/sitemap.xml |
| Robots | https://irkportal.ru/robots.txt |

## 5. Env на production

```
DATABASE_URL
PAYLOAD_SECRET
NEXT_PUBLIC_SERVER_URL=https://irkportal.ru
NEXT_PUBLIC_YANDEX_MAPS_API_KEY
YANDEX_ROUTER_API_KEY          # опционально, геометрия маршрутов
NEXT_PUBLIC_YANDEX_METRIKA_ID=109995467
RESEND_API_KEY                 # опционально, уведомления
EMAIL_FROM / EMAIL_TO
REVALIDATE_SECRET
```

## 6. Риски

| Риск | Митигация |
|------|-----------|
| Битая сборка `.next` на VPS | `rm -rf .next && npm run build` |
| Demo-контент в коде | Публиковать через CMS, не полагаться на fallback |
| Права на фото | Модерация + `rightsType` в админке |
| Заявки только в админке | Включить email в Site Settings |

## 7. Что нужно от клиента

- [ ] Реальные контакты (Telegram, MAX, email)
- [ ] Фото Алёны и hero-изображения
- [ ] Маршруты: тексты, обложки, цены «с Алёной»
- [ ] Статьи (минимум история Иркутска + 3–5 материалов)
- [ ] Фотоархив с правами и подписями
- [ ] Товары и мастера (фото, цены, статусы)
- [ ] AR: видео или честный `coming_soon`
- [ ] 3–5 отзывов для главной
- [ ] Решение по разделу «События»

## 8. Деплой (надёжный)

```bash
cd /var/www/polezno
git pull origin master
npm ci --include=dev
npm run db:push          # при изменении схемы
rm -rf .next
NODE_OPTIONS='--max-old-space-size=1536' npm run build
pm2 restart polezno
```
