import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import {
  adminCrud,
  adminPanelAccess,
  articleReadAccess,
} from "../access";
import { ADMIN_GROUP } from "../admin-groups";
import {
  ARTICLE_CATEGORY_OPTIONS,
  CONTENT_STATUS_OPTIONS,
  MATERIAL_TYPE_OPTIONS,
} from "../constants";
import {
  createAutoSlugBeforeValidate,
  SLUG_FIELD_ADMIN,
  SLUG_FIELD_LABEL,
} from "../hooks/auto-slug";
import { revalidateAfterChange } from "../hooks/revalidate";
import { validateRequiredSlug } from "../validators";

export const Articles: CollectionConfig = {
  slug: "articles",
  labels: {
    singular: "Статья",
    plural: "Статьи",
  },
  admin: {
    group: ADMIN_GROUP.CONTENT,
    useAsTitle: "title",
    defaultColumns: ["title", "category", "status", "publishedAt", "_status", "updatedAt"],
    listSearchableFields: ["title", "excerpt", "slug"],
    description:
      "Статьи раздела /explore. На сайте видны только при «Опубликован» и версии Payload «Published» (оба статуса).",
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/explore/${doc.slug}`;
      }
      return null;
    },
  },
  access: {
    admin: adminPanelAccess,
    read: articleReadAccess,
    create: adminCrud,
    update: adminCrud,
    delete: adminCrud,
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  hooks: {
    beforeValidate: [
      createAutoSlugBeforeValidate({ sourceField: "title", fallback: "article" }),
    ],
    afterChange: [revalidateAfterChange],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Заголовок",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: SLUG_FIELD_LABEL,
      required: true,
      unique: true,
      validate: validateRequiredSlug,
      admin: SLUG_FIELD_ADMIN,
    },
    {
      name: "status",
      type: "select",
      label: "Статус публикации",
      defaultValue: "draft",
      required: true,
      options: [...CONTENT_STATUS_OPTIONS],
      admin: {
        position: "sidebar",
        description:
          "Свой статус коллекции. Для сайта также нужна кнопка Publish версии Payload (_status). Оба должны быть «published».",
      },
    },
    {
      name: "materialType",
      type: "select",
      label: "Тип материала",
      options: [...MATERIAL_TYPE_OPTIONS],
      defaultValue: "article",
      admin: { position: "sidebar" },
    },
    {
      name: "category",
      type: "select",
      label: "Категория",
      required: true,
      options: [...ARTICLE_CATEGORY_OPTIONS],
    },
    {
      name: "tags",
      type: "array",
      label: "Теги",
      fields: [{ name: "tag", type: "text", label: "Тег", required: true }],
    },
    {
      name: "season",
      type: "select",
      label: "Сезон",
      options: [
        { label: "Весь год", value: "all" },
        { label: "Зима", value: "winter" },
        { label: "Весна", value: "spring" },
        { label: "Лето", value: "summer" },
        { label: "Осень", value: "autumn" },
      ],
      defaultValue: "all",
      admin: { position: "sidebar" },
    },
    {
      name: "isHiddenGem",
      type: "checkbox",
      label: "Неочевидное место",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "Избранное",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Обложка",
      admin: {
        description: "Или укажите coverUrl, если нет файла в медиатеке.",
      },
    },
    {
      name: "coverUrl",
      type: "text",
      label: "Обложка (URL)",
      admin: { position: "sidebar" },
    },
    {
      name: "videoUrl",
      type: "text",
      label: "Ссылка на видео",
      admin: { position: "sidebar" },
    },
    {
      name: "excerpt",
      type: "textarea",
      label: "Краткое описание",
      required: true,
    },
    {
      name: "readTime",
      type: "number",
      label: "Время чтения (мин)",
      admin: { position: "sidebar" },
    },
    {
      name: "author",
      type: "text",
      label: "Автор (legacy)",
      admin: { position: "sidebar", hidden: true },
    },
    {
      name: "authorName",
      type: "text",
      label: "Автор",
      admin: { position: "sidebar" },
    },
    {
      name: "source",
      type: "text",
      label: "Источник",
      admin: { position: "sidebar" },
    },
    {
      name: "photoCredit",
      type: "text",
      label: "Фото: автор / кредит",
      admin: { position: "sidebar" },
    },
    {
      name: "historicalPeriod",
      type: "text",
      label: "Исторический период",
      admin: { position: "sidebar" },
    },
    {
      name: "year",
      type: "number",
      label: "Год",
      admin: { position: "sidebar" },
    },
    {
      name: "street",
      type: "text",
      label: "Улица",
      admin: { position: "sidebar" },
    },
    {
      name: "place",
      type: "text",
      label: "Место",
      admin: { position: "sidebar" },
    },
    {
      name: "district",
      type: "text",
      label: "Район",
      admin: { position: "sidebar" },
    },
    {
      name: "content",
      type: "richText",
      label: "Содержание",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "relatedRoute",
      type: "relationship",
      relationTo: "routes",
      label: "Связанный маршрут",
    },
    {
      name: "relatedExcursion",
      type: "relationship",
      relationTo: "excursions",
      label: "Связанная экскурсия",
    },
    {
      name: "relatedPlaces",
      type: "relationship",
      relationTo: "places",
      label: "Связанные места (system)",
      hasMany: true,
      admin: {
        hidden: true,
        description: "Коллекция places не используется публичным сайтом.",
      },
    },
    {
      name: "ctaText",
      type: "text",
      label: "Текст CTA-блока",
      admin: { description: "Например: «Записаться на экскурсию»" },
    },
    {
      name: "ctaLink",
      type: "text",
      label: "Ссылка CTA",
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Дата публикации",
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
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
