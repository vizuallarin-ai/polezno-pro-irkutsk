import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { FloatingContact } from "@/components/contact/floating-contact";
import { YandexMetrikaHead, YandexMetrikaNoscript } from "@/components/analytics/yandex-metrika";
import { LenisProvider } from "@/components/layout/lenis-provider";
import { getNavigation, getSecondaryCatalogFlags } from "@/lib/navigation";
import { getSiteSettings } from "@/lib/site-settings";
import { contactsForDisplay } from "@/lib/contact-display";
import { getSiteUrl } from "@/lib/site-url";
import { organizationSchema } from "@/lib/jsonld";
import { BOOSTY_URL, TELEGRAM_URL } from "@/lib/site-links";
import "../globals.css";

const siteUrl = getSiteUrl();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Иркпортал — авторский навигатор по Иркутску",
    template: "%s | Иркпортал",
  },
  description:
    "Иркпортал: авторские маршруты, экскурсии и материалы об Иркутске без туристических штампов.",
  keywords: [
    "Иркутск",
    "Иркпортал",
    "маршруты",
    "экскурсии",
    "путешествия",
    "Байкал",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Иркпортал",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Иркпортал",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Иркпортал — авторский навигатор по Иркутску",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "LLEp_6ENwdLy4ubS0_YoCB6e4J0xmz5IoGs2iJHrQTk",
  },
};

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nav, settings, catalogFlags] = await Promise.all([
    getNavigation(),
    getSiteSettings(),
    getSecondaryCatalogFlags(),
  ]);
  const contact = contactsForDisplay(settings.contact);
  const sameAs = [
    contact.telegram || TELEGRAM_URL,
    contact.boosty || BOOSTY_URL,
    contact.vk,
    contact.max,
  ].filter((v): v is string => Boolean(v));

  const orgSchema = organizationSchema({
    name: settings.projectName,
    description: settings.description,
    email: contact.email || undefined,
    sameAs,
  });

  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}
    >
      <head>
        <YandexMetrikaHead />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:outline focus:outline-2 focus:outline-baikal"
        >
          Перейти к содержимому
        </a>
        <YandexMetrikaNoscript />
        <LenisProvider>
          <Header
            primaryLinks={nav.primaryLinks}
            moreLinks={nav.moreLinks}
            ctaLabel={settings.mainCta.label}
            ctaHref={settings.mainCta.href}
            contactCtaLabel={settings.leadSettings.contactCtaLabel}
            projectName={settings.projectName}
            projectDescriptor={settings.projectDescriptor}
            contact={contact}
          />
          <main id="main-content">{children}</main>
          <Footer
            settings={settings}
            contact={contact}
            showEvents={catalogFlags.showEvents}
            showSouvenirs={catalogFlags.showSouvenirs}
          />
          <FloatingContact
            contact={contact}
            label={settings.leadSettings.contactCtaLabel}
          />
          <ScrollToTop />
        </LenisProvider>
      </body>
    </html>
  );
}
