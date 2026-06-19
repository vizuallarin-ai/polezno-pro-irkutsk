const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const MIN_FILL_TIME_MS = 3_000;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_FIELD_LENGTH = 500;

const ipHits = new Map<string, { count: number; resetAt: number }>();

export const HONEYPOT_FIELD = "_hp";
export const FORM_STARTED_FIELD = "_formStartedAt";

export function sanitizeLeadText(value: unknown, maxLen = MAX_FIELD_LENGTH): string | undefined {
  if (typeof value !== "string") return undefined;
  const stripped = value
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLen);
  return stripped || undefined;
}

export function checkHoneypot(body: Record<string, unknown>): boolean {
  const hp = body[HONEYPOT_FIELD];
  return typeof hp === "string" && hp.length > 0;
}

export function checkMinFillTime(body: Record<string, unknown>): boolean {
  const started = body[FORM_STARTED_FIELD];
  if (typeof started !== "number" || !Number.isFinite(started)) return true;
  return Date.now() - started >= MIN_FILL_TIME_MS;
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip") || "unknown";
}

export { MAX_MESSAGE_LENGTH };
