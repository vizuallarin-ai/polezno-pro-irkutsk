import type { CollectionConfig } from "payload";
import { adminCrud, adminPanelAccess } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "Пользователь",
    plural: "Пользователи",
  },
  auth: true,
  admin: {
    useAsTitle: "email",
    description: "Доступ к /admin только для роли «Администратор».",
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
        { label: "Администратор", value: "admin" },
        { label: "Редактор", value: "editor" },
      ],
      defaultValue: "admin",
      admin: {
        description: "Только администраторы могут входить в панель CMS.",
      },
    },
  ],
};
