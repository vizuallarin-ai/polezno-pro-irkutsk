import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { LenisProvider } from "@/components/layout/lenis-provider";
import { getNavigation } from "@/lib/navigation";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteUrl } from "@/lib/site-url";
import "../globals.css";

const siteUrl = getSiteUrl();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()]);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: settings.projectName,
    url: siteUrl,
    description: settings.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Иркутск",
      addressRegion: "Иркутская область",
      addressCountry: "RU",
    },
  };

  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <LenisProvider>
          <Header
            primaryLinks={nav.primaryLinks}
            moreLinks={nav.moreLinks}
            ctaLabel={settings.mainCta.label}
            ctaHref={settings.mainCta.href}
            projectName={settings.projectName}
            projectDescriptor={settings.projectDescriptor}
            contact={settings.contact}
          />
          <main>{children}</main>
          <Footer settings={settings} />
          <ScrollToTop />
        </LenisProvider>
      </body>
    </html>
  );
}
