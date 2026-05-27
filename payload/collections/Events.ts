import type { CollectionConfig } from "payload";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "startDate", "updatedAt"],
    group: "Контент",
  },
  access: {
    read: () => true,
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
      admin: { position: "sidebar" },
    },
    {
      name: "category",
      type: "select",
      label: "Категория",
      required: true,
      options: [
        { label: "Фестиваль", value: "festival" },
        { label: "Концерт", value: "concert" },
        { label: "Выставка", value: "exhibition" },
        { label: "Ледовое событие", value: "ice" },
        { label: "Байкал", value: "baikal" },
        { label: "Гастрономия", value: "gastronomy" },
        { label: "Спорт", value: "sport" },
        { label: "Культура", value: "culture" },
        { label: "Форум", value: "forum" },
        { label: "Другое", value: "other" },
      ],
    },
    {
      name: "startDate",
      type: "date",
      label: "Дата начала",
      required: true,
    },
    {
      name: "endDate",
      type: "date",
      label: "Дата окончания",
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
      label: "Описание",
    },
    {
      name: "ticketUrl",
      type: "text",
      label: "Ссылка на билеты (внешняя)",
    },
    {
      name: "hasApplicationForm",
      type: "checkbox",
      label: "Форма заявки (внутренняя)",
      defaultValue: false,
    },
    {
      name: "price",
      type: "text",
      label: "Стоимость билета (описание)",
    },
    {
      name: "isFeatured",
      type: "checkbox",
      label: "Рекомендуемое (на главной)",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
  ],
};
