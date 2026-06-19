import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import {
  adminCrud,
  adminPanelAccess,
  publishedOrStaff,
} from "../access";
import {
  AR_POSTCARD_EFFECT_OPTIONS,
  type ArPostcardEffectType,
} from "@/lib/ar-postcard-constants";
import {
  CONTENT_STATUS_OPTIONS,
  PHOTO_RIGHTS_OPTIONS,
} from "../constants";
import { revalidateAfterChange } from "../hooks/revalidate";
import { validateRequiredSlug } from "../validators";

const SITE_BASE =
  process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
  "https://irkportal.ru";

function hasVideo(data: Record<string, unknown>): boolean {
  return Boolean(
    (data.animationVideoUrl && String(data.animationVideoUrl).trim()) ||
      data.animationVideo
  );
}

function hasAudio(data: Record<string, unknown>): boolean {
  return Boolean(
    (data.audioUrl && String(data.audioUrl).trim()) || data.audioFile
  );
}

function isExternalEffect(effectType: string): boolean {
  return effectType === "webar_link" || effectType === "external_ar_service";
}

export const ArPostcards: CollectionConfig = {
  slug: "ar-postcards",
  labels: {
    singular: "AR-открытка",
    plural: "AR-открытки",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "effectType",
      "status",
      "isFeatured",
      "isDiscontinued",
      "updatedAt",
    ],
    listSearchableFields: [
      "title",
      "slug",
      "shortDescription",
      "place",
      "street",
      "authorName",
    ],
    description:
      "Ожившие открытки: QR ведёт на /ar-postcards/[slug]. Публикуйте только с подтверждёнными правами и готовым эффектом.",
    preview: (doc) => {
      if (doc?.slug) {
        return `${SITE_BASE}/ar-postcards/${doc.slug}`;
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
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (!data) return data;

        if (data.slug) {
          data.qrTargetUrl = `${SITE_BASE}/ar-postcards/${data.slug}`;
        }

        if (
          operation === "update" &&
          originalDoc?.status === "published" &&
          originalDoc.slug &&
          data.slug &&
          originalDoc.slug !== data.slug
        ) {
          throw new Error(
            "Slug опубликованной открытки нельзя менять — на печати уже QR со старым адресом."
          );
        }

        if (data.status === "published") {
          if (!data.rightsType || data.rightsType === "unknown") {
            throw new Error(
              "Нельзя опубликовать открытку без указанных и одобренных прав (rightsType)."
            );
          }

          const effectType = String(
            data.effectType || "coming_soon"
          ) as ArPostcardEffectType;

          if (effectType === "video_page" && !hasVideo(data)) {
            throw new Error(
              "Для типа «Видео на странице» загрузите видео или укажите URL."
            );
          }

          if (effectType === "audio_story" && !hasAudio(data)) {
            throw new Error(
              "Для типа «Аудиоистория» загрузите аудио или укажите URL."
            );
          }

          if (isExternalEffect(effectType) && !data.effectUrl) {
            throw new Error(
              "Для внешнего AR укажите effectUrl — ссылку на WebAR или сервис."
            );
          }

          if (effectType === "animated_image" && !data.postcardImage && !data.coverImage) {
            throw new Error(
              "Для анимированного изображения нужно изображение открытки."
            );
          }
        }

        return data;
      },
    ],
    afterChange: [revalidateAfterChange],
  },
  fields: [
    {
      name: "qrPreview",
      type: "ui",
      admin: {
        components: {
          Field: "./payload/components/ArPostcardQrPreview#default",
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
      label: "Slug",
      required: true,
      unique: true,
      validate: validateRequiredSlug,
      admin: {
        position: "sidebar",
        description:
          "После публикации slug не меняется — иначе сломаются QR на напечатанных открытках. Смена slug у опубликованной записи заблокирована.",
      },
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
      name: "effectType",
      type: "select",
      label: "Тип эффекта",
      defaultValue: "coming_soon",
      required: true,
      options: [...AR_POSTCARD_EFFECT_OPTIONS],
      admin: {
        position: "sidebar",
        description:
          "video_page — видео на странице; coming_soon — честная заглушка без фейкового видео.",
      },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "На витрине",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "isDiscontinued",
      type: "checkbox",
      label: "Снята с печати",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Показываем пометку на странице, но QR продолжает работать.",
      },
    },
    {
      name: "qrTargetUrl",
      type: "text",
      label: "QR-ссылка",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Генерируется автоматически из slug.",
      },
    },
    {
      name: "shortDescription",
      type: "textarea",
      label: "Краткое описание",
    },
    {
      name: "fullDescription",
      type: "richText",
      label: "Полное описание / история",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      type: "row",
      fields: [
        {
          name: "coverImage",
          type: "upload",
          relationTo: "media",
          label: "Обложка (витрина)",
        },
        {
          name: "postcardImage",
          type: "upload",
          relationTo: "media",
          label: "Изображение открытки",
          admin: {
            description: "Основное фото для страницы и анимации.",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Видео-эффект",
      admin: {
        initCollapsed: false,
        condition: (_, siblingData) =>
          siblingData?.effectType === "video_page" ||
          siblingData?.effectType === "animated_image",
      },
      fields: [
        {
          name: "animationVideo",
          type: "upload",
          relationTo: "media",
          label: "Видео (файл)",
          admin: {
            description: "MP4/WebM. Без автовоспроизведения со звуком на сайте.",
          },
        },
        {
          name: "animationVideoUrl",
          type: "text",
          label: "Видео (URL)",
          admin: { description: "Альтернатива загрузке файла." },
        },
        {
          name: "animationPosterImage",
          type: "upload",
          relationTo: "media",
          label: "Постер видео",
          admin: { description: "Обязателен для видео на странице." },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Аудиоистория",
      admin: {
        initCollapsed: true,
        condition: (_, siblingData) => siblingData?.effectType === "audio_story",
      },
      fields: [
        {
          name: "audioFile",
          type: "upload",
          relationTo: "media",
          label: "Аудио (файл)",
        },
        {
          name: "audioUrl",
          type: "text",
          label: "Аудио (URL)",
        },
        {
          name: "audioTranscript",
          type: "textarea",
          label: "Текст / транскрипт",
          admin: { description: "Показывается под плеером." },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Внешний AR",
      admin: {
        initCollapsed: true,
        condition: (_, siblingData) =>
          siblingData?.effectType === "webar_link" ||
          siblingData?.effectType === "external_ar_service",
      },
      fields: [
        {
          name: "effectUrl",
          type: "text",
          label: "Ссылка на эффект",
          admin: {
            description: "WebAR или внешний сервис — открывается в новой вкладке.",
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "place",
          type: "text",
          label: "Место",
        },
        {
          name: "street",
          type: "text",
          label: "Улица",
        },
        {
          name: "year",
          type: "number",
          label: "Год",
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
          label: "Автор",
        },
        {
          name: "sourceName",
          type: "text",
          label: "Источник",
        },
        {
          name: "rightsType",
          type: "select",
          label: "Тип прав",
          defaultValue: "own_photo",
          required: true,
          options: [...PHOTO_RIGHTS_OPTIONS],
          admin: {
            description: "unknown — публикация заблокирована.",
          },
        },
        {
          name: "licenseText",
          type: "textarea",
          label: "Текст лицензии",
        },
      ],
    },
    {
      type: "collapsible",
      label: "Связи",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "relatedProduct",
          type: "relationship",
          relationTo: "products",
          label: "Связанный сувенир",
        },
        {
          name: "relatedPhoto",
          type: "relationship",
          relationTo: "photos",
          label: "Связанное фото",
        },
        {
          name: "relatedRoute",
          type: "relationship",
          relationTo: "routes",
          label: "Связанный маршрут",
        },
        {
          name: "relatedMaterial",
          type: "relationship",
          relationTo: "articles",
          label: "Связанный материал",
        },
      ],
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
