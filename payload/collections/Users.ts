import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  access: {
    read: () => true,
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
      options: [
        { label: "Администратор", value: "admin" },
        { label: "Редактор", value: "editor" },
      ],
      defaultValue: "editor",
    },
  ],
};
