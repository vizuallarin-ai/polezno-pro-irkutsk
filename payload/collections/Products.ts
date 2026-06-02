import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import {
  adminCrud,
  adminPanelAccess,
  publishedOrStaff,
} from "../access";
import { revalidateAfterChange } from "../hooks/revalidate";

export const Products: CollectionConfig = {
  slug: "products",
  labels: {
    singular: "Товар",
    plural: "Товары",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "price", "inStock", "status", "updatedAt"],
    group: "Магазин",
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/shop/${doc.slug}`;
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
      label: "Название товара",
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
      name: "category",
      type: "select",
      label: "Категория",
      required: true,
      options: [
        { label: "Одежда", value: "clothing" },
        { label: "Постеры", value: "posters" },
        { label: "Открытки", value: "postcards" },
        { label: "Арт-объекты", value: "art" },
        { label: "Книги", value: "books" },
        { label: "Сувениры", value: "souvenirs" },
        { label: "Керамика", value: "ceramics" },
        { label: "Еда и напитки", value: "food" },
      ],
    },
    {
      name: "price",
      type: "number",
      label: "Цена (₽)",
      required: true,
      min: 0,
    },
    {
      name: "gallery",
      type: "array",
      label: "Галерея",
      minRows: 1,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
      ],
    },
    {
      name: "story",
      type: "richText",
      label: "История товара",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "shortDescription",
      type: "textarea",
      label: "Краткое описание",
    },
    {
      name: "inStock",
      type: "checkbox",
      label: "В наличии",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    {
      name: "stockQuantity",
      type: "number",
      label: "Количество на складе",
      admin: { position: "sidebar" },
    },
    {
      name: "externalLink",
      type: "text",
      label: "Внешняя ссылка на покупку",
      admin: { description: "Если товар продаётся на внешней площадке." },
    },
    {
      name: "relatedRoute",
      type: "relationship",
      relationTo: "routes",
      label: "Связанный маршрут",
    },
    {
      name: "stripePriceId",
      type: "text",
      label: "Stripe Price ID",
      admin: { position: "sidebar" },
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
