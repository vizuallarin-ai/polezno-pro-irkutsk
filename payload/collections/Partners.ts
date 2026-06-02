import type { CollectionConfig } from "payload";
import { adminCrud, adminPanelAccess } from "../access";

export const Partners: CollectionConfig = {
  slug: "partners",
  admin: {
    useAsTitle: "name",
    group: "Отзывы и партнёры",
    description: "Логотипы партнёров — отображаются в секции «Нам доверяют» на главной странице.",
  },
  access: {
    admin: adminPanelAccess,
    read: () => true,
    create: adminCrud,
    update: adminCrud,
    delete: adminCrud,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Название",
      required: true,
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: "Логотип",
      required: true,
    },
    {
      name: "url",
      type: "text",
      label: "Ссылка на сайт",
    },
    {
      name: "order",
      type: "number",
      label: "Порядок отображения",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
  ],
};
