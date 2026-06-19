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
import {
  BUSINESS_BUDGET_OPTIONS,
  BUSINESS_FORMAT_OPTIONS,
  BUSINESS_TASK_TYPE_OPTIONS,
} from "@/lib/leads-business";
import { LEAD_SOURCE_OPTIONS } from "../constants";

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
    defaultColumns: [
      "name",
      "company",
      "taskType",
      "status",
      "source",
      "businessFormat",
      "createdAt",
    ],
    listSearchableFields: [
      "name",
      "email",
      "phone",
      "contact",
      "company",
      "message",
      "routeSlug",
      "articleSlug",
      "eventSlug",
      "excursionSlug",
      "productSlug",
      "productTitle",
      "makerId",
      "productCategory",
      "arPostcardSlug",
      "arPostcardTitle",
      "taskType",
      "sourceBlock",
    ],
    description:
      "Фильтруйте по колонке «Статус» или «Источник». B2B-заявки: источник «Для бизнеса (B2B)» — /admin/collections/leads?where[source][equals]=business",
    components: {
      beforeListTable: ["./payload/components/LeadsListFilters#default"],
    },
  },
  access: {
    admin: adminPanelAccess,
    read: leadsReadAccess,
    create: leadsCreateAccess,
    update: leadsUpdateAccess,
    delete: leadsDeleteAccess,
  },
  defaultSort: "-createdAt",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Имя",
      required: true,
    },
    {
      name: "company",
      type: "text",
      label: "Компания / проект",
      admin: {
        description: "B2B: название компании или проекта.",
      },
    },
    {
      name: "contact",
      type: "text",
      label: "Контакт для связи",
      admin: {
        description: "Основной контакт из B2B-формы (телефон, email, @username).",
      },
    },
    {
      name: "email",
      type: "email",
      label: "Email",
    },
    {
      name: "phone",
      type: "text",
      label: "Телефон",
    },
    {
      name: "telegram",
      type: "text",
      label: "Telegram",
    },
    {
      name: "max",
      type: "text",
      label: "MAX",
    },
    {
      name: "websiteUrl",
      type: "text",
      label: "Сайт компании",
    },
    {
      name: "taskType",
      type: "select",
      label: "Тип задачи (B2B)",
      options: [...BUSINESS_TASK_TYPE_OPTIONS],
      admin: {
        description: "Заполняется из формы «Для бизнеса».",
      },
    },
    {
      name: "businessFormat",
      type: "select",
      label: "Формат (B2B)",
      options: [...BUSINESS_FORMAT_OPTIONS],
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
        ...BUSINESS_BUDGET_OPTIONS,
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
      options: [...LEAD_SOURCE_OPTIONS],
      admin: { position: "sidebar" },
    },
    {
      name: "sourceType",
      type: "text",
      label: "Тип источника",
      admin: {
        position: "sidebar",
        description: "business — заявка с раздела «Для бизнеса».",
      },
    },
    {
      name: "sourceBlock",
      type: "text",
      label: "Блок CTA",
      admin: {
        position: "sidebar",
        description: "Откуда на странице нажали (hero, direction-*, routes, form).",
      },
    },
    {
      name: "routeSlug",
      type: "text",
      label: "Маршрут (slug)",
      admin: { position: "sidebar" },
    },
    {
      name: "articleSlug",
      type: "text",
      label: "Статья (slug)",
      admin: { position: "sidebar" },
    },
    {
      name: "eventSlug",
      type: "text",
      label: "Событие (slug)",
      admin: { position: "sidebar" },
    },
    {
      name: "excursionSlug",
      type: "text",
      label: "Экскурсия (slug)",
      admin: { position: "sidebar" },
    },
    {
      name: "selectedFormat",
      type: "text",
      label: "Выбранный формат",
      admin: {
        position: "sidebar",
        description: "self-guided, guided или corporate — из формы программы.",
      },
    },
    {
      name: "sourceTitle",
      type: "text",
      label: "Источник (название)",
      admin: {
        position: "sidebar",
        description: "Название маршрута или экскурсии, с которой пришла заявка.",
      },
    },
    {
      name: "productSlug",
      type: "text",
      label: "Товар (slug)",
      admin: { position: "sidebar" },
    },
    {
      name: "productId",
      type: "text",
      label: "Товар (ID)",
      admin: { position: "sidebar" },
    },
    {
      name: "productTitle",
      type: "text",
      label: "Товар (название)",
      admin: { position: "sidebar" },
    },
    {
      name: "productCategory",
      type: "text",
      label: "Категория товара",
      admin: { position: "sidebar" },
    },
    {
      name: "quantity",
      type: "number",
      label: "Количество",
      admin: { position: "sidebar" },
    },
    {
      name: "makerId",
      type: "text",
      label: "Мастер (ID)",
      admin: { position: "sidebar" },
    },
    {
      name: "makerSlug",
      type: "text",
      label: "Мастер (slug)",
      admin: { position: "sidebar" },
    },
    {
      name: "makerTitle",
      type: "text",
      label: "Мастер (название)",
      admin: { position: "sidebar" },
    },
    {
      name: "craftType",
      type: "text",
      label: "Направление мастера",
      admin: { position: "sidebar" },
    },
    {
      name: "placementType",
      type: "text",
      label: "Тип размещения",
      admin: { position: "sidebar" },
    },
    {
      name: "arPostcardSlug",
      type: "text",
      label: "AR-открытка (slug)",
      admin: { position: "sidebar" },
    },
    {
      name: "arPostcardTitle",
      type: "text",
      label: "AR-открытка (название)",
      admin: { position: "sidebar" },
    },
  ],
  hooks: {
    afterChange: [afterChangeHook],
  },
};
