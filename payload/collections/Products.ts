import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import {
  adminCrud,
  adminPanelAccess,
  publishedOrStaff,
} from "../access";
import {
  CONTENT_STATUS_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_STOCK_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
} from "../constants";
import { revalidateAfterChange } from "../hooks/revalidate";
import { validateRequiredSlug } from "../validators";

export const Products: CollectionConfig = {
  slug: "products",
  labels: {
    singular: "Сувенир",
    plural: "Сувениры",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "productType",
      "category",
      "price",
      "stockStatus",
      "isOwnMerch",
      "status",
      "updatedAt",
    ],
    listSearchableFields: ["title", "slug", "shortDescription"],
    description: "Каталог /souvenirs. Публично — только опубликованные товары.",
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/souvenirs/${doc.slug}`;
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
      name: "productType",
      type: "select",
      label: "Тип товара",
      defaultValue: "own_merch",
      required: true,
      options: [...PRODUCT_TYPE_OPTIONS],
      admin: { position: "sidebar" },
    },
    {
      name: "isOwnMerch",
      type: "checkbox",
      label: "Мерч Иркпортала",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    {
      name: "stockStatus",
      type: "select",
      label: "Наличие / статус",
      defaultValue: "soon",
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
      min: 0,
      admin: {
        description: "Ориентир для заявки. Оплата на сайте не подключена.",
      },
    },
    {
      name: "priceLabel",
      type: "text",
      label: "Подпись к цене",
      admin: {
        description: 'Например: «от 350 ₽» или «цена по запросу».',
      },
    },
    {
      name: "gallery",
      type: "array",
      label: "Галерея",
      minRows: 0,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
      ],
    },
    {
      name: "shortDescription",
      type: "textarea",
      label: "Краткое описание",
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
      name: "cityConnectionText",
      type: "textarea",
      label: "Связь с Иркутском",
    },
    {
      name: "orderCtaLabel",
      type: "text",
      label: "Текст кнопки заказа",
      defaultValue: "Оставить заявку",
    },
    {
      name: "maker",
      type: "relationship",
      relationTo: "makers",
      label: "Мастер",
      admin: {
        condition: (_, siblingData) => !siblingData?.isOwnMerch,
      },
    },
    {
      name: "relatedRoute",
      type: "relationship",
      relationTo: "routes",
      label: "Связанный маршрут (legacy)",
      admin: { description: "Один маршрут — для обратной совместимости." },
    },
    {
      name: "relatedRoutes",
      type: "relationship",
      relationTo: "routes",
      label: "Связанные маршруты",
      hasMany: true,
    },
    {
      name: "relatedArticles",
      type: "relationship",
      relationTo: "articles",
      label: "Связанные материалы",
      hasMany: true,
    },
    {
      name: "relatedPhotos",
      type: "relationship",
      relationTo: "photos",
      label: "Связанные фото",
      hasMany: true,
    },
    {
      name: "relatedArPostcard",
      type: "relationship",
      relationTo: "ar-postcards",
      label: "Ожившая AR-открытка",
      admin: {
        description: "Связь с цифровой версией товара — блок на странице сувенира.",
      },
    },
    {
      name: "externalLink",
      type: "text",
      label: "Внешняя ссылка",
      admin: { description: "Если товар продаётся на внешней площадке." },
    },
    {
      name: "inStock",
      type: "checkbox",
      label: "В наличии (legacy)",
      defaultValue: false,
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
      name: "stripePriceId",
      type: "text",
      label: "Stripe Price ID (legacy)",
      admin: {
        position: "sidebar",
        description: "Не используется в разделе сувениров.",
      },
    },
    {
      name: "relatedArticle",
      type: "relationship",
      relationTo: "articles",
      label: "Связанная статья (legacy)",
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
