/**
 * Privacy-minimized lead notification.
 * External email transport receives only internal identifiers — never lead PII.
 */

import { Resend } from "resend";
import { BRAND } from "@/lib/brand-constants";
import { REQUEST_TYPE_OPTIONS, SOURCE_TYPE_OPTIONS } from "@/lib/leads-constants";
import { LEAD_SOURCE_OPTIONS } from "@/lib/content-labels";
import { getSiteUrl } from "@/lib/site-url";

export const LEAD_NOTIFICATION_ALLOWED_KEYS = [
  "leadId",
  "createdAt",
  "sourceType",
  "adminUrl",
  "correlationId",
] as const;

export const LEAD_NOTIFICATION_FORBIDDEN_KEYS = [
  "name",
  "email",
  "phone",
  "contact",
  "telegram",
  "whatsapp",
  "max",
  "message",
  "comment",
  "comments",
  "fio",
  "company",
  "ip",
  "useragent",
  "user-agent",
  "userAgent",
  "body",
  "requestbody",
  "pageurl",
] as const;

export type LeadNotificationPayload = {
  leadId: string;
  createdAt: string;
  sourceType: string;
  adminUrl: string;
  correlationId?: string;
};

export type LeadNotifyInput = {
  leadId: string;
  createdAt?: Date | string;
  sourceType?: string | null;
  correlationId?: string;
  trustedRecipient?: string | null;
};

export type LeadEmailMessage = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type LeadEmailTransport = {
  send: (message: LeadEmailMessage) => Promise<void>;
};

export type LeadNotifyResult =
  | { status: "sent" }
  | { status: "skipped"; reason: "missing_config" | "disabled" }
  | { status: "failed"; errorName: string };

export type LeadNotifyEnv = Record<string, string | undefined>;

export type LeadNotifyDeps = {
  env?: LeadNotifyEnv;
  transport?: LeadEmailTransport | null;
  now?: Date;
  siteUrl?: string;
  enabled?: boolean;
};

const SOURCE_ALLOWLIST = new Set<string>([
  ...SOURCE_TYPE_OPTIONS.map((item) => item.value),
  ...REQUEST_TYPE_OPTIONS.map((item) => item.value),
  ...LEAD_SOURCE_OPTIONS.map((item) => item.value),
  "general",
  "general_contact",
  "unknown",
]);

const LEAD_ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let resend: Resend | null = null;

function getEnv(
  env: LeadNotifyEnv | undefined,
  key: string
): string | undefined {
  const value = (env ?? process.env)[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function sanitizeLeadNotificationId(leadId: string): string | null {
  const trimmed = leadId.trim();
  return LEAD_ID_PATTERN.test(trimmed) ? trimmed : null;
}

export function sanitizeLeadNotificationSourceType(
  sourceType?: string | null
): string {
  const value = (sourceType ?? "").trim();
  if (value && SOURCE_ALLOWLIST.has(value)) return value;
  return "unknown";
}

export function isTrustedNotificationEmail(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!EMAIL_PATTERN.test(trimmed)) return false;
  if (trimmed.length > 254) return false;
  return true;
}

export function buildLeadAdminUrl(
  leadId: string,
  siteUrl = getSiteUrl()
): string {
  const safeId = sanitizeLeadNotificationId(leadId);
  const base = siteUrl.replace(/\/$/, "");
  if (!safeId) return `${base}/admin/collections/leads`;
  return `${base}/admin/collections/leads/${encodeURIComponent(safeId)}`;
}

export function buildLeadNotificationPayload(
  input: LeadNotifyInput,
  deps: Pick<LeadNotifyDeps, "now" | "siteUrl"> = {}
): LeadNotificationPayload {
  const leadId = sanitizeLeadNotificationId(input.leadId) ?? "unknown";
  const createdAt =
    input.createdAt instanceof Date
      ? input.createdAt.toISOString()
      : typeof input.createdAt === "string" && input.createdAt.trim()
        ? input.createdAt.trim()
        : (deps.now ?? new Date()).toISOString();

  const payload: LeadNotificationPayload = {
    leadId,
    createdAt,
    sourceType: sanitizeLeadNotificationSourceType(input.sourceType),
    adminUrl: buildLeadAdminUrl(leadId, deps.siteUrl ?? getSiteUrl()),
  };

  if (input.correlationId && LEAD_ID_PATTERN.test(input.correlationId.trim())) {
    payload.correlationId = input.correlationId.trim();
  }

  return payload;
}

export function leadNotificationPayloadKeys(
  payload: LeadNotificationPayload
): string[] {
  return Object.keys(payload);
}

export function payloadContainsForbiddenPiiKeys(
  payload: Record<string, unknown>
): string[] {
  const forbidden = new Set(
    LEAD_NOTIFICATION_FORBIDDEN_KEYS.map((key) => key.toLowerCase())
  );
  return Object.keys(payload).filter((key) => forbidden.has(key.toLowerCase()));
}

export function buildLeadNotificationEmail(
  payload: LeadNotificationPayload
): Omit<LeadEmailMessage, "from" | "to"> {
  const subject = `Новая заявка ${payload.leadId}`;
  const lines = [
    "Появилась новая заявка.",
    `Внутренний номер: ${payload.leadId}`,
    `Время сервера: ${payload.createdAt}`,
    `Источник: ${payload.sourceType}`,
    `Открыть в админке: ${payload.adminUrl}`,
  ];
  if (payload.correlationId) {
    lines.push(`Correlation: ${payload.correlationId}`);
  }
  lines.push("Содержание заявки в письмо не включено.");

  const text = lines.join("\n");
  const html = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9f9f7;">
  <h2 style="margin:0 0 16px;font-size:20px;font-weight:400;color:#1C1C1E;">Новая заявка</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;color:#6B6B6B;font-size:13px;width:160px;">Номер</td><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;font-size:14px;color:#1C1C1E;">${payload.leadId}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;color:#6B6B6B;font-size:13px;">Время</td><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;font-size:14px;color:#1C1C1E;">${payload.createdAt}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;color:#6B6B6B;font-size:13px;">Источник</td><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;font-size:14px;color:#1C1C1E;">${payload.sourceType}</td></tr>
    ${payload.correlationId ? `<tr><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;color:#6B6B6B;font-size:13px;">Correlation</td><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;font-size:14px;color:#1C1C1E;">${payload.correlationId}</td></tr>` : ""}
  </table>
  <p style="margin:20px 0 0;font-size:13px;color:#9CA3AF;">Открыть в админке: <a href="${payload.adminUrl}">перейти к заявке</a></p>
</div>`;

  return { subject, html, text };
}

export function resolveLeadNotificationRecipient(
  input: LeadNotifyInput,
  env?: LeadNotifyEnv
): string | null {
  const fromEnv = getEnv(env, "EMAIL_TO");
  if (isTrustedNotificationEmail(fromEnv)) return fromEnv as string;
  if (isTrustedNotificationEmail(input.trustedRecipient)) {
    return input.trustedRecipient!.trim();
  }
  return null;
}

function getDefaultResendTransport(env?: LeadNotifyEnv): LeadEmailTransport | null {
  const apiKey = getEnv(env, "RESEND_API_KEY");
  if (!apiKey) return null;
  if (!resend) resend = new Resend(apiKey);
  const client = resend;
  return {
    async send(message) {
      await client.emails.send({
        from: message.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
    },
  };
}

function logLeadNotify(result: LeadNotifyResult, leadId: string): void {
  const safeLeadId = sanitizeLeadNotificationId(leadId) ?? "unknown";
  if (result.status === "failed") {
    console.error(
      JSON.stringify({
        phase: "lead_notify",
        outcome: "failed",
        errorName: result.errorName.slice(0, 80),
        leadId: safeLeadId,
      })
    );
    return;
  }
  console.info(
    JSON.stringify({
      phase: "lead_notify",
      outcome: result.status,
      reason: result.status === "skipped" ? result.reason : undefined,
      leadId: safeLeadId,
    })
  );
}

export async function sendLeadNotification(
  input: LeadNotifyInput,
  deps: LeadNotifyDeps = {}
): Promise<LeadNotifyResult> {
  try {
    if (deps.enabled === false) {
      const skipped = { status: "skipped", reason: "disabled" } as const;
      logLeadNotify(skipped, input.leadId);
      return skipped;
    }

    const env = deps.env ?? process.env;
    const recipient = resolveLeadNotificationRecipient(input, env);
    const fromAddress = getEnv(env, "EMAIL_FROM");
    const transport =
      deps.transport === undefined ? getDefaultResendTransport(env) : deps.transport;

    if (!recipient || !fromAddress || !transport) {
      const skipped = { status: "skipped", reason: "missing_config" } as const;
      logLeadNotify(skipped, input.leadId);
      return skipped;
    }

    const payload = buildLeadNotificationPayload(input, {
      now: deps.now,
      siteUrl: deps.siteUrl ?? getSiteUrl(),
    });
    const body = buildLeadNotificationEmail(payload);

    await transport.send({
      from: `${BRAND.projectName} <${fromAddress}>`,
      to: recipient,
      subject: body.subject,
      html: body.html,
      text: body.text,
    });

    const sent = { status: "sent" } as const;
    logLeadNotify(sent, payload.leadId);
    return sent;
  } catch (error) {
    const failed = {
      status: "failed" as const,
      errorName: error instanceof Error ? error.name.slice(0, 80) : "Error",
    };
    logLeadNotify(failed, input.leadId);
    return failed;
  }
}

/** Notify after a successful save. Never throws — email failure must not undo the lead. */
export async function notifySavedLead(
  input: LeadNotifyInput,
  deps: LeadNotifyDeps = {}
): Promise<LeadNotifyResult> {
  try {
    return await sendLeadNotification(input, deps);
  } catch (error) {
    const failed = {
      status: "failed" as const,
      errorName: error instanceof Error ? error.name.slice(0, 80) : "Error",
    };
    logLeadNotify(failed, input.leadId);
    return failed;
  }
}
