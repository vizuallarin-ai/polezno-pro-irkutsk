import type { CollectionConfig } from "payload";
import { adminCrud, adminPanelAccess } from "../access";

export const Places: CollectionConfig = {
  slug: "places",
  labels: { singular: "Место", plural: "Места" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "isLocalGem", "updatedAt"],
    group: "Маршруты и места",
  },
  access: {
    admin: adminPanelAccess,
    read: () => true,
    create: adminCrud,
    update: adminCrud,
    delete: adminCrud,
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Название места",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "category",
      type: "select",
      label: "Категория",
      options: [
        { label: "Достопримечательность", value: "sight" },
        { label: "Ресторан / кафе", value: "food" },
        { label: "Отель", value: "hotel" },
        { label: "Музей", value: "museum" },
        { label: "Парк", value: "park" },
        { label: "Магазин", value: "shop" },
        { label: "Другое", value: "other" },
      ],
    },
    {
      name: "address",
      type: "text",
      label: "Адрес",
    },
    {
      name: "coordinates",
      type: "group",
      label: "Координаты",
      fields: [
        { name: "lat", type: "number", label: "Широта", required: true },
        { name: "lng", type: "number", label: "Долгота", required: true },
      ],
    },
    {
      name: "photos",
      type: "array",
      label: "Фотографии",
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text", label: "Подпись" },
      ],
    },
    {
      name: "description",
      type: "textarea",
      label: "Описание",
    },
    {
      name: "tags",
      type: "array",
      label: "Теги",
      fields: [{ name: "tag", type: "text" }],
    },
    {
      name: "isLocalGem",
      type: "checkbox",
      label: "Место от локалов",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "workingHours",
      type: "text",
      label: "Часы работы",
    },
    {
      name: "website",
      type: "text",
      label: "Веб-сайт",
    },
  ],
};
