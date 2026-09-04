# GATE UX.D — Premium Visual Implementation

**Branch:** `phase15-ux-funnel-hardening`  
**Starting:** `8fa9cc85e1449f60751f53454807d5d18ee90233`  
**Audit:** `docs/UX_D_VISUAL_AUDIT.md`

## 1. Visual audit

See audit doc. Core diagnosis: functional site still read as marketplace template — boxed cards, dual equal CTAs, uniform hairlines, icon chooser grid.

## 2. Design principles applied

- **Less but better** — remove frames/icons/dual button footers; keep hierarchy.
- **Editorial** — image + type + one clear action (ghost text), not catalog tiles.
- **Rhythm** — `section-pad` / `section-pad-lg`, recessed vs quiet surfaces, uneven density.
- **Preserve UX.C** — CTA labels, forms, lead backend untouched in semantics.

## 3. Header decisions

- Brand mark: `.type-brand` (stronger weight + tracking) instead of tiny UI label.
- Descriptor quieter on xl; does not compete with primary CTA.
- «Связаться» demoted to ghost text control (no outline box).
- Primary CTA uses `.cta-primary`; taller header bar; wider nav gaps.

## 4. Typography decisions

- Onest: refined nav tracking, brand utility, body leading 1.65.
- Cormorant: hero / display / selected H2 (scenario, author, business, contact bands).
- No Cormorant on nav/buttons/forms.

## 5. Hero changes

- Stronger gradient plane + slightly brighter image.
- CTA classes `.cta-on-dark-primary|secondary`.
- Removed bounce scroll cue (calmer).
- More breathing room under title.

## 6. Card system

- `ExperienceCard` / `RouteVisualCard` → `.editorial-card`: no outer border, image reveal hover, text actions instead of dual filled buttons.
- Souvenir cards: borderless media, quieter meta, maker in meta line.
- Scenario picker: no icons, bottom hairline instead of boxes, display heading.

## 7. CTA styling

Shared utilities in `globals.css`:

- `.cta-primary` / `.cta-secondary` / `.cta-ghost`
- `.cta-on-dark-primary` / `.cta-on-dark-secondary`

Canonical labels unchanged. Business hero «Обсудить задачу» → **Обсудить программу**.

## 8. Color / surface

- Paper/ink neutrals warmed and calmed (`#F7F5F1` / `#1A1A1A`).
- Softer borders; quieter radius (`0.125rem`).
- Soft shadows lifted for media only.
- Contact / business forms: recessed surface without heavy border frame.

## 9. Mobile decisions

- Tap targets ≥44px retained on CTAs/ghosts.
- Scenario stack becomes 1-col with air.
- Header brand + hamburger hierarchy unchanged functionally.

## 10. Accessibility

- Focus-visible baikal outline preserved.
- Contrast: muted `#5E5A54` on paper.
- `prefers-reduced-motion` still disables heavy motion; image hover disabled under reduce.

## 11. Validation

- `npm run typecheck` — PASS
- `npm run lint` — 0 errors (existing warnings OK)
- `git diff --check` — PASS

## 12. Remaining work (post UX.D)

- Prelaunch / map empty chrome still denser than editorial ideal.
- Explore mosaic density vs featured still inconsistent.
- Corporate route cards on business page still dual-CTA (lower priority).
- Full visual matrix / isolated rebuild optional for UX.E release gate.
- Real photography will amplify this direction more than further chrome polish.

## Mutation ledger

- production: NO  
- master: NO  
- deploy: NO  
- UX branch: YES  
- push: NO  
