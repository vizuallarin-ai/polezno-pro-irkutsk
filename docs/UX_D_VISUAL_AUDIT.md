# GATE UX.D — Visual Audit

**Branch:** `phase15-ux-funnel-hardening`  
**Baseline HEAD:** `8fa9cc85e1449f60751f53454807d5d18ee90233`  
**Scope:** Art direction only — no CTA vocabulary / lead / architecture changes.

## Verdict (before polish)

Иркпортал уже **функционально зрелый** (UX.A–C), но визуально часто читается как **аккуратный продуктовый шаблон**: hairline-рамки, marketplace-карточки с двумя равными кнопками, одинаковая плотность секций. Не хватает спокойствия и «дорогих» пауз, которые ожидаешь от авторского гида высокого чека.

---

## Главная

| Area | Finding |
| --- | --- |
| Hero | Сильная editorial база (Cormorant + full-bleed). CTA-пара канонична. Образ чуть «плосковат» (opacity), scroll-cue декоративен. |
| Scenario picker | Четыре равносильные outline-карточки + иконки → ощущение dashboard/chooser, не журнала. Hover почти пустой. |
| Section rhythm | Чередование `border-y` + `bg-card` делает ленту однородной. ContactCta + FinalCta рядом — два финала. |
| Author / photos / souvenirs | Ближе к editorial; author dual CTA конкурирует с нижними бандами. |

**Cheap / noisy:** outline-сетка сценариев, stacked conversion bands.  
**Missing:** воздух между секциями разной «температуры», один визуальный якорь на блок.

## Header

| Area | Finding |
| --- | --- |
| Brand | Uppercase + tracking ок, но вес/`type-ui-label` делает бренд слишком «лейблом», не mark. |
| Descriptor | На xl полезен; на md усечён — ок. Не должен спорить с CTA. |
| Nav | Спокойная; underline hover хороший. Gap можно чуть увеличить. |
| CTA | Primary сильный; «Связаться» outline + Primary рядом — два competing controls (допустимо, но Secondary должен быть тише). |

## Routes / map

| Area | Finding |
| --- | --- |
| Experience cards | Marketplace tile: badges на фото, dual `h-10` buttons, `border-t` footer. Нет image hover. |
| Route cards | То же + tags `text-[10px]` выглядят дешево. |
| Prelaunch / empty | Честный статус ок; визуально «киоск кнопок» рядом с картой. |

## Explore

Featured materials уже editorial. Category mosaic `gap-px` vs featured `gap-10` — два языка плотности. Bottom CTA + ContactCta дублируют финал.

## Business

Набор bordered slabs; hero CTA утоплен под bullets. Corporate cards с двумя full-width buttons. Доверие есть в тексте, не в поверхности.

## Contact

Intent-chrome UX.C сильный. Левая колонка чуть перегружена списком. Форма без поверхности vs ContactCta в коробке — разный язык.

---

## Systemic smells

1. **Hairline borders everywhere** — основной «дешёвый» сигнал.  
2. **Dual equal CTAs on cards** — marketplace.  
3. **Unused Button primitive** — CTA-классы размазаны строками.  
4. **Uniform section chrome** — мало ритма.  
5. **Tiny meta / tags** — tech catalog, не hospitality.

## Principles for implementation

- Less but better: убрать рамки и dual footers, не добавлять виджеты.  
- Editorial: image + type + one clear action.  
- Quiet surfaces: paper / ink / one accent (baikal).  
- Preserve UX.C labels and form architecture.
