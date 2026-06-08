import type { CollectionConfig } from "payload";
import {
  adminCrud,
  adminPanelAccess,
  publishedOrStaff,
} from "../access";
import { revalidateAfterChange } from "../hooks/revalidate";

const routePointFields = [
  {
    name: "title",
    type: "text" as const,
    label: "Название точки",
    required: true,
  },
  {
    name: "lat",
    type: "number" as const,
    label: "Широта (lat)",
    required: true,
    admin: {
      description: "Например: 52.2890. Можно скопировать из Яндекс.Карт или Google Maps.",
    },
  },
  {
    name: "lng",
    type: "number" as const,
    label: "Долгота (lng)",
    required: true,
    admin: {
      description: "Например: 104.2800. Порядок: lat, lng.",
    },
  },
  {
    name: "description",
    type: "textarea" as const,
    label: "Описание",
  },
  {
    name: "whatToNotice",
    type: "textarea" as const,
    label: "На что обратить внимание",
  },
  {
    name: "timeOnSite",
    type: "text" as const,
    label: "Время на точке",
    admin: { description: "Например: 15 мин" },
  },
  {
    name: "image",
    type: "upload" as const,
    relationTo: "media" as const,
    label: "Фото",
  },
  {
    name: "order",
    type: "number" as const,
    label: "Порядок",
    defaultValue: 0,
    admin: { description: "Меньшее число — раньше в маршруте." },
  },
  {
    name: "published",
    type: "checkbox" as const,
    label: "Показывать на сайте",
    defaultValue: true,
  },
];

export const Routes: CollectionConfig = {
  slug: "routes",
  labels: {
    singular: "Маршрут",
    plural: "Маршруты",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "type", "status", "pointsCount", "updatedAt"],
    group: "Маршруты",
    description: "Пешие и авторские маршруты для карты и страниц /map/[slug].",
  },
  access: {
    admin: adminPanelAccess,
    read: publishedOrStaff("status"),
    create: adminCrud,
    update: adminCrud,
    delete: adminCrud,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        const points = data?.routePoints ?? [];
        const published = points.filter(
          (p: { published?: boolean }) => p?.published !== false
        );
        data.pointsCount = published.length;

        if (!data.geoLine && published.length > 0) {
          data.geoLine = {
            type: "LineString",
            coordinates: published
              .sort(
                (a: { order?: number }, b: { order?: number }) =>
                  (a.order ?? 0) - (b.order ?? 0)
              )
              .map((p: { lng?: number; lat?: number }) => [p.lng ?? 0, p.lat ?? 0]),
          };
        }

        if (data?.type === "paid") {
          data.isPaid = true;
        } else if (data?.type === "free") {
          data.isPaid = false;
        }

        return data;
      },
    ],
    afterChange: [revalidateAfterChange],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Название маршрута",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: "URL-slug",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      label: "Статус",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Черновик", value: "draft" },
        { label: "Опубликован", value: "published" },
        { label: "Скрыт", value: "hidden" },
        { label: "В архиве", value: "archived" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "category",
      type: "select",
      label: "Категория",
      required: true,
      options: [
        { label: "Архитектура", value: "architecture" },
        { label: "Гастрономия", value: "gastronomy" },
        { label: "История", value: "history" },
        { label: "Декабристы", value: "decembrists" },
        { label: "Деревянное зодчество", value: "wooden" },
        { label: "Hidden Places", value: "hidden" },
        { label: "Советский Иркутск", value: "soviet" },
        { label: "Ночная прогулка", value: "night" },
      ],
    },
    {
      name: "format",
      type: "select",
      label: "Формат",
      defaultValue: "walking",
      options: [
        { label: "Пеший", value: "walking" },
        { label: "Гастро", value: "gastro" },
        { label: "Авторский", value: "author" },
        { label: "Байкал рядом", value: "baikal" },
      ],
    },
    {
      name: "type",
      type: "select",
      label: "Тип доступа",
      required: true,
      options: [
        { label: "Бесплатный", value: "free" },
        { label: "Платный", value: "paid" },
      ],
      defaultValue: "free",
    },
    {
      name: "isPaid",
      type: "checkbox",
      label: "Платный маршрут",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Синхронизируется с типом доступа.",
      },
    },
    {
      name: "price",
      type: "number",
      label: "Цена (₽)",
      admin: { condition: (data) => data?.type === "paid" },
    },
    {
      name: "description",
      type: "textarea",
      label: "Краткое описание",
      required: true,
    },
    {
      name: "fullDescription",
      type: "textarea",
      label: "Полное описание",
    },
    {
      name: "duration",
      type: "number",
      label: "Продолжительность (мин)",
    },
    {
      name: "distance",
      type: "number",
      label: "Дистанция (км)",
    },
    {
      name: "difficulty",
      type: "select",
      label: "Сложность",
      defaultValue: "medium",
      options: [
        { label: "Лёгкая", value: "easy" },
        { label: "Средняя", value: "medium" },
        { label: "Сложная", value: "hard" },
      ],
    },
    {
      name: "pointsCount",
      type: "number",
      label: "Количество точек",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Вычисляется автоматически из опубликованных точек.",
      },
    },
    {
      name: "tags",
      type: "array",
      label: "Теги",
      fields: [{ name: "tag", type: "text", label: "Тег" }],
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Обложка (загрузка)",
    },
    {
      name: "coverUrl",
      type: "text",
      label: "Обложка (URL)",
      admin: {
        description: "Альтернатива загрузке — прямая ссылка на изображение.",
      },
    },
    {
      name: "routePoints",
      type: "array",
      label: "Точки маршрута",
      admin: {
        initCollapsed: false,
        description: "Перетаскивайте строки для изменения порядка. Заполните lat/lng для карты.",
      },
      fields: routePointFields,
    },
    {
      name: "geoLine",
      type: "json",
      label: "GeoJSON маршрута (LineString)",
      admin: {
        readOnly: true,
        description: "Заполняется автоматически из точек, если пусто.",
      },
    },
    {
      name: "audioGuide",
      type: "upload",
      relationTo: "media",
      label: "Аудиогид (MP3)",
    },
    {
      name: "pdfGuide",
      type: "upload",
      relationTo: "media",
      label: "PDF-гид",
    },
    {
      name: "schedule",
      type: "array",
      label: "Расписание экскурсий",
      fields: [
        { name: "date", type: "date", label: "Дата", required: true },
        { name: "time", type: "text", label: "Время (11:00)" },
        { name: "spotsTotal", type: "number", label: "Всего мест", defaultValue: 10 },
        { name: "spotsLeft", type: "number", label: "Осталось мест" },
        { name: "isOpen", type: "checkbox", label: "Запись открыта", defaultValue: true },
      ],
    },
    {
      name: "guide",
      type: "relationship",
      relationTo: "guides",
      label: "Гид-автор",
      admin: { position: "sidebar" },
    },
    {
      name: "stripeProductId",
      type: "text",
      label: "Stripe Product ID",
      admin: {
        position: "sidebar",
        condition: (data) => data?.type === "paid",
      },
    },
    {
      name: "qrCodeUrl",
      type: "text",
      label: "QR-код (URL)",
      admin: { position: "sidebar" },
    },
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "title", type: "text", label: "Meta Title" },
        { name: "description", type: "textarea", label: "Meta Description" },
        { name: "image", type: "upload", relationTo: "media", label: "OG Image" },
      ],
    },
  ],
};
