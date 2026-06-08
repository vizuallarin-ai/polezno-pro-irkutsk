import type { GlobalConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { adminCrud } from "../access";
import { ADMIN_GROUPS } from "../constants";
import { revalidateGlobalAfterChange } from "../hooks/revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Настройки сайта",
  admin: {
    group: ADMIN_GROUPS.settings,
    description: "Глобальные настройки: контакты, hero, SEO, подвал.",
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
      name: "projectName",
      type: "text",
      label: "Название проекта",
      defaultValue: "Полезно про Иркутск",
    },
    {
      name: "description",
      type: "textarea",
      label: "Описание проекта",
    },
    {
      name: "city",
      type: "text",
      label: "Город",
      defaultValue: "Иркутск",
    },
    {
      name: "heroTitle",
      type: "text",
      label: "Hero — заголовок",
      defaultValue: "Иркутск",
    },
    {
      name: "heroSubtitle",
      type: "textarea",
      label: "Hero — подзаголовок",
      defaultValue: "Авторский навигатор по городу и Байкалу",
    },
    {
      name: "mainCta",
      type: "group",
      label: "Главный CTA",
      fields: [
        { name: "label", type: "text", label: "Текст кнопки", defaultValue: "Спланировать" },
        { name: "href", type: "text", label: "Ссылка", defaultValue: "/program" },
        { name: "description", type: "textarea", label: "Подзаголовок" },
      ],
    },
    {
      name: "secondaryCta",
      type: "group",
      label: "Вторичный CTA",
      fields: [
        { name: "label", type: "text", label: "Текст кнопки", defaultValue: "Маршруты" },
        { name: "href", type: "text", label: "Ссылка", defaultValue: "/map" },
      ],
    },
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
        { name: "youtube", type: "text", label: "YouTube" },
        { name: "instagram", type: "text", label: "Instagram" },
      ],
    },
    {
      name: "footerText",
      type: "textarea",
      label: "Текст в подвале",
    },
    {
      name: "footerTagline",
      type: "text",
      label: "Подзаголовок в подвале",
      defaultValue: "Авторский навигатор по Иркутску",
    },
    {
      name: "defaultSeo",
      type: "group",
      label: "SEO по умолчанию",
      fields: [
        {
          name: "metaDescription",
          type: "textarea",
          label: "Meta description",
        },
        {
          name: "ogImage",
          type: "upload",
          relationTo: "media",
          label: "OG-изображение",
        },
      ],
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
      label: "OG-изображение (legacy)",
      admin: { description: "Дублирует defaultSeo.ogImage — для совместимости." },
    },
    {
      name: "metaDescription",
      type: "textarea",
      label: "Meta description (legacy)",
      admin: { description: "Дублирует defaultSeo.metaDescription." },
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
