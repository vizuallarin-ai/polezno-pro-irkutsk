/**
 * Phase 10: seed own merch souvenirs into Payload CMS.
 * Run: npm run seed:souvenirs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { buildConfig, getPayload } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
nextEnv.loadEnvConfig(root);

const SEED_PRODUCTS = [
  {
    title: "Карта-прогулка по центру Иркутска",
    slug: "map-walk-center-irkutsk",
    productType: "printed_map",
    category: "maps_routes",
    price: 450,
    priceLabel: "от 450 ₽",
    stockStatus: "pre_order",
    isOwnMerch: true,
    isFeatured: true,
    shortDescription:
      "Печатная карта с маршрутом по центру: улицы, ориентиры и короткие подписи без туристических штампов.",
    cityConnectionText:
      "Собрана на основе маршрутов Иркпортала по историческому центру — для самостоятельной прогулки.",
    orderCtaLabel: "Запросить предзаказ",
  },
  {
    title: "Открытки «Иркутск без штампов»",
    slug: "postcards-no-cliches",
    productType: "postcard",
    category: "postcards",
    price: 350,
    priceLabel: "набор от 350 ₽",
    stockStatus: "soon",
    isOwnMerch: true,
    isFeatured: true,
    shortDescription:
      "Набор открыток с деталями города: фасады, дворы, зимний свет — не открытки «медведь с балалайкой».",
    cityConnectionText: "Сюжеты из фотоархива и маршрутов проекта.",
    orderCtaLabel: "Узнать о старте продаж",
  },
  {
    title: "Постер «Деревянный Иркутск»",
    slug: "poster-wooden-irkutsk",
    productType: "poster",
    category: "posters",
    price: 1200,
    priceLabel: "от 1 200 ₽",
    stockStatus: "pre_order",
    isOwnMerch: true,
    isFeatured: true,
    shortDescription:
      "Постер с деревянной архитектурой: резные наличники, фактуры, тихие улицы.",
    cityConnectionText: "Вдохновлён маршрутами по деревянному зодчеству Иркутска.",
    orderCtaLabel: "Оставить заявку",
  },
  {
    title: "Мини-гид «Иркутск за 3 дня»",
    slug: "mini-guide-3-days",
    productType: "digital_guide",
    category: "mini_guides",
    price: 590,
    priceLabel: "590 ₽",
    stockStatus: "soon",
    isOwnMerch: true,
    isFeatured: true,
    shortDescription:
      "Компактный план на три дня: что смотреть, где гулять и как не утонуть в штампах.",
    cityConnectionText: "Связан с материалами раздела «Исследовать» и маршрутами на карте.",
    orderCtaLabel: "Сообщить о готовности",
  },
];

async function ensurePlaceholderMedia(payload) {
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: "seed-placeholder-souvenir.svg" } },
    limit: 1,
  });
  if (existing.docs[0]) return existing.docs[0].id;

  const svgPath = path.join(root, "public", "images", "map-preview.svg");
  const buffer = fs.readFileSync(svgPath);
  const media = await payload.create({
    collection: "media",
    data: { alt: "Демо-сувенир Иркпортала" },
    file: {
      data: buffer,
      mimetype: "image/svg+xml",
      name: "seed-placeholder-souvenir.svg",
      size: buffer.length,
    },
  });
  return media.id;
}

async function loadPayload() {
  const { Users } = await import("../payload/collections/Users.ts");
  const { Media } = await import("../payload/collections/Media.ts");
  const { Routes } = await import("../payload/collections/Routes.ts");
  const { Places } = await import("../payload/collections/Places.ts");
  const { Articles } = await import("../payload/collections/Articles.ts");
  const { Events } = await import("../payload/collections/Events.ts");
  const { Products } = await import("../payload/collections/Products.ts");
  const { Makers } = await import("../payload/collections/Makers.ts");
  const { Photos } = await import("../payload/collections/Photos.ts");
  const { Excursions } = await import("../payload/collections/Excursions.ts");
  const { Reviews } = await import("../payload/collections/Reviews.ts");
  const { Partners } = await import("../payload/collections/Partners.ts");
  const { Leads } = await import("../payload/collections/Leads.ts");
  const { Guides } = await import("../payload/collections/Guides.ts");
  const { SiteSettings } = await import("../payload/globals/SiteSettings.ts");
  const { Navigation } = await import("../payload/globals/Navigation.ts");

  const config = buildConfig({
    secret: process.env.PAYLOAD_SECRET,
    collections: [
      Users,
      Routes,
      Leads,
      Articles,
      Photos,
      Events,
      Media,
      Places,
      Excursions,
      Makers,
      Products,
      Guides,
      Reviews,
      Partners,
    ],
    globals: [SiteSettings, Navigation],
    editor: lexicalEditor(),
    db: postgresAdapter({
      pool: { connectionString: process.env.DATABASE_URL },
      push: false,
    }),
  });

  return getPayload({ config });
}

async function main() {
  if (!process.env.DATABASE_URL?.trim() || !process.env.PAYLOAD_SECRET?.trim()) {
    console.error("DATABASE_URL and PAYLOAD_SECRET are required");
    process.exit(1);
  }

  const payload = await loadPayload();
  const mediaId = await ensurePlaceholderMedia(payload);

  for (const product of SEED_PRODUCTS) {
    const found = await payload.find({
      collection: "products",
      where: { slug: { equals: product.slug } },
      limit: 1,
    });
    if (found.docs.length > 0) {
      console.log("skip", product.slug);
      continue;
    }

    await payload.create({
      collection: "products",
      data: {
        ...product,
        status: "published",
        gallery: [{ image: mediaId }],
        inStock: product.stockStatus === "in_stock",
        seo: {
          title: `${product.title} — сувениры Иркутска`,
          description: product.shortDescription,
        },
      },
    });
    console.log("created", product.slug);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
