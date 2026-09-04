#!/usr/bin/env npx tsx
/**
 * Lead pipeline security contract tests (no DB / no network).
 * Run: npm run test:leads
 */
import assert from "node:assert/strict";
import { compactLeadSchema } from "../lib/leads-schema";
import {
  checkHoneypot,
  checkMinFillTime,
  checkRateLimit,
  FORM_STARTED_FIELD,
  HONEYPOT_FIELD,
  sanitizeLeadText,
} from "../lib/lead-spam";
import { escapeHtml } from "../lib/email";
import { resolvePublicMainCta } from "../lib/cta-constants";
import { leadsCreateAccess, mediaReadAccess } from "../payload/access";

function testSanitize() {
  assert.equal(sanitizeLeadText("<b>Hi</b>"), "Hi");
  assert.equal(sanitizeLeadText("a".repeat(600))?.length, 500);
  assert.equal(sanitizeLeadText(null), undefined);
}

function testHoneypot() {
  assert.equal(checkHoneypot({ [HONEYPOT_FIELD]: "bot" }), true);
  assert.equal(checkHoneypot({ [HONEYPOT_FIELD]: "" }), false);
  assert.equal(checkHoneypot({}), false);
}

function testMinFill() {
  assert.equal(checkMinFillTime({}), true);
  assert.equal(
    checkMinFillTime({ [FORM_STARTED_FIELD]: Date.now() }),
    false
  );
  assert.equal(
    checkMinFillTime({ [FORM_STARTED_FIELD]: Date.now() - 4000 }),
    true
  );
}

function testRateLimit() {
  const ip = `test-${Date.now()}-${Math.random()}`;
  for (let i = 0; i < 5; i++) {
    assert.equal(checkRateLimit(ip), true, `hit ${i + 1} should pass`);
  }
  assert.equal(checkRateLimit(ip), false, "6th hit should fail");
}

function testCompactSchema() {
  const ok = compactLeadSchema.safeParse({
    name: "Алёна",
    contact: "+7 999 000-00-00",
    consentAccepted: true,
  });
  assert.equal(ok.success, true);

  const bad = compactLeadSchema.safeParse({
    name: "A",
    contact: "x",
  });
  assert.equal(bad.success, false);
}

function testEscapeHtml() {
  assert.equal(escapeHtml(`<script>alert("x")</script>`), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  assert.equal(escapeHtml("Tom & Jerry"), "Tom &amp; Jerry");
}

function testCtaHref() {
  // Unsafe / legacy primary CTAs remap to B2C discovery browse (/map).
  assert.equal(
    resolvePublicMainCta({ href: "javascript:alert(1)" }).href,
    "/map"
  );
  assert.equal(
    resolvePublicMainCta({ href: "/business" }).href,
    "/map"
  );
  assert.equal(
    resolvePublicMainCta({ href: "/contact" }).href,
    "/map"
  );
  assert.equal(
    resolvePublicMainCta({ href: "/map" }).href,
    "/map"
  );
}

function testAccessContracts() {
  const anon = { req: { user: null } } as never;
  assert.equal(leadsCreateAccess(anon), false);

  const mediaRule = mediaReadAccess(anon);
  assert.deepEqual(mediaRule, { visibility: { equals: "public" } });

  const admin = {
    req: { user: { role: "admin" } },
  } as never;
  assert.equal(leadsCreateAccess(admin), true);
  assert.equal(mediaReadAccess(admin), true);
}

const tests = [
  ["sanitizeLeadText", testSanitize],
  ["honeypot", testHoneypot],
  ["minFillTime", testMinFill],
  ["rateLimit", testRateLimit],
  ["compactLeadSchema", testCompactSchema],
  ["escapeHtml", testEscapeHtml],
  ["resolvePublicMainCta", testCtaHref],
  ["accessContracts", testAccessContracts],
] as const;

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`ok  ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${name}`, err);
  }
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log(`\n${tests.length} tests passed`);
