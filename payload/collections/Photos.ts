import type { CollectionConfig } from "payload";
import {
  adminCrud,
  adminPanelAccess,
  photoReadAccess,
} from "../access";
import {
  CONTENT_STATUS_OPTIONS,
  PHOTO_CATEGORY_OPTIONS,
  PHOTO_MODERATION_OPTIONS,
  PHOTO_RIGHTS_OPTIONS,
  PHOTO_TYPE_OPTIONS,
} from "../constants";
import { revalidateAfterChange } from "../hooks/revalidate";
import { validateRequiredSlug } from "../validators";

const CONSENT_VERSION = "2026-06-01";

export const Photos: CollectionConfig = {
  slug: "photos",
  labels: {
    singular: "Фото",
    plural: "Фото Иркутска",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "category",
      "year",
      "street",
      "moderationStatus",
      "status",
      "updatedAt",
    ],
    listSearchableFields: [
      "title",
      "slug",
      "street",
      "place",
      "authorName",
      "sourceName",
    ],
    description:
      "Фотоархив /explore/photos. Публично — status «Опубликован» и moderationStatus «Одобрено».",
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/explore/photos/${doc.slug}`;
      }
      return null;
    },
  },
  access: {
    admin: adminPanelAccess,
    read: photoReadAccess,
    create: adminCrud,
    update: adminCrud,
    delete: adminCrud,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (data?.status === "published") {
          if (data.moderationStatus !== "approved") {
            throw new Error(
              "Нельзя опубликовать фото без одобрения модерации."
            );
          }
          if (data.rightsType === "unknown") {
            throw new Error(
              "Нельзя опубликовать фото с неизвестными правами."
            );
          }
          if (!data.permissionConfirmed) {
            throw new Error(
              "Нельзя опубликовать фото без подтверждения прав."
            );
          }
        }

        if (
          operation === "create" &&
          data?.photoType === "user_submitted" &&
          !data.moderationStatus
        ) {
          data.moderationStatus = "pending";
          data.status = "draft";
        }

        if (data?.moderationStatus === "approved" && !data.reviewedAt) {
          data.reviewedAt = new Date().toISOString();
        }

        if (data?.status === "published" && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }

        return data;
      },
    ],
    afterChange: [revalidateAfterChange],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Название / подпись",
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
      name: "moderationStatus",
      type: "select",
      label: "Модерация",
      defaultValue: "approved",
      required: true,
      options: [...PHOTO_MODERATION_OPTIONS],
      admin: { position: "sidebar" },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Фото",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      label: "Описание",
    },
    {
      name: "category",
      type: "select",
      label: "Категория",
      required: true,
      options: [...PHOTO_CATEGORY_OPTIONS],
    },
    {
      name: "photoType",
      type: "select",
      label: "Тип фото",
      defaultValue: "modern",
      required: true,
      options: [...PHOTO_TYPE_OPTIONS],
    },
    {
      type: "row",
      fields: [
        {
          name: "year",
          type: "number",
          label: "Год",
          admin: { width: "33%" },
        },
        {
          name: "period",
          type: "text",
          label: "Период",
          admin: {
            width: "67%",
            description: "Например: «начало XX века», «1990-е»",
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "street",
          type: "text",
          label: "Улица",
        },
        {
          name: "place",
          type: "text",
          label: "Место",
        },
        {
          name: "district",
          type: "text",
          label: "Район",
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "latitude",
          type: "number",
          label: "Широта",
        },
        {
          name: "longitude",
          type: "number",
          label: "Долгота",
        },
      ],
    },
    {
      type: "collapsible",
      label: "Авторство и права",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "authorName",
          type: "text",
          label: "Автор фото",
        },
        {
          name: "sourceName",
          type: "text",
          label: "Источник",
        },
        {
          name: "sourceUrl",
          type: "text",
          label: "URL источника",
        },
        {
          name: "rightsType",
          type: "select",
          label: "Тип прав",
          defaultValue: "own_photo",
          required: true,
          options: [...PHOTO_RIGHTS_OPTIONS],
        },
        {
          name: "licenseText",
          type: "textarea",
          label: "Текст лицензии",
        },
        {
          name: "permissionConfirmed",
          type: "checkbox",
          label: "Права подтверждены",
          defaultValue: true,
        },
        {
          name: "imageAlt",
          type: "text",
          label: "Alt-текст",
          admin: {
            description:
              "Если пусто — генерируется из названия, места и года.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Пара «было / стало»",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "pairedPhoto",
          type: "relationship",
          relationTo: "photos",
          label: "Связанное фото (вторая часть пары)",
        },
        {
          name: "beforeAfterCaption",
          type: "textarea",
          label: "Описание изменений",
        },
        {
          name: "pairedPhotoYear",
          type: "number",
          label: "Год второго фото",
        },
      ],
    },
    {
      type: "collapsible",
      label: "Связи",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "relatedArticles",
          type: "relationship",
          relationTo: "articles",
          hasMany: true,
          label: "Материалы",
        },
        {
          name: "relatedRoutes",
          type: "relationship",
          relationTo: "routes",
          hasMany: true,
          label: "Маршруты",
        },
      ],
    },
    {
      type: "collapsible",
      label: "Пользовательская отправка",
      admin: {
        initCollapsed: true,
        condition: (data) => data?.photoType === "user_submitted",
      },
      fields: [
        {
          name: "submittedByName",
          type: "text",
          label: "Имя отправителя",
        },
        {
          name: "submittedByContact",
          type: "text",
          label: "Контакт",
        },
        {
          name: "submittedByEmail",
          type: "email",
          label: "Email",
        },
        {
          name: "submittedAt",
          type: "date",
          label: "Дата отправки",
        },
        {
          name: "consentText",
          type: "textarea",
          label: "Текст согласия",
          admin: { readOnly: true },
        },
        {
          name: "consentVersion",
          type: "text",
          label: "Версия согласия",
          defaultValue: CONSENT_VERSION,
          admin: { readOnly: true },
        },
        {
          name: "rejectionReason",
          type: "textarea",
          label: "Причина отклонения",
        },
        {
          name: "reviewedAt",
          type: "date",
          label: "Дата проверки",
          admin: { readOnly: true },
        },
        {
          name: "reviewedBy",
          type: "text",
          label: "Проверил",
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Дата публикации",
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "title", type: "text", label: "Meta Title" },
        { name: "description", type: "textarea", label: "Meta Description" },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "OG Image",
        },
      ],
    },
  ],
};
