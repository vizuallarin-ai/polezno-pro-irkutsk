/** Внешние ссылки проекта (env с fallback для dev). */
export const TELEGRAM_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "https://t.me/poleznoproirkutsk";

export const BOOSTY_URL =
  process.env.NEXT_PUBLIC_BOOSTY_URL ?? "https://boosty.to/polezno_irkutsk";

/** Яндекс Вебмастер — счётчик ИКС в футере. */
export const YANDEX_WEBMASTER_SITE =
  process.env.NEXT_PUBLIC_YANDEX_WEBMASTER_SITE ?? "irkportal.ru";

export const YANDEX_WEBMASTER_INFO_URL = `https://webmaster.yandex.ru/siteinfo/?site=${YANDEX_WEBMASTER_SITE}`;

export const YANDEX_IKS_COUNTER_URL = `https://yandex.ru/cycounter?${YANDEX_WEBMASTER_SITE}&theme=light&lang=ru`;
