import type { CollectionConfig, CollectionAfterChangeHook } from "payload";
import { sendReviewRequest } from "@/lib/email";
import {
  adminCrud,
  adminPanelAccess,
  leadsCreateAccess,
  leadsDeleteAccess,
  leadsReadAccess,
  leadsUpdateAccess,
} from "../access";

const afterChangeHook: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  if (
    doc.status === "closed" &&
    previousDoc?.status !== "closed" &&
    doc.email &&
    doc.name
  ) {
    try {
      await sendReviewRequest({
        to: String(doc.email),
        name: String(doc.name),
        serviceType: doc.serviceType ? String(doc.serviceType) : undefined,
      });
    } catch (err) {
      console.error("Review request email error:", err);
    }
  }
};

export const Leads: CollectionConfig = {
  slug: "leads",
  labels: {
    singular: "Заявка",
    plural: "Заявки",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "status", "source", "serviceType", "createdAt"],
    group: "CRM",
    listSearchableFields: ["name", "email", "phone", "message"],
    description: "Фильтруйте по статусу «Новый» для необработанных заявок.",
  },
  access: {
    admin: adminPanelAccess,
    read: leadsReadAccess,
    create: leadsCreateAccess,
    update: leadsUpdateAccess,
    delete: leadsDeleteAccess,
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Имя",
      required: true,
    },
    {
      name: "email",
      type: "email",
      label: "Email",
      required: true,
    },
    {
      name: "phone",
      type: "text",
      label: "Телефон",
    },
    {
      name: "serviceType",
      type: "select",
      label: "Тип запроса",
      options: [
        { label: "Индивидуальный тур", value: "individual_tour" },
        { label: "Корпоративная программа", value: "corporate" },
        { label: "Экскурсия", value: "excursion" },
        { label: "Консалтинг", value: "consulting" },
        { label: "Общий вопрос", value: "general" },
      ],
    },
    {
      name: "dates",
      type: "text",
      label: "Планируемые даты",
    },
    {
      name: "groupSize",
      type: "number",
      label: "Количество человек",
    },
    {
      name: "interests",
      type: "array",
      label: "Интересы",
      fields: [{ name: "interest", type: "text" }],
    },
    {
      name: "budget",
      type: "select",
      label: "Бюджет",
      options: [
        { label: "До 10 000 ₽", value: "budget_10k" },
        { label: "10 000 — 30 000 ₽", value: "budget_30k" },
        { label: "30 000 — 100 000 ₽", value: "budget_100k" },
        { label: "От 100 000 ₽", value: "budget_100k_plus" },
      ],
    },
    {
      name: "message",
      type: "textarea",
      label: "Сообщение",
    },
    {
      name: "status",
      type: "select",
      label: "Статус",
      options: [
        { label: "Новый", value: "new" },
        { label: "В работе", value: "in_progress" },
        { label: "Ответ отправлен", value: "replied" },
        { label: "Закрыт", value: "closed" },
        { label: "Спам", value: "spam" },
      ],
      defaultValue: "new",
      admin: { position: "sidebar" },
    },
    {
      name: "adminComment",
      type: "textarea",
      label: "Комментарий администратора",
      admin: { position: "sidebar" },
    },
    {
      name: "source",
      type: "select",
      label: "Источник",
      options: [
        { label: "Форма программы", value: "program_form" },
        { label: "Страница контактов", value: "contacts" },
        { label: "Событие", value: "event" },
        { label: "Магазин", value: "shop" },
        { label: "Карта / маршрут", value: "map" },
        { label: "Экскурсии", value: "excursions" },
        { label: "Прямой заход", value: "direct" },
        { label: "Другое", value: "other" },
      ],
      admin: { position: "sidebar" },
    },
  ],
  hooks: {
    afterChange: [afterChangeHook],
  },
};
