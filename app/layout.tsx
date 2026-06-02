import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

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
    default: "Полезно про Иркутск — туристический гид и культурная платформа",
    template: "%s | Полезно про Иркутск",
  },
  description:
    "Иркутск и Байкал: авторские маршруты, экскурсии, событийный туризм и культурные проекты. Организация путешествий под ключ.",
  keywords: [
    "Иркутск",
    "Байкал",
    "туризм",
    "маршруты",
    "экскурсии",
    "путешествия",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Полезно про Иркутск",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Полезно про Иркутск",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Полезно про Иркутск",
    url: siteUrl,
    description:
      "Организация путешествий, авторских маршрутов и культурных проектов в Иркутске и на Байкале.",
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
        {children}
      </body>
    </html>
  );
}
