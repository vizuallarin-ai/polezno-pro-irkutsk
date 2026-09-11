/**
 * ADMIN.E unit checks: roles, access matrix predicates, delete guards, article sync.
 * Run: npx tsx scripts/test-admin-e-access.ts
 */
import assert from "node:assert/strict";
import {
  adminPanelAccess,
  canHardDelete,
  canManageContent,
  canManageLeads,
  canManageUsers,
  contentDeleteAccess,
  isContentEditor,
  isDeveloper,
  isOwner,
  isOwnerOrDeveloper,
  leadsCreateAccess,
  leadsDeleteAccess,
  makerReadAccess,
  mediaDeleteAccess,
} from "../payload/access";
import { articleStatusSyncBeforeChange } from "../payload/hooks/article-status-sync";
import {
  createContentDeleteGuard,
  leadsBeforeDeleteGuard,
} from "../payload/hooks/delete-guards";
import { ROLE_OPTIONS, roleOf } from "../payload/roles";
import { ARTICLE_VERSIONS, CONTENT_VERSIONS, GLOBAL_VERSIONS } from "../payload/versioning";

let passed = 0;

async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (err) {
    console.error(`FAIL ${name}`);
    throw err;
  }
}

async function main() {
  await check("role options cover target model", () => {
    assert.deepEqual(
      ROLE_OPTIONS.map((o) => o.value).sort(),
      ["admin", "developer", "editor"]
    );
    assert.equal(roleOf({ role: "admin" }), "admin");
    assert.equal(roleOf({ role: "nope" as never }), null);
  });

  await check("role predicates", () => {
    const owner = { req: { user: { role: "admin" } } } as never;
    const editor = { req: { user: { role: "editor" } } } as never;
    const developer = { req: { user: { role: "developer" } } } as never;
    const anon = { req: { user: null } } as never;

    assert.equal(isOwner(owner), true);
    assert.equal(isContentEditor(editor), true);
    assert.equal(isDeveloper(developer), true);
    assert.equal(isOwnerOrDeveloper(editor), false);
    assert.equal(adminPanelAccess(editor), true);
    assert.equal(adminPanelAccess(anon), false);
    assert.equal(canManageContent(editor), true);
    assert.equal(canManageLeads(editor), false);
    assert.equal(canManageLeads(owner), true);
    assert.equal(canManageUsers(editor), false);
    assert.equal(canHardDelete(owner), false);
    assert.equal(canHardDelete(developer), true);
    assert.equal(leadsCreateAccess(editor), false);
    assert.equal(leadsDeleteAccess(owner), false);
    assert.equal(leadsDeleteAccess(developer), true);
    assert.equal(mediaDeleteAccess(editor), false);
    assert.equal(contentDeleteAccess(editor), true);
  });

  await check("maker public read matches placement gate", () => {
    const anon = { req: { user: null } } as never;
    assert.deepEqual(makerReadAccess(anon), {
      and: [
        { status: { equals: "published" } },
        { placementStatus: { equals: "active" } },
      ],
    });
  });

  await check("article status sync", () => {
    const published = articleStatusSyncBeforeChange({
      data: { status: "published", title: "T" },
      originalDoc: { status: "draft" },
    } as never);
    assert.equal((published as { _status: string })._status, "published");

    const archived = articleStatusSyncBeforeChange({
      data: { status: "archived" },
      originalDoc: { status: "published", _status: "published" },
    } as never);
    assert.equal((archived as { _status: string })._status, "draft");
  });

  await check("leads delete guard blocks owner", async () => {
    await assert.rejects(
      () =>
        leadsBeforeDeleteGuard({
          req: { user: { role: "admin" } },
        } as never),
      /Заявки не удаляются/
    );
  });

  await check("content delete guard blocks published for owner", async () => {
    const guard = createContentDeleteGuard();
    await assert.rejects(
      () =>
        guard({
          id: 1,
          collection: { slug: "excursions" },
          req: {
            user: { role: "admin" },
            payload: {
              findByID: async () => ({ status: "published" }),
            },
          },
        } as never),
      /опубликованный/
    );
  });

  await check("version retention constants are finite", () => {
    assert.equal(CONTENT_VERSIONS.maxPerDoc, 25);
    assert.equal(ARTICLE_VERSIONS.maxPerDoc, 40);
    assert.equal(GLOBAL_VERSIONS.max, 25);
    assert.ok(ARTICLE_VERSIONS.drafts);
  });

  await check("content delete guard allows archived for owner", async () => {
    const guard = createContentDeleteGuard();
    await guard({
      id: 2,
      collection: { slug: "excursions" },
      req: {
        user: { role: "admin" },
        payload: {
          findByID: async () => ({ status: "archived" }),
        },
      },
    } as never);
  });

  await check("developer bypasses content delete guard", async () => {
    const guard = createContentDeleteGuard();
    await guard({
      id: 3,
      collection: { slug: "excursions" },
      req: {
        user: { role: "developer" },
        payload: {
          findByID: async () => ({ status: "published" }),
        },
      },
    } as never);
  });

  await check("editor cannot manage leads or users", () => {
    const editor = { req: { user: { role: "editor" } } } as never;
    assert.equal(canManageLeads(editor), false);
    assert.equal(canManageUsers(editor), false);
    assert.equal(leadsCreateAccess(editor), false);
  });

  console.log(`\nADMIN.E access checks passed: ${passed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
