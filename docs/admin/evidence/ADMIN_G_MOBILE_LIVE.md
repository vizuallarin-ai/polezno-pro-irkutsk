# ADMIN.G — Mobile live smoke (390×844)

**Gate:** ADMIN.G  
**Viewport:** 390×844 (device metrics override)  
**Session:** authenticated Owner

## Pages

| Page | overflowX critical | Navigation usable | Notes |
|---|---|---|---|
| Dashboard `/admin` | PASS (none) | PASS (Close Menu / Account / actions) | Owner dashboard blocks visible |
| Leads | PASS | PASS | List + create reachable |
| Excursions | PASS | PASS | Empty state OK |
| Routes | PASS | PASS | Empty state OK |
| Article edit shell | PASS | PASS | Versions link visible |
| Versions detail | PASS | PASS | `Restore this version` visible, not clicked |

## Accepted limitations

- Payload English chrome (`Versions`, `Restore this version`, some `Sort by {{label}}` placeholders) — known ADMIN.F guide alignment
- Dense admin tables on narrow screens require horizontal glance inside table widgets at times; document-level `scrollWidth` stayed within viewport for checked pages
- No critical blocking modal/dropdown defects observed on primary paths

## Verdict

**MOBILE LIVE SMOKE = PASS** (no critical blocker)
