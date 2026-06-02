import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import {
  adminCrud,
  adminPanelAccess,
  publishedOrStaff,
} from "../access";
import { revalidateAfterChange } from "../hooks/revalidate";

export const Excursions: CollectionConfig = {
  slug: "excursions",
  labels: {
    singular: "Экскурсия",
    plural: "Экскурсии",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "format", "price", "status", "updatedAt"],
    group: "Маршруты и места",
    description: "Платные и авторские экскурсии с привязкой к маршрутам.",
  },
  access: {
    admin: adminPanelAccess,
    read: publishedOrStaff("status"),
    create: adminCrud,
    update: adminCrud,
    delete: adminCrud,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Название",
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
      name: "status",
      type: "select",
      label: "Статус",
      defaultValue: "draft",
      required: true,
      options: [
        { label: "Черновик", value: "draft" },
        { label: "Опубликован", value: "published" },
        { label: "Скрыт", value: "hidden" },
        { label: "В архиве", value: "archived" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "format",
      type: "select",
      label: "Формат",
      required: true,
      options: [
        { label: "Пешая", value: "walking" },
        { label: "Автобусная", value: "bus" },
        { label: "Гастро", value: "gastro" },
        { label: "Авторская", value: "author" },
        { label: "Корпоративная", value: "corporate" },
        { label: "Байкал", value: "baikal" },
        { label: "Ночная", value: "night" },
      ],
    },
    {
      name: "shortDescription",
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
      name: "price",
      type: "number",
      label: "Цена от (₽)",
      min: 0,
    },
    {
      name: "duration",
      type: "number",
      label: "Длительность (мин)",
    },
    {
      name: "groupSize",
      type: "text",
      label: "Размер группы",
      admin: { description: "Например: до 12 человек" },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Обложка",
    },
    {
      name: "coverUrl",
      type: "text",
      label: "Обложка (URL)",
    },
    {
      name: "relatedRoutes",
      type: "relationship",
      relationTo: "routes",
      label: "Связанные маршруты",
      hasMany: true,
    },
    {
      name: "guide",
      type: "relationship",
      relationTo: "guides",
      label: "Гид",
    },
    {
      name: "content",
      type: "richText",
      label: "Подробное описание",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "На главной",
      defaultValue: false,
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
