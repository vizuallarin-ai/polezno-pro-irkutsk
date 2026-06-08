import type { CollectionConfig } from "payload";
import { adminCrud, adminPanelAccess } from "../access";

export const Partners: CollectionConfig = {
  slug: "partners",
  admin: {
    useAsTitle: "name",
    group: "Позже",
    hidden: true,
    description: "Скоро — партнёры в следующей фазе.",
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
