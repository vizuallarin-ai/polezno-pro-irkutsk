import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import {
  adminCrud,
  adminPanelAccess,
  articleReadAccess,
} from "../access";
import { ARTICLE_CATEGORY_OPTIONS, CONTENT_STATUS_OPTIONS } from "../constants";
import { revalidateAfterChange } from "../hooks/revalidate";
import { validateRequiredSlug } from "../validators";

export const Articles: CollectionConfig = {
  slug: "articles",
  labels: {
    singular: "Статья",
    plural: "Статьи",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "status", "publishedAt", "_status", "updatedAt"],
    listSearchableFields: ["title", "excerpt", "slug"],
    description: "Материалы для раздела /explore. Публично — только status «Опубликован» и версия published.",
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
      label: "URL-slug",
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
      label: "Hidden Gem",
      defaultValue: false,
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
      label: "Автор",
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
      label: "Связанные места",
      hasMany: true,
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
