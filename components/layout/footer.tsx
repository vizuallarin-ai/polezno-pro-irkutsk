import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const footerLinks = {
  explore: [
    { href: "/map", label: "Маршруты" },
    { href: "/explore", label: "Все материалы" },
    { href: "/events", label: "События" },
    { href: "/explore/food", label: "Где поесть" },
    { href: "/explore/baikal", label: "Байкал рядом" },
    { href: "/explore/hidden", label: "Hidden Places" },
  ],
  services: [
    { href: "/program", label: "Создать программу" },
    { href: "/explore/excursions", label: "Экскурсии" },
    { href: "/about", label: "О проекте" },
    { href: "/about#guides", label: "Наши гиды" },
    { href: "/contact", label: "Контакты" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div>
              <Link href="/" className="inline-flex flex-col gap-1 mb-6">
                <span className="text-lg font-medium tracking-widest uppercase text-primary-foreground">
                  Полезно про Иркутск
                </span>
                <span className="text-sm text-primary-foreground/50 font-light">
                  Цифровая платформа о городе и Байкале
                </span>
              </Link>
              <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
                Организация путешествий, авторские маршруты, культурные проекты
                в Иркутске и на Байкале с 2019 года.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <a
                  href="https://t.me/polezno_irkutsk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-widest text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-200"
                  aria-label="Telegram"
                >
                  Telegram
                </a>
                <a
                  href="https://instagram.com/polezno.irkutsk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-widest text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-200"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
              </div>
            </div>
            <NewsletterForm />
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-primary-foreground/40 mb-5">
              Исследовать
            </p>
            <ul className="flex flex-col gap-3">
              {footerLinks.explore.map((link) => (
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
              Услуги
            </p>
            <ul className="flex flex-col gap-3">
              {footerLinks.services.map((link) => (
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
        </div>

        <Separator className="mt-16 mb-8 bg-primary-foreground/10" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} Полезно про Иркутск. Все права
            защищены.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/contact"
              className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors duration-200"
            >
              Контакты
            </Link>
            <a
              href="https://t.me/polezno_irkutsk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors duration-200"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

