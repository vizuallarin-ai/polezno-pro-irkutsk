import type { CollectionConfig } from "payload";
import {
  adminCrud,
  adminPanelAccess,
  guideReadAccess,
} from "../access";
import { ADMIN_GROUP } from "../admin-groups";
import {
  createAutoSlugBeforeValidate,
  SLUG_FIELD_ADMIN,
  SLUG_FIELD_LABEL,
} from "../hooks/auto-slug";
import { guidePublicSafetyBeforeValidate } from "../hooks/publish-guards";
import { revalidateAfterChange } from "../hooks/revalidate";
import { validateRequiredSlug } from "../validators";

export const Guides: CollectionConfig = {
  slug: "guides",
  labels: {
    singular: "Гид / профиль",
    plural: "Гиды / профили",
  },
  admin: {
    group: ADMIN_GROUP.PROJECT,
    useAsTitle: "name",
    defaultColumns: ["name", "specialization", "isActive", "updatedAt"],
    listSearchableFields: ["name", "slug", "bio"],
    description:
      "Профили гидов для /about/guides. Неактивный или незаполненный профиль на сайте не показывается.",
    hidden: false,
  },
  access: {
    admin: adminPanelAccess,
    read: guideReadAccess,
    create: adminCrud,
    update: adminCrud,
    delete: adminCrud,
  },
  hooks: {
    beforeValidate: [
      createAutoSlugBeforeValidate({ sourceField: "name", fallback: "guide" }),
      guidePublicSafetyBeforeValidate,
    ],
    afterChange: [revalidateAfterChange],
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Имя",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: SLUG_FIELD_LABEL,
      required: true,
      unique: true,
      validate: validateRequiredSlug,
      admin: SLUG_FIELD_ADMIN,
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Фотография",
      required: true,
    },
    {
      name: "specialization",
      type: "select",
      label: "Специализация",
      hasMany: true,
      options: [
        { label: "История", value: "history" },
        { label: "Архитектура", value: "architecture" },
        { label: "Гастрономия", value: "gastronomy" },
        { label: "Деревянное зодчество", value: "wooden" },
        { label: "Байкал", value: "baikal" },
        { label: "Ночные прогулки", value: "night" },
        { label: "Декабристы", value: "decembrists" },
        { label: "Секретные места", value: "hidden" },
        { label: "Корпоративные программы", value: "corporate" },
      ],
    },
    {
      name: "bio",
      type: "textarea",
      label: "О себе",
      required: true,
    },
    {
      name: "quote",
      type: "text",
      label: "Цитата (девиз)",
    },
    {
      name: "experience",
      type: "number",
      label: "Лет опыта",
    },
    {
      name: "languages",
      type: "array",
      label: "Языки проведения",
      fields: [{ name: "language", type: "text" }],
    },
    {
      name: "routes",
      type: "relationship",
      relationTo: "routes",
      label: "Авторские маршруты",
      hasMany: true,
    },
    {
      name: "isActive",
      type: "checkbox",
      label: "Показывать на сайте",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Включайте только для готового профиля. Placeholder и незаполненные карточки остаются выключенными.",
      },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "Отображать на главной",
      defaultValue: false,
      admin: { position: "sidebar" },
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
