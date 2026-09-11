import type { CollectionConfig } from "payload";
import {
  ownerOrDeveloperPanelAccess,
  usersCreateAccess,
  usersDeleteAccess,
  usersReadAccess,
  usersUpdateAccess,
} from "../access";
import { ADMIN_GROUP } from "../admin-groups";
import {
  usersBeforeChangeGuard,
  usersBeforeDeleteGuard,
} from "../hooks/delete-guards";
import { ROLE_OPTIONS } from "../roles";

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
      "Роли: Владелец (admin), Контент-редактор (editor), Разработчик (developer). Не удаляйте последнего владельца/разработчика.",
  },
  access: {
    admin: ownerOrDeveloperPanelAccess,
    read: usersReadAccess,
    create: usersCreateAccess,
    update: usersUpdateAccess,
    delete: usersDeleteAccess,
  },
  hooks: {
    beforeChange: [usersBeforeChangeGuard],
    beforeDelete: [usersBeforeDeleteGuard],
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
      options: [...ROLE_OPTIONS],
      defaultValue: "admin",
      admin: {
        description:
          "Владелец — контент и заявки. Редактор — только контент (без заявок и пользователей). Разработчик — технический полный доступ.",
      },
    },
  ],
};
