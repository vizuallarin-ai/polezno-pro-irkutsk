import type { CollectionConfig } from "payload";
import { adminCrud, adminPanelAccess, staffOnlyRead } from "../access";
import { ADMIN_GROUP } from "../admin-groups";

export const Partners: CollectionConfig = {
  slug: "partners",
  labels: {
    singular: "Партнёр (system)",
    plural: "Партнёры (system)",
  },
  admin: {
    useAsTitle: "name",
    group: ADMIN_GROUP.SYSTEM,
    hidden: true,
    description:
      "Orphan / не используется публичным сайтом. Скрыто из ежедневной работы владельца.",
  },
  access: {
    admin: adminPanelAccess,
    read: staffOnlyRead,
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
