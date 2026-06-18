import { z } from "zod";

export const BUSINESS_TASK_TYPE_OPTIONS = [
  { label: "Организовать программу по Иркутску", value: "city_program" },
  { label: "Сопровождение туристического проекта", value: "tour_support" },
  { label: "Обучение персонала", value: "staff_training" },
  { label: "Приём делегации / гостей", value: "delegation" },
  { label: "Корпоративное мероприятие", value: "corporate_event" },
  { label: "Программа по маршруту с сайта", value: "route_program" },
  { label: "Консультация по проекту", value: "consulting" },
  { label: "Другое", value: "other" },
] as const;

export const BUSINESS_FORMAT_OPTIONS = [
  { label: "Под ключ — от идеи до сопровождения", value: "full_service" },
  { label: "Программа с гидом на месте", value: "guided_program" },
  { label: "Аудит / бриф / консультация", value: "audit_brief" },
  { label: "Обучение / воркшоп", value: "training" },
  { label: "Онлайн-формат", value: "online" },
  { label: "Пока не определились", value: "undecided" },
] as const;

export const BUSINESS_BUDGET_OPTIONS = [
  { label: "До 50 000 ₽", value: "budget_50k" },
  { label: "50 000 — 150 000 ₽", value: "budget_150k" },
  { label: "150 000 — 500 000 ₽", value: "budget_500k" },
  { label: "От 500 000 ₽", value: "budget_500k_plus" },
  { label: "Пока не определились", value: "budget_undecided" },
] as const;

const taskTypeValues = BUSINESS_TASK_TYPE_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

const formatValues = BUSINESS_FORMAT_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

const budgetValues = BUSINESS_BUDGET_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

export const businessLeadSchema = z.object({
  name: z.string().min(2, "Введите имя"),
  company: z.string().min(2, "Укажите компанию или проект"),
  contact: z.string().min(3, "Укажите, как с вами связаться"),
  taskType: z.enum(taskTypeValues, { message: "Выберите тип задачи" }),
  message: z.string().min(10, "Опишите задачу подробнее"),
  email: z
    .string()
    .email("Некорректный email")
    .optional()
    .or(z.literal("")),
  telegram: z.string().optional(),
  max: z.string().optional(),
  phone: z.string().optional(),
  dates: z.string().optional(),
  peopleCount: z.number().min(1).max(5000).optional(),
  businessFormat: z.enum(formatValues).optional().or(z.literal("")),
  budgetRange: z.enum(budgetValues).optional().or(z.literal("")),
  websiteUrl: z.string().url("Некорректный URL").optional().or(z.literal("")),
  sourceType: z.literal("business").optional(),
  sourceTitle: z.string().optional(),
  sourceBlock: z.string().optional(),
  source: z.literal("business").optional(),
  routeSlug: z.string().optional(),
  excursionSlug: z.string().optional(),
  selectedFormat: z.string().optional(),
});

export type BusinessLeadInput = z.infer<typeof businessLeadSchema>;

export const BUSINESS_TASK_TYPE_LABELS = Object.fromEntries(
  BUSINESS_TASK_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

export const BUSINESS_FORMAT_LABELS = Object.fromEntries(
  BUSINESS_FORMAT_OPTIONS.map((o) => [o.value, o.label])
);

export const BUSINESS_BUDGET_LABELS = Object.fromEntries(
  BUSINESS_BUDGET_OPTIONS.map((o) => [o.value, o.label])
);
