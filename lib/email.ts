import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site-url";

let resend: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

const FROM = process.env.EMAIL_FROM || "noreply@polezno.irkutsk.ru";
const SITE_URL = getSiteUrl();

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

  const serviceLabel =
    serviceType === "corporate"
      ? "корпоративной программы"
      : serviceType === "excursion"
      ? "экскурсии"
      : "путешествия";

  await client.emails.send({
    from: `Полезно про Иркутск <${FROM}>`,
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
                Полезно про Иркутск
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 16px;font-size:28px;font-weight:300;color:#1C1C1E;line-height:1.3;">
                ${name}, как прошло?
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
                Это письмо отправлено после вашей программы с «Полезно про Иркутск».
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

export async function sendLeadNotification({
  name,
  email,
  serviceType,
  message,
}: {
  name: string;
  email: string;
  serviceType?: string;
  message?: string;
}) {
  const client = getResend();
  if (!client) return;

  const adminEmail = process.env.EMAIL_TO || "info@polezno.irkutsk.ru";

  await client.emails.send({
    from: `CRM Полезно про Иркутск <${FROM}>`,
    to: adminEmail,
    subject: `Новая заявка от ${name}`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9f9f7;">
  <h2 style="margin:0 0 16px;font-size:20px;font-weight:400;color:#1C1C1E;">Новая заявка</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;color:#6B6B6B;font-size:13px;width:120px;">Имя</td><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;font-size:14px;color:#1C1C1E;">${name}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;color:#6B6B6B;font-size:13px;">Email</td><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;font-size:14px;color:#1C1C1E;"><a href="mailto:${email}">${email}</a></td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;color:#6B6B6B;font-size:13px;">Тип</td><td style="padding:8px 0;border-bottom:1px solid #e8e6e3;font-size:14px;color:#1C1C1E;">${serviceType || "—"}</td></tr>
    ${message ? `<tr><td style="padding:8px 0;color:#6B6B6B;font-size:13px;vertical-align:top;">Сообщение</td><td style="padding:8px 0;font-size:14px;color:#1C1C1E;">${message}</td></tr>` : ""}
  </table>
  <p style="margin:20px 0 0;font-size:13px;color:#9CA3AF;">Посмотреть в CMS: <a href="${SITE_URL}/admin/collections/leads">открыть</a></p>
</div>`,
  });
}
