"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Menu, X, ChevronDown, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/navigation";
import {
  PRIMARY_NAV_LINKS,
  MORE_NAV_LINKS,
  DEFAULT_CTA,
} from "@/lib/navigation-constants";
import { CITY_HISTORY_HREF } from "@/lib/brand-constants";
import type { SiteContacts } from "@/lib/site-settings";

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

function HeaderContacts({
  contact,
  className,
  onClick,
}: {
  contact?: SiteContacts;
  className?: string;
  onClick?: () => void;
}) {
  const items = [
    contact?.telegram
      ? { href: contact.telegram, label: "Telegram", external: true }
      : null,
    contact?.max ? { href: contact.max, label: "MAX", external: true } : null,
    contact?.email
      ? { href: `mailto:${contact.email}`, label: "Email", external: false }
      : null,
  ].filter(Boolean) as { href: string; label: string; external: boolean }[];

  if (items.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {items.map((item) =>
        item.external ? (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            {item.label}
          </a>
        ) : (
          <a
            key={item.label}
            href={item.href}
            onClick={onClick}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail size={12} aria-hidden />
            {item.label}
          </a>
        )
      )}
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
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        aria-expanded={open}
        aria-haspopup="true"
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-3 min-w-[11rem] border border-border bg-background py-2 shadow-lg"
          >
            {links.map((link) => (
              <div key={`${link.href}-${link.label}`}>
                {isExternalHref(link.href) ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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

export function Header({
  primaryLinks = PRIMARY_NAV_LINKS,
  moreLinks = MORE_NAV_LINKS,
  ctaLabel = DEFAULT_CTA.label,
  ctaHref = DEFAULT_CTA.href,
  projectName = "Иркпортал",
  projectDescriptor = "Авторский навигатор по Иркутску от Алёны Ямщиковой",
  contact,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    "relative text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group";

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
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex min-w-0 flex-col">
              <Link
                href="/"
                className="text-sm font-medium tracking-widest uppercase text-foreground hover:text-foreground/80 transition-colors"
                aria-label={`${projectName} — на главную`}
              >
                {projectName}
              </Link>
              <p className="hidden sm:block text-[11px] text-muted-foreground leading-tight truncate max-w-[220px] lg:max-w-xs">
                Авторский навигатор по{" "}
                <Link
                  href={CITY_HISTORY_HREF}
                  className="text-foreground/80 hover:text-baikal underline-offset-2 hover:underline"
                >
                  Иркутску
                </Link>{" "}
                от Алёны Ямщиковой
              </p>
            </div>

            <nav
              className="hidden lg:flex items-center gap-6 xl:gap-8"
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

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
              <HeaderContacts
                contact={contact}
                className="hidden xl:flex"
              />

              {contact?.telegram && (
                <a
                  href={contact.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="xl:hidden flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Telegram — написать Алёне"
                >
                  <MessageCircle size={20} aria-hidden />
                </a>
              )}

              <Link
                href={ctaHref}
                className="hidden md:inline-flex h-9 items-center px-4 lg:px-5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 active:scale-[0.98]"
              >
                {ctaLabel}
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
            className="fixed inset-0 z-50 bg-background flex flex-col px-6 pt-20 pb-10"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-6 flex items-center justify-center w-10 h-10 text-foreground"
              aria-label="Закрыть меню"
            >
              <X size={20} />
            </button>

            <nav
              className="flex flex-col gap-6 mt-4"
              aria-label="Мобильная навигация"
            >
              {[...primaryLinks, ...moreLinks].map((link, i) => (
                <motion.div
                  key={`${link.href}-${link.label}`}
                  custom={i}
                  variants={linkVariants}
                  initial="closed"
                  animate="open"
                >
                  <NavLink
                    link={link}
                    className="text-3xl font-light tracking-tight text-foreground hover:text-baikal transition-colors duration-200 block"
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
              className="mt-8 flex flex-col gap-6"
            >
              <HeaderContacts
                contact={contact}
                className="flex-col items-start gap-4"
                onClick={() => setIsOpen(false)}
              />

              <Link
                href={ctaHref}
                onClick={() => setIsOpen(false)}
                className="inline-flex h-12 items-center px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-fit"
              >
                {ctaLabel}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
