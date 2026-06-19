export const REQUEST_TYPE_OPTIONS = [
  { label: "Общая заявка", value: "general_contact" },
  { label: "Спланировать визит", value: "plan_visit" },
  { label: "Маршрут", value: "route_request" },
  { label: "Пройти с Алёной", value: "guided_route" },
  { label: "Для бизнеса", value: "business_request" },
  { label: "Товар / сувенир", value: "product_order" },
  { label: "Вопрос о товаре", value: "product_question" },
  { label: "Размещение мастера", value: "maker_placement" },
  { label: "Вопрос по фотоархиву", value: "photo_submission_question" },
  { label: "AR-открытка", value: "ar_postcard_preorder" },
  { label: "Общий запрос (сувениры)", value: "souvenir_general" },
  { label: "Клуб", value: "club_interest" },
  { label: "Событие", value: "event_interest" },
  { label: "Вопрос о материале", value: "content_question" },
  { label: "Другой запрос", value: "custom_request" },
] as const;

export const SOURCE_TYPE_OPTIONS = [
  { label: "Главная", value: "home" },
  { label: "Маршрут", value: "route" },
  { label: "Раздел маршрутов", value: "routes" },
  { label: "Материал", value: "material" },
  { label: "Исследовать", value: "explore" },
  { label: "Фото", value: "photo" },
  { label: "Фотоархив", value: "photos" },
  { label: "Для бизнеса", value: "business" },
  { label: "Товар", value: "product" },
  { label: "Сувениры", value: "souvenirs" },
  { label: "Мастер", value: "maker" },
  { label: "AR-открытка", value: "ar_postcard" },
  { label: "О проекте", value: "about" },
  { label: "Контакты", value: "contact" },
  { label: "Клуб", value: "club" },
  { label: "Событие", value: "event" },
  { label: "Подвал", value: "footer" },
  { label: "Шапка", value: "header" },
  { label: "Плавающая кнопка", value: "floating_contact" },
  { label: "Блок CTA", value: "cta_section" },
] as const;

export const PRIORITY_OPTIONS = [
  { label: "Высокий", value: "high" },
  { label: "Обычный", value: "normal" },
  { label: "Низкий", value: "low" },
] as const;

export const PREFERRED_CONTACT_OPTIONS = [
  { label: "Любой", value: "any" },
  { label: "Telegram", value: "telegram" },
  { label: "MAX", value: "max" },
  { label: "Email", value: "email" },
  { label: "Телефон", value: "phone" },
] as const;

export const REQUEST_TYPE_LABELS = Object.fromEntries(
  REQUEST_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

export const SOURCE_TYPE_LABELS = Object.fromEntries(
  SOURCE_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

export const PRIORITY_LABELS = Object.fromEntries(
  PRIORITY_OPTIONS.map((o) => [o.value, o.label])
);

export const DEFAULT_CONSENT_TEXT =
  "Я согласен(на) на обработку персональных данных и понимаю, что со мной свяжутся по указанному контакту";

export const DEFAULT_CONSENT_VERSION = "2026-06";

export const DEFAULT_PRIVACY_POLICY_URL = "/privacy";

export type RequestType = (typeof REQUEST_TYPE_OPTIONS)[number]["value"];
export type SourceType = (typeof SOURCE_TYPE_OPTIONS)[number]["value"];
export type LeadPriority = (typeof PRIORITY_OPTIONS)[number]["value"];

const HIGH_PRIORITY_REQUEST_TYPES = new Set<RequestType>([
  "business_request",
  "guided_route",
  "ar_postcard_preorder",
  "product_order",
]);

export function resolveLeadPriority(input: {
  requestType?: string | null;
  company?: string | null;
  quantity?: number | null;
  message?: string | null;
}): LeadPriority {
  if (input.company?.trim()) return "high";
  if (input.requestType && HIGH_PRIORITY_REQUEST_TYPES.has(input.requestType as RequestType)) {
    return "high";
  }
  if (typeof input.quantity === "number" && input.quantity > 0) return "high";
  const msg = input.message?.trim() ?? "";
  if (!msg || msg.length < 8) return "low";
  return "normal";
}

export function requestTypeFromLegacy(input: {
  sourceType?: string;
  serviceType?: string;
  taskType?: string;
  source?: string;
}): RequestType {
  if (input.taskType || input.sourceType === "business" || input.source === "business") {
    return "business_request";
  }
  if (input.sourceType === "ar_postcard_preorder") return "ar_postcard_preorder";
  if (input.sourceType === "ar_postcard_question") return "content_question";
  if (input.sourceType === "product_order") return "product_order";
  if (input.sourceType === "product_question") return "product_question";
  if (input.sourceType === "maker_placement") return "maker_placement";
  if (input.sourceType === "souvenir_general") return "souvenir_general";
  if (input.source === "route" || input.sourceType === "route") return "route_request";
  if (input.serviceType === "individual_tour") return "plan_visit";
  if (input.serviceType === "excursion") return "guided_route";
  if (input.serviceType === "corporate") return "business_request";
  if (input.source === "photos" || input.sourceType === "photo") {
    return "photo_submission_question";
  }
  if (input.source === "event") return "event_interest";
  if (input.source === "contacts" || input.sourceType === "contact") {
    return "general_contact";
  }
  return "general_contact";
}

export const CTA_VARIANT_COPY = {
  default: {
    title: "Спланировать визит",
    description:
      "Напишите, когда вы будете в Иркутске — подберём маршруты, экскурсии или программу под ваши даты.",
    primaryCtaLabel: "Спланировать визит",
    defaultRequestType: "plan_visit" as RequestType,
  },
  route: {
    title: "Пройти с Алёной",
    description:
      "Маршруты можно пройти самостоятельно или адаптировать под прогулку с автором навигатора.",
    primaryCtaLabel: "Пройти с Алёной",
    defaultRequestType: "guided_route" as RequestType,
  },
  route_detail: {
    title: "Хотите пройти этот маршрут с Алёной?",
    description:
      "Напишите, когда вы будете в Иркутске и что вам интересно — маршрут можно пройти самостоятельно или адаптировать под прогулку с Алёной.",
    primaryCtaLabel: "Обсудить маршрут",
    defaultRequestType: "guided_route" as RequestType,
  },
  business: {
    title: "Есть задача для гостей, команды или проекта?",
    description:
      "Опишите, что нужно: программа по Иркутску, сопровождение турпроекта или обучение персонала.",
    primaryCtaLabel: "Обсудить задачу",
    defaultRequestType: "business_request" as RequestType,
  },
  souvenir: {
    title: "Хотите уточнить наличие?",
    description:
      "Напишите по товару — уточним наличие, предзаказ или связь с мастером.",
    primaryCtaLabel: "Уточнить товар",
    defaultRequestType: "product_question" as RequestType,
  },
  photo: {
    title: "Есть фото Иркутска?",
    description:
      "Можно предложить фото для архива. Перед публикацией оно пройдёт модерацию.",
    primaryCtaLabel: "Предложить фото",
    defaultRequestType: "photo_submission_question" as RequestType,
  },
  photo_detail: {
    title: "Увидеть это место",
    description:
      "Хотите пройти мимо этого места в маршруте или узнать больше об истории кадра?",
    primaryCtaLabel: "Увидеть это место",
    defaultRequestType: "content_question" as RequestType,
  },
  ar_postcard: {
    title: "Предзаказать открытку",
    description:
      "Оставьте контакт — сообщим о готовности набора или поможем с предзаказом.",
    primaryCtaLabel: "Предзаказать открытку",
    defaultRequestType: "ar_postcard_preorder" as RequestType,
  },
  material: {
    title: "Увидеть это в маршруте",
    description:
      "Расскажите, что вас заинтересовало — подскажем маршрут или формат прогулки.",
    primaryCtaLabel: "Увидеть это в маршруте",
    defaultRequestType: "content_question" as RequestType,
  },
  explore: {
    title: "Задать вопрос о городе",
    description:
      "Если хотите углубиться в тему или собрать маршрут по материалам Иркпортала — напишите.",
    primaryCtaLabel: "Задать вопрос о городе",
    defaultRequestType: "content_question" as RequestType,
  },
  maker: {
    title: "Связаться по товарам",
    description:
      "Уточним наличие, сроки изготовления или поможем с заказом у мастера.",
    primaryCtaLabel: "Связаться по товарам",
    defaultRequestType: "product_question" as RequestType,
  },
  about: {
    title: "Написать Алёне",
    description:
      "По вопросам проекта, сотрудничества, маршрутов и программ — напишите напрямую.",
    primaryCtaLabel: "Написать Алёне",
    defaultRequestType: "general_contact" as RequestType,
  },
  contact: {
    title: "Отправить сообщение",
    description: "Опишите запрос — ответим в течение рабочего дня.",
    primaryCtaLabel: "Отправить сообщение",
    defaultRequestType: "general_contact" as RequestType,
  },
  compact: {
    title: "Связаться",
    description: "Напишите — ответим по указанному контакту.",
    primaryCtaLabel: "Написать",
    defaultRequestType: "general_contact" as RequestType,
  },
} as const;

export type CtaVariant = keyof typeof CTA_VARIANT_COPY;
