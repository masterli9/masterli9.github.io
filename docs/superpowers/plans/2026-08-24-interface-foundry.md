# Interface Foundry Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current portfolio visual system with the approved Interface Foundry direction: black-led, flat, spacious, typographic sections connected by one compact recurring SVG assembly cell, while preserving the existing navbar name transition, cursor-following square, content truth, anchors, language switching, project modal, and contact flow.

**Architecture:** Keep the existing React/Vite page entry point and existing behavioral components, but introduce a small design-system layer and reusable SVG primitives. `home_impl.tsx` remains the composition root for the one-page experience. New visual sections (`Hero`, `Statement`, `SelectedWork`) consume shared primitives and translation keys; existing About, Skills, Experience, Goals, Contact, Header, modal, cookie, and footer behavior is retained and restyled. Project data is centralized so Selected Work and the existing modal cannot drift apart.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, Fontsource Instrument Sans, inline SVG, existing EmailJS contact integration.

**Spec:** `docs/superpowers/specs/2026-08-24-interface-foundry-design.md`

## Global Constraints

- Preserve all existing user changes. Start implementation by recording `git status` and a baseline `npm run build`/`npm run lint`; never reset, checkout, or overwrite unrelated work.
- Stage only files belonging to the current task when making implementation checkpoints. Do not commit the existing `.impeccable/`, `screenshot.cjs`, or unrelated user changes unless explicitly requested.
- Keep `src/App.tsx` rendering `CursorFollower`; preserve the cursor follower's square-following behavior and only adjust its colors/sizing if needed for the new flat palette.
- Preserve the Header `layoutId="shared-name"` contract so the existing name transition continues to work between hero and navbar.
- Preserve the existing anchor IDs and behavioral contracts: navigation, language switcher, project modal, privacy modal, cookie consent, EmailJS submission, honeypot field, and external project links.
- Do not introduce glow, `box-shadow`, gradients, glassmorphism, decorative noise, automatic uppercase, generic pill tags, or card-grid presentation as a substitute for hierarchy.
- Use the design tokens from the spec: `#050505`, `#F7F7F5`, `#F21868`, `#355CFF`, and `#777777`. One saturated accent should dominate a viewport.
- Use Instrument Sans bundled through Fontsource. Do not add a dependency on Usual or Adobe Creative Cloud.
- All new animation must use transform, opacity, or stroke changes only; honor `prefers-reduced-motion` and Framer Motion's `useReducedMotion` behavior.
- Keep mobile in one column without horizontal overflow. The assembly cell may simplify on mobile, but it must remain visible.
- After each task, run at least `npm run build` and `npm run lint` unless the task only changes documentation. For visual tasks, also perform the task-specific browser check described below.

---

## Task 1: Establish the new tokens, font, and flat global surface

**Files:**

- Modify `package.json`
- Modify `package-lock.json`
- Modify `src/main.tsx`
- Modify `src/index.css`
- Modify `src/components/Layout.tsx`
- Modify `src/App.tsx`
- Modify `src/styles/animations.css`

**Interfaces:**

- Font loading remains a side-effect import from `src/main.tsx`.
- Existing component class names may be migrated to semantic tokens, but no component behavior changes in this task.

**Steps:**

- [ ] Confirm the baseline and active entry point with `git status`, `Get-Content src/App.tsx`, and `Get-Content src/pages/home_impl.tsx`; record that `src/pages/home_impl.tsx` is active and `src/pages/home.tsx` is not imported.
- [ ] Replace the Outfit dependency/import with `@fontsource/instrument-sans`, importing weights 400, 500, 600, and 700 from `src/main.tsx`; verify no source file still imports Outfit.
- [ ] Replace the old neon/glow-oriented color aliases in `src/index.css` with semantic tokens for ink black, soft white, signal pink, cobalt blue, line gray, and muted text; expose equivalent Tailwind theme values so existing utility classes can migrate incrementally.
- [ ] Set the global body background to ink black, text to soft white, selection to signal pink with ink-black text, and remove the visible `noise-overlay` layer from `App.tsx` so the surface stays flat.
- [ ] Remove obsolete gradient, shadow, skew, marquee, and old visual-effect utilities from `src/index.css`; retain only utilities that are still referenced after the redesign.
- [ ] Replace the old generic animation helpers in `src/styles/animations.css` with shared reduced-motion-safe primitives for reveal, line draw, and assembly state classes. Do not add bounce or elastic easing.
- [ ] Update `Layout.tsx` to use the new page surface and selection tokens without changing its children or scroll behavior.
- [ ] Run `npm run build` and `npm run lint`; use `Select-String` to confirm no `glow`, `shadow`, `gradient`, or `noise-overlay` class remains in the active page path.

**Checkpoint:** `git add` only the task files and create a checkpoint commit named `style: establish interface foundry tokens` after verifying the diff contains no unrelated changes.

---

## Task 2: Build the reusable Interface Foundry SVG system

**Files:**

- Add `src/components/AssemblyCell.tsx`
- Add `src/components/assembly/assembly.css`
- Add `src/components/FoundryTrace.tsx`
- Modify `src/index.css` only for shared token usage if required

**Interfaces:**

```ts
export type AssemblyCellMode =
  | 'hero'
  | 'selected-work'
  | 'trace'
  | 'queue'
  | 'static';

export interface AssemblyCellProps {
  mode?: AssemblyCellMode;
  className?: string;
  labelledBy?: string;
}

export interface FoundryTraceProps {
  variant?: 'rail' | 'module' | 'frame' | 'inspection';
  className?: string;
  ariaHidden?: boolean;
}
```

**Steps:**

- [ ] Implement `FoundryTrace` as the shared flat SVG primitive layer: short rail, square/capsule module, output frame, and inspection square. Use `currentColor` or explicit token classes; do not encode gradients, filters, or shadows in the SVG.
- [ ] Implement `AssemblyCell` as a compact, bounded SVG assembly cell containing one short rail, two or three modules, one transfer mechanism, and one simple output frame. Keep the desktop width around one quarter to one third of the hero viewport and prevent the component from becoming a full-width illustration.
- [ ] Give `AssemblyCell` a real accessible label when `labelledBy` is supplied and `aria-hidden="true"` only for decorative usages. Keep the static output meaningful without relying on animation.
- [ ] Implement the autonomous loop in Framer Motion: module arrival, alignment, insertion, output activation, pause, and repeat. Use stable keyframes/transforms and opacity/stroke changes only; keep the sequence slow and restrained.
- [ ] Use `useReducedMotion()` to render a stable assembled state and suppress the loop when reduced motion is requested. Do not make the cell disappear on mobile or reduced-motion settings.
- [ ] Add mode-specific CSS so `hero` is compact and legible, `selected-work` can frame a real project preview, `trace` is a single subtle rail/module, `queue` supports a small sequence of modules, and `static` has no animation.
- [ ] Render the component in a temporary local route or a minimal existing section for verification, then run `npm run build` and `npm run lint` and inspect that the SVG has no filter, gradient, or excessive width.

**Checkpoint:** `git add` only the new assembly files and create `feat: add interface foundry svg primitives`.

---

## Task 3: Replace the active page composition with the black-led narrative

**Files:**

- Add `src/components/Hero.tsx`
- Add `src/components/Statement.tsx`
- Modify `src/pages/home_impl.tsx`
- Modify `src/i18n/translations.ts`
- Modify `src/components/Header.tsx`

**Interfaces:**

- `Hero` renders the existing `layoutId="shared-name"` name and exposes the existing hero CTA destinations.
- `Statement` accepts no project/business data; it consumes translated statement copy and renders a `FoundryTrace`.
- Keep the existing Header prop/context contract and mobile menu behavior unchanged.

**Steps:**

- [ ] Extract the hero markup from `home_impl.tsx` into `Hero.tsx`; keep the hero name in title case, use a restrained heading scale, and place the short role line, two existing CTA actions, and `AssemblyCell mode="hero"` in the approved asymmetrical desktop layout.
- [ ] Add translated keys for the hero role/description and Statement label, headline, and supporting text in both Czech and English. Keep the copy concise and do not hard-code language-specific UI strings in components.
- [ ] Add `Statement.tsx` as a mostly empty black section with one narrow text measure, one strong headline, one short paragraph, and a single `FoundryTrace variant="rail"`; no card, panel, or second large illustration.
- [ ] Recompose `home_impl.tsx` in this order and with these existing anchors: `Hero`, `Statement`, `SelectedWork` at `projects`, About/Profile at `about`, Skills/Capabilities at `skills`, Experience at `experience`, Goals/Contact at `goals` and `contact`, then Footer.
- [ ] Preserve the existing `Layout` wrapper and `CookieBanner`; preserve all anchor navigation destinations used by Header.
- [ ] Restyle Header to a flat, quiet navigation bar with the existing name transition, no floating glass surface, no shadow, and no automatic uppercase. Keep mobile menu open/close and language controls functional.
- [ ] Run `npm run build` and `npm run lint`, then use the dev server to inspect a 1440px desktop screenshot: hero text must not dominate the whole viewport, assembly cell must stay narrow on the right, and black must clearly outweigh white above the fold.

**Checkpoint:** `git add` only composition, header, and translation files and create `feat: compose black-led foundry page`.

---

## Task 4: Centralize project data and implement Selected Work with The GT Series first

**Files:**

- Add `src/data/projects.ts`
- Add `src/components/ProjectIcon.tsx`
- Add `src/components/SelectedWork.tsx`
- Modify `src/components/Projects.tsx`
- Modify `src/components/ProjectModal.tsx`
- Modify `src/i18n/translations.ts`

**Interfaces:**

```ts
export type ProjectIconName = 'mobile' | 'web';

export interface ProjectRecord {
  id: 'gt-series' | 'rehearsal-hub';
  title: 'The GT Series' | 'RehearsalHub';
  type: 'mobile' | 'web';
  icon: ProjectIconName;
  translationKey: 'gtSeries' | 'rehearsalHub';
  technologies: string[];
  images: string[];
  href: string;
  featured: boolean;
}

export const projects: readonly ProjectRecord[] = [...];
```

**Steps:**

- [ ] Move the existing GT Series and RehearsalHub content, image paths, technologies, and links into `src/data/projects.ts`; keep the current visible content and `thegtseries.com` URL unchanged.
- [ ] Replace React-node icon data with `ProjectIcon` mapping from `ProjectIconName`, so data remains serializable and both Selected Work and the modal use the same record.
- [ ] Implement `SelectedWork.tsx` as a black, non-card composition: left metadata/title/description/link and right GT Series preview inside a thin frame that visually echoes `AssemblyCell mode="selected-work"`. Do not render a two-card grid.
- [ ] Make The GT Series the first and only featured output in this section; keep RehearsalHub available through the existing project flow without visually duplicating the featured presentation.
- [ ] Refactor `Projects.tsx` and `ProjectModal.tsx` to consume `projects` and preserve current modal open, close, carousel, image, link, and keyboard behavior.
- [ ] Add the Selected Work section label and any project metadata keys to both translations; keep project descriptions localized as they are today.
- [ ] Run `npm run build` and `npm run lint`; manually verify clicking the GT Series link opens the existing external destination and opening a project still shows the modal with its images.

**Checkpoint:** `git add` only project data, Selected Work, project UI/modal, and related translations and create `feat: present gt series as selected work`.

---

## Task 5: Rework the white typographic zones: Profile, Capabilities, and Experience

**Files:**

- Modify `src/components/About.tsx`
- Modify `src/components/Skills.tsx`
- Modify `src/components/Experience.tsx`
- Add `src/components/SectionLabel.tsx` if the repeated label pattern is not already present
- Modify `src/i18n/translations.ts` only for missing labels

**Interfaces:**

```ts
export interface SectionLabelProps {
  index: string;
  children: React.ReactNode;
  tone?: 'dark' | 'light';
}
```

**Steps:**

- [ ] Convert About/Profile to a soft-white section with black text, narrow reading measure, asymmetric columns, and large whitespace. Keep the existing biography and personal fields; remove cards and heavy borders.
- [ ] Convert Skills/Capabilities to typographic grouped lists or a precise two-column list. Replace generic pill tags with flat text rows, short line separators, or compact modules only where they communicate a real skill group.
- [ ] Restyle Experience as a white content section with a thin construction axis/rail and calm rows. Keep dates, roles, organizations, and links; ensure the rail remains secondary to readable text.
- [ ] Use `SectionLabel` for consistent numbered labels without forcing uppercase; keep label sizing small and letter-spacing restrained.
- [ ] Add one or two subtle `FoundryTrace` primitives across the white group, not a full assembly cell and not a decorative illustration per section.
- [ ] Check contrast for all white-section text and muted labels against `#F7F7F5`; do not use the pink accent for large body copy.
- [ ] Run `npm run build` and `npm run lint`, then inspect a desktop and narrow mobile screenshot for reading width, vertical rhythm, and absence of pill/card styling.

**Checkpoint:** `git add` only white-zone components, shared section label, and necessary translations and create `style: make content zones typographic`.

---

## Task 6: Rebuild the black Goals and Contact closing sequence

**Files:**

- Modify `src/components/Goals.tsx`
- Modify `src/components/ContactForm.tsx`
- Modify `src/components/Footer.tsx`
- Modify `src/components/PrivacyModal.tsx`
- Modify `src/i18n/translations.ts` only for missing closing labels

**Interfaces:**

- Keep the current `ContactForm` EmailJS submit contract, input names (`from_name`, `reply_to`, `subject`, `message`), required fields, `website_url` honeypot, status handling, and reset behavior.
- Keep Footer links and privacy/cookie modal trigger behavior.

**Steps:**

- [ ] Rebuild Goals as a black production queue: three compact text rows or modules with existing goal content, one `FoundryTrace variant="queue"`, and generous spacing. Remove the current oversized card treatment.
- [ ] Rebuild Contact as the final black request area. Use a simple line-based form with labels, no panel background, no shadow, and a clear signal-pink submit action; preserve all EmailJS behavior.
- [ ] Add visible `<label>` elements associated with every form control while retaining any existing placeholders as secondary hints; keep focus states visible with a flat 1px signal-pink or cobalt outline.
- [ ] Ensure the message field, validation feedback, loading state, success state, error state, honeypot behavior, and submit button remain usable without animation.
- [ ] Restyle Footer as the quiet end of the black block, preserving email, navigation, privacy, and cookie actions. Restyle PrivacyModal without changing its open/close or consent behavior.
- [ ] Run `npm run build` and `npm run lint`; manually verify keyboard tab order, form validation without submission, and that no `box-shadow`, gradient, or panel class returns in the closing sections.

**Checkpoint:** `git add` only Goals, ContactForm, Footer, PrivacyModal, and related translations and create `feat: finish foundry contact sequence`.

---

## Task 7: Migrate overlays, language controls, and preserved interactions to the new visual system

**Files:**

- Modify `src/components/LanguageSwitcher.tsx`
- Modify `src/components/CookieBanner.tsx`
- Modify `src/components/ProjectModal.tsx` if remaining token migration is needed
- Modify `src/components/CursorFollower.tsx` only if palette/size tuning is needed
- Modify `src/components/Header.tsx` if mobile/desktop token migration is incomplete

**Interfaces:**

- No public behavior changes are allowed for language switching, cookie consent, project modal controls, cursor following, or navbar name transition.

**Steps:**

- [ ] Replace stale token references such as `text-text-light`, `text-text-dark`, and `bg-accent-primary` with the new semantic tokens; verify every referenced class is defined or is a valid Tailwind utility.
- [ ] Restyle LanguageSwitcher as a flat text/control treatment with a clear active state and no capsule/pill background.
- [ ] Restyle CookieBanner and PrivacyModal as flat high-contrast surfaces that are readable on both page tones; preserve consent persistence and close actions.
- [ ] Verify CursorFollower remains a small square inspection marker, does not create a glow or shadow, and respects touch devices where hover tracking is unavailable.
- [ ] Verify Header name transition by navigating/scrolling between hero and navbar state; do not replace the shared layout ID or introduce a second competing name animation.
- [ ] Run `npm run build` and `npm run lint`, then manually test language switching, cookie accept/reopen behavior, modal close via button and Escape, and cursor behavior on desktop.

**Checkpoint:** `git add` only interaction-shell files and create `style: align preserved interactions with foundry system`.

---

## Task 8: Tune responsive layout, motion boundaries, and accessibility

**Files:**

- Modify `src/components/AssemblyCell.tsx`
- Modify `src/components/assembly/assembly.css`
- Modify `src/components/Hero.tsx`
- Modify `src/components/SelectedWork.tsx`
- Modify `src/components/About.tsx`
- Modify `src/components/Skills.tsx`
- Modify `src/components/Experience.tsx`
- Modify `src/components/Goals.tsx`
- Modify `src/components/ContactForm.tsx`
- Modify `src/index.css`
- Modify `src/styles/animations.css`

**Steps:**

- [ ] Add explicit desktop/tablet/mobile breakpoints: desktop keeps text-left/assembly-right, mobile becomes text → compact assembly cell → CTA, and Selected Work stacks metadata before the preview.
- [ ] Reduce assembly modules and travel distance below the mobile breakpoint while keeping the SVG within its container; verify `document.documentElement.scrollWidth <= window.innerWidth` at 390px and 768px widths.
- [ ] Define a restrained type scale and max-widths for hero, statement, project, and body copy so no heading produces a six-line oversized block or forces horizontal overflow.
- [ ] Add visible `:focus-visible` treatment to links, buttons, language controls, modal controls, and form fields; confirm focus remains visible on both black and white sections.
- [ ] Add `@media (prefers-reduced-motion: reduce)` coverage for all new assembly and reveal classes and verify the page reaches a stable assembled state without waiting for a loop.
- [ ] Check the page with keyboard-only navigation and an accessible-name pass for SVG, buttons, links, and form fields; decorative traces must be hidden from assistive technology.
- [ ] Run `npm run build` and `npm run lint`, then capture 1440px, 1024px, 768px, and 390px screenshots for visual comparison against the spec.

**Checkpoint:** `git add` only responsive/motion/accessibility files and create `polish: tune foundry responsive behavior`.

---

## Task 9: Remove obsolete active-path styling and perform final verification

**Files:**

- Modify `src/pages/home_impl.tsx` if stale imports remain
- Modify `src/index.css` or `src/styles/animations.css` if unused old utilities remain
- Leave `src/pages/home.tsx` untouched unless a read-only import scan proves it is dead and deletion is explicitly approved
- Add visual QA artifacts only under `.impeccable/review/` if needed

**Steps:**

- [ ] Run a source import scan from PowerShell to confirm the active route is `src/pages/home_impl.tsx`, the already-deleted `BlobBackground` is not imported, and no old glow/background component is reachable from `src/App.tsx`.
- [ ] Search active source for prohibited patterns: `shadow-`, `drop-shadow`, `backdrop-blur`, `bg-gradient`, glow class names, automatic uppercase classes, and obsolete color aliases. Review each match instead of deleting blindly.
- [ ] Run `npm run lint` and `npm run build` from a cleanly reproducible dependency state; record the actual exit codes and relevant output.
- [ ] Start the app with `npm run dev -- --host 127.0.0.1` and use the existing Edge/headless screenshot workflow with `--in-process-gpu` to capture desktop and mobile output.
- [ ] Manually verify the complete flow: hero CTA anchors, navbar name transition, cursor square, autonomous assembly loop, reduced-motion static state, GT Series link/modal, language switch, contact validation, cookie consent, privacy modal, and no mobile horizontal overflow.
- [ ] Run the existing Impeccable detector against `src` and resolve any new high-severity violations introduced by the redesign; do not chase cosmetic detector noise that conflicts with the approved spec without documenting the reason.
- [ ] Review the final diff and status, confirm all local user changes remain intact, and only then present the implementation result. Do not push or merge unless separately requested.

**Checkpoint:** create a final scoped checkpoint commit named `verify: interface foundry redesign` only after all checks pass and only with explicitly staged redesign files.

---

## Self-review checklist for the implementer

- [ ] The active page is black-led with the first three sections black and the white sections grouped as reading relief.
- [ ] The hero right side is a compact assembly cell, not a wide detailed factory illustration.
- [ ] The SVG rail/module/frame/inspection primitives recur in multiple scales without becoming repetitive decoration.
- [ ] The GT Series is the first completed output and is presented as a framed real preview rather than a generic card.
- [ ] Text is title case, Instrument Sans is bundled locally, and the scale is controlled rather than oversized.
- [ ] No glow, shadow, gradient, glass, or generic pill treatment appears in the active visual path.
- [ ] The existing navbar name transition and cursor-following square are still present and not visually overpowered.
- [ ] Contact, modal, cookies, language switching, anchors, keyboard behavior, reduced motion, and mobile layout still work.
- [ ] The final verification evidence is based on actual build/lint/browser results, not only on a successful source edit.
