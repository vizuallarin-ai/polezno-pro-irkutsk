import type { GlobalConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { adminCrud } from "../access";
import { revalidateGlobalAfterChange } from "../hooks/revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Настройки сайта",
  admin: {
    group: "Настройки",
  },
  access: {
    read: () => true,
    update: adminCrud,
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange],
  },
  fields: [
    {
      name: "contact",
      type: "group",
      label: "Контакты",
      fields: [
        { name: "phone", type: "text", label: "Телефон" },
        { name: "email", type: "email", label: "Email" },
        { name: "telegram", type: "text", label: "Telegram" },
        { name: "whatsapp", type: "text", label: "WhatsApp" },
        { name: "vk", type: "text", label: "ВКонтакте" },
        { name: "boosty", type: "text", label: "Boosty" },
      ],
    },
    {
      name: "mainCta",
      type: "group",
      label: "Главный CTA",
      fields: [
        { name: "label", type: "text", label: "Текст кнопки", defaultValue: "Создать тур" },
        { name: "href", type: "text", label: "Ссылка", defaultValue: "/program" },
        { name: "description", type: "textarea", label: "Подзаголовок" },
      ],
    },
    {
      name: "footerText",
      type: "textarea",
      label: "Текст в подвале",
    },
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
      label: "Постер Hero-видео",
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
      label: "Статистика",
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
      label: "Социальные сети (legacy)",
      admin: { description: "Дублирует contact — для обратной совместимости." },
      fields: [
        { name: "telegram", type: "text", label: "Telegram" },
        { name: "instagram", type: "text", label: "Instagram" },
        { name: "vk", type: "text", label: "ВКонтакте" },
      ],
    },
  ],
};
