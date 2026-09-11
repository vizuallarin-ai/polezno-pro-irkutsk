import type { CollectionConfig } from "payload";
import { adminCrud, adminPanelAccess } from "../access";
import { ADMIN_GROUP } from "../admin-groups";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "Пользователь",
    plural: "Пользователи",
  },
  auth: true,
  admin: {
    group: ADMIN_GROUP.MANAGEMENT,
    useAsTitle: "email",
    description:
      "Доступ к /admin только для роли «Администратор». Роль «Редактор» пока не открывает панель (планируется в ADMIN.E).",
  },
  access: {
    admin: adminPanelAccess,
    read: adminCrud,
    create: adminCrud,
    update: adminCrud,
    delete: adminCrud,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Имя",
    },
    {
      name: "role",
      type: "select",
      label: "Роль",
      required: true,
      options: [
        { label: "Администратор (полный доступ)", value: "admin" },
        {
          label: "Редактор (пока без входа в /admin — не выбирать)",
          value: "editor",
        },
      ],
      defaultValue: "admin",
      admin: {
        description:
          "Пока используйте только «Администратор». Модель Owner / Content Editor / Developer — этап ADMIN.E.",
      },
    },
  ],
};
