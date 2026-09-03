/**
 * Pure helpers for Gate 1H immutable release deploy (Node ESM, no secrets).
 * Used by scripts/immutable-release-deploy.mjs and fixture tests.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  lstatSync,
  readlinkSync,
  realpathSync,
} from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

export const COMMIT_SHA_FULL_PATTERN = /^[0-9a-f]{40}$/;
export const EXPECTED_PACKAGE_NAME = "polezno-pro-irkutsk";
export const LOCK_FILE_NAME = ".immutable-release-deploy.lock";

export function normalizeAbsolutePath(p) {
  if (typeof p !== "string" || p.trim() === "") {
    throw new Error("normalizeAbsolutePath: path must be a non-empty string");
  }
  const resolved = path.resolve(p.trim());
  if (resolved.length > 1 && (resolved.endsWith("/") || resolved.endsWith("\\"))) {
    return resolved.replace(/[/\\]+$/, "");
  }
  return resolved;
}

export function assertAllowedDeployPath(target, allowedPrefixes) {
  if (!Array.isArray(allowedPrefixes) || allowedPrefixes.length === 0) {
    throw new Error("assertAllowedDeployPath: allowedPrefixes must be non-empty");
  }
  const normalizedTarget = normalizeAbsolutePath(target);
  const normalizedPrefixes = allowedPrefixes.map((prefix) =>
    normalizeAbsolutePath(prefix)
  );
  const allowed = normalizedPrefixes.some((prefix) => {
    if (normalizedTarget === prefix) return true;
    const prefixWithSep = prefix.endsWith(path.sep) ? prefix : prefix + path.sep;
    return normalizedTarget.startsWith(prefixWithSep);
  });
  if (!allowed) {
    throw new Error(
      `assertAllowedDeployPath: path is outside allowed prefixes: ${normalizedTarget}`
    );
  }
}

export function isSafeReleaseDirName(name) {
  if (typeof name !== "string") return false;
  if (name.includes("/") || name.includes("\\") || name.includes("..")) {
    return false;
  }
  return COMMIT_SHA_FULL_PATTERN.test(name);
}

export function parseCliArgs(argv) {
  const out = {
    execute: false,
    expectedSha: null,
    backupId: null,
    switchMode: "symlink",
    healthPort: 3911,
    projectRoot: null,
    help: false,
  };
  const args = [...argv];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--execute") out.execute = true;
    else if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--expected-sha") {
      out.expectedSha = args[++i] ?? null;
    } else if (a.startsWith("--expected-sha=")) {
      out.expectedSha = a.slice("--expected-sha=".length);
    } else if (a === "--backup-id") {
      out.backupId = args[++i] ?? null;
    } else if (a.startsWith("--backup-id=")) {
      out.backupId = a.slice("--backup-id=".length);
    } else if (a === "--switch-mode") {
      out.switchMode = args[++i] ?? "symlink";
    } else if (a.startsWith("--switch-mode=")) {
      out.switchMode = a.slice("--switch-mode=".length);
    } else if (a === "--health-port") {
      out.healthPort = Number(args[++i]);
    } else if (a.startsWith("--health-port=")) {
      out.healthPort = Number(a.slice("--health-port=".length));
    } else if (a === "--project-root") {
      out.projectRoot = args[++i] ?? null;
    } else if (a.startsWith("--project-root=")) {
      out.projectRoot = a.slice("--project-root=".length);
    }
  }
  if (out.switchMode !== "symlink" && out.switchMode !== "pointer") {
    throw new Error(`Invalid --switch-mode: ${out.switchMode} (use symlink|pointer)`);
  }
  return out;
}

/**
 * Resolve deploy architecture roots from env (fixture-friendly).
 */
export function resolveDeployRoots(env = process.env) {
  const deployRoot = normalizeAbsolutePath(env.DEPLOY_ROOT || "/var/www");
  const legacyApp = env.LEGACY_APP || "polezno";
  const releasesDir = env.RELEASES_DIR || "polezno-releases";
  const sharedDir = env.SHARED_DIR || "polezno-shared";
  const currentName = env.CURRENT_SYMLINK || "polezno-current";

  const roots = {
    deployRoot,
    legacyPath: path.join(deployRoot, legacyApp),
    releasesPath: path.join(deployRoot, releasesDir),
    sharedPath: path.join(deployRoot, sharedDir),
    currentPath: path.join(deployRoot, currentName),
    currentTempPath: path.join(deployRoot, `${currentName}.new`),
    lockPath: path.join(deployRoot, LOCK_FILE_NAME),
    names: { legacyApp, releasesDir, sharedDir, currentName },
  };

  // All deploy mutations must stay under DEPLOY_ROOT
  for (const key of [
    "legacyPath",
    "releasesPath",
    "sharedPath",
    "currentPath",
    "currentTempPath",
    "lockPath",
  ]) {
    assertAllowedDeployPath(roots[key], [deployRoot]);
  }

  return roots;
}

export function readPackageName(projectRoot) {
  const pkgPath = path.join(projectRoot, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  return pkg.name;
}

export function assertProjectPackageName(projectRoot) {
  const name = readPackageName(projectRoot);
  if (name !== EXPECTED_PACKAGE_NAME) {
    throw new Error(
      `Package name mismatch: expected ${EXPECTED_PACKAGE_NAME}, got ${name}`
    );
  }
  return name;
}

export function assertFullSha(sha, label = "SHA") {
  if (!COMMIT_SHA_FULL_PATTERN.test(sha || "")) {
    throw new Error(`${label} must be a full 40-char lowercase hex SHA`);
  }
  return sha;
}

/**
 * Fast-forward / ancestry stub: when local git is available, require
 * expected-sha === HEAD. Callers may inject `getHeadSha` for tests.
 */
export function assertExpectedShaMatchesHead(expectedSha, options = {}) {
  assertFullSha(expectedSha, "expected-sha");
  const getHead =
    options.getHeadSha ||
    (() =>
      execSync("git rev-parse HEAD", {
        cwd: options.cwd || process.cwd(),
        encoding: "utf8",
      }).trim());
  const head = getHead();
  if (head !== expectedSha) {
    throw new Error(
      `Ancestry/preflight failed: expected-sha ${expectedSha} does not match HEAD ${head}`
    );
  }
  return true;
}

export function validateHealthPayload(body, expectedSha) {
  if (!body || typeof body !== "object") {
    return { ok: false, reason: "health body missing or not an object" };
  }
  if (body.commitSha !== expectedSha) {
    return {
      ok: false,
      reason: `commitSha mismatch: got ${body.commitSha}, expected ${expectedSha}`,
    };
  }
  if (body.identitySource !== "artifact") {
    return {
      ok: false,
      reason: `identitySource must be artifact, got ${body.identitySource}`,
    };
  }
  if (body.identityComplete !== true) {
    return { ok: false, reason: "identityComplete must be true" };
  }
  if (body.worktreeDirty !== false) {
    return { ok: false, reason: "worktreeDirty must be false" };
  }
  return { ok: true, reason: "ok" };
}

export function createLedger() {
  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    mutations: [],
    notes: [],
  };
}

export function ledgerNote(ledger, message) {
  ledger.notes.push({ at: new Date().toISOString(), message });
}

export function ledgerMutation(ledger, entry) {
  // Never record secret values
  const safe = { ...entry, at: new Date().toISOString() };
  delete safe.envContents;
  delete safe.secret;
  delete safe.password;
  delete safe.token;
  ledger.mutations.push(safe);
}

/**
 * Safe delete: only lock file or temp current pointer/symlink under deploy root.
 * Never broad recursive wipe of releases or legacy.
 */
export function safeDeleteScopedFile(targetPath, allowedPrefixes, kind) {
  assertAllowedDeployPath(targetPath, allowedPrefixes);
  const base = path.basename(targetPath);
  const allowedKinds = new Set(["lock", "current-temp"]);
  if (!allowedKinds.has(kind)) {
    throw new Error(`safeDeleteScopedFile: refused kind=${kind}`);
  }
  if (kind === "lock" && base !== LOCK_FILE_NAME) {
    throw new Error("safeDeleteScopedFile: lock basename mismatch");
  }
  if (kind === "current-temp" && !base.endsWith(".new")) {
    throw new Error("safeDeleteScopedFile: current-temp must end with .new");
  }
  if (existsSync(targetPath)) {
    rmSync(targetPath, { force: true, recursive: false });
    return true;
  }
  return false;
}

export function acquireDeployLock(lockPath, allowedPrefixes, meta = {}) {
  assertAllowedDeployPath(lockPath, allowedPrefixes);
  if (existsSync(lockPath)) {
    throw new Error(`Deploy lock already held: ${lockPath}`);
  }
  writeFileSync(
    lockPath,
    JSON.stringify(
      {
        pid: process.pid,
        createdAt: new Date().toISOString(),
        ...meta,
      },
      null,
      2
    ),
    { flag: "wx" }
  );
}

export function releaseDeployLock(lockPath, allowedPrefixes) {
  safeDeleteScopedFile(lockPath, allowedPrefixes, "lock");
}

/**
 * Read current release target (pointer file JSON/text or symlink).
 */
export function readCurrentTarget(currentPath, switchMode) {
  if (!existsSync(currentPath)) return null;
  if (switchMode === "pointer") {
    const raw = readFileSync(currentPath, "utf8").trim();
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.target === "string") {
        return normalizeAbsolutePath(parsed.target);
      }
    } catch {
      // plain path text
    }
    return normalizeAbsolutePath(raw);
  }
  const st = lstatSync(currentPath);
  if (st.isSymbolicLink()) {
    const link = readlinkSync(currentPath);
    return normalizeAbsolutePath(
      path.isAbsolute(link) ? link : path.join(path.dirname(currentPath), link)
    );
  }
  // Directory junction / real dir — resolve
  try {
    return normalizeAbsolutePath(realpathSync(currentPath));
  } catch {
    return normalizeAbsolutePath(currentPath);
  }
}

export function releaseDirForSha(releasesPath, sha) {
  assertFullSha(sha);
  if (!isSafeReleaseDirName(sha)) {
    throw new Error(`Unsafe release dir name: ${sha}`);
  }
  return path.join(releasesPath, sha);
}

/**
 * Materialize a release directory from a source tree (copy essential markers).
 * Does NOT touch legacy package-lock. Fixture/tests pass a prepared sourceDir.
 */
export function createReleaseDir({
  releasesPath,
  sha,
  sourceDir,
  allowedPrefixes,
  ledger,
  copyFn,
}) {
  assertFullSha(sha);
  const releaseDir = releaseDirForSha(releasesPath, sha);
  assertAllowedDeployPath(releaseDir, allowedPrefixes);
  assertAllowedDeployPath(releasesPath, allowedPrefixes);

  if (existsSync(releaseDir)) {
    ledgerMutation(ledger, {
      op: "release-exists",
      path: releaseDir,
      sha,
    });
    return { releaseDir, created: false };
  }

  mkdirSync(releasesPath, { recursive: true });
  assertAllowedDeployPath(releasesPath, allowedPrefixes);

  if (typeof copyFn === "function") {
    copyFn(sourceDir, releaseDir);
  } else {
    mkdirSync(releaseDir, { recursive: true });
    // Minimal release stub: identity + package marker (no secrets)
    writeFileSync(
      path.join(releaseDir, "RELEASE_SHA"),
      sha + "\n",
      "utf8"
    );
    if (sourceDir && existsSync(sourceDir)) {
      const pkgSrc = path.join(sourceDir, "package.json");
      if (existsSync(pkgSrc)) {
        writeFileSync(
          path.join(releaseDir, "package.json"),
          readFileSync(pkgSrc, "utf8")
        );
      }
    }
  }

  ledgerMutation(ledger, {
    op: "create-release-dir",
    path: releaseDir,
    sha,
  });
  return { releaseDir, created: true };
}

/**
 * Symlink shared .env.production and media into the release (no secret values logged).
 */
export function linkSharedIntoRelease({
  releaseDir,
  sharedPath,
  allowedPrefixes,
  ledger,
  symlinkImpl = symlinkSync,
}) {
  assertAllowedDeployPath(releaseDir, allowedPrefixes);
  assertAllowedDeployPath(sharedPath, allowedPrefixes);

  const envSrc = path.join(sharedPath, ".env.production");
  const mediaSrc = path.join(sharedPath, "media");
  const envDest = path.join(releaseDir, ".env.production");
  const mediaDest = path.join(releaseDir, "public", "media");

  mkdirSync(path.join(releaseDir, "public"), { recursive: true });

  if (existsSync(envSrc) && !existsSync(envDest)) {
    try {
      symlinkImpl(envSrc, envDest);
    } catch {
      // Windows without symlink privilege: copy path marker only for fixtures
      if (process.platform === "win32") {
        writeFileSync(
          envDest,
          `# linked-from-shared (pointer)\n# source=${envSrc}\n`,
          "utf8"
        );
      } else {
        throw err;
      }
    }
    ledgerMutation(ledger, {
      op: "link-shared-env",
      dest: envDest,
      // path only — never contents
      sharedEnvPresent: true,
    });
  }

  if (existsSync(mediaSrc) && !existsSync(mediaDest)) {
    try {
      symlinkImpl(mediaSrc, mediaDest, "dir");
    } catch {
      if (process.platform === "win32") {
        mkdirSync(mediaDest, { recursive: true });
        writeFileSync(
          path.join(mediaDest, ".shared-media-link"),
          mediaSrc + "\n",
          "utf8"
        );
      } else {
        throw err;
      }
    }
    ledgerMutation(ledger, {
      op: "link-shared-media",
      dest: mediaDest,
      sharedMediaPresent: true,
    });
  }

  return { envDest, mediaDest };
}

/**
 * Atomic current switch: write temp then rename over current.
 * pointer mode: JSON { target } file — works cross-platform for fixtures.
 * symlink mode: directory symlink (Linux production).
 */
export function atomicSwitchCurrent({
  currentPath,
  currentTempPath,
  releaseDir,
  switchMode,
  allowedPrefixes,
  ledger,
}) {
  assertAllowedDeployPath(currentPath, allowedPrefixes);
  assertAllowedDeployPath(currentTempPath, allowedPrefixes);
  assertAllowedDeployPath(releaseDir, allowedPrefixes);

  // Clean any leftover temp
  if (existsSync(currentTempPath)) {
    safeDeleteScopedFile(currentTempPath, allowedPrefixes, "current-temp");
  }

  if (switchMode === "pointer") {
    writeFileSync(
      currentTempPath,
      JSON.stringify({ target: normalizeAbsolutePath(releaseDir) }, null, 2),
      "utf8"
    );
  } else {
    try {
      symlinkSync(releaseDir, currentTempPath, "dir");
    } catch {
      // Fallback for environments without symlink rights
      writeFileSync(
        currentTempPath,
        JSON.stringify({ target: normalizeAbsolutePath(releaseDir) }, null, 2),
        "utf8"
      );
      ledgerNote(
        ledger,
        "symlink create failed; wrote pointer JSON for current-temp (Windows/privilege fallback)"
      );
    }
  }

  renameSync(currentTempPath, currentPath);
  ledgerMutation(ledger, {
    op: "atomic-switch",
    currentPath,
    releaseDir,
    switchMode,
  });
  return readCurrentTarget(currentPath, switchMode === "symlink" && isSymlink(currentPath) ? "symlink" : "pointer");
}

function isSymlink(p) {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

export function rollbackCurrent({
  currentPath,
  currentTempPath,
  previousTarget,
  switchMode,
  allowedPrefixes,
  ledger,
}) {
  if (!previousTarget) {
    throw new Error("rollbackCurrent: no previous target");
  }
  atomicSwitchCurrent({
    currentPath,
    currentTempPath,
    releaseDir: previousTarget,
    switchMode,
    allowedPrefixes,
    ledger,
  });
  ledgerMutation(ledger, {
    op: "rollback",
    restored: previousTarget,
  });
}

/**
 * Build a human-readable plan (dry-run).
 */
export function buildDeployPlan({
  roots,
  expectedSha,
  backupId,
  switchMode,
  execute,
  projectRoot,
}) {
  return {
    mode: execute ? "EXECUTE" : "DRY-RUN / PREFLIGHT",
    packageNameExpected: EXPECTED_PACKAGE_NAME,
    projectRoot,
    expectedSha: expectedSha || "(not set — required for --execute)",
    backupId: backupId || "(not set — required for --execute)",
    switchMode,
    roots: {
      deployRoot: roots.deployRoot,
      legacyPath: roots.legacyPath,
      releasesPath: roots.releasesPath,
      sharedPath: roots.sharedPath,
      currentPath: roots.currentPath,
      lockPath: roots.lockPath,
    },
    steps: [
      "Verify package name polezno-pro-irkutsk",
      "Verify expected-sha is full 40-char hex and matches HEAD (local ancestry stub)",
      "Acquire deploy lock under DEPLOY_ROOT",
      "Idempotent check: if current already points at SHA → verify + exit 0",
      "Create release dir under polezno-releases/<sha> (never mutate legacy package-lock)",
      "Link shared .env.production and media into release",
      "Pre-switch health on alternate localhost port",
      "Atomic current switch (temp + rename)",
      "Post-switch smoke; auto-rollback on failure",
      "Write mutation ledger artifact (no secrets)",
      "Release lock",
    ],
    safety: [
      "No broad rm -rf",
      "Only delete lock or *.new temp under allowed prefix",
      "Retention cleanup NOT included",
      "Default mode is dry-run; --execute requires --expected-sha and --backup-id",
    ],
  };
}

/**
 * Default HTTP health fetch. Override via options.healthCheck or DEPLOY_HEALTH_HOOK.
 * DEPLOY_HEALTH_HOOK: path to a .mjs that exports default async function(url, ctx).
 */
export async function defaultHealthCheck(url, ctx = {}) {
  const hook = process.env.DEPLOY_HEALTH_HOOK;
  if (hook) {
    const mod = await import(pathToFileUrl(hook));
    const fn = mod.default || mod.healthCheck;
    if (typeof fn !== "function") {
      throw new Error("DEPLOY_HEALTH_HOOK module must export default function");
    }
    return fn(url, ctx);
  }
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return { ok: false, status: res.status, body: null };
  }
  const body = await res.json();
  return { ok: true, status: res.status, body };
}

function pathToFileUrl(filePath) {
  const abs = path.resolve(filePath);
  let u = abs.replace(/\\/g, "/");
  if (!u.startsWith("/")) u = "/" + u; // Windows drive
  return `file://${u}`;
}

function detectSwitchMode(currentPath, fallback) {
  if (!existsSync(currentPath)) return fallback;
  try {
    return lstatSync(currentPath).isSymbolicLink() ? "symlink" : "pointer";
  } catch {
    return fallback;
  }
}

function extractHealthBody(result) {
  if (!result || typeof result !== "object") return result;
  if (result.body && typeof result.body === "object" && "commitSha" in result.body) {
    return result.body;
  }
  if ("commitSha" in result) return result;
  return result.body ?? result;
}

async function assertHealthOk(check, url, ctx, expectedSha, label) {
  const result = await check(url, ctx);
  const body = extractHealthBody(result);
  const validated = validateHealthPayload(body, expectedSha);
  if (result && result.ok === false) {
    throw new Error(
      `${label}: ${result.reason || validated.reason || `status ${result.status}`}`
    );
  }
  if (!validated.ok) {
    throw new Error(`${label}: ${validated.reason}`);
  }
  return body;
}

/**
 * Core deploy state machine. Injectable hooks for fixture tests.
 */
export async function runImmutableReleaseDeploy(options) {
  const {
    execute = false,
    expectedSha = null,
    backupId = null,
    switchMode = "symlink",
    healthPort = 3911,
    projectRoot = process.cwd(),
    env = process.env,
    getHeadSha,
    materializeRelease,
    startPreview, // async ({ releaseDir, port }) => handle
    stopPreview, // async (handle) => void
    healthCheck,
    ledgerPath,
    skipPackageCheck = false,
    skipAncestryCheck = false,
  } = options;

  const roots = resolveDeployRoots(env);
  const allowedPrefixes = [roots.deployRoot];
  const ledger = createLedger();
  ledger.backupId = backupId || null;
  ledger.expectedSha = expectedSha || null;
  ledger.mode = execute ? "execute" : "dry-run";

  const plan = buildDeployPlan({
    roots,
    expectedSha,
    backupId,
    switchMode,
    execute,
    projectRoot,
  });

  if (!execute) {
    return {
      status: "dry-run",
      exitCode: 0,
      plan,
      ledger,
      roots,
    };
  }

  // EXECUTE path
  if (!backupId || String(backupId).trim() === "") {
    throw new Error("--execute requires --backup-id <id>");
  }
  assertFullSha(expectedSha, "--expected-sha");

  if (!skipPackageCheck) {
    assertProjectPackageName(projectRoot);
  }
  if (!skipAncestryCheck) {
    assertExpectedShaMatchesHead(expectedSha, {
      cwd: projectRoot,
      getHeadSha,
    });
  }

  mkdirSync(roots.deployRoot, { recursive: true });
  acquireDeployLock(roots.lockPath, allowedPrefixes, {
    expectedSha,
    backupId,
  });
  ledgerMutation(ledger, { op: "acquire-lock", path: roots.lockPath });

  let previewHandle = null;
  const check = healthCheck || ((url, ctx) => defaultHealthCheck(url, ctx));
  const healthUrl = `http://127.0.0.1:${healthPort}/api/health`;

  try {
    const readMode = detectSwitchMode(roots.currentPath, switchMode);
    const currentTarget = readCurrentTarget(roots.currentPath, readMode);
    const expectedRelease = releaseDirForSha(roots.releasesPath, expectedSha);

    // Idempotent: current already on SHA
    if (
      currentTarget &&
      normalizeAbsolutePath(currentTarget) ===
        normalizeAbsolutePath(expectedRelease)
    ) {
      await assertHealthOk(
        check,
        healthUrl,
        { phase: "idempotent", expectedSha, releaseDir: expectedRelease },
        expectedSha,
        "Idempotent verify failed"
      );
      ledgerNote(
        ledger,
        "Idempotent success: current already points at expected SHA"
      );
      writeLedgerFile(ledgerPath, ledger, roots, allowedPrefixes);
      return {
        status: "idempotent-success",
        exitCode: 0,
        plan,
        ledger,
        roots,
        releaseDir: expectedRelease,
      };
    }

    // Create release (never mutates legacy package-lock)
    let releaseDir;
    if (typeof materializeRelease === "function") {
      const r = await materializeRelease({
        roots,
        sha: expectedSha,
        allowedPrefixes,
        ledger,
      });
      releaseDir = r.releaseDir;
    } else {
      const r = createReleaseDir({
        releasesPath: roots.releasesPath,
        sha: expectedSha,
        sourceDir: roots.legacyPath,
        allowedPrefixes,
        ledger,
      });
      releaseDir = r.releaseDir;
    }

    linkSharedIntoRelease({
      releaseDir,
      sharedPath: roots.sharedPath,
      allowedPrefixes,
      ledger,
    });

    const previousTarget = currentTarget;
    const effectiveMode = switchMode;

    if (typeof startPreview === "function") {
      previewHandle = await startPreview({
        releaseDir,
        port: healthPort,
        phase: "pre-switch",
      });
    }
    await assertHealthOk(
      check,
      healthUrl,
      { phase: "pre-switch", expectedSha, releaseDir },
      expectedSha,
      "Pre-switch health failed"
    );
    ledgerMutation(ledger, { op: "pre-switch-health-ok", port: healthPort });

    if (typeof stopPreview === "function" && previewHandle) {
      await stopPreview(previewHandle);
      previewHandle = null;
    }

    atomicSwitchCurrent({
      currentPath: roots.currentPath,
      currentTempPath: roots.currentTempPath,
      releaseDir,
      switchMode: effectiveMode,
      allowedPrefixes,
      ledger,
    });

    if (typeof startPreview === "function") {
      previewHandle = await startPreview({
        releaseDir,
        port: healthPort,
        phase: "post-switch",
      });
    }
    try {
      await assertHealthOk(
        check,
        healthUrl,
        { phase: "post-switch", expectedSha, releaseDir },
        expectedSha,
        "Post-switch health failed"
      );
    } catch (postErr) {
      ledgerNote(
        ledger,
        `Post-switch failure: ${postErr.message} — rolling back`
      );
      if (previousTarget) {
        rollbackCurrent({
          currentPath: roots.currentPath,
          currentTempPath: roots.currentTempPath,
          previousTarget,
          switchMode: effectiveMode,
          allowedPrefixes,
          ledger,
        });
      }
      writeLedgerFile(ledgerPath, ledger, roots, allowedPrefixes);
      throw new Error(
        `Post-switch health failed (rolled back): ${postErr.message}`
      );
    }
    ledgerMutation(ledger, { op: "post-switch-health-ok", port: healthPort });

    if (typeof stopPreview === "function" && previewHandle) {
      await stopPreview(previewHandle);
      previewHandle = null;
    }

    writeLedgerFile(ledgerPath, ledger, roots, allowedPrefixes);
    return {
      status: "switched",
      exitCode: 0,
      plan,
      ledger,
      roots,
      releaseDir,
      previousTarget,
    };
  } finally {
    if (typeof stopPreview === "function" && previewHandle) {
      try {
        await stopPreview(previewHandle);
      } catch {
        // ignore
      }
    }
    try {
      releaseDeployLock(roots.lockPath, allowedPrefixes);
      ledgerMutation(ledger, { op: "release-lock", path: roots.lockPath });
    } catch {
      // lock may already be gone
    }
  }
}

function writeLedgerFile(ledgerPath, ledger, roots, allowedPrefixes) {
  const out =
    ledgerPath ||
    path.join(
      roots.deployRoot,
      `immutable-release-ledger-${Date.now()}.json`
    );
  assertAllowedDeployPath(out, allowedPrefixes);
  writeFileSync(out, JSON.stringify(ledger, null, 2), "utf8");
  ledger.writtenTo = out;
}
