#!/usr/bin/env node
/**
 * RELEASE.1 — Rollback proof without touching production.
 *
 * Proves: release A → switch B → rollback A (pointer mode, tmpdir).
 *
 * Usage:
 *   npm run release:rollback-dry-run
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
import {
  atomicSwitchCurrent,
  createLedger,
  createReleaseDir,
  normalizeAbsolutePath,
  readCurrentTarget,
  rollbackCurrent,
  releaseDirForSha,
} from "../lib/immutable-release.mjs";

const SHA_A = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const SHA_B = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

function makeFixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "irk-rollback-proof-"));
  const legacy = path.join(root, "polezno");
  const releases = path.join(root, "polezno-releases");
  const shared = path.join(root, "polezno-shared");
  mkdirSync(legacy, { recursive: true });
  mkdirSync(releases, { recursive: true });
  mkdirSync(path.join(shared, "media"), { recursive: true });
  writeFileSync(
    path.join(legacy, "package.json"),
    JSON.stringify({ name: "polezno-pro-irkutsk", version: "0.1.0" }, null, 2)
  );
  writeFileSync(
    path.join(legacy, "package-lock.json"),
    JSON.stringify({ name: "legacy-lock", lockfileVersion: 3 }, null, 2)
  );
  writeFileSync(path.join(shared, ".env.production"), "NODE_ENV=production\n");
  writeFileSync(path.join(shared, "media", "marker.txt"), "media-ok\n");
  return { root, legacy, releases, shared };
}

function main() {
  const fx = makeFixture();
  const ledger = createLedger();
  const currentPath = path.join(fx.root, "polezno-current");
  const currentTempPath = path.join(fx.root, "polezno-current.new");
  const allowedPrefixes = [fx.root];

  try {
    const releaseA = createReleaseDir({
      releasesPath: fx.releases,
      sha: SHA_A,
      sourceDir: fx.legacy,
      allowedPrefixes,
      ledger,
    }).releaseDir;

    atomicSwitchCurrent({
      currentPath,
      currentTempPath,
      releaseDir: releaseA,
      switchMode: "pointer",
      allowedPrefixes,
      ledger,
    });

    let current = readCurrentTarget(currentPath, "pointer");
    assert.equal(
      normalizeAbsolutePath(current),
      normalizeAbsolutePath(releaseDirForSha(fx.releases, SHA_A))
    );
    console.log("1) CURRENT → release A OK");

    const releaseB = createReleaseDir({
      releasesPath: fx.releases,
      sha: SHA_B,
      sourceDir: fx.legacy,
      allowedPrefixes,
      ledger,
    }).releaseDir;

    atomicSwitchCurrent({
      currentPath,
      currentTempPath,
      releaseDir: releaseB,
      switchMode: "pointer",
      allowedPrefixes,
      ledger,
    });

    current = readCurrentTarget(currentPath, "pointer");
    assert.equal(
      normalizeAbsolutePath(current),
      normalizeAbsolutePath(releaseDirForSha(fx.releases, SHA_B))
    );
    console.log("2) CURRENT → release B OK");

    rollbackCurrent({
      currentPath,
      currentTempPath,
      previousTarget: releaseA,
      switchMode: "pointer",
      allowedPrefixes,
      ledger,
    });

    current = readCurrentTarget(currentPath, "pointer");
    assert.equal(
      normalizeAbsolutePath(current),
      normalizeAbsolutePath(releaseA)
    );
    console.log("3) ROLLBACK → release A OK");

    assert.equal(existsSync(currentTempPath), false);
    assert.ok(existsSync(path.join(releaseA)));
    assert.ok(existsSync(path.join(releaseB)));

    const proofPath = path.join(fx.root, "rollback-proof.json");
    writeFileSync(
      proofPath,
      JSON.stringify(
        {
          proven: true,
          sequence: ["A", "B", "rollback-A"],
          shaA: SHA_A,
          shaB: SHA_B,
          mutations: ledger.mutations.map((m) => m.op),
          at: new Date().toISOString(),
        },
        null,
        2
      ),
      "utf8"
    );

    console.log("\nROLLBACK DRY-RUN PROVEN");
    console.log(`fixture: ${fx.root}`);
    console.log(`ops: ${ledger.mutations.map((m) => m.op).join(" → ")}`);
    console.log(`proof: ${proofPath}`);
    // Keep proof readable in CI logs; fixture dir cleaned below after read
    console.log(readFileSync(proofPath, "utf8"));
  } finally {
    rmSync(fx.root, { recursive: true, force: true });
  }
}

main();
