import type { CollectionConfig } from "payload";
import {
  adminPanelAccess,
  contentCrud,
  contentDeleteAccess,
  reviewReadAccess,
} from "../access";
import { ADMIN_GROUP } from "../admin-groups";
import { CONTENT_STATUS_OPTIONS } from "../constants";
import { createContentDeleteGuard } from "../hooks/delete-guards";
import { revalidateAfterChange } from "../hooks/revalidate";
import { CONTENT_VERSIONS } from "../versioning";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  labels: {
    singular: "Отзыв",
    plural: "Отзывы",
  },
  admin: {
    group: ADMIN_GROUP.CONTENT,
    useAsTitle: "author",
    defaultColumns: ["author", "rating", "status", "isFeatured", "updatedAt"],
    listSearchableFields: ["author", "city", "text"],
    description:
      "Отзывы для блока доверия на главной. Если отзывов ещё нет — добавьте реальные. Черновик не виден на сайте; «Опубликован» + «На главной» — показывается посетителям.",
    hidden: false,
  },
  versions: CONTENT_VERSIONS,
  access: {
    admin: adminPanelAccess,
    read: reviewReadAccess,
    create: contentCrud,
    update: contentCrud,
    delete: contentDeleteAccess,
  },
  hooks: {
    beforeDelete: [createContentDeleteGuard()],
    afterChange: [revalidateAfterChange],
  },
  fields: [
    {
      name: "author",
      type: "text",
      label: "Имя автора",
      required: true,
    },
    {
      name: "city",
      type: "text",
      label: "Город",
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Фото автора",
    },
    {
      name: "text",
      type: "textarea",
      label: "Текст отзыва",
      required: true,
    },
    {
      name: "rating",
      type: "select",
      label: "Оценка",
      options: [
        { label: "★★★★★ — 5", value: "5" },
        { label: "★★★★ — 4", value: "4" },
        { label: "★★★ — 3", value: "3" },
      ],
      defaultValue: "5",
    },
    {
      name: "serviceType",
      type: "select",
      label: "Тип услуги",
      options: [
        { label: "Тур", value: "tour" },
        { label: "Экскурсия", value: "excursion" },
        { label: "Корпоративная программа", value: "corporate" },
        { label: "Магазин", value: "shop" },
      ],
    },
    {
      name: "status",
      type: "select",
      label: "Статус публикации",
      required: true,
      defaultValue: "draft",
      options: [...CONTENT_STATUS_OPTIONS],
      admin: {
        position: "sidebar",
        description: "Только «Опубликован» может появиться на сайте.",
      },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "Показывать на главной",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Нужны статус «Опубликован» и эта галочка.",
      },
    },
  ],
};
