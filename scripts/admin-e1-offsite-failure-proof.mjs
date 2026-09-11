/**
 * ADMIN.E.1 — prove offsite script fails closed (non-zero) without live credentials.
 * Does not upload anywhere. Does not print secrets.
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptPosix = "scripts/backup-offsite-copy.sh";
const tmp = path.join(root, ".tmp-admin-e1-offsite-fail");
fs.mkdirSync(tmp, { recursive: true });
const dump = path.join(tmp, "fail-probe.dump");
fs.writeFileSync(dump, "admin-e1-offsite-failure-probe");
// Keep probe out of backup-health-check scan paths (.tmp-admin-e1-restore).

const gitBash = "C:\\Program Files\\Git\\bin\\bash.exe";
if (!fs.existsSync(gitBash)) {
  throw new Error("Git bash required for offsite failure proof on Windows");
}

function run(extraEnv) {
  const r = spawnSync(
    gitBash,
    ["-lc", `DUMP="$DUMP" bash ${scriptPosix}; echo __EC:$?`],
    {
      cwd: root,
      env: { ...process.env, DUMP: dump.replace(/\\/g, "/"), ...extraEnv },
      encoding: "utf8",
    }
  );
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = out.match(/__EC:(\d+)/);
  const status = m ? Number(m[1]) : r.status;
  return { status, out: out.replace(/__EC:\d+\s*$/m, "").trim() };
}

const cases = [];

{
  const r = run({});
  cases.push({
    name: "missing_OFFSITE_MODE",
    status: r.status,
    ok: r.status === 2,
    snippet: r.out.slice(0, 240),
  });
}

{
  const r = run({
    OFFSITE_MODE: "s3",
    OFFSITE_S3_BUCKET: "definitely-missing-admin-e1-xyz",
  });
  cases.push({
    name: "s3_without_aws_cli",
    status: r.status,
    ok: r.status !== 0,
    snippet: r.out.slice(0, 240),
  });
}

{
  const r = spawnSync(
    gitBash,
    ["-lc", `DUMP=".tmp-admin-e1-restore/nope.dump" bash ${scriptPosix}; echo __EC:$?`],
    { cwd: root, encoding: "utf8" }
  );
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = out.match(/__EC:(\d+)/);
  const status = m ? Number(m[1]) : r.status;
  cases.push({
    name: "missing_dump_file",
    status,
    ok: status !== 0,
    snippet: out.slice(0, 240),
  });
}

const allOk = cases.every((c) => c.ok);
const evidence = {
  at: new Date().toISOString(),
  gate: "ADMIN.E.1",
  status: allOk ? "OFFSITE_FAILURE_SIGNAL_PROVEN" : "OFFSITE_FAILURE_SIGNAL_INCOMPLETE",
  liveCopy: "NOT_LIVE",
  note: "No OFFSITE_*/AWS_* credentials available; cannot prove remote object existence.",
  cases,
};

fs.mkdirSync(path.join(root, "docs/admin/evidence"), { recursive: true });
fs.writeFileSync(
  path.join(root, "docs/admin/evidence/ADMIN_E1_OFFSITE_BACKUP.md"),
  `# ADMIN.E.1 — Offsite backup evidence\n\n## Live copy\n\n**OFFSITE BACKUP NOT LIVE**\n\n- Provider class: S3-compatible or scp (script-ready)\n- Destination: not configured in this environment\n- DB remote object: NOT PROVEN\n- Media remote object: NOT PROVEN\n- Private access: N/A until destination exists\n\n## Failure handling\n\nControlled disposable invocations prove non-zero exit when offsite cannot succeed:\n\n\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\`\n\n## Retention contract (when LIVE)\n\n- Frequency: after daily on-host dump\n- Retention: \`OFFSITE_RETENTION_DAYS\` default 14\n- S3: bucket lifecycle on \`db/\` + \`media/\` prefixes required\n- Cleanup: lifecycle (S3) / destination host find (scp)\n- Failure: script exits non-zero; must not be treated as success by cron\n`
);

console.log(evidence.status, cases.map((c) => `${c.name}=${c.status}`).join(" "));
process.exit(allOk ? 0 : 1);
