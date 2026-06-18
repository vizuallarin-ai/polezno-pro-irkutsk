import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import {
  adminCrud,
  adminPanelAccess,
  publishedOrStaff,
} from "../access";
import {
  CONTENT_STATUS_OPTIONS,
  MAKER_CRAFT_OPTIONS,
  MAKER_PLACEMENT_STATUS_OPTIONS,
  MAKER_PLACEMENT_TYPE_OPTIONS,
} from "../constants";
import { revalidateAfterChange } from "../hooks/revalidate";
import { validateRequiredSlug } from "../validators";

export const Makers: CollectionConfig = {
  slug: "makers",
  labels: {
    singular: "Мастер",
    plural: "Мастера",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "craftType",
      "placementType",
      "placementStatus",
      "status",
      "updatedAt",
    ],
    listSearchableFields: ["title", "slug", "shortDescription", "city"],
    description:
      "Местные мастера для раздела /souvenirs. Публично — опубликованные с активным размещением.",
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/souvenirs/makers/${doc.slug}`;
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
      label: "Имя / название мастерской",
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
      label: "Статус публикации",
      defaultValue: "draft",
      required: true,
      options: [...CONTENT_STATUS_OPTIONS],
      admin: { position: "sidebar" },
    },
    {
      name: "placementStatus",
      type: "select",
      label: "Статус размещения",
      defaultValue: "active",
      required: true,
      options: [...MAKER_PLACEMENT_STATUS_OPTIONS],
      admin: { position: "sidebar" },
    },
    {
      name: "placementType",
      type: "select",
      label: "Тип размещения",
      defaultValue: "catalog",
      required: true,
      options: [...MAKER_PLACEMENT_TYPE_OPTIONS],
      admin: { position: "sidebar" },
    },
    {
      name: "advertisingLabelNeeded",
      type: "checkbox",
      label: "Нужна рекламная пометка",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "craftType",
      type: "select",
      label: "Направление",
      required: true,
      options: [...MAKER_CRAFT_OPTIONS],
    },
    {
      name: "shortDescription",
      type: "textarea",
      label: "Краткое описание",
      required: true,
    },
    {
      name: "story",
      type: "richText",
      label: "История мастера",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
      label: "Фото / логотип",
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Обложка",
    },
    {
      name: "city",
      type: "text",
      label: "Город",
      defaultValue: "Иркутск",
    },
    {
      name: "district",
      type: "text",
      label: "Район / локация",
    },
    {
      name: "websiteUrl",
      type: "text",
      label: "Сайт",
    },
    {
      name: "telegram",
      type: "text",
      label: "Telegram",
    },
    {
      name: "instagram",
      type: "text",
      label: "Instagram",
    },
    {
      name: "legalNote",
      type: "textarea",
      label: "Юридическая пометка",
      admin: {
        description: "Рекламная или партнёрская пометка для публичной страницы.",
      },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "На главной витрине",
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
