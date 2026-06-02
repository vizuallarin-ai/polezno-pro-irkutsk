import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

import { Users } from "./payload/collections/Users";
import { Media } from "./payload/collections/Media";
import { Routes } from "./payload/collections/Routes";
import { Places } from "./payload/collections/Places";
import { Articles } from "./payload/collections/Articles";
import { Events } from "./payload/collections/Events";
import { Products } from "./payload/collections/Products";
import { Excursions } from "./payload/collections/Excursions";
import { Reviews } from "./payload/collections/Reviews";
import { Partners } from "./payload/collections/Partners";
import { Leads } from "./payload/collections/Leads";
import { Guides } from "./payload/collections/Guides";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { Navigation } from "./payload/globals/Navigation";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: "— Полезно про Иркутск CMS",
    },
    dateFormat: "dd.MM.yyyy",
    components: {
      beforeDashboard: ["./payload/components/BeforeDashboard#default"],
    },
  },
  collections: [
    Users,
    Media,
    Routes,
    Places,
    Excursions,
    Articles,
    Events,
    Products,
    Guides,
    Reviews,
    Partners,
    Leads,
  ],
  globals: [SiteSettings, Navigation],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "super-secret-payload-key-change-me",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  upload: {
    limits: {
      fileSize: 50_000_000,
    },
  },
  plugins: [],
});
