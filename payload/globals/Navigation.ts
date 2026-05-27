import type { GlobalConfig } from "payload";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Навигация",
  admin: {
    group: "Настройки",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "mainNav",
      type: "array",
      label: "Главное меню",
      fields: [
        { name: "label", type: "text", label: "Название", required: true },
        { name: "href", type: "text", label: "URL", required: true },
      ],
    },
    {
      name: "ctaLabel",
      type: "text",
      label: "Текст CTA-кнопки в шапке",
      defaultValue: "Создать тур",
    },
    {
      name: "ctaHref",
      type: "text",
      label: "Ссылка CTA-кнопки",
      defaultValue: "/program",
    },
  ],
};
