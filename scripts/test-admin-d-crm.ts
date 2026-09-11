/**
 * ADMIN.D — Lead CRM unit checks (no DB / no network).
 * Run: npm run test:admin-d
 */
import assert from "node:assert/strict";
import {
  ACTIVE_LEAD_STATUSES,
  CRM_INTERNAL_FIELD_NAMES,
  LEAD_STATUS_DEFINITIONS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_VALUES,
  OWNER_TIMEZONE,
  TERMINAL_LEAD_STATUSES,
  calendarDateInTimeZone,
  classifyLeadFollowUp,
  isActiveLeadStatus,
  isTerminalLeadStatus,
  isValidClosedReason,
  omitCrmInternalFields,
  publicBodyInjectsCrmFields,
  summarizeCrmLeads,
} from "../lib/leads/crm";
import { buildUnifiedLeadData } from "../lib/leads-api-helpers";
import { leadsCreateAccess, leadsReadAccess } from "../payload/access";
import {
  buildAttentionItems,
  buildOwnerLaunchReadiness,
  type OwnerDashboardSnapshotInput,
} from "../lib/admin/owner-launch-readiness";
import { compactLeadSchema } from "../lib/leads-schema";

let passed = 0;

function check(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (err) {
    console.error(`FAIL ${name}`);
    throw err;
  }
}

check("status model has unique machine values and owner labels", () => {
  assert.equal(LEAD_STATUS_VALUES.length, LEAD_STATUS_DEFINITIONS.length);
  assert.equal(new Set(LEAD_STATUS_VALUES).size, LEAD_STATUS_VALUES.length);
  assert.equal(LEAD_STATUS_LABELS.new, "Новая");
  assert.equal(LEAD_STATUS_LABELS.in_progress, "Нужно связаться");
  assert.equal(LEAD_STATUS_LABELS.replied, "Обсуждение");
  assert.equal(LEAD_STATUS_LABELS.booked, "Забронировано");
  assert.equal(LEAD_STATUS_LABELS.closed, "Завершено");
  assert.equal(LEAD_STATUS_LABELS.declined, "Отказ");
  assert.equal(LEAD_STATUS_LABELS.spam, "Спам");
});

check("terminal statuses are closed, declined, spam only", () => {
  assert.deepEqual([...TERMINAL_LEAD_STATUSES].sort(), [
    "closed",
    "declined",
    "spam",
  ]);
  assert.equal(isTerminalLeadStatus("closed"), true);
  assert.equal(isTerminalLeadStatus("declined"), true);
  assert.equal(isTerminalLeadStatus("booked"), false);
  assert.equal(isActiveLeadStatus("booked"), true);
  assert.ok(ACTIVE_LEAD_STATUSES.includes("booked"));
  assert.ok(!ACTIVE_LEAD_STATUSES.includes("closed"));
});

check("closedReason enum validates", () => {
  assert.equal(isValidClosedReason("price"), true);
  assert.equal(isValidClosedReason("chose_other"), true);
  assert.equal(isValidClosedReason("hack"), false);
});

check("follow-up: overdue / today / upcoming / unscheduled / terminal never overdue", () => {
  // Fixed instant: 2026-09-11 12:00 UTC = 20:00 Irkutsk same calendar day.
  const now = new Date("2026-09-11T12:00:00.000Z");
  assert.equal(calendarDateInTimeZone(now, OWNER_TIMEZONE), "2026-09-11");

  assert.equal(
    classifyLeadFollowUp(
      { status: "in_progress", nextContactAt: "2026-09-10T10:00:00.000Z" },
      now
    ),
    "overdue"
  );

  // Later today in Irkutsk (same YMD, still in future vs now).
  assert.equal(
    classifyLeadFollowUp(
      { status: "replied", nextContactAt: "2026-09-11T14:00:00.000Z" },
      now
    ),
    "due_today"
  );

  assert.equal(
    classifyLeadFollowUp(
      { status: "booked", nextContactAt: "2026-09-20T10:00:00.000Z" },
      now
    ),
    "upcoming"
  );

  assert.equal(
    classifyLeadFollowUp({ status: "in_progress", nextContactAt: null }, now),
    "unscheduled"
  );

  // New without schedule is not an unscheduled signal (already covered by «Новая»).
  assert.equal(
    classifyLeadFollowUp({ status: "new", nextContactAt: null }, now),
    "none"
  );

  // Terminal never overdue even with past nextContactAt.
  assert.equal(
    classifyLeadFollowUp(
      { status: "closed", nextContactAt: "2020-01-01T00:00:00.000Z" },
      now
    ),
    "none"
  );
  assert.equal(
    classifyLeadFollowUp(
      { status: "declined", nextContactAt: "2020-01-01T00:00:00.000Z" },
      now
    ),
    "none"
  );
  assert.equal(
    classifyLeadFollowUp(
      { status: "spam", nextContactAt: "2020-01-01T00:00:00.000Z" },
      now
    ),
    "none"
  );
});

check("calendar-day boundary uses owner timezone not UTC date string", () => {
  // 2026-09-11 20:30 UTC = 2026-09-12 04:30 Irkutsk → owner "today" is Sep 12.
  const now = new Date("2026-09-11T20:30:00.000Z");
  assert.equal(calendarDateInTimeZone(now, OWNER_TIMEZONE), "2026-09-12");

  // nextContact at 2026-09-11 22:00 UTC is still Sep 12 Irkutsk morning — due today.
  assert.equal(
    classifyLeadFollowUp(
      { status: "replied", nextContactAt: "2026-09-11T22:00:00.000Z" },
      now
    ),
    "due_today"
  );
});

check("dashboard CRM summary counts without false overdue on terminal", () => {
  const now = new Date("2026-09-11T12:00:00.000Z");
  const summary = summarizeCrmLeads(
    [
      {
        id: 1,
        name: "A",
        status: "new",
        createdAt: "2026-09-11T01:00:00.000Z",
      },
      {
        id: 2,
        name: "B",
        status: "in_progress",
        nextContactAt: "2026-09-01T00:00:00.000Z",
      },
      {
        id: 3,
        name: "C",
        status: "closed",
        nextContactAt: "2026-09-01T00:00:00.000Z",
      },
      {
        id: 4,
        name: "D",
        status: "replied",
        nextContactAt: "2026-09-11T15:00:00.000Z",
      },
      {
        id: 5,
        name: "E",
        status: "booked",
        nextContactAt: null,
      },
    ],
    { now }
  );
  assert.equal(summary.newCount, 1);
  assert.equal(summary.overdueCount, 1);
  assert.equal(summary.dueTodayCount, 1);
  assert.equal(summary.unscheduledCount, 1);
  assert.equal(summary.recentNew[0]?.name, "A");
});

check("public schema strips unknown CRM fields", () => {
  const parsed = compactLeadSchema.safeParse({
    name: "Гость",
    contact: "+79990001122",
    status: "closed",
    adminComment: "hack",
    nextContactAt: "2026-01-01",
    lastContactAt: "2026-01-01",
    closedReason: "price",
    priority: "high",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(parsed.data, "status"),
      false
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(parsed.data, "adminComment"),
      false
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(parsed.data, "nextContactAt"),
      false
    );
  }
});

check("buildUnifiedLeadData forces status=new and ignores CRM injection", () => {
  const injected = {
    name: "Гость",
    contact: "guest@example.com",
    preferredContactMethod: "email",
    status: "closed",
    adminComment: "should not land",
    nextContactAt: "2099-01-01T00:00:00.000Z",
    lastContactAt: "2099-01-01T00:00:00.000Z",
    closedReason: "price",
    priority: "high",
  };
  assert.ok(publicBodyInjectsCrmFields(injected).length >= 5);
  const lead = buildUnifiedLeadData(
    injected as never,
    "contacts",
    "https://example.com"
  );
  assert.equal(lead.status, "new");
  assert.equal(
    Object.prototype.hasOwnProperty.call(lead, "adminComment"),
    false
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(lead, "nextContactAt"),
    false
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(lead, "closedReason"),
    false
  );
  // Priority is server-computed from content, not client "high".
  assert.notEqual(lead.priority, "high");
});

check("omitCrmInternalFields removes all CRM keys", () => {
  const body = Object.fromEntries(
    CRM_INTERNAL_FIELD_NAMES.map((k) => [k, "x"])
  ) as Record<string, unknown>;
  body.name = "ok";
  const cleaned = omitCrmInternalFields(body);
  assert.equal(cleaned.name, "ok");
  for (const key of CRM_INTERNAL_FIELD_NAMES) {
    assert.equal(Object.prototype.hasOwnProperty.call(cleaned, key), false);
  }
});

check("public access cannot read or create leads via Payload access", () => {
  const anon = { req: { user: null } } as never;
  assert.equal(leadsReadAccess(anon), false);
  assert.equal(leadsCreateAccess(anon), false);
});

check("attention includes overdue and unscheduled signals", () => {
  const snap: OwnerDashboardSnapshotInput = {
    leadsNew: 1,
    leadsOverdue: 3,
    leadsDueToday: 2,
    leadsUnscheduled: 1,
    recentNewLeads: [],
    excursions: { published: 1, drafts: 0, publishedReady: 1 },
    routes: { published: 1, drafts: 0, publishedReady: 1 },
    articles: { published: 0, drafts: 0, publishedReady: 0 },
    reviews: { published: 1, drafts: 0, publishedReady: 1 },
    photos: { total: 4, publishedReady: 4, pendingModeration: 0 },
    guides: { total: 1, publicReady: 1, hasPlaceholder: false },
    contacts: { hasPhone: true, hasEmail: true, hasTelegram: true },
    recentDrafts: [],
  };
  const readiness = buildOwnerLaunchReadiness(snap);
  const attention = buildAttentionItems(snap, readiness);
  assert.equal(attention[0]?.id, "leads-overdue");
  assert.ok(attention.some((a) => a.id === "leads-new"));
  assert.ok(attention.some((a) => a.id === "leads-due-today"));
  assert.ok(attention.some((a) => a.id === "leads-unscheduled"));
});

console.log(`\nADMIN.D checks passed: ${passed}`);
