# ADMIN.A — Remediation Roadmap (ADMIN.B–F)

**Date:** 2026-09-11  
**Rule:** Do not start the next gate without explicit approval.  
**Dependency spine:** ADMIN.B → (C ∥ D early) → E → F; CONTENT.1 remains parallel owner-gated.

```
ADMIN.A (this audit) ──► ADMIN.B IA/simplify
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
           ADMIN.C      ADMIN.D        CONTENT.1
         Dashboard      Lead CRM     (owner pack)
              │             │             │
              └──────┬──────┘             │
                     ▼                    │
                  ADMIN.E safety/roles/guide
                     │                    │
                     └────────┬───────────┘
                              ▼
                           ADMIN.F owner acceptance
```

---

## ADMIN.B — Information Architecture & CMS Simplification

| | |
|--|--|
| **Goal** | Owner opens `/admin` and understands a business workspace, not a schema dump |
| **In scope** | Menu groups + RU labels; rename Материалы→Статьи; unhide Reviews/Guides with safe draft/status; hide Places/Partners/Navigation from Owner; help texts; auto-slug; price XOR validation; fix excursion revalidate paths; hide unused/legacy fields; clarify article publish controls; document or relocate `/api/routes` collision |
| **Out of scope** | Full CRM fields; new dashboard widgets beyond light tweaks; owner content ingest; payments |
| **Deps** | ADMIN.A |
| **Risks** | Access changes on reviews/guides; route API rename needs frontend consumers update |
| **Acceptance** | Owner menu matches target IA; reviews/guides reachable; cannot publish excursion without price mode; publish revalidates `/excursions/[slug]` + `/map`; no orphan collections in Owner nav |
| **Tests** | typecheck/lint; access unit tests; staging publish smoke; REST anonymous cannot read draft reviews |
| **Complexity** | L |
| **Order** | **First implementation gate** |

---

## ADMIN.C — Owner Dashboard & Guided Workflows

| | |
|--|--|
| **Goal** | After login, owner knows what to do today |
| **In scope** | Dashboard attention list; quick actions; readiness checklist; preview guidance; optional excursion/photo lightweight wizards; «Open site» |
| **Out of scope** | Heavy analytics; rebuilding Payload list views entirely |
| **Deps** | ADMIN.B (labels/groups/readiness fields) |
| **Risks** | Over-customization debt |
| **Acceptance** | Empty commercial shelves show actionable empty states; one-click create paths work |
| **Tests** | Component/render tests if present; staging walkthrough checklist |
| **Complexity** | M–L |
| **Order** | After B; can overlap early D |

---

## ADMIN.D — Lead CRM

| | |
|--|--|
| **Goal** | Leads become a mini sales desk for one guide |
| **In scope** | Status vocabulary (owner-approved); `nextContactAt`; notes; overdue filter; notify health; delete guards; optional Telegram; history lite |
| **Out of scope** | Multi-user assignment; marketing automation; payment CRM; external CRM sync |
| **Deps** | ADMIN.B helpful; can start after A with care |
| **Risks** | Status migration; notification secrets |
| **Acceptance** | Owner processes New→…→Done without spreadsheets; overdue visible; notify path proven on staging |
| **Tests** | Existing lead security/privacy tests + new field validation; staging E2E form→admin |
| **Complexity** | M |
| **Order** | Parallel or right after B |

---

## ADMIN.E — Safety, Roles, Recovery & Owner Guide

| | |
|--|--|
| **Goal** | Mistakes are recoverable; roles match reality; owner has a plain-Russian guide |
| **In scope** | Versions/drafts on core collections; archive-first delete; Owner/Editor/Developer access; tighten public REST reads; offsite backup ops closeout with owner-facing “when to call”; `ADMIN_GUIDE_OWNER.ru.md`; password-reset path documented |
| **Out of scope** | Full SOC2 program; rewriting auth |
| **Deps** | B (+ ideally C/D field stability) |
| **Risks** | Enabling versions = schema/migrate — needs careful prod plan |
| **Acceptance** | Restore from version on staging; editor role behaves as designed or removed; guide reviewed by non-dev reader |
| **Tests** | Access matrix tests; backup restore dry-run evidence |
| **Complexity** | L–XL |
| **Order** | After B; before F |

---

## ADMIN.F — Non-Technical Owner Acceptance

| | |
|--|--|
| **Goal** | Owner completes real tasks alone |
| **In scope** | Scripted tasks: publish draft excursion (staging or after CONTENT), handle test lead, add review, update contacts, find overdue; tablet check; scorecard |
| **Out of scope** | New features mid-acceptance (bugs only) |
| **Deps** | B–E; enough real or staging content (**OWNER CONTENT** / CONTENT.1) |
| **Risks** | Scheduling with owner; prod write policy |
| **Acceptance** | Owner success ≥ agreed tasks without developer voice/chat; residual issues logged |
| **Tests** | Observed acceptance session notes (anonymized) |
| **Complexity** | M |
| **Order** | Last |

---

## Parallel: CONTENT.1 (not renamed, still blocking commercial truth)

Admin UX improvements **do not replace** owner pack. Without real excursion/route/photos/reviews/settings, ADMIN.F on production commercial paths stays limited. Prefer staging for publish drills if pack still absent.

---

## Suggested sequencing (calendar-agnostic)

1. **ADMIN.B** (unblock clarity + dangerous publish/cache bugs)  
2. **ADMIN.D** thin CRM (daily money path) in parallel with **ADMIN.C** dashboard  
3. **ADMIN.E** safety/roles/guide/backup  
4. **CONTENT.1** when pack signed  
5. **ADMIN.F** acceptance  

---

## Stop rule

After ADMIN.A: **stop**. Await explicit approval before ADMIN.B implementation.
