import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site-url";
import { BRAND } from "@/lib/brand-constants";

let resend: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

/** Escape untrusted strings before interpolating into HTML email bodies. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const FROM = process.env.EMAIL_FROM || "noreply@irkportal.ru";
const SITE_URL = getSiteUrl();
const BRAND_NAME = BRAND.projectName;

export async function sendReviewRequest({
  to,
  name,
  serviceType,
}: {
  to: string;
  name: string;
  serviceType?: string;
}) {
  const client = getResend();
  if (!client) {
    console.warn("Resend not configured — RESEND_API_KEY missing");
    return;
  }

  const safeName = escapeHtml(name);
  const serviceLabel =
    serviceType === "corporate"
      ? "корпоративной программы"
      : serviceType === "excursion"
        ? "экскурсии"
        : "путешествия";

  await client.emails.send({
    from: `${BRAND_NAME} <${FROM}>`,
    to,
    subject: "Поделитесь впечатлениями — это поможет другим путешественникам",
    html: `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Оставьте отзыв</title>
</head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F7;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;max-width:560px;width:100%;">
          <tr>
            <td style="padding:40px 40px 24px;border-bottom:1px solid #E8E6E3;">
              <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9CA3AF;">
                ${escapeHtml(BRAND_NAME)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;color:#1C1C1E;line-height:1.3;">
                ${safeName}, как прошло?
              </h1>
              <p style="margin:0 0 20px;font-size:15px;color:#6B6B6B;line-height:1.6;">
                Рады, что вы воспользовались нашей ${serviceLabel}.
                Ваш отзыв поможет другим путешественникам принять решение —
                и нам стать лучше.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#6B6B6B;line-height:1.6;">
                Это займёт не более 2 минут.
              </p>
              <a
                href="${SITE_URL}/contact?review=1&name=${encodeURIComponent(name)}"
                style="display:inline-block;background:#1C1C1E;color:#FAF9F7;text-decoration:none;font-size:14px;padding:14px 28px;letter-spacing:1px;"
              >
                Оставить отзыв
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 40px;border-top:1px solid #E8E6E3;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
                Это письмо отправлено после вашей программы с «${escapeHtml(BRAND_NAME)}».
                Если вы получили его по ошибке — просто проигнорируйте.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

/** Gate C.1: lead alerts must not include PII — see lib/lead-notification.ts */
export {
  sendLeadNotification,
  notifySavedLead,
} from "@/lib/lead-notification";
