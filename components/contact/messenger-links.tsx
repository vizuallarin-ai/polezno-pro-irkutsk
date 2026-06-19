"use client";

import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteContacts } from "@/lib/site-settings";
import { isDisplayablePhone } from "@/lib/contact-display";
import { leadAnalyticsProps, trackLeadEvent } from "@/lib/analytics-events";

interface MessengerLinksProps {
  contact: SiteContacts;
  sourceType?: string;
  sourceBlock?: string;
  layout?: "row" | "column";
  className?: string;
}

export function MessengerLinks({
  contact,
  sourceType = "cta_section",
  sourceBlock = "messengers",
  layout = "row",
  className,
}: MessengerLinksProps) {
  const items = [
    contact.telegram
      ? {
          href: contact.telegram,
          label: "Telegram",
          event: "messenger_click" as const,
          external: true,
        }
      : null,
    contact.max
      ? {
          href: contact.max,
          label: "MAX",
          event: "messenger_click" as const,
          external: true,
        }
      : null,
    contact.email
      ? {
          href: `mailto:${contact.email}`,
          label: "Email",
          event: "email_click" as const,
          external: false,
        }
      : null,
    contact.phone && isDisplayablePhone(contact.phone)
      ? {
          href: `tel:${contact.phone.replace(/\s/g, "")}`,
          label: contact.phone,
          event: "contact_click" as const,
          external: false,
        }
      : null,
  ].filter(Boolean) as {
    href: string;
    label: string;
    event: "messenger_click" | "email_click" | "contact_click";
    external: boolean;
  }[];

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "flex gap-3 flex-wrap",
        layout === "column" && "flex-col items-start",
        className
      )}
    >
      {items.map((item) => {
        const analytics = leadAnalyticsProps(item.event, {
          sourceType,
          sourceBlock,
          cta: item.label,
        });
        const onClick = () =>
          trackLeadEvent(item.event, { sourceType, sourceBlock, cta: item.label });

        if (item.external) {
          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClick}
              {...analytics}
              className="inline-flex items-center gap-2 text-sm border border-border px-4 py-2 hover:bg-muted transition-colors"
              aria-label={`${item.label} — написать`}
            >
              <MessageCircle size={14} aria-hidden />
              {item.label}
            </a>
          );
        }

        if (item.event === "email_click") {
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={onClick}
              {...analytics}
              className="inline-flex items-center gap-2 text-sm border border-border px-4 py-2 hover:bg-muted transition-colors"
              aria-label="Написать на email"
            >
              <Mail size={14} aria-hidden />
              {item.label}
            </a>
          );
        }

        return (
          <a
            key={item.label}
            href={item.href}
            onClick={onClick}
            {...analytics}
            className="inline-flex items-center gap-2 text-sm border border-border px-4 py-2 hover:bg-muted transition-colors"
          >
            {item.label}
          </a>
        );
      })}
      <Link
        href="/contact#lead-form"
        {...leadAnalyticsProps("cta_click", {
          sourceType,
          sourceBlock,
          cta: "form",
        })}
        onClick={() =>
          trackLeadEvent("cta_click", { sourceType, sourceBlock, cta: "form" })
        }
        className="inline-flex items-center gap-2 text-sm bg-foreground text-primary-foreground px-4 py-2 hover:bg-foreground/90 transition-colors"
      >
        Форма на сайте
      </Link>
    </div>
  );
}
