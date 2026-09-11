import type { CollectionConfig } from "payload";
import {
  adminPanelAccess,
  contentCrud,
  contentDeleteAccess,
  guideReadAccess,
} from "../access";
import { ADMIN_GROUP } from "../admin-groups";
import {
  createAutoSlugBeforeValidate,
  SLUG_FIELD_ADMIN,
  SLUG_FIELD_LABEL,
} from "../hooks/auto-slug";
import { createContentDeleteGuard } from "../hooks/delete-guards";
import { guidePublicSafetyBeforeValidate } from "../hooks/publish-guards";
import { revalidateAfterChange } from "../hooks/revalidate";
import { CONTENT_VERSIONS } from "../versioning";
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
      "Профили гидов для /about/guides. Если профиль пустой или с заглушкой — заполните имя и ссылку. Неактивный или незаполненный профиль на сайте не показывается.",
    hidden: false,
  },
  versions: CONTENT_VERSIONS,
  access: {
    admin: adminPanelAccess,
    read: guideReadAccess,
    create: contentCrud,
    update: contentCrud,
    delete: contentDeleteAccess,
  },
  hooks: {
    beforeValidate: [
      createAutoSlugBeforeValidate({ sourceField: "name", fallback: "guide" }),
      guidePublicSafetyBeforeValidate,
    ],
    beforeDelete: [createContentDeleteGuard({ mode: "guide" })],
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
