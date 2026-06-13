import type { CollectionConfig } from "payload";
import {
  adminCrud,
  adminPanelAccess,
  publishedOrStaff,
} from "../access";
import { ADMIN_GROUPS, CONTENT_STATUS_OPTIONS, EVENT_CATEGORY_OPTIONS } from "../constants";
import { revalidateAfterChange } from "../hooks/revalidate";
import { validateRequiredSlug } from "../validators";

export const Events: CollectionConfig = {
  slug: "events",
  labels: {
    singular: "Событие",
    plural: "События",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "startDate", "status", "isPast", "updatedAt"],
    group: ADMIN_GROUPS.events,
    listSearchableFields: ["title", "venue", "slug"],
    description: "Календарь событий на /events. Публично — только опубликованные.",
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${doc.slug}`;
      }
      return null;
    },
  },
  access: {
    admin: adminPanelAccess,
    read: publishedOrStaff("status"),
    create: adminCrud,
    update: adminCrud,
    delete: adminCrud,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.startDate) {
          const end = data.endDate
            ? new Date(data.endDate)
            : new Date(data.startDate);
          data.isPast = end.getTime() < Date.now();
        }
        return data;
      },
    ],
    afterChange: [revalidateAfterChange],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Название события",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      validate: validateRequiredSlug,
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      label: "Статус",
      defaultValue: "draft",
      required: true,
      options: [...CONTENT_STATUS_OPTIONS],
      admin: { position: "sidebar" },
    },
    {
      name: "isPast",
      type: "checkbox",
      label: "Прошло",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Обновляется при сохранении по дате окончания.",
      },
    },
    {
      name: "category",
      type: "select",
      label: "Категория",
      required: true,
      options: [...EVENT_CATEGORY_OPTIONS],
    },
    {
      name: "startDate",
      type: "date",
      label: "Дата начала",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "endDate",
      type: "date",
      label: "Дата окончания",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "venue",
      type: "text",
      label: "Место проведения",
      required: true,
    },
    {
      name: "address",
      type: "text",
      label: "Адрес",
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Обложка",
    },
    {
      name: "description",
      type: "textarea",
      label: "Краткое описание",
    },
    {
      name: "fullDescription",
      type: "textarea",
      label: "Полное описание",
    },
    {
      name: "ticketUrl",
      type: "text",
      label: "Ссылка на билеты",
    },
    {
      name: "hasApplicationForm",
      type: "checkbox",
      label: "Форма заявки на сайте",
      defaultValue: false,
    },
    {
      name: "price",
      type: "text",
      label: "Стоимость (текст)",
    },
    {
      name: "relatedRoute",
      type: "relationship",
      relationTo: "routes",
      label: "Связанный маршрут",
    },
    {
      name: "relatedExcursion",
      type: "relationship",
      relationTo: "excursions",
      label: "Связанная экскурсия",
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "На главной",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "title", type: "text", label: "Meta Title" },
        { name: "description", type: "textarea", label: "Meta Description" },
        { name: "image", type: "upload", relationTo: "media", label: "OG Image" },
      ],
    },
  ],
};
