import Link from "next/link";
import { YANDEX_MAPS_TERMS_URL } from "@/lib/map-config";
import { BOOSTY_URL, YANDEX_IKS_COUNTER_URL, YANDEX_WEBMASTER_INFO_URL } from "@/lib/site-links";
import { CityTextureDivider } from "@/components/visual/city-texture-divider";
import type { SiteSettingsData, SiteContacts } from "@/lib/site-settings";
import { contactsForDisplay } from "@/lib/contact-display";
import { CITY_HISTORY_HREF } from "@/lib/brand-constants";

const footerNav = {
  main: [
    { href: "/map", label: "Маршруты и экскурсии" },
    { href: "/explore", label: "Исследовать" },
    { href: "/business", label: "Для бизнеса" },
    { href: "/about", label: "О проекте" },
    { href: "/contact", label: "Контакты" },
  ],
  more: [
    { href: "/events", label: "События" },
    { href: BOOSTY_URL, label: "Клуб на Boosty", external: true },
    { href: "/souvenirs", label: "Сувениры" },
    { href: CITY_HISTORY_HREF, label: "История Иркутска" },
  ],
};

interface FooterProps {
  settings?: SiteSettingsData;
  contact?: SiteContacts;
  showEvents?: boolean;
}

export function Footer({ settings, contact: contactProp, showEvents = true }: FooterProps) {
  const projectName = settings?.projectName || "Иркпортал";
  const tagline = settings?.footerTagline || "Авторский навигатор по Иркутску";
  const footerText =
    settings?.footerText ||
    "Маршруты, экскурсии и материалы о городе — без туристических штампов.";
  const legacyName = settings?.legacyProjectName || "Полезно про Иркутск";
  const contact = contactProp ?? contactsForDisplay(settings?.contact ?? {});
  const telegram = contact.telegram;
  const max = contact.max;
  const instagram = settings?.contact.instagram;
  const email = contact.email;
  const disclaimer =
    settings?.socialDisclaimerText ||
    "* Instagram принадлежит компании Meta, признанной экстремистской организацией и запрещённой в РФ.";

  return (
    <footer className="relative bg-foreground text-primary-foreground city-texture-pattern" role="contentinfo">
      <div className="absolute inset-0 bg-foreground/95" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <Link href="/" className="inline-flex flex-col gap-1 mb-4">
                <span className="text-lg font-medium tracking-widest uppercase text-primary-foreground">
                  {projectName}
                </span>
                <span className="text-sm text-primary-foreground/50 font-light">
                  {tagline}
                </span>
              </Link>
              <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-sm">
                {footerText}
              </p>
              <p className="text-xs text-primary-foreground/35 mt-3">
                Ранее — {legacyName}
              </p>

              <div className="flex items-center gap-4 mt-6 flex-wrap">
                {telegram && (
                  <a
                    href={telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-widest text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-200"
                  >
                    Telegram
                  </a>
                )}
                {max && (
                  <a
                    href={max}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-widest text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-200"
                  >
                    MAX
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="text-xs uppercase tracking-widest text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-200"
                  >
                    Email
                  </a>
                )}
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-widest text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-200"
                  >
                    Instagram*
                  </a>
                )}
                {settings?.contact.vk && (
                  <a
                    href={settings.contact.vk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-widest text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-200"
                  >
                    ВКонтакте
                  </a>
                )}
              </div>

              {instagram && (
                <p className="text-[10px] leading-relaxed text-primary-foreground/30 mt-4 max-w-md">
                  {disclaimer}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-primary-foreground/40 mb-5">
              Навигация
            </p>
            <ul className="flex flex-col gap-3">
              {footerNav.main.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-primary-foreground/40 mb-5">
              Ещё
            </p>
            <ul className="flex flex-col gap-3">
              {footerNav.more
                .filter((link) => showEvents || link.href !== "/events")
                .map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <CityTextureDivider className="mt-16 mb-8 opacity-30" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-xs text-primary-foreground/40">
              © {new Date().getFullYear()} {projectName}. Все права защищены.
            </p>
            <a
              href={YANDEX_WEBMASTER_INFO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-200"
              aria-label="Индекс качества сайта (ИКС) в Яндекс Вебмастере"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={YANDEX_IKS_COUNTER_URL}
                width={88}
                height={31}
                alt="ИКС — индекс качества сайта в Яндексе"
                className="rounded-lg"
              />
            </a>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <Link
              href="/contact"
              className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors duration-200"
            >
              Контакты
            </Link>
            <Link
              href={settings?.leadSettings.privacyPolicyUrl || "/privacy"}
              className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors duration-200"
            >
              Политика данных
            </Link>
            <a
              href={YANDEX_MAPS_TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors duration-200"
            >
              Яндекс Карты API
            </a>
            {email && (
              <a
                href={`mailto:${email}`}
                className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors duration-200"
              >
                {email}
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
