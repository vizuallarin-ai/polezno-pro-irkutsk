#!/usr/bin/env node
/**
 * Чеклист переменных для Vercel + одноразовая генерация секретов в stdout.
 * Секреты НЕ читаются из .env — только вывод для копирования в Dashboard.
 *
 * Usage: npm run setup-vercel-env
 */

import { randomBytes } from "node:crypto";

const PRODUCTION_URL = "https://polezno-pro-irkutsk.vercel.app";

/** @type {{ name: string; required: boolean; hint: string; scopes?: string }[]} */
const CORE_VARS = [
  {
    name: "DATABASE_URL",
    required: true,
    hint: "Neon → Project → Connection string (PostgreSQL). Только в Vercel Dashboard.",
    scopes: "Production + Preview",
  },
  {
    name: "PAYLOAD_SECRET",
    required: true,
    hint: "Скопируйте из блока «Сгенерированные секреты» ниже (32+ символов).",
    scopes: "Production + Preview",
  },
  {
    name: "NEXT_PUBLIC_SERVER_URL",
    required: true,
    hint: PRODUCTION_URL,
    scopes: "Production (+ Preview при необходимости)",
  },
  {
    name: "REVALIDATE_SECRET",
    required: true,
    hint: "Скопируйте из блока «Сгенерированные секреты» ниже.",
    scopes: "Production + Preview",
  },
];

/** @type {{ name: string; required: boolean; hint: string }[]} */
const OPTIONAL_VARS = [
  {
    name: "NEXT_PUBLIC_BOOSTY_URL",
    required: false,
    hint: "https://boosty.to/polezno_irkutsk",
  },
  {
    name: "STRIPE_SECRET_KEY",
    required: false,
    hint: "Stripe Dashboard → Secret key",
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    required: false,
    hint: "Stripe → Publishable key",
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    required: false,
    hint: "После настройки webhook на production URL",
  },
  {
    name: "NEXT_PUBLIC_MAPBOX_TOKEN",
    required: false,
    hint: "Mapbox → Access token (pk.)",
  },
  {
    name: "RESEND_API_KEY",
    required: false,
    hint: "Resend → API Keys",
  },
  {
    name: "EMAIL_FROM",
    required: false,
    hint: "noreply@ваш-домен.ru",
  },
  {
    name: "EMAIL_TO",
    required: false,
    hint: "info@polezno.irkutsk.ru",
  },
];

function generateSecret(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

function printSection(title) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(title);
  console.log("═".repeat(60));
}

printSection("Vercel + Neon — чеклист переменных");
console.log(
  "\nДобавьте вручную: Vercel → проект polezno-pro-irkutsk → Settings → Environment Variables"
);
console.log(`Production URL: ${PRODUCTION_URL}`);
console.log("\n⚠️  Секреты в git не коммитить. Dashboard — единственное место для DATABASE_URL.\n");

console.log("── Обязательно для /admin (Payload CMS) ──\n");
for (const v of CORE_VARS) {
  console.log(`  [${v.scopes ?? "Production"}] ${v.name}`);
  console.log(`      ${v.hint}\n`);
}

console.log("── Опционально (сайт без них может работать частично) ──\n");
for (const v of OPTIONAL_VARS) {
  console.log(`  ${v.name}`);
  console.log(`      ${v.hint}\n`);
}

printSection("Сгенерированные секреты (скопируйте ОДИН РАЗ)");
const payloadSecret = generateSecret(32);
const revalidateSecret = generateSecret(24);
console.log("\nPAYLOAD_SECRET=");
console.log(payloadSecret);
console.log("\nREVALIDATE_SECRET=");
console.log(revalidateSecret);
console.log(
  "\n→ Vercel: вставьте в поля PAYLOAD_SECRET и REVALIDATE_SECRET для Production и Preview."
);
console.log("→ Сохраните в менеджере паролей. Повторный запуск скрипта = новые значения.\n");

printSection("Следующие шаги (≈5 минут)");
console.log(`
1. Neon (neon.tech): New Project → polezno-pro-irkutsk → скопировать Connection string
2. Vercel → Environment Variables: DATABASE_URL + секреты выше + NEXT_PUBLIC_SERVER_URL
3. Deployments → Redeploy (лучше без кэша)
4. Открыть ${PRODUCTION_URL}/admin или локально:
   vercel env pull .env.local  →  npm run create-admin
`);

printSection("Neon MCP (опционально в Cursor)");
console.log(`
Если нужна автоматизация из IDE: Cursor → Settings → MCP → Neon → Authenticate.
После OAuth доступны list_projects / create_project. Без авторизации — только UI Neon.
`);
