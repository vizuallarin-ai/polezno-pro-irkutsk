/**
 * Canonical Lead CRM domain (ADMIN.D).
 * Single source of truth for statuses, terminal rules, and follow-up classification.
 * No React / Payload UI imports here.
 */

/** Owner-facing timezone for “today” / calendar-day comparisons. */
export const OWNER_TIMEZONE = "Asia/Irkutsk";

/** Sample cap for dashboard CRM classification (solo-owner volume). */
export const CRM_ACTIVE_SAMPLE_LIMIT = 150;

export const LEAD_STATUS_VALUES = [
  "new",
  "in_progress",
  "replied",
  "booked",
  "closed",
  "declined",
  "spam",
] as const;

export type LeadCrmStatus = (typeof LEAD_STATUS_VALUES)[number];

export type LeadStatusDefinition = {
  value: LeadCrmStatus;
  label: string;
  meaning: string;
  terminal: boolean;
  /** Owner should normally set nextContactAt while in this status. */
  followUpExpected: boolean;
};

/**
 * Machine values kept for compatibility with existing production leads.
 * New commercial values: `booked`, `declined` (do not reuse `closed` for refusal —
 * `closed` triggers the review-request email).
 */
export const LEAD_STATUS_DEFINITIONS: readonly LeadStatusDefinition[] = [
  {
    value: "new",
    label: "Новая",
    meaning: "Заявка получена, владелец ещё её не обработал.",
    terminal: false,
    followUpExpected: true,
  },
  {
    value: "in_progress",
    label: "Нужно связаться",
    meaning: "Владелец увидел заявку; следующий шаг — контакт с клиентом.",
    terminal: false,
    followUpExpected: true,
  },
  {
    value: "replied",
    label: "Обсуждение",
    meaning: "Контакт состоялся, идёт согласование программы/даты/условий.",
    terminal: false,
    followUpExpected: true,
  },
  {
    value: "booked",
    label: "Забронировано",
    meaning:
      "Клиент подтвердил экскурсию/услугу. Не terminal: до услуги ещё может понадобиться контакт.",
    terminal: false,
    followUpExpected: true,
  },
  {
    value: "closed",
    label: "Завершено",
    meaning: "Услуга состоялась / сделка завершена.",
    terminal: true,
    followUpExpected: false,
  },
  {
    value: "declined",
    label: "Отказ",
    meaning: "Заявка закрыта без продажи.",
    terminal: true,
    followUpExpected: false,
  },
  {
    value: "spam",
    label: "Спам",
    meaning: "Системный/антиспам bucket — не коммерческий отказ.",
    terminal: true,
    followUpExpected: false,
  },
] as const;

export const LEAD_STATUS_OPTIONS = LEAD_STATUS_DEFINITIONS.map((d) => ({
  label: d.label,
  value: d.value,
}));

export const LEAD_STATUS_LABELS: Record<LeadCrmStatus, string> =
  Object.fromEntries(
    LEAD_STATUS_DEFINITIONS.map((d) => [d.value, d.label])
  ) as Record<LeadCrmStatus, string>;

export const TERMINAL_LEAD_STATUSES: readonly LeadCrmStatus[] =
  LEAD_STATUS_DEFINITIONS.filter((d) => d.terminal).map((d) => d.value);

export const ACTIVE_LEAD_STATUSES: readonly LeadCrmStatus[] =
  LEAD_STATUS_DEFINITIONS.filter((d) => !d.terminal).map((d) => d.value);

/** Statuses where missing nextContactAt is a useful dashboard signal (not «Новая»). */
export const UNSCHEDULED_SIGNAL_STATUSES: readonly LeadCrmStatus[] = [
  "in_progress",
  "replied",
  "booked",
] as const;

export const CLOSED_REASON_OPTIONS = [
  { label: "Не подошла цена", value: "price" },
  { label: "Выбрал другого", value: "chose_other" },
  { label: "Изменились планы", value: "plans_changed" },
  { label: "Не удалось связаться", value: "unreachable" },
  { label: "Другое", value: "other" },
] as const;

export type ClosedReason = (typeof CLOSED_REASON_OPTIONS)[number]["value"];

export const CLOSED_REASON_VALUES = CLOSED_REASON_OPTIONS.map((o) => o.value);

/** Fields that public form / API must never set. */
export const CRM_INTERNAL_FIELD_NAMES = [
  "status",
  "adminComment",
  "nextContactAt",
  "lastContactAt",
  "closedReason",
  "closedReasonNote",
  "priority",
] as const;

export type CrmInternalFieldName = (typeof CRM_INTERNAL_FIELD_NAMES)[number];

export type FollowUpBucket =
  | "overdue"
  | "due_today"
  | "upcoming"
  | "unscheduled"
  | "none";

export type LeadFollowUpInput = {
  status?: string | null;
  nextContactAt?: string | Date | null;
};

export function isLeadCrmStatus(value: unknown): value is LeadCrmStatus {
  return (
    typeof value === "string" &&
    (LEAD_STATUS_VALUES as readonly string[]).includes(value)
  );
}

export function isTerminalLeadStatus(status: unknown): boolean {
  return (
    typeof status === "string" &&
    (TERMINAL_LEAD_STATUSES as readonly string[]).includes(status)
  );
}

export function isActiveLeadStatus(status: unknown): boolean {
  return (
    typeof status === "string" &&
    (ACTIVE_LEAD_STATUSES as readonly string[]).includes(status)
  );
}

export function isValidClosedReason(value: unknown): value is ClosedReason {
  return (
    typeof value === "string" &&
    (CLOSED_REASON_VALUES as readonly string[]).includes(value)
  );
}

/** YYYY-MM-DD in the given IANA timezone (calendar day, not UTC day). */
export function calendarDateInTimeZone(
  date: Date,
  timeZone: string = OWNER_TIMEZONE
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function parseLeadDate(
  value: string | Date | null | undefined
): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Classify an active lead for follow-up work.
 * Terminal leads always return `none` (never overdue).
 */
export function classifyLeadFollowUp(
  input: LeadFollowUpInput,
  now: Date = new Date(),
  timeZone: string = OWNER_TIMEZONE
): FollowUpBucket {
  if (!isActiveLeadStatus(input.status)) return "none";

  const next = parseLeadDate(input.nextContactAt);
  if (!next) {
    if (
      typeof input.status === "string" &&
      (UNSCHEDULED_SIGNAL_STATUSES as readonly string[]).includes(input.status)
    ) {
      return "unscheduled";
    }
    return "none";
  }

  if (next.getTime() < now.getTime()) return "overdue";

  const nextDay = calendarDateInTimeZone(next, timeZone);
  const today = calendarDateInTimeZone(now, timeZone);
  if (nextDay === today) return "due_today";
  return "upcoming";
}

export type CrmLeadSummary = {
  newCount: number;
  overdueCount: number;
  dueTodayCount: number;
  unscheduledCount: number;
  recentNew: Array<{
    id: string | number;
    name: string;
    createdAt: string | null;
    requestType: string | null;
  }>;
  /** True when active sample may be incomplete (totalDocs > limit). */
  sampleCapped: boolean;
};

export type CrmLeadDoc = {
  id: string | number;
  name?: unknown;
  status?: unknown;
  nextContactAt?: unknown;
  createdAt?: unknown;
  requestType?: unknown;
};

/**
 * Aggregate CRM counters from an active-lead sample (in-memory).
 * Prefer one find over N status/date counts on the dashboard.
 */
export function summarizeCrmLeads(
  docs: CrmLeadDoc[],
  opts?: {
    now?: Date;
    timeZone?: string;
    recentLimit?: number;
    totalDocs?: number;
    sampleLimit?: number;
  }
): CrmLeadSummary {
  const now = opts?.now ?? new Date();
  const timeZone = opts?.timeZone ?? OWNER_TIMEZONE;
  const recentLimit = opts?.recentLimit ?? 5;
  const sampleLimit = opts?.sampleLimit ?? CRM_ACTIVE_SAMPLE_LIMIT;
  const totalDocs = opts?.totalDocs ?? docs.length;

  let newCount = 0;
  let overdueCount = 0;
  let dueTodayCount = 0;
  let unscheduledCount = 0;
  const recentNew: CrmLeadSummary["recentNew"] = [];

  for (const doc of docs) {
    const status = typeof doc.status === "string" ? doc.status : null;
    if (status === "new") {
      newCount += 1;
      if (recentNew.length < recentLimit) {
        recentNew.push({
          id: doc.id,
          name:
            typeof doc.name === "string" && doc.name.trim()
              ? doc.name.trim()
              : "Без имени",
          createdAt:
            typeof doc.createdAt === "string" ? doc.createdAt : null,
          requestType:
            typeof doc.requestType === "string" ? doc.requestType : null,
        });
      }
    }

    const bucket = classifyLeadFollowUp(
      {
        status,
        nextContactAt:
          typeof doc.nextContactAt === "string" ||
          doc.nextContactAt instanceof Date
            ? doc.nextContactAt
            : null,
      },
      now,
      timeZone
    );

    if (bucket === "overdue") overdueCount += 1;
    else if (bucket === "due_today") dueTodayCount += 1;
    else if (bucket === "unscheduled") unscheduledCount += 1;
  }

  return {
    newCount,
    overdueCount,
    dueTodayCount,
    unscheduledCount,
    recentNew,
    sampleCapped: totalDocs > sampleLimit,
  };
}

/** Payload `where` for active (non-terminal) leads. */
export function activeLeadsWhere(): {
  status: { in: LeadCrmStatus[] };
} {
  return { status: { in: [...ACTIVE_LEAD_STATUSES] } };
}

export function newLeadsWhere(): { status: { equals: "new" } } {
  return { status: { equals: "new" } };
}

/**
 * Strip CRM-only keys from an untrusted public body (defence in depth).
 * Does not mutate the input object.
 */
export function omitCrmInternalFields<T extends Record<string, unknown>>(
  body: T
): Omit<T, CrmInternalFieldName> {
  const out = { ...body };
  for (const key of CRM_INTERNAL_FIELD_NAMES) {
    delete out[key];
  }
  return out as Omit<T, CrmInternalFieldName>;
}

export function publicBodyInjectsCrmFields(
  body: Record<string, unknown>
): CrmInternalFieldName[] {
  return CRM_INTERNAL_FIELD_NAMES.filter((key) =>
    Object.prototype.hasOwnProperty.call(body, key)
  );
}
