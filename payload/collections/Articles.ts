import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "updatedAt"],
    group: "Контент",
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/explore/${doc.slug}`;
      }
      return null;
    },
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: {
      autosave: true,
    },
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
      admin: { position: "sidebar" },
    },
    {
      name: "category",
      type: "select",
      label: "Категория",
      required: true,
      options: [
        { label: "Что посмотреть", value: "sights" },
        { label: "Где гулять", value: "walks" },
        { label: "Где поесть", value: "food" },
        { label: "Где остановиться", value: "stay" },
        { label: "История города", value: "history" },
        { label: "Интересные факты", value: "facts" },
        { label: "Байкал", value: "baikal" },
        { label: "Hidden Places", value: "hidden" },
        { label: "Гастрономия", value: "gastronomy" },
        { label: "Архитектура", value: "architecture" },
        { label: "Экскурсии", value: "excursions" },
      ],
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
      label: "Рекомендуемая (на главной)",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Обложка",
      required: true,
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
      name: "content",
      type: "richText",
      label: "Содержание",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "relatedPlaces",
      type: "relationship",
      relationTo: "places",
      label: "Связанные места",
      hasMany: true,
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Дата публикации",
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
