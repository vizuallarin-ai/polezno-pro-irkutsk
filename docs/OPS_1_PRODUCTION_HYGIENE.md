# GATE OPS.1 — Production Hygiene + Release Retention

## 1. Final Status

**OPS.1 CLOSED / PRODUCTION HYGIENE COMPLETE / RELEASE RETENTION ESTABLISHED / ROLLBACK PRESERVED / MEDIA SAFE / PRODUCTION SHA UNCHANGED**

---

## 2. Production Baseline

| Item | Value |
|------|-------|
| Local branch | `phase15-ux-funnel-hardening` |
| Local HEAD | `7b1012a40044d8240ba65e8c1f2c0543c6eeb63a` |
| Origin same tip | yes |
| Worktree | clean tracked; unrelated untracked local artifacts only |
| Production SHA (before & after) | `ff8e2e0a36fc4716a7834adc26076a7e588680c6` |
| `polezno-current` | `/var/www/polezno-releases/ff8e2e0a36fc4716a7834adc26076a7e588680c6` |
| PM2 | `polezno` online, cwd=`/var/www/polezno-current`, restarts=4 (unchanged during cleanup) |

---

## 3. Disk Before

```
Filesystem      Size  Used Avail Use% 
/dev/vda1        14G   12G  2.1G  85% /
```

---

## 4. Storage Breakdown

| PATH | SIZE | PURPOSE | SAFE TO REMOVE? | WHY | RISK |
|------|------|---------|-----------------|-----|------|
| `/var/www/polezno-releases/ff8e2e0…` | 1.1G | CURRENT production | **NO** | Live symlink target | Outage |
| `/var/www/polezno-releases/d6c31b6…` | 1.1G | Proven rollback (UX.F) | **NO** (keep) | Last known-good before typography | Lose rollback |
| `/var/www/polezno-releases/3d8c300…` | 1.1G | OLD (UX.E docs era) | **YES** | Not current; not needed rollback | Low — superseded |
| `/var/www/polezno` `node_modules`+`.next` | ~1.34G | Legacy mutable checkout artifacts | **YES (trim)** | PM2 does not use this cwd | Breaks only legacy local materialize that expects installed deps |
| `/var/www/polezno` git/source | ~10M after trim | Legacy clone | Keep tree | Optional future clone source | Low |
| `/var/www/polezno-shared/media` | 424K | Shared uploads | **NEVER** | Outside release lifecycle | Data loss |
| `/var/www/polezno-shared/.env.production` | ~2K | Shared secrets | **NEVER** | Runtime config | Outage/secrets |
| `/var/log/journal` | 1.4G → 165M | systemd journal | Cap/vacuum | Rebuildable ops logs | Lose deep history |
| `/root/.npm` | 587M → ~21M | npm cache | **YES** | Rebuildable | Slower next `npm ci` |
| `/var/cache/apt` | ~115M | apt cache | Partial | Rebuildable | None meaningful |
| `/root/.pm2/logs` | ~565K | App logs | Rotate only | Evidence | Low |
| `/var/lib/postgresql` | 68M | DB | **NEVER** | Live data | Catastrophic |
| Docker | n/a | Not installed | — | — | — |

---

## 5. Root Cause

Disk pressure was **not** media and **not** a single runaway log alone. Combined:

1. **3× full immutable releases** (~1.1G each, dominated by `node_modules`) = 3.3G  
2. **systemd journal** unconstrained ≈ 1.4G  
3. **Legacy `/var/www/polezno` runtime artifacts** ≈ 1.3G (unused by PM2)  
4. **npm cache** ≈ 0.6G  

Shared media was negligible (424K).

---

## 6. Release Inventory

| SHA | Class | Notes |
|-----|-------|-------|
| `ff8e2e0a36fc4716a7834adc26076a7e588680c6` | **CURRENT** | UX.D.2 Prata+Golos; health OK |
| `d6c31b69304cdc213500bf8ff261b64cf5b78ac1` | **PROVEN ROLLBACK** | UX.F content activation; `.next`, `node_modules`, media+env links present |
| `3d8c3002440bc89542fb519709368acbfde53be6` | **OLD** | Deleted in OPS.1 |

No INCOMPLETE/UNKNOWN dirs remained after inventory.

---

## 7. Retention Decision

**Policy:** keep **CURRENT + 1 proven previous** (= 2 release directories).

Rationale:

- Each release ≈ **1.1G**; VPS root is **14G**  
- With 2 releases (~2.2G) + OS, headroom remains for **one new build**  
- Deployment frequency is gated / infrequent → 2 dirs is enough  
- Prefer stricter than “current+2” while disk is small  

```
KEEP:   current + previous proven-good
DELETE: older completed SHA release dirs
NEVER:  shared media, shared env, DB, active current
```

Script: `scripts/ops-release-retention.sh` (`KEEP=2`, dry-run default; `EXECUTE=1` to delete).

---

## 8. Deleted Releases

Exact path removed:

```
/var/www/polezno-releases/3d8c3002440bc89542fb519709368acbfde53be6
```

Pre-checks: not `polezno-current`; media only via shared symlink; no unique user data inside.

---

## 9. Logs / Cache

| Action | Result |
|--------|--------|
| `journalctl` vacuum + `SystemMaxUse=200M` drop-in | Journal **165M**; conf: `/etc/systemd/journald.conf.d/99-irkportal-size.conf` |
| `npm cache clean --force` | `/root/.npm` ~587M → ~21M (pm2 module install left small cache) |
| `apt-get clean` | archives already tiny |
| `pm2-logrotate` installed | max_size **10M**, retain **7**, compress **true** |
| PM2 app logs | ~565K — not truncated (no incident wipe) |

---

## 10. Media Safety

- All releases link `public/media` → `/var/www/polezno-shared/media`  
- Shared media untouched (424K; files still present)  
- Current + rollback both have valid media symlinks  
- Turbopack rule documented: **symlink AFTER `next build`**

---

## 11. Disk After

```
Filesystem      Size  Used Avail Use% 
/dev/vda1        14G  7.3G  6.2G  55% /
```

Releases left: `ff8e2e0…` + `d6c31b6…` only (~2.2G).

---

## 12. Space Freed

| Metric | Value |
|--------|-------|
| Before used | 12G (85%) |
| After used | 7.3G (55%) |
| Freed | **~4.7G** |
| Free now | **6.2G** |
| Percentage points | **−30 pp** |

Further deletion would require removing the rollback release or OS packages — **not safe**. Target ≤70–75% **met** (55%).

---

## 13. Required Deploy Headroom

| Item | Estimate |
|------|----------|
| New release tree (`node_modules`+`.next`) | ~1.1G |
| Build scratch / npm temp | ~0.3–0.5G |
| **Minimum free before deploy** | **≥ 1.5–2.0G** |
| **Comfortable free** | **≥ 3.0G** |

Current free **6.2G** → next content release can build safely.

---

## 14. Rollback Proof

Verified **without** switching production:

| Check | `d6c31b6…` |
|-------|------------|
| Directory exists | yes |
| `git HEAD` | `d6c31b69304cdc213500bf8ff261b64cf5b78ac1` |
| `.next` + `BUILD_ID` | yes (`_EjxJhxSNtiKP_ATQEbQO`) |
| `node_modules/next` | yes |
| `.env.production` → shared | yes |
| `public/media` → shared | yes |

Rollback procedure: atomic retarget `polezno-current` + `pm2 restart` (see runbook). **Not executed** (production remains `ff8e2e0`).

---

## 15. Media Symlink Procedure

1. Release checkout  
2. Link shared `.env.production`  
3. **Remove** `public/media` if present  
4. `npm ci` + `next build` (+ identity write)  
5. `ln -sfn /var/www/polezno-shared/media public/media`  
6. Switch `polezno-current` + PM2 restart  
7. Smoke  

Do **not** “fix” Turbopack in OPS.1 — workaround is operational.

---

## 16. Retention Automation

- Added **manual/post-deploy** script: `scripts/ops-release-retention.sh`  
- Default dry-run; requires `EXECUTE=1`  
- Never deletes current; requires shared media present  
- **Not** hard-wired into `immutable-release-deploy.mjs` (that tool still says retention not included) — lower risk than changing the execute state machine mid-content freeze  
- Runbook instructs: after successful deploy, run retention with `KEEP=2`

---

## 17. Runbook Changes

Created: [`docs/OPS_1_PRODUCTION_RUNBOOK.md`](./OPS_1_PRODUCTION_RUNBOOK.md)

Sections: DISK CHECK, DEPLOY, MEDIA SYMLINK, ROLLBACK, RELEASE RETENTION, LOG CHECK, SMOKE.

---

## 18. Files Changed

| File | Change |
|------|--------|
| `docs/OPS_1_PRODUCTION_HYGIENE.md` | This report |
| `docs/OPS_1_PRODUCTION_RUNBOOK.md` | Concrete VPS runbook |
| `scripts/ops-release-retention.sh` | Safe retention helper |

**No application / UX / typography / content / CTA / routing code changed.**

---

## 19. Production Smoke

| Check | Result |
|-------|--------|
| `/api/health` SHA | `ff8e2e0…` unchanged |
| `/` `/explore` `/about` `/contact` `/map` `/routes` | 200 |
| PM2 `polezno` | online, same pid family, no cleanup-induced restart of app process |
| Media shared | intact |
| HTML classes | `prata_` + `golos_text_` present; Cormorant/Onest absent |
| Symlink | still `ff8e2e0…` |

---

## 20. Remaining Risks

- Next deploy still needs ~1.1G free **during** build; run `df` first  
- Legacy `/var/www/polezno` remains as thin git tree — do not assume `npm start` works there without reinstall  
- Journal history depth reduced by design (200M cap)  
- `pm2-logrotate` added as PM2 module — save PM2 process list if not already (`pm2 save`) on next maintenance window  
- Small VPS (14G): if media grows large later, disk math changes — monitor shared media

---

## 21. Definition of Done Evidence

| # | Status |
|---|--------|
| 1 Root cause | DONE §5 |
| 2 Releases classified | DONE §6 |
| 3 Current saved | DONE |
| 4 Rollback saved + proven | DONE §14 |
| 5 Old releases cleaned | DONE `3d8c300` |
| 6 Media safe | DONE §10 |
| 7 Logs/caches | DONE §9 |
| 8 Disk reduced | DONE 85%→55% |
| 9 Deploy headroom | DONE 6.2G free |
| 10 Retention policy | DONE §7 |
| 11 Media-after-build docs | DONE §15 + runbook |
| 12 Rollback path | DONE |
| 13 SHA unchanged | DONE `ff8e2e0` |
| 14 Smoke PASS | DONE §19 |
| 15 No product code change | DONE |
| 16 Runbook | DONE |

---

## 22. Recommended Next Action

Do **not** start UX.G.

Wait for **OWNER CONTENT PACK**:

- 1 excursion  
- 2 routes  
- real reviews  
- real photos  
- Site Settings  
- commercial experience parameters  

Before that content deploy: `df -h` (≥3G free preferred) → follow `OPS_1_PRODUCTION_RUNBOOK.md` → after success `KEEP=2 EXECUTE=1 bash scripts/ops-release-retention.sh`.
