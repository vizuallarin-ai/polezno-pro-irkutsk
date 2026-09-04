"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/navigation";
import {
  PRIMARY_NAV_LINKS,
  MORE_NAV_LINKS,
  DEFAULT_CTA,
} from "@/lib/navigation-constants";
import { CITY_HISTORY_HREF } from "@/lib/brand-constants";
import {
  CTA,
  assistWalkHref,
  buildContactHref,
} from "@/lib/cta-constants";
import type { SiteContacts } from "@/lib/site-settings";
import { leadAnalyticsProps, trackLeadEvent } from "@/lib/analytics-events";

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

const easeInOut: [number, number, number, number] = [0.76, 0, 0.24, 1];

const menuVariants: Variants = {
  closed: { opacity: 0, x: "100%" },
  open: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: easeInOut },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: { duration: 0.3, ease: easeInOut },
  },
};

const linkVariants: Variants = {
  closed: { opacity: 0, y: 20 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.07,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

interface HeaderProps {
  primaryLinks?: NavItem[];
  moreLinks?: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
  contactCtaLabel?: string;
  projectName?: string;
  projectDescriptor?: string;
  contact?: SiteContacts;
}

function NavLink({
  link,
  className,
  onClick,
}: {
  link: NavItem;
  className: string;
  onClick?: () => void;
}) {
  const label = (
    <>
      {link.label}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
    </>
  );

  if (isExternalHref(link.href)) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className} onClick={onClick}>
      {label}
    </Link>
  );
}

function ContactDropdown({
  contact,
  label = "Связаться",
  onNavigate,
  variant = "dropdown",
}: {
  contact?: SiteContacts;
  label?: string;
  onNavigate?: () => void;
  variant?: "dropdown" | "list";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "dropdown") return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [variant]);

  const items = [
    contact?.telegram
      ? { href: contact.telegram, label: "Telegram", external: true }
      : null,
    contact?.max ? { href: contact.max, label: "MAX", external: true } : null,
    contact?.email
      ? { href: `mailto:${contact.email}`, label: "Email", external: false }
      : null,
    { href: "/contact#lead-form", label: "Форма на сайте", external: false },
  ].filter(Boolean) as { href: string; label: string; external: boolean }[];

  if (items.length === 0) return null;

  if (variant === "list") {
    return (
      <div className="flex flex-col gap-3">
        <p className="type-caption uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {items.map((item) =>
          item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="type-body text-foreground hover:text-baikal transition-colors"
              onClick={() => {
                trackLeadEvent("messenger_click", {
                  sourceType: "header",
                  cta: item.label,
                });
                onNavigate?.();
              }}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className="type-body text-foreground hover:text-baikal transition-colors"
              onClick={() => {
                trackLeadEvent("cta_click", {
                  sourceType: "header",
                  cta: item.label,
                });
                onNavigate?.();
              }}
            >
              {item.label}
            </Link>
          )
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hidden md:inline-flex min-h-[44px] h-11 items-center gap-1.5 px-4 type-button border border-border bg-background hover:bg-muted transition-colors duration-200"
        aria-expanded={open}
        aria-haspopup="menu"
        {...leadAnalyticsProps("contact_click", {
          sourceType: "header",
          cta: label,
        })}
      >
        {label}
        <ChevronDown
          size={14}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] border border-border bg-background py-2 shadow-lg"
          >
            {items.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  role="menuitem"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 type-body-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => {
                    trackLeadEvent("messenger_click", {
                      sourceType: "header",
                      cta: item.label,
                    });
                    setOpen(false);
                    onNavigate?.();
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  role="menuitem"
                  href={item.href}
                  className="block px-4 py-2 type-body-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => {
                    trackLeadEvent(
                      item.label === "Email" ? "email_click" : "cta_click",
                      { sourceType: "header", cta: item.label }
                    );
                    setOpen(false);
                    onNavigate?.();
                  }}
                >
                  {item.label}
                </Link>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MoreDropdown({ links }: { links: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center gap-1 type-nav-secondary text-muted-foreground hover:text-foreground transition-colors group"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Ещё
        <ChevronDown
          size={14}
          className={cn("transition-transform", open && "rotate-180")}
        />
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-3 min-w-[12rem] border border-border bg-background py-2 shadow-lg"
          >
            {links.map((link) => (
              <div key={`${link.href}-${link.label}`}>
                {isExternalHref(link.href) ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    className="block px-4 py-2 type-body-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    role="menuitem"
                    className="block px-4 py-2 type-body-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function resolveContextualCta(
  pathname: string | null,
  fallbackLabel: string,
  fallbackHref: string
): { label: string; href: string } {
  if (pathname?.startsWith("/business")) {
    return { label: CTA.b2bPrimary.label, href: CTA.b2bPrimary.href };
  }
  if (pathname?.match(/^\/map\/[^/]+/) || pathname?.match(/^\/excursions\//)) {
    const slug =
      pathname?.split("/")[2] ??
      pathname?.replace(/^\/(map|excursions)\//, "") ??
      "";
    const isExcursion = pathname?.startsWith("/excursions/");
    return {
      label: CTA.guided.label,
      href: buildContactHref({
        intent: isExcursion ? "excursion" : "route",
        productType: isExcursion ? "excursion" : "route",
        slug,
        sourceBlock: "header-contextual",
      }),
    };
  }
  return { label: fallbackLabel, href: fallbackHref };
}

export function Header({
  primaryLinks = PRIMARY_NAV_LINKS,
  moreLinks = MORE_NAV_LINKS,
  ctaLabel = DEFAULT_CTA.label,
  ctaHref = DEFAULT_CTA.href,
  contactCtaLabel = "Связаться",
  projectName = "Иркпортал",
  projectDescriptor = "Авторский навигатор по Иркутску от Алёны Ямщиковой",
  contact,
}: HeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const headerCta = useMemo(
    () => resolveContextualCta(pathname, ctaLabel, ctaHref),
    [pathname, ctaLabel, ctaHref]
  );

  const descriptor =
    projectDescriptor?.trim() ||
    "Авторский навигатор по Иркутску от Алёны Ямщиковой";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinkClass =
    "relative type-nav text-muted-foreground hover:text-foreground transition-colors duration-200 group";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border/40"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 lg:gap-6">
            <div className="flex min-w-0 flex-col justify-center gap-0.5">
              <Link
                href="/"
                className="type-ui-label tracking-[0.14em] uppercase text-foreground hover:text-foreground/80 transition-colors whitespace-nowrap"
                aria-label={`${projectName} — на главную`}
              >
                {projectName}
              </Link>
              <p className="hidden xl:block type-caption text-muted-foreground leading-snug max-w-[280px] text-pretty">
                Авторский навигатор по{" "}
                <Link
                  href={CITY_HISTORY_HREF}
                  className="text-foreground/80 hover:text-baikal underline-offset-2 hover:underline"
                >
                  Иркутску
                </Link>{" "}
                от Алёны Ямщиковой
              </p>
              <p className="hidden md:block xl:hidden type-caption text-muted-foreground leading-snug whitespace-nowrap">
                Навигатор Алёны Ямщиковой
              </p>
              <span className="sr-only">{descriptor}</span>
            </div>

            <nav
              className="hidden lg:flex items-center gap-5 xl:gap-7"
              aria-label="Основная навигация"
            >
              {primaryLinks.map((link) => (
                <NavLink
                  key={`${link.href}-${link.label}`}
                  link={link}
                  className={navLinkClass}
                />
              ))}
              <MoreDropdown links={moreLinks} />
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <ContactDropdown contact={contact} label={contactCtaLabel} />

              <Link
                href={headerCta.href}
                className="cta-label hidden lg:inline-flex min-h-[44px] h-11 items-center px-4 xl:px-5 type-button bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 active:scale-[0.98]"
              >
                {headerCta.label}
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 text-foreground hover:text-muted-foreground transition-colors"
                aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={isOpen}
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className="fixed inset-0 z-50 bg-background flex flex-col px-6 pt-20 pb-10 overflow-y-auto"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-6 flex items-center justify-center w-10 h-10 text-foreground"
              aria-label="Закрыть меню"
            >
              <X size={20} />
            </button>

            <nav
              className="flex flex-col gap-5 mt-2"
              aria-label="Основные разделы"
            >
              <p className="type-caption uppercase tracking-widest text-muted-foreground">
                Главное
              </p>
              {primaryLinks.map((link, i) => (
                <motion.div
                  key={`${link.href}-${link.label}`}
                  custom={i}
                  variants={linkVariants}
                  initial="closed"
                  animate="open"
                >
                  <NavLink
                    link={link}
                    className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground hover:text-baikal transition-colors duration-200 block"
                    onClick={() => setIsOpen(false)}
                  />
                </motion.div>
              ))}
            </nav>

            <nav
              className="flex flex-col gap-4 mt-10"
              aria-label="Ещё разделы"
            >
              <p className="type-caption uppercase tracking-widest text-muted-foreground">
                Ещё
              </p>
              {moreLinks.map((link, i) => (
                <motion.div
                  key={`${link.href}-${link.label}`}
                  custom={primaryLinks.length + i}
                  variants={linkVariants}
                  initial="closed"
                  animate="open"
                >
                  <NavLink
                    link={link}
                    className="text-lg font-normal text-foreground/85 hover:text-baikal transition-colors duration-200 block"
                    onClick={() => setIsOpen(false)}
                  />
                </motion.div>
              ))}
            </nav>

            <motion.div
              custom={primaryLinks.length + moreLinks.length}
              variants={linkVariants}
              initial="closed"
              animate="open"
              className="mt-10 flex flex-col gap-5 border-t border-border pt-8"
            >
              <ContactDropdown
                contact={contact}
                label={contactCtaLabel}
                variant="list"
                onNavigate={() => setIsOpen(false)}
              />

              <Link
                href={headerCta.href}
                onClick={() => setIsOpen(false)}
                className="cta-label cta-label-wrap-sm inline-flex min-h-[44px] h-12 items-center justify-center px-8 type-button bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full sm:w-fit"
              >
                {headerCta.label}
              </Link>

              <Link
                href={assistWalkHref("mobile-menu")}
                onClick={() => setIsOpen(false)}
                className="type-body-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {CTA.assist.label}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
