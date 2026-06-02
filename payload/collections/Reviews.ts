import type { CollectionConfig } from "payload";
import { adminCrud, adminPanelAccess } from "../access";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: {
    useAsTitle: "author",
    defaultColumns: ["author", "rating", "isFeatured", "updatedAt"],
    group: "Отзывы и партнёры",
    description: "Добавьте отзывы — они отобразятся в секции «Нам доверяют» на главной странице.",
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
      name: "author",
      type: "text",
      label: "Имя автора",
      required: true,
    },
    {
      name: "city",
      type: "text",
      label: "Город",
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Фото автора",
    },
    {
      name: "text",
      type: "textarea",
      label: "Текст отзыва",
      required: true,
    },
    {
      name: "rating",
      type: "select",
      label: "Оценка",
      options: [
        { label: "★★★★★ — 5", value: "5" },
        { label: "★★★★ — 4", value: "4" },
        { label: "★★★ — 3", value: "3" },
      ],
      defaultValue: "5",
    },
    {
      name: "serviceType",
      type: "select",
      label: "Тип услуги",
      options: [
        { label: "Тур", value: "tour" },
        { label: "Экскурсия", value: "excursion" },
        { label: "Корпоративная программа", value: "corporate" },
        { label: "Магазин", value: "shop" },
      ],
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "Показывать на главной",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
  ],
};
