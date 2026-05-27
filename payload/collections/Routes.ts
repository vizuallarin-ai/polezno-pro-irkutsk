import type { CollectionConfig } from "payload";

export const Routes: CollectionConfig = {
  slug: "routes",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "type", "updatedAt"],
    group: "Маршруты и места",
  },
  access: {
    read: () => true,
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
      admin: {
        position: "sidebar",
      },
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
      name: "price",
      type: "number",
      label: "Цена (₽)",
      admin: {
        condition: (data) => data?.type === "paid",
      },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Обложка",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      label: "Краткое описание",
      required: true,
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
      name: "geoLine",
      type: "json",
      label: "GeoJSON маршрута (LineString)",
    },
    {
      name: "places",
      type: "relationship",
      relationTo: "places",
      label: "Точки интереса",
      hasMany: true,
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
      name: "stripeProductId",
      type: "text",
      label: "Stripe Product ID",
      admin: {
        position: "sidebar",
        condition: (data) => data?.type === "paid",
      },
    },
    {
      name: "schedule",
      type: "array",
      label: "Расписание экскурсий (ближайшие даты)",
      admin: {
        description:
          "Добавьте конкретные даты проведения — они отобразятся в карточке маршрута.",
      },
      fields: [
        {
          name: "date",
          type: "date",
          label: "Дата",
          required: true,
        },
        {
          name: "time",
          type: "text",
          label: "Время начала (например: 11:00)",
        },
        {
          name: "spotsTotal",
          type: "number",
          label: "Всего мест",
          defaultValue: 10,
        },
        {
          name: "spotsLeft",
          type: "number",
          label: "Осталось мест",
        },
        {
          name: "isOpen",
          type: "checkbox",
          label: "Запись открыта",
          defaultValue: true,
        },
      ],
    },
    {
      name: "qrCodeUrl",
      type: "text",
      label: "QR-код (URL для генерации)",
      admin: {
        position: "sidebar",
        description:
          "Оставьте пустым — заполнится автоматически на основе slug. Или укажите кастомный URL.",
      },
    },
    {
      name: "guide",
      type: "relationship",
      relationTo: "guides",
      label: "Гид-автор маршрута",
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
