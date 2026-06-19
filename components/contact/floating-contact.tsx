"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, X, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteContacts } from "@/lib/site-settings";
import { leadAnalyticsProps, trackLeadEvent } from "@/lib/analytics-events";

interface FloatingContactProps {
  contact: SiteContacts;
  label?: string;
}

export function FloatingContact({
  contact,
  label = "Связаться",
}: FloatingContactProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const isMapPage = pathname === "/map" || pathname.startsWith("/map/");
  const isContactPage = pathname === "/contact";

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isMapPage || isContactPage) return null;

  const items = [
    contact.telegram
      ? { href: contact.telegram, label: "Telegram", external: true }
      : null,
    contact.max ? { href: contact.max, label: "MAX", external: true } : null,
    contact.email
      ? { href: `mailto:${contact.email}`, label: "Email", external: false }
      : null,
  ].filter(Boolean) as { href: string; label: string; external: boolean }[];

  return (
    <div
      className={cn(
        "fixed z-30 flex flex-col items-end gap-2 transition-all duration-300",
        "bottom-20 left-4 md:bottom-8 md:left-8",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      {open && (
        <div className="flex flex-col gap-2 mb-1 border border-border bg-background/95 p-2 shadow-sm backdrop-blur-sm">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              {...leadAnalyticsProps(
                item.label === "Email" ? "email_click" : "messenger_click",
                { sourceType: "floating_contact", cta: item.label }
              )}
              onClick={() =>
                trackLeadEvent(
                  item.label === "Email" ? "email_click" : "messenger_click",
                  { sourceType: "floating_contact", cta: item.label }
                )
              }
              className="inline-flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors whitespace-nowrap"
            >
              {item.label === "Email" ? (
                <Mail size={14} aria-hidden />
              ) : (
                <MessageCircle size={14} aria-hidden />
              )}
              {item.label}
            </a>
          ))}
          <Link
            href="/contact#lead-form"
            {...leadAnalyticsProps("cta_click", {
              sourceType: "floating_contact",
              cta: "form",
            })}
            onClick={() => {
              trackLeadEvent("cta_click", {
                sourceType: "floating_contact",
                cta: "form",
              });
              setOpen(false);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-foreground text-primary-foreground hover:bg-foreground/90 transition-colors"
          >
            Форма на сайте
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Закрыть контакты" : label}
        {...leadAnalyticsProps("contact_click", {
          sourceType: "floating_contact",
          cta: label,
        })}
        className="inline-flex h-11 items-center gap-2 border border-border bg-background/90 px-4 text-sm text-foreground shadow-sm backdrop-blur-sm hover:bg-background transition-colors"
      >
        {open ? <X size={16} aria-hidden /> : <MessageCircle size={16} aria-hidden />}
        <span className="hidden sm:inline">{label}</span>
      </button>
    </div>
  );
}
