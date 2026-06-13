import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import {
  adminCrud,
  adminPanelAccess,
  publishedOrStaff,
} from "../access";
import {
  ADMIN_GROUPS,
  CONTENT_STATUS_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_STOCK_OPTIONS,
} from "../constants";
import { revalidateAfterChange } from "../hooks/revalidate";
import { validateRequiredSlug } from "../validators";

export const Products: CollectionConfig = {
  slug: "products",
  labels: {
    singular: "Товар",
    plural: "Товары",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "price", "stockStatus", "status", "updatedAt"],
    group: ADMIN_GROUPS.products,
    listSearchableFields: ["title", "slug", "shortDescription"],
    description: "Каталог /shop. Публично — только опубликованные товары.",
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
      name: "stockStatus",
      type: "select",
      label: "Наличие",
      defaultValue: "in_stock",
      required: true,
      options: [...PRODUCT_STOCK_OPTIONS],
      admin: { position: "sidebar" },
    },
    {
      name: "category",
      type: "select",
      label: "Категория",
      required: true,
      options: [...PRODUCT_CATEGORY_OPTIONS],
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
      label: "В наличии (legacy)",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Дублирует stockStatus — для обратной совместимости.",
      },
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
      name: "relatedArticle",
      type: "relationship",
      relationTo: "articles",
      label: "Связанная статья",
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
