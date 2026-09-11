import type {
  CollectionBeforeValidateHook,
  CollectionConfig,
  CollectionAfterChangeHook,
} from "payload";
import { sendReviewRequest } from "@/lib/email";
import {
  ownerOrDeveloperPanelAccess,
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
import { ADMIN_GROUP } from "../admin-groups";
import {
  PRIORITY_OPTIONS,
  PREFERRED_CONTACT_OPTIONS,
  REQUEST_TYPE_OPTIONS,
} from "@/lib/leads-constants";
import {
  CLOSED_REASON_OPTIONS,
  isLeadCrmStatus,
  isValidClosedReason,
  LEAD_STATUS_OPTIONS,
  parseLeadDate,
} from "@/lib/leads/crm";
import { leadsBeforeDeleteGuard } from "../hooks/delete-guards";

const afterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
}) => {
  // Review request only on successful completion («Завершено»), never on Отказ/Спам.
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

const crmBeforeValidate: CollectionBeforeValidateHook = async ({ data }) => {
  if (!data) return data;

  if (data.status != null && data.status !== "" && !isLeadCrmStatus(data.status)) {
    throw new Error(
      "Некорректный статус заявки. Выберите значение из списка."
    );
  }

  if (
    data.closedReason != null &&
    data.closedReason !== "" &&
    !isValidClosedReason(data.closedReason)
  ) {
    throw new Error("Некорректная причина отказа.");
  }

  if (data.nextContactAt != null && data.nextContactAt !== "") {
    if (!parseLeadDate(data.nextContactAt as string | Date)) {
      throw new Error("Укажите корректную дату следующего контакта.");
    }
  }

  if (data.lastContactAt != null && data.lastContactAt !== "") {
    if (!parseLeadDate(data.lastContactAt as string | Date)) {
      throw new Error("Укажите корректную дату последнего контакта.");
    }
  }

  return data;
};

export const Leads: CollectionConfig = {
  slug: "leads",
  labels: {
    singular: "Заявка",
    plural: "Заявки",
  },
  admin: {
    group: ADMIN_GROUP.OPERATIONS,
    useAsTitle: "name",
    defaultColumns: [
      "name",
      "contact",
      "status",
      "nextContactAt",
      "createdAt",
      "source",
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
      "requestType",
      "pageUrl",
      "routeTitle",
      "materialSlug",
      "photoId",
      "adminComment",
    ],
    description:
      "Рабочий стол заявок: статус → следующий контакт → заметка. Не удаляйте заявки — переведите в «Завершено» или «Отказ». Жёсткое удаление только у разработчика.",
    components: {
      beforeListTable: ["./payload/components/LeadsListFilters#default"],
    },
  },
  access: {
    admin: ownerOrDeveloperPanelAccess,
    read: leadsReadAccess,
    create: leadsCreateAccess,
    update: leadsUpdateAccess,
    delete: leadsDeleteAccess,
  },
  hooks: {
    beforeValidate: [crmBeforeValidate],
    beforeDelete: [leadsBeforeDeleteGuard],
    afterChange: [afterChangeHook],
  },
  defaultSort: "-createdAt",
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Клиент",
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
                description:
                  "Основной контакт из формы (телефон, email, @username).",
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
              name: "preferredContactMethod",
              type: "select",
              label: "Предпочтительный способ связи",
              options: [...PREFERRED_CONTACT_OPTIONS],
            },
            {
              name: "message",
              type: "textarea",
              label: "Сообщение / запрос",
            },
            {
              name: "interestType",
              type: "text",
              label: "Тип интереса",
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
          ],
        },
        {
          label: "Работа с заявкой",
          fields: [
            {
              name: "status",
              type: "select",
              label: "Статус",
              options: [...LEAD_STATUS_OPTIONS],
              defaultValue: "new",
              index: true,
              admin: {
                description:
                  "Новая → Нужно связаться → Обсуждение → Забронировано → Завершено. Отказ и Спам — закрытие без продажи.",
              },
            },
            {
              name: "nextContactAt",
              type: "date",
              label: "Следующая связь",
              index: true,
              admin: {
                date: {
                  pickerAppearance: "dayAndTime",
                  displayFormat: "dd.MM.yyyy HH:mm",
                },
                description:
                  "Когда снова связаться. Просроченные заявки видны на главной админки (часовой пояс проекта: Иркутск).",
              },
            },
            {
              name: "lastContactAt",
              type: "date",
              label: "Последний контакт",
              admin: {
                date: {
                  pickerAppearance: "dayAndTime",
                  displayFormat: "dd.MM.yyyy HH:mm",
                },
                description:
                  "Фактический контакт с клиентом — не путать с датой изменения записи.",
              },
            },
            {
              name: "adminComment",
              type: "textarea",
              label: "Заметка",
              admin: {
                description:
                  "Что происходит сейчас: договорённости, контекст, следующий шаг своими словами.",
              },
            },
            {
              name: "closedReason",
              type: "select",
              label: "Причина отказа",
              options: [...CLOSED_REASON_OPTIONS],
              admin: {
                condition: (data) => data?.status === "declined",
                description: "Необязательно — помогает понять повторяющиеся отказы.",
              },
            },
            {
              name: "closedReasonNote",
              type: "text",
              label: "Уточнение отказа",
              admin: {
                condition: (data) => data?.status === "declined",
                description: "Короткий комментарий, если выбрали «Другое» или нужно уточнить.",
              },
            },
            {
              name: "priority",
              type: "select",
              label: "Приоритет",
              options: [...PRIORITY_OPTIONS],
              defaultValue: "normal",
              admin: {
                description: "При создании с сайта выставляется автоматически.",
              },
            },
          ],
        },
        {
          label: "Источник / техническое",
          fields: [
            {
              name: "requestType",
              type: "select",
              label: "Тип заявки",
              options: [...REQUEST_TYPE_OPTIONS],
            },
            {
              name: "source",
              type: "select",
              label: "Источник",
              options: [...LEAD_SOURCE_OPTIONS],
            },
            {
              name: "sourceType",
              type: "text",
              label: "Тип источника",
              admin: {
                description: "business — заявка с раздела «Для бизнеса».",
              },
            },
            {
              name: "sourceBlock",
              type: "text",
              label: "Блок CTA",
              admin: {
                description:
                  "Откуда на странице нажали (hero, direction-*, routes, form).",
              },
            },
            {
              name: "routeId",
              type: "text",
              label: "Маршрут (ID)",
            },
            {
              name: "routeSlug",
              type: "text",
              label: "Маршрут (slug)",
            },
            {
              name: "routeTitle",
              type: "text",
              label: "Маршрут (название)",
            },
            {
              name: "materialId",
              type: "text",
              label: "Материал (ID)",
            },
            {
              name: "materialSlug",
              type: "text",
              label: "Материал (slug)",
            },
            {
              name: "photoId",
              type: "text",
              label: "Фото (ID)",
            },
            {
              name: "articleSlug",
              type: "text",
              label: "Статья (slug)",
            },
            {
              name: "eventSlug",
              type: "text",
              label: "Событие (slug)",
            },
            {
              name: "excursionSlug",
              type: "text",
              label: "Экскурсия (slug)",
            },
            {
              name: "selectedFormat",
              type: "text",
              label: "Выбранный формат",
              admin: {
                description:
                  "self-guided, guided или corporate — из формы программы.",
              },
            },
            {
              name: "sourceTitle",
              type: "text",
              label: "Источник (название)",
              admin: {
                description:
                  "Название маршрута или экскурсии, с которой пришла заявка.",
              },
            },
            {
              name: "productSlug",
              type: "text",
              label: "Товар (slug)",
            },
            {
              name: "productId",
              type: "text",
              label: "Товар (ID)",
            },
            {
              name: "productTitle",
              type: "text",
              label: "Товар (название)",
            },
            {
              name: "productCategory",
              type: "text",
              label: "Категория товара",
            },
            {
              name: "quantity",
              type: "number",
              label: "Количество",
            },
            {
              name: "makerId",
              type: "text",
              label: "Мастер (ID)",
            },
            {
              name: "makerSlug",
              type: "text",
              label: "Мастер (slug)",
            },
            {
              name: "makerTitle",
              type: "text",
              label: "Мастер (название)",
            },
            {
              name: "craftType",
              type: "text",
              label: "Направление мастера",
            },
            {
              name: "placementType",
              type: "text",
              label: "Тип размещения",
            },
            {
              name: "arPostcardId",
              type: "text",
              label: "AR-открытка (ID)",
            },
            {
              name: "arPostcardSlug",
              type: "text",
              label: "AR-открытка (slug)",
            },
            {
              name: "arPostcardTitle",
              type: "text",
              label: "AR-открытка (название)",
            },
            {
              name: "sourceSlug",
              type: "text",
              label: "Источник (slug)",
            },
            {
              name: "sourceId",
              type: "text",
              label: "Источник (ID)",
            },
            {
              name: "sourceUrl",
              type: "text",
              label: "URL источника",
            },
            {
              name: "pageUrl",
              type: "text",
              label: "Страница отправки",
            },
            {
              name: "referrer",
              type: "text",
              label: "Referrer",
            },
            {
              name: "utmSource",
              type: "text",
              label: "UTM Source",
            },
            {
              name: "utmMedium",
              type: "text",
              label: "UTM Medium",
            },
            {
              name: "utmCampaign",
              type: "text",
              label: "UTM Campaign",
            },
            {
              name: "utmContent",
              type: "text",
              label: "UTM Content",
            },
            {
              name: "utmTerm",
              type: "text",
              label: "UTM Term",
            },
            {
              name: "consentAccepted",
              type: "checkbox",
              label: "Согласие получено",
            },
            {
              name: "consentText",
              type: "text",
              label: "Текст согласия",
            },
            {
              name: "consentVersion",
              type: "text",
              label: "Версия согласия",
            },
            {
              name: "consentAcceptedAt",
              type: "date",
              label: "Дата согласия",
            },
          ],
        },
      ],
    },
  ],
};
