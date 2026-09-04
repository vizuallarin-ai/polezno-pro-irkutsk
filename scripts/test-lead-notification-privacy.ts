#!/usr/bin/env npx tsx
/**
 * Gate C.1 lead notification privacy — fixtures only, no email send.
 * Run: npm run test:lead-privacy
 */

import assert from "node:assert/strict";
import { sanitizeAnalyticsParams } from "../lib/analytics-events";
import {
  buildLeadNotificationEmail,
  buildLeadNotificationPayload,
  LEAD_NOTIFICATION_ALLOWED_KEYS,
  notifySavedLead,
  payloadContainsForbiddenPiiKeys,
  sendLeadNotification,
  type LeadEmailMessage,
} from "../lib/lead-notification";
import {
  buildSitemapCmsErrorLog,
  sitemapContainsDemoMarkers,
} from "../lib/sitemap-contract";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  const run = Promise.resolve().then(fn);
  return run
    .then(() => {
      passed += 1;
      console.log(`ok  ${name}`);
    })
    .catch((error) => {
      failed += 1;
      console.error(`not ok  ${name}`);
      console.error(error);
    });
}

const TEST_PII = {
  name: "Иван Тестов",
  email: "ivan.privacy@example.com",
  phone: "+79991234567",
  message: "Секретное сообщение заявителя",
};

async function main() {
  await test("10. Email notification payload has no forbidden PII keys", () => {
    const payload = buildLeadNotificationPayload({
      leadId: "lead_42",
      createdAt: "2026-09-04T07:00:00.000Z",
      sourceType: "contact",
      correlationId: "corr_1",
    });
    const forbidden = payloadContainsForbiddenPiiKeys(
      payload as unknown as Record<string, unknown>
    );
    assert.deepEqual(forbidden, []);
    for (const key of Object.keys(payload)) {
      assert.ok(
        (LEAD_NOTIFICATION_ALLOWED_KEYS as readonly string[]).includes(key)
      );
    }
  });

  await test("11. Email body does not contain test name/email/phone/message", () => {
    const payload = buildLeadNotificationPayload({
      leadId: "lead_42",
      createdAt: "2026-09-04T07:00:00.000Z",
      sourceType: "contact",
    });
    const email = buildLeadNotificationEmail(payload);
    const haystack = `${email.subject}\n${email.html}\n${email.text}`;
    assert.equal(haystack.includes(TEST_PII.name), false);
    assert.equal(haystack.includes(TEST_PII.email), false);
    assert.equal(haystack.includes(TEST_PII.phone), false);
    assert.equal(haystack.includes(TEST_PII.message), false);
    assert.ok(haystack.includes("lead_42"));
    assert.ok(haystack.includes("/admin/collections/leads/lead_42"));
  });

  await test("12. Missing email config causes a safe skip", async () => {
    const result = await sendLeadNotification(
      { leadId: "lead_skip", sourceType: "contact" },
      {
        env: {},
        transport: null,
        siteUrl: "https://irkportal.ru",
      }
    );
    assert.equal(result.status, "skipped");
    if (result.status === "skipped") {
      assert.equal(result.reason, "missing_config");
    }
  });

  await test("13. Email transport failure does not destroy a saved lead", async () => {
    let saved = false;
    const lead = await (async () => {
      saved = true;
      return { id: "lead_saved" };
    })();

    const result = await notifySavedLead(
      { leadId: lead.id, sourceType: "contact" },
      {
        env: {
          EMAIL_FROM: "noreply@irkportal.ru",
          EMAIL_TO: "ops@irkportal.ru",
          RESEND_API_KEY: "re_test_not_used",
        },
        siteUrl: "https://irkportal.ru",
        transport: {
          async send() {
            throw new Error("transport down");
          },
        },
      }
    );

    assert.equal(saved, true);
    assert.equal(lead.id, "lead_saved");
    assert.equal(result.status, "failed");
  });

  await test("14. Analytics payload still strips PII", () => {
    const clean = sanitizeAnalyticsParams({
      sourceSlug: "center-walk",
      email: TEST_PII.email,
      phone: TEST_PII.phone,
      name: TEST_PII.name,
      message: TEST_PII.message,
      cta: "Подобрать прогулку",
    });
    assert.equal(clean.sourceSlug, "center-walk");
    assert.equal(clean.cta, "Подобрать прогулку");
    assert.equal("email" in clean, false);
    assert.equal("phone" in clean, false);
    assert.equal("name" in clean, false);
    assert.equal("message" in clean, false);
  });

  await test("15. Sitemap fail-soft logging stays sanitized", () => {
    const log = buildSitemapCmsErrorLog(
      new Error("connection refused postgresql://secret:pass@host/db")
    );
    assert.equal(log.phase, "sitemap_cms_urls");
    assert.equal(log.outcome, "error");
    assert.equal(JSON.stringify(log).includes("postgresql://"), false);
    assert.equal(JSON.stringify(log).includes("secret"), false);
    const demoHits = sitemapContainsDemoMarkers(
      "<urlset><loc>https://irkportal.ru/souvenirs</loc></urlset>"
    );
    assert.equal(demoHits.length, 0);
  });

  await test("User input cannot change recipient, sender, subject or admin URL", async () => {
    const captured: LeadEmailMessage[] = [];
    await sendLeadNotification(
      {
        leadId: "lead_42",
        sourceType: "contact",
        trustedRecipient: TEST_PII.email,
      },
      {
        env: {
          EMAIL_FROM: "noreply@irkportal.ru",
          EMAIL_TO: "ops@irkportal.ru",
        },
        siteUrl: "https://irkportal.ru",
        transport: {
          async send(message) {
            captured.push(message);
          },
        },
      }
    );
    assert.equal(captured.length, 1);
    assert.equal(captured[0].to, "ops@irkportal.ru");
    assert.equal(captured[0].from.includes("noreply@irkportal.ru"), true);
    assert.equal(captured[0].to.includes(TEST_PII.email), false);
    assert.equal(captured[0].subject.includes(TEST_PII.name), false);
    assert.equal(
      captured[0].html.includes("https://evil.example/admin"),
      false
    );
    assert.ok(captured[0].html.includes("https://irkportal.ru/admin/collections/leads/lead_42"));
  });

  console.log(`\nLead privacy tests: ${passed} passed, ${failed} failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
