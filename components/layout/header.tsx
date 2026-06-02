"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/navigation";
import { DEFAULT_NAV_LINKS, DEFAULT_CTA } from "@/lib/navigation-constants";

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
  links?: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
}

export function Header({
  links = DEFAULT_NAV_LINKS,
  ctaLabel = DEFAULT_CTA.label,
  ctaHref = DEFAULT_CTA.href,
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
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 group"
              aria-label="Полезно про Иркутск — домой"
            >
              <span className="text-sm font-medium tracking-widest uppercase">
                Полезно про
              </span>
              <span className="text-sm font-medium tracking-widest uppercase text-baikal">
                Иркутск
              </span>
            </Link>

            <nav
              className="hidden md:flex items-center gap-8"
              aria-label="Основная навигация"
            >
              {links.map((link) => {
                const className =
                  "relative text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group";
                const label = (
                  <>
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
                  </>
                );
                return isExternalHref(link.href) ? (
                  <a
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className={className}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href={ctaHref}
                className="hidden md:inline-flex h-9 items-center px-5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 active:scale-[0.98]"
              >
                {ctaLabel}
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 text-foreground hover:text-muted-foreground transition-colors"
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
              className="flex flex-col gap-6 mt-8"
              aria-label="Мобильная навигация"
            >
              {links.map((link, i) => (
                <motion.div
                  key={`${link.href}-${link.label}`}
                  custom={i}
                  variants={linkVariants}
                  initial="closed"
                  animate="open"
                >
                  {isExternalHref(link.href) ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="text-3xl font-light tracking-tight text-foreground hover:text-baikal transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-3xl font-light tracking-tight text-foreground hover:text-baikal transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>

            <motion.div
              custom={links.length}
              variants={linkVariants}
              initial="closed"
              animate="open"
              className="mt-auto"
            >
              <Link
                href={ctaHref}
                onClick={() => setIsOpen(false)}
                className="inline-flex h-12 items-center px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
