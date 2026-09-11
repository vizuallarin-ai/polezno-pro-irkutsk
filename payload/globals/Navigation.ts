import type { GlobalConfig } from "payload";
import { isOwnerOrDeveloper } from "../access";
import { ADMIN_GROUP } from "../admin-groups";
import { revalidateGlobalAfterChange } from "../hooks/revalidate";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Навигация (system)",
  admin: {
    group: ADMIN_GROUP.SYSTEM,
    hidden: true,
    description:
      "Главное меню сайта задаётся кодом (не этим полем). Здесь влияют только CTA в шапке. Не для ежедневной работы владельца.",
  },
  access: {
    // Public Local API needs CTA fields; mainNav is unused by frontend.
    read: () => true,
    update: isOwnerOrDeveloper,
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange],
  },
  fields: [
    {
      name: "mainNav",
      type: "array",
      label: "Главное меню (не используется сайтом)",
      admin: {
        description:
          "Сайт читает PRIMARY_NAV_LINKS из кода. Изменения здесь не влияют на шапку.",
        hidden: true,
      },
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
      admin: {
        description: "Это поле реально используется публичным сайтом.",
      },
    },
    {
      name: "ctaHref",
      type: "text",
      label: "Ссылка CTA-кнопки",
      defaultValue: "/business",
    },
  ],
};
