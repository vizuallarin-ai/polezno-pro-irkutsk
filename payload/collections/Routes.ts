import type { CollectionConfig } from "payload";
import {
  adminCrud,
  adminPanelAccess,
  publishedOrStaff,
} from "../access";
import { revalidateAfterChange } from "../hooks/revalidate";
import { syncRouteGeometryBeforeChange } from "../hooks/sync-route-geometry";
import {
  CONTENT_STATUS_OPTIONS,
  ROUTE_ACCESS_OPTIONS,
  ROUTE_CATEGORY_OPTIONS,
  ROUTE_DIFFICULTY_OPTIONS,
  ROUTE_FORMAT_OPTIONS,
} from "../constants";

const routePointFields = [
  {
    name: "title",
    type: "text" as const,
    label: "Название точки",
    required: true,
  },
  {
    name: "lat",
    type: "number" as const,
    label: "Широта (lat)",
    required: true,
    admin: {
      description: "Например: 52.2890. Можно скопировать из Яндекс.Карт или Google Maps.",
    },
  },
  {
    name: "lng",
    type: "number" as const,
    label: "Долгота (lng)",
    required: true,
    admin: {
      description: "Например: 104.2800. Порядок: lat, lng.",
    },
  },
  {
    name: "description",
    type: "textarea" as const,
    label: "Описание",
  },
  {
    name: "whatToNotice",
    type: "textarea" as const,
    label: "На что обратить внимание",
  },
  {
    name: "timeOnSite",
    type: "text" as const,
    label: "Время на точке",
    admin: { description: "Например: 15 мин" },
  },
  {
    name: "image",
    type: "upload" as const,
    relationTo: "media" as const,
    label: "Фото",
  },
  {
    name: "order",
    type: "number" as const,
    label: "Порядок",
    defaultValue: 0,
    admin: { description: "Меньшее число — раньше в маршруте." },
  },
  {
    name: "published",
    type: "checkbox" as const,
    label: "Показывать на сайте",
    defaultValue: true,
  },
];

export const Routes: CollectionConfig = {
  slug: "routes",
  labels: {
    singular: "Маршрут",
    plural: "Маршруты",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "format", "type", "status", "updatedAt"],
    description: "Пешие и авторские маршруты для карты и страниц /map/[slug].",
  },
  access: {
    admin: adminPanelAccess,
    read: publishedOrStaff("status"),
    create: adminCrud,
    update: adminCrud,
    delete: adminCrud,
  },
  hooks: {
    beforeChange: [syncRouteGeometryBeforeChange],
    afterChange: [revalidateAfterChange],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Название маршрута",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: "URL-slug",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      label: "Статус",
      required: true,
      defaultValue: "draft",
      options: [...CONTENT_STATUS_OPTIONS],
      admin: { position: "sidebar" },
    },
    {
      name: "category",
      type: "select",
      label: "Категория",
      required: true,
      options: [...ROUTE_CATEGORY_OPTIONS],
    },
    {
      name: "format",
      type: "select",
      label: "Формат",
      defaultValue: "walking",
      options: [...ROUTE_FORMAT_OPTIONS],
    },
    {
      name: "type",
      type: "select",
      label: "Тип доступа",
      required: true,
      options: [...ROUTE_ACCESS_OPTIONS],
      defaultValue: "free",
    },
    {
      name: "isPaid",
      type: "checkbox",
      label: "Платный маршрут",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Синхронизируется с типом доступа.",
      },
    },
    {
      name: "price",
      type: "number",
      label: "Цена (₽)",
      admin: { condition: (data) => data?.type === "paid" },
    },
    {
      name: "description",
      type: "textarea",
      label: "Краткое описание",
      required: true,
    },
    {
      name: "fullDescription",
      type: "textarea",
      label: "Полное описание",
    },
    {
      name: "duration",
      type: "number",
      label: "Продолжительность (мин)",
    },
    {
      name: "distance",
      type: "number",
      label: "Дистанция (км)",
    },
    {
      name: "difficulty",
      type: "select",
      label: "Сложность",
      defaultValue: "medium",
      options: [...ROUTE_DIFFICULTY_OPTIONS],
    },
    {
      type: "collapsible",
      label: "Формат прохождения",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "isSelfGuided",
          type: "checkbox",
          label: "Можно пройти самостоятельно",
          defaultValue: true,
        },
        {
          name: "isGuidedAvailable",
          type: "checkbox",
          label: "Доступно с гидом",
          defaultValue: true,
        },
        {
          name: "isCorporateAvailable",
          type: "checkbox",
          label: "Подходит для корпоратива",
          defaultValue: false,
        },
        {
          name: "experienceType",
          type: "select",
          label: "Тип опыта (для фильтров)",
          options: [
            { label: "— не задан —", value: "" },
            { label: "Пеший", value: "walking" },
            { label: "Гастро", value: "gastro" },
            { label: "Авторский", value: "author" },
            { label: "Байкал рядом", value: "baikal" },
            { label: "Корпоратив", value: "corporate" },
            { label: "Первое знакомство", value: "first-visit" },
          ],
        },
        {
          name: "priceLabel",
          type: "text",
          label: "Подпись цены",
          admin: {
            description: "Например: «Бесплатно» или «от 490 ₽». Если пусто — выводится автоматически.",
          },
        },
        {
          name: "bookingCta",
          type: "text",
          label: "Текст кнопки записи",
          admin: { description: "Например: «Пройти с гидом»" },
        },
        {
          name: "bookingDescription",
          type: "textarea",
          label: "Описание для записи",
        },
      ],
    },
    {
      name: "pointsCount",
      type: "number",
      label: "Количество точек",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Вычисляется автоматически из опубликованных точек.",
      },
    },
    {
      name: "tags",
      type: "array",
      label: "Теги",
      fields: [{ name: "tag", type: "text", label: "Тег" }],
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Обложка (загрузка)",
    },
    {
      name: "coverUrl",
      type: "text",
      label: "Обложка (URL)",
      admin: {
        description: "Альтернатива загрузке — прямая ссылка на изображение.",
      },
    },
    {
      name: "routePoints",
      type: "array",
      label: "Точки маршрута",
      admin: {
        initCollapsed: false,
        description: "Перетаскивайте строки для изменения порядка. Заполните lat/lng для карты.",
      },
      fields: routePointFields,
    },
    {
      type: "collapsible",
      label: "Геометрия маршрута",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "routeGeometryPanel",
          type: "ui",
          admin: {
            components: {
              Field: "./payload/components/RouteGeometryPanel#RouteGeometryPanel",
            },
          },
        },
        {
          name: "routeGeometry",
          type: "group",
          label: "Данные геометрии",
          admin: {
            description:
              "Активная линия для сайта выбирается по источнику: ручная → API → fallback.",
          },
          fields: [
            {
              name: "activeSource",
              type: "select",
              label: "Активный источник",
              defaultValue: "fallback",
              options: [
                { label: "Ручная линия", value: "manual" },
                { label: "Яндекс API", value: "yandex_api" },
                { label: "По точкам (прямые)", value: "fallback" },
                { label: "Только точки", value: "none" },
              ],
            },
            {
              name: "status",
              type: "select",
              label: "Статус линии",
              defaultValue: "active",
              options: [
                { label: "Черновик", value: "draft" },
                { label: "Активна", value: "active" },
                { label: "Требует проверки", value: "needs_review" },
                { label: "Ошибка", value: "error" },
                { label: "В архиве", value: "archived" },
              ],
            },
            {
              name: "showRouteLine",
              type: "checkbox",
              label: "Показывать линию на карте",
              defaultValue: true,
            },
            {
              name: "routeLineColor",
              type: "text",
              label: "Цвет линии (hex)",
              admin: { description: "Необязательно. Например: #0B3D5C" },
            },
            {
              name: "manualGeometry",
              type: "json",
              label: "Ручная линия (GeoJSON LineString)",
            },
            {
              name: "apiGeometry",
              type: "json",
              label: "Линия из API (GeoJSON LineString)",
              admin: { readOnly: true },
            },
            {
              name: "fallbackGeometry",
              type: "json",
              label: "Fallback по точкам",
              admin: { readOnly: true },
            },
            {
              name: "distanceMeters",
              type: "number",
              label: "Дистанция (м)",
              admin: { readOnly: true },
            },
            {
              name: "durationMinutesMin",
              type: "number",
              label: "Время мин (мин)",
              admin: { readOnly: true },
            },
            {
              name: "durationMinutesMax",
              type: "number",
              label: "Время макс (мин)",
              admin: { readOnly: true },
            },
            {
              name: "provider",
              type: "text",
              label: "Провайдер",
              admin: { readOnly: true },
            },
            {
              name: "providerRequestHash",
              type: "text",
              label: "Хэш запроса",
              admin: { readOnly: true },
            },
            {
              name: "providerRawResponse",
              type: "json",
              label: "Ответ API (служебное)",
              admin: {
                readOnly: true,
                condition: () => false,
              },
            },
            {
              name: "pointsFingerprint",
              type: "text",
              label: "Отпечаток точек",
              admin: { readOnly: true },
            },
            {
              name: "geometryUpdatedAt",
              type: "date",
              label: "Геометрия обновлена",
              admin: { readOnly: true },
            },
            {
              name: "geometryReviewedAt",
              type: "date",
              label: "Проверено",
              admin: { readOnly: true },
            },
            {
              name: "lastError",
              type: "textarea",
              label: "Последняя ошибка",
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
    {
      name: "geoLine",
      type: "json",
      label: "Активная линия для сайта (GeoJSON)",
      admin: {
        readOnly: true,
        description: "Синхронизируется автоматически из активного источника геометрии.",
      },
    },
    {
      name: "audioGuide",
      type: "upload",
      relationTo: "media",
      label: "Аудиогид (MP3)",
    },
    {
      name: "pdfGuide",
      type: "upload",
      relationTo: "media",
      label: "PDF-гид",
    },
    {
      name: "schedule",
      type: "array",
      label: "Расписание экскурсий",
      fields: [
        { name: "date", type: "date", label: "Дата", required: true },
        { name: "time", type: "text", label: "Время (11:00)" },
        { name: "spotsTotal", type: "number", label: "Всего мест", defaultValue: 10 },
        { name: "spotsLeft", type: "number", label: "Осталось мест" },
        { name: "isOpen", type: "checkbox", label: "Запись открыта", defaultValue: true },
      ],
    },
    {
      name: "guide",
      type: "relationship",
      relationTo: "guides",
      label: "Гид-автор",
      admin: { position: "sidebar" },
    },
    {
      name: "stripeProductId",
      type: "text",
      label: "Stripe Product ID",
      admin: {
        position: "sidebar",
        condition: (data) => data?.type === "paid",
      },
    },
    {
      name: "qrCodeUrl",
      type: "text",
      label: "QR-код (URL)",
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
