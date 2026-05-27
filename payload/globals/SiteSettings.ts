import type { GlobalConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Настройки сайта",
  admin: {
    group: "Настройки",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "heroVideo",
      type: "upload",
      relationTo: "media",
      label: "Hero-видео (WebM)",
    },
    {
      name: "heroVideoPoster",
      type: "upload",
      relationTo: "media",
      label: "Постер для Hero-видео",
    },
    {
      name: "founderName",
      type: "text",
      label: "Имя основателя",
    },
    {
      name: "founderPhoto",
      type: "upload",
      relationTo: "media",
      label: "Фото основателя",
    },
    {
      name: "manifesto",
      type: "richText",
      label: "Манифест проекта",
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures],
      }),
    },
    {
      name: "stats",
      type: "array",
      label: "Статистика (social proof)",
      fields: [
        { name: "value", type: "text", label: "Значение", required: true },
        { name: "label", type: "text", label: "Подпись", required: true },
      ],
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      label: "OG-изображение по умолчанию",
    },
    {
      name: "metaDescription",
      type: "textarea",
      label: "Meta description по умолчанию",
    },
    {
      name: "socialLinks",
      type: "group",
      label: "Социальные сети",
      fields: [
        { name: "telegram", type: "text", label: "Telegram" },
        { name: "instagram", type: "text", label: "Instagram" },
        { name: "vk", type: "text", label: "ВКонтакте" },
      ],
    },
  ],
};
