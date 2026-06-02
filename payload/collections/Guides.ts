import type { CollectionConfig } from "payload";
import { adminCrud, adminPanelAccess } from "../access";

export const Guides: CollectionConfig = {
  slug: "guides",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "specialization", "isActive", "updatedAt"],
    group: "Команда",
    description:
      "Гиды и авторы маршрутов. Отображаются на странице /about#guides и в карточках экскурсий.",
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
      name: "name",
      type: "text",
      label: "Имя",
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
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Фотография",
      required: true,
    },
    {
      name: "specialization",
      type: "select",
      label: "Специализация",
      hasMany: true,
      options: [
        { label: "История", value: "history" },
        { label: "Архитектура", value: "architecture" },
        { label: "Гастрономия", value: "gastronomy" },
        { label: "Деревянное зодчество", value: "wooden" },
        { label: "Байкал", value: "baikal" },
        { label: "Ночные прогулки", value: "night" },
        { label: "Декабристы", value: "decembrists" },
        { label: "Hidden Places", value: "hidden" },
        { label: "Корпоративные программы", value: "corporate" },
      ],
    },
    {
      name: "bio",
      type: "textarea",
      label: "О себе",
      required: true,
    },
    {
      name: "quote",
      type: "text",
      label: "Цитата (девиз)",
    },
    {
      name: "experience",
      type: "number",
      label: "Лет опыта",
    },
    {
      name: "languages",
      type: "array",
      label: "Языки проведения",
      fields: [{ name: "language", type: "text" }],
    },
    {
      name: "routes",
      type: "relationship",
      relationTo: "routes",
      label: "Авторские маршруты",
      hasMany: true,
    },
    {
      name: "isActive",
      type: "checkbox",
      label: "Активный гид (показывать на сайте)",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "Отображать на главной",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "order",
      type: "number",
      label: "Порядок отображения",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
  ],
};
