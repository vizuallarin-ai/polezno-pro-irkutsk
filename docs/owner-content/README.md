# Owner content staging (CONTENT.0)

## Что сюда попадает

- Контракты и шаблоны приёма материалов владельца
- Статус intake (что получено / чего не хватает)
- Machine-readable `pack.json` (staging, без публикации)
- Человекочитаемые черновики сущностей (экскурсия, маршрут, гид, отзывы, контакты, медиа)
- Отчёты validation / missing fields для менеджера

## Что сюда не попадает

- Fake-экскурсии, цены «из головы», выдуманные отзывы
- Секреты, `.env`, пароли, токены аналитики «как есть» без нужды
- Бинарные оригиналы клиента (фото/PDF/Word) — они живут в `owner-content-private/` (вне git)
- Production CMS / прямые записи в БД
- Публикация на irkportal.ru

## Как отмечать missing

В markdown-черновиках и в `pack.json`:

- пустое поле = **MISSING**
- «не знаем / уточнить» = **OWNER_CONFIRMATION_REQUIRED** или **AMBIGUOUS**
- не подставлять «разумное значение»

## Как отмечать owner-confirmed

- В `pack.json`: `ownerConfirmed: true` / `ownerConfirmedAt: ISO-date`
- Для отзывов: `permissionToPublish: true` + понятный `source`
- Для фото: `publicationRights: OWNER_CONFIRMED` или `CLIENT_PROVIDED`
- Юридические правила (отмена, возврат) — только после явного подтверждения владельца

## Как работать с media

1. Сырые файлы → `owner-content-private/raw/<packVersion>/`
2. Запись в `media-manifest.md` + элементы `media[]` в `pack.json`
3. Сохранять связь `originalFilename` → `normalizedFilename`
4. Не переименовывать оригинал без записи в манифест
5. Без подтверждённых прав — публикация блокируется

## Команды

```bash
npm run content:intake:validate
npm run content:intake:plan
npm run content:intake:report
npm run test:content-intake
```

Все команды — **dry-run**, без записи в CMS/DB.

## Переход к CONTENT.1

Разрешён только если:

1. Owner pack получен (`packVersion` задан)
2. Validation пройдена, blockers закрыты
3. Media rights решены
4. Minimum launch pack ready
5. Dry-run plan просмотрен
6. Есть явное разрешение на ingest

CONTENT.0 **не** начинает ingest.
