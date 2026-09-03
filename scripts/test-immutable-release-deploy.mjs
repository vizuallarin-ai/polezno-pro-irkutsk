#!/usr/bin/env node
/**
 * Local fixture tests for Gate 1H immutable release deploy.
 * Uses os.tmpdir(), --switch-mode=pointer, injectable health callbacks.
 * No production access. No secrets.
 */
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  COMMIT_SHA_FULL_PATTERN,
  normalizeAbsolutePath,
  assertAllowedDeployPath,
  isSafeReleaseDirName,
  createReleaseDir,
  linkSharedIntoRelease,
  atomicSwitchCurrent,
  readCurrentTarget,
  runImmutableReleaseDeploy,
  validateHealthPayload,
  createLedger,
  releaseDirForSha,
} from "../lib/immutable-release.mjs";

const SHA_A = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const SHA_B = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const SHA_BAD = "not-a-sha";

let passed = 0;
let failed = 0;

function test(name, fn) {
  return { name, fn };
}

async function runTest(t) {
  try {
    await t.fn();
    passed++;
    console.log(`✓ ${t.name}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${t.name}`);
    console.error(`  ${err.message || err}`);
    if (err.stack) console.error(err.stack.split("\n").slice(0, 4).join("\n"));
  }
}

function makeFixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "irk-immutable-deploy-"));
  const legacy = path.join(root, "polezno");
  const releases = path.join(root, "polezno-releases");
  const shared = path.join(root, "polezno-shared");
  mkdirSync(legacy, { recursive: true });
  mkdirSync(releases, { recursive: true });
  mkdirSync(path.join(shared, "media"), { recursive: true });
  writeFileSync(
    path.join(legacy, "package-lock.json"),
    JSON.stringify({ name: "legacy-lock", lockfileVersion: 3 }, null, 2)
  );
  writeFileSync(
    path.join(legacy, "package.json"),
    JSON.stringify({ name: "polezno-pro-irkutsk", version: "0.1.0" }, null, 2)
  );
  writeFileSync(
    path.join(shared, ".env.production"),
    "# fixture env — not a secret value for tests\nNODE_ENV=production\n"
  );
  writeFileSync(path.join(shared, "media", "marker.txt"), "media-ok\n");
  // Preserve a copy of legacy lock for drift assertion
  const lockBefore = readFileSync(path.join(legacy, "package-lock.json"), "utf8");
  return { root, legacy, releases, shared, lockBefore };
}

function healthOk(sha) {
  return {
    commitSha: sha,
    identitySource: "artifact",
    identityComplete: true,
    worktreeDirty: false,
    project: "irkportal",
  };
}

function envFor(root) {
  return {
    DEPLOY_ROOT: root,
    LEGACY_APP: "polezno",
    RELEASES_DIR: "polezno-releases",
    SHARED_DIR: "polezno-shared",
    CURRENT_SYMLINK: "polezno-current",
  };
}

const tests = [
  test("normalizeAbsolutePath + allowed prefix", () => {
    const p = normalizeAbsolutePath(path.join(os.tmpdir(), "x", "..", "y"));
    assert.ok(path.isAbsolute(p));
    const base = normalizeAbsolutePath(os.tmpdir());
    assertAllowedDeployPath(path.join(base, "child"), [base]);
    assert.throws(() =>
      assertAllowedDeployPath(path.join(base, "..", "outside"), [base])
    );
  }),

  test("isSafeReleaseDirName requires full 40 hex", () => {
    assert.equal(isSafeReleaseDirName(SHA_A), true);
    assert.equal(isSafeReleaseDirName("abc"), false);
    assert.equal(isSafeReleaseDirName(SHA_A.toUpperCase()), false);
    assert.equal(isSafeReleaseDirName("../" + SHA_A), false);
    assert.equal(COMMIT_SHA_FULL_PATTERN.test(SHA_A), true);
  }),

  test("invalid SHA rejected by validateHealth / releaseDir", () => {
    assert.equal(isSafeReleaseDirName(SHA_BAD), false);
    const v = validateHealthPayload(healthOk(SHA_A), SHA_B);
    assert.equal(v.ok, false);
  }),

  test("initial legacy state preserved (package-lock untouched)", async () => {
    const fx = makeFixture();
    try {
      const ledger = createLedger();
      createReleaseDir({
        releasesPath: fx.releases,
        sha: SHA_A,
        sourceDir: fx.legacy,
        allowedPrefixes: [fx.root],
        ledger,
      });
      const lockAfter = readFileSync(
        path.join(fx.legacy, "package-lock.json"),
        "utf8"
      );
      assert.equal(lockAfter, fx.lockBefore);
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("release creation under polezno-releases/<sha>", () => {
    const fx = makeFixture();
    try {
      const ledger = createLedger();
      const { releaseDir, created } = createReleaseDir({
        releasesPath: fx.releases,
        sha: SHA_A,
        sourceDir: fx.legacy,
        allowedPrefixes: [fx.root],
        ledger,
      });
      assert.equal(created, true);
      assert.equal(releaseDir, path.join(fx.releases, SHA_A));
      assert.ok(existsSync(path.join(releaseDir, "RELEASE_SHA")));
      assert.equal(
        readFileSync(path.join(releaseDir, "RELEASE_SHA"), "utf8").trim(),
        SHA_A
      );
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("existing release is idempotent (created=false)", () => {
    const fx = makeFixture();
    try {
      const ledger = createLedger();
      createReleaseDir({
        releasesPath: fx.releases,
        sha: SHA_A,
        sourceDir: fx.legacy,
        allowedPrefixes: [fx.root],
        ledger,
      });
      const second = createReleaseDir({
        releasesPath: fx.releases,
        sha: SHA_A,
        sourceDir: fx.legacy,
        allowedPrefixes: [fx.root],
        ledger,
      });
      assert.equal(second.created, false);
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("shared env/media linking", () => {
    const fx = makeFixture();
    try {
      const ledger = createLedger();
      const { releaseDir } = createReleaseDir({
        releasesPath: fx.releases,
        sha: SHA_A,
        sourceDir: fx.legacy,
        allowedPrefixes: [fx.root],
        ledger,
      });
      linkSharedIntoRelease({
        releaseDir,
        sharedPath: fx.shared,
        allowedPrefixes: [fx.root],
        ledger,
      });
      assert.ok(existsSync(path.join(releaseDir, ".env.production")));
      assert.ok(existsSync(path.join(releaseDir, "public", "media")));
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("invalid path outside DEPLOY_ROOT throws", () => {
    const fx = makeFixture();
    try {
      assert.throws(() =>
        assertAllowedDeployPath(path.join(os.tmpdir(), "other-place"), [
          fx.root,
        ])
      );
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("atomic pointer switch works via write-temp + rename", () => {
    const fx = makeFixture();
    try {
      const ledger = createLedger();
      const { releaseDir } = createReleaseDir({
        releasesPath: fx.releases,
        sha: SHA_A,
        sourceDir: fx.legacy,
        allowedPrefixes: [fx.root],
        ledger,
      });
      const currentPath = path.join(fx.root, "polezno-current");
      const currentTempPath = path.join(fx.root, "polezno-current.new");
      atomicSwitchCurrent({
        currentPath,
        currentTempPath,
        releaseDir,
        switchMode: "pointer",
        allowedPrefixes: [fx.root],
        ledger,
      });
      const target = readCurrentTarget(currentPath, "pointer");
      assert.equal(
        normalizeAbsolutePath(target),
        normalizeAbsolutePath(releaseDir)
      );
      assert.equal(existsSync(currentTempPath), false);
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("dry-run prints plan and exits success (no lock)", async () => {
    const fx = makeFixture();
    try {
      const result = await runImmutableReleaseDeploy({
        execute: false,
        expectedSha: SHA_A,
        backupId: "backup-fixture-1",
        switchMode: "pointer",
        projectRoot: fx.legacy,
        env: envFor(fx.root),
        skipPackageCheck: true,
        skipAncestryCheck: true,
      });
      assert.equal(result.status, "dry-run");
      assert.equal(result.exitCode, 0);
      assert.ok(result.plan.steps.length > 5);
      assert.equal(existsSync(path.join(fx.root, ".immutable-release-deploy.lock")), false);
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("preflight failure (wrong sha vs HEAD)", async () => {
    const fx = makeFixture();
    try {
      await assert.rejects(
        () =>
          runImmutableReleaseDeploy({
            execute: true,
            expectedSha: SHA_A,
            backupId: "backup-fixture-1",
            switchMode: "pointer",
            projectRoot: fx.legacy,
            env: envFor(fx.root),
            skipPackageCheck: true,
            skipAncestryCheck: false,
            getHeadSha: () => SHA_B,
          }),
        /Ancestry|does not match HEAD/
      );
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("successful switch with mocked health", async () => {
    const fx = makeFixture();
    try {
      const result = await runImmutableReleaseDeploy({
        execute: true,
        expectedSha: SHA_A,
        backupId: "backup-fixture-1",
        switchMode: "pointer",
        healthPort: 3911,
        projectRoot: fx.legacy,
        env: envFor(fx.root),
        skipPackageCheck: true,
        skipAncestryCheck: true,
        getHeadSha: () => SHA_A,
        healthCheck: async (_url, ctx) => ({
          ok: true,
          body: healthOk(ctx.expectedSha),
        }),
        ledgerPath: path.join(fx.root, "ledger-success.json"),
      });
      assert.equal(result.status, "switched");
      const current = readCurrentTarget(
        path.join(fx.root, "polezno-current"),
        "pointer"
      );
      assert.equal(
        normalizeAbsolutePath(current),
        normalizeAbsolutePath(releaseDirForSha(fx.releases, SHA_A))
      );
      // legacy lock untouched
      assert.equal(
        readFileSync(path.join(fx.legacy, "package-lock.json"), "utf8"),
        fx.lockBefore
      );
      assert.ok(existsSync(path.join(fx.root, "ledger-success.json")));
      const ledger = JSON.parse(
        readFileSync(path.join(fx.root, "ledger-success.json"), "utf8")
      );
      assert.ok(!JSON.stringify(ledger).includes("PASSWORD"));
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("failed post-switch health → rollback", async () => {
    const fx = makeFixture();
    try {
      // Seed previous current → SHA_B
      const ledger0 = createLedger();
      const prev = createReleaseDir({
        releasesPath: fx.releases,
        sha: SHA_B,
        sourceDir: fx.legacy,
        allowedPrefixes: [fx.root],
        ledger: ledger0,
      }).releaseDir;
      atomicSwitchCurrent({
        currentPath: path.join(fx.root, "polezno-current"),
        currentTempPath: path.join(fx.root, "polezno-current.new"),
        releaseDir: prev,
        switchMode: "pointer",
        allowedPrefixes: [fx.root],
        ledger: ledger0,
      });

      let postCalls = 0;
      await assert.rejects(
        () =>
          runImmutableReleaseDeploy({
            execute: true,
            expectedSha: SHA_A,
            backupId: "backup-fixture-2",
            switchMode: "pointer",
            projectRoot: fx.legacy,
            env: envFor(fx.root),
            skipPackageCheck: true,
            skipAncestryCheck: true,
            getHeadSha: () => SHA_A,
            healthCheck: async (_url, ctx) => {
              if (ctx.phase === "pre-switch") {
                return { ok: true, body: healthOk(SHA_A) };
              }
              postCalls++;
              return {
                ok: true,
                body: {
                  ...healthOk(SHA_A),
                  identityComplete: false,
                },
              };
            },
            ledgerPath: path.join(fx.root, "ledger-rollback.json"),
          }),
        /Post-switch health failed \(rolled back\)/
      );
      assert.ok(postCalls >= 1);
      const restored = readCurrentTarget(
        path.join(fx.root, "polezno-current"),
        "pointer"
      );
      assert.equal(
        normalizeAbsolutePath(restored),
        normalizeAbsolutePath(prev)
      );
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("repeat run is idempotent success", async () => {
    const fx = makeFixture();
    try {
      const opts = {
        execute: true,
        expectedSha: SHA_A,
        backupId: "backup-fixture-3",
        switchMode: "pointer",
        projectRoot: fx.legacy,
        env: envFor(fx.root),
        skipPackageCheck: true,
        skipAncestryCheck: true,
        getHeadSha: () => SHA_A,
        healthCheck: async (_url, ctx) => ({
          ok: true,
          body: healthOk(ctx.expectedSha),
        }),
        ledgerPath: path.join(fx.root, "ledger-repeat.json"),
      };
      const first = await runImmutableReleaseDeploy(opts);
      assert.equal(first.status, "switched");
      const second = await runImmutableReleaseDeploy({
        ...opts,
        ledgerPath: path.join(fx.root, "ledger-repeat-2.json"),
      });
      assert.equal(second.status, "idempotent-success");
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("execute without backup-id fails", async () => {
    const fx = makeFixture();
    try {
      await assert.rejects(
        () =>
          runImmutableReleaseDeploy({
            execute: true,
            expectedSha: SHA_A,
            backupId: null,
            switchMode: "pointer",
            projectRoot: fx.legacy,
            env: envFor(fx.root),
            skipPackageCheck: true,
            skipAncestryCheck: true,
          }),
        /backup-id/
      );
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),

  test("CLI dry-run via subprocess exits 0", async () => {
    const { spawnSync } = await import("node:child_process");
    const script = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "immutable-release-deploy.mjs"
    );
    const fx = makeFixture();
    try {
      const r = spawnSync(process.execPath, [script], {
        encoding: "utf8",
        env: { ...process.env, ...envFor(fx.root) },
      });
      assert.equal(r.status, 0, r.stderr || r.stdout);
      assert.match(r.stdout, /DRY-RUN|PREFLIGHT/i);
    } finally {
      rmSync(fx.root, { recursive: true, force: true });
    }
  }),
];

async function main() {
  console.log("Gate 1H immutable release deploy — fixture tests\n");
  for (const t of tests) {
    await runTest(t);
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
