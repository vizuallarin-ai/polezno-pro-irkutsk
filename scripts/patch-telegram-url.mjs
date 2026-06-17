/**
 * Одноразово обновляет Telegram URL в SiteSettings (production после смены канала).
 * node scripts/patch-telegram-url.mjs
 */
import path from "path";
import { fileURLToPath } from "url";
import nextEnv from "@next/env";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root);

const NEW_URL = "https://t.me/poleznoproirkutsk";
const OLD_PATTERNS = ["polezno_irkutsk", "polezno-irkutsk"];

const { default: config } = await import("../payload.config.js");
const { getPayload } = await import("payload");

const payload = await getPayload({ config });
const global = await payload.findGlobal({ slug: "site-settings", depth: 0 });

const contact = global.contact ?? {};
const social = global.socialLinks ?? {};

const current = contact.telegram || social.telegram || "";
const needsUpdate = OLD_PATTERNS.some((p) => current.includes(p)) || !current;

if (!needsUpdate) {
  console.log("Telegram URL already up to date:", current);
  process.exit(0);
}

await payload.updateGlobal({
  slug: "site-settings",
  data: {
    contact: { ...contact, telegram: NEW_URL },
    socialLinks: { ...social, telegram: NEW_URL },
  },
});

console.log("Updated Telegram URL to", NEW_URL);
