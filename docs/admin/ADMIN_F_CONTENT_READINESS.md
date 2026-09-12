# ADMIN.F — Content readiness (production truth)

**Method:** public HTTPS read-only, 2026-09-12. No fake content written.

## Verdict

**CONTENT READY = NO-GO** for public commercial launch  
**SYSTEM** may still be technically deployable later — separate from content.

## Criteria

| Criterion | Production state | Blocker? | Owner action |
|---|---|---|---|
| Flagship excursion | `totalDocs=0` published API | **YES** | Create & publish real excursion |
| ≥1 real route | custom `/api/routes` → `[]` | **YES** | Publish real route with geometry |
| Real photos | `totalDocs=0` | **YES** | Publish ≥3 real photos |
| Reviews | `totalDocs=0` | **YES** / or explicit opt-out | Add real reviews or document opt-out |
| Guide profile | 1 doc; `slug=Slug`; bio/quote placeholders | **YES** | Replace placeholder with real profile |
| Contacts | telegram only; phone/email empty | WARN | Add phone and/or email if desired |
| Articles | 8 published (explore) | OK for content shelf | Keep quality |
| Privacy/contact pages | `/privacy`, `/contact` exist | OK | — |
| Demo souvenirs/AR | published demo-class products/AR | WARN | Conscious keep-or-hide decision |

## Separation

- **SYSTEM READY (partial):** admin code on feature branch; production still old SHA
- **CONTENT READY:** **NO**

Do not mark commercial launch GO until owner content pack meets `lib/admin/owner-launch-readiness.ts` critical criteria without fixtures.
