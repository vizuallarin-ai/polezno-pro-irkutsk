import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import {
  adminCrud,
  adminPanelAccess,
  publishedOrStaff,
} from "../access";
import { ADMIN_GROUPS, CONTENT_STATUS_OPTIONS } from "../constants";
import { revalidateAfterChange } from "../hooks/revalidate";
import { validateRequiredSlug } from "../validators";

export const Excursions: CollectionConfig = {
  slug: "excursions",
  labels: {
    singular: "Экскурсия",
    plural: "Экскурсии",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "format", "price", "status", "updatedAt"],
    group: ADMIN_GROUPS.excursions,
    listSearchableFields: ["title", "slug", "shortDescription"],
    description: "Экскурсии для /excursions. Публично — только опубликованные.",
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/excursions/${doc.slug}`;
      }
      return null;
    },
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
      validate: validateRequiredSlug,
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      label: "Статус",
      defaultValue: "draft",
      required: true,
      options: [...CONTENT_STATUS_OPTIONS],
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
      name: "priceOnRequest",
      type: "checkbox",
      label: "Цена по запросу",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "price",
      type: "number",
      label: "Цена от (₽)",
      min: 0,
      admin: {
        condition: (_, siblingData) => !siblingData?.priceOnRequest,
      },
    },
    {
      name: "duration",
      type: "number",
      label: "Длительность (мин)",
      admin: { position: "sidebar" },
    },
    {
      name: "groupSize",
      type: "text",
      label: "Размер группы",
      admin: { description: "Например: до 12 человек" },
    },
    {
      name: "includes",
      type: "array",
      label: "Включено",
      fields: [{ name: "item", type: "text", label: "Пункт", required: true }],
    },
    {
      name: "excludes",
      type: "array",
      label: "Не включено",
      fields: [{ name: "item", type: "text", label: "Пункт", required: true }],
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
      admin: { position: "sidebar" },
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
