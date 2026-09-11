import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import {
  adminCrud,
  adminPanelAccess,
  publishedOrStaff,
} from "../access";
import { ADMIN_GROUP } from "../admin-groups";
import { CONTENT_STATUS_OPTIONS, EXCURSION_FORMAT_OPTIONS } from "../constants";
import {
  createAutoSlugBeforeValidate,
  SLUG_FIELD_ADMIN,
  SLUG_FIELD_LABEL,
} from "../hooks/auto-slug";
import { excursionPublishGuardBeforeValidate } from "../hooks/publish-guards";
import { revalidateAfterChange } from "../hooks/revalidate";
import { validateRequiredSlug } from "../validators";

export const Excursions: CollectionConfig = {
  slug: "excursions",
  labels: {
    singular: "Экскурсия",
    plural: "Экскурсии",
  },
  admin: {
    group: ADMIN_GROUP.OPERATIONS,
    useAsTitle: "title",
    defaultColumns: ["title", "format", "price", "duration", "status", "updatedAt"],
    listSearchableFields: ["title", "slug", "shortDescription"],
    description:
      "Коммерческие экскурсии. Если список пуст — начните с одной флагманской. Черновик можно сохранить неполным; для публикации нужны цена (или «по запросу»), длительность и описание.",
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
    beforeValidate: [
      createAutoSlugBeforeValidate({ sourceField: "title", fallback: "excursion" }),
      excursionPublishGuardBeforeValidate,
    ],
    afterChange: [revalidateAfterChange],
  },
  fields: [
    {
      name: "publishChecklist",
      type: "ui",
      admin: {
        components: {
          Field: "./payload/components/ExcursionPublishChecklist#default",
        },
      },
    },
    {
      name: "title",
      type: "text",
      label: "Название",
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
      label: "Статус",
      defaultValue: "draft",
      required: true,
      options: [...CONTENT_STATUS_OPTIONS],
      admin: {
        position: "sidebar",
        description:
          "Черновик — не на сайте. «Опубликован» — нужна цена или «по запросу», длительность и описание.",
      },
    },
    {
      name: "format",
      type: "select",
      label: "Формат",
      required: true,
      options: [...EXCURSION_FORMAT_OPTIONS],
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
      admin: {
        position: "sidebar",
        description: "Включите, если цену сообщаете после заявки.",
      },
    },
    {
      name: "price",
      type: "number",
      label: "Цена от (₽)",
      min: 0,
      admin: {
        condition: (_, siblingData) => !siblingData?.priceOnRequest,
        description: "Обязательна при публикации, если не включено «Цена по запросу».",
      },
    },
    {
      name: "duration",
      type: "number",
      label: "Длительность (мин)",
      admin: {
        position: "sidebar",
        description: "Обязательна при публикации.",
      },
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
      admin: {
        position: "sidebar",
        description: "Альтернатива загрузке файла. Обычно достаточно одного варианта.",
      },
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
      label: "Подробное описание (не используется сайтом)",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
      admin: {
        hidden: true,
        description:
          "Legacy Lexical field — сайт читает shortDescription/fullDescription. Данные сохранены.",
      },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "На главной",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "showInRoutesPage",
      type: "checkbox",
      label: "Показывать на странице маршрутов",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description:
          "Если выключено — экскурсия доступна только по прямой ссылке /excursions/[slug].",
      },
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
