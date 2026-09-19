# Semantic Factory Parts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace random factory symbols with deterministic landing-page elements, make the forming press reveal those elements, make the Experience station visibly finish and inspect them, and add the missing section heading.

**Architecture:** A five-item `LANDING_PART_BLUEPRINTS` cycle becomes the single source of truth for role, geometry, finish, and future assembly slot. Physics continues to use the existing `shape` field, while `FactoryPartGraphic` renders stage-aware semantic content from the part’s stable blueprint. The press changes only geometry/stage; the paint station changes only production stage, so neither station invents a new identity or random color.

**Tech Stack:** React 19, TypeScript 5.9, Matter.js 0.20, inline SVG, CSS, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-19-semantic-factory-parts-design.md`

## Global Constraints

- The output is a decorative product landing page, not a functional miniature application.
- The only produced roles are `brand`, `heading`, `copy`, `cta`, and `visual`.
- Do not manufacture cursors, toggles, radios, forms, menus, or statistics.
- A part keeps the same `id`, `role`, `finish`, and future assembly slot throughout the line.
- No nozzle is permanently tied to pink, blue, white, or any other fixed color.
- The current contact assembler is compatibility-only in this phase; do not redesign it.
- Experience and certification copy and links remain unchanged.
- Decorative SVG remains hidden from assistive technology and supports reduced motion.

## Review Focus

- Arbitrary valid CSS colors in a finish recipe must render and must not be mapped back to the old three-color palette; pinned in Task 1.
- A recipe without text must skip the print-head phase without stalling the paint cycle; pinned in Task 3.
- Consecutive parts reaching the paint sensor must be serialized so one active part cannot overwrite another’s finish; pinned in Task 3.
- Rebuilding a Matter body after its semantic geometry changes must preserve identity, finish, position, velocity, and angle; pinned in Task 2.
- Reduced-motion snapshots must contain the same five semantic roles and finished visuals without spray animation; pinned in Task 5.

---

### Task 1: Define the semantic landing-part blueprint

**Files:**
- Modify: `src/factory/factoryTypes.ts`
- Create: `src/factory/landingPartBlueprints.ts`
- Modify: `src/factory/factoryFlowModel.ts`
- Test: `tests/factory-flow.test.mjs`

**Interfaces:**
- Consumes: existing `FactoryPartSpec`, `createFactoryPartSpec(sequence, stage)` and deterministic stream sequence.
- Produces: `FactoryPartRole`, `FactoryPartFinish`, `FactoryAssemblySlot`, `LANDING_PART_BLUEPRINTS`, `getLandingPartBlueprint(sequence)`, and semantic fields on every `FactoryPartSpec`.

- [ ] **Step 1: Replace the old raw-color sequence test with failing semantic-blueprint tests**

Add tests equivalent to:

```js
test('the factory repeats five stable landing-page blueprints', async () => {
  const model = await import('../src/factory/factoryFlowModel.ts')
  const parts = [0, 1, 2, 3, 4, 5].map((sequence) => model.createFactoryPartSpec(sequence, 'raw'))
  assert.deepEqual(parts.map(({ role }) => role), ['brand', 'heading', 'copy', 'cta', 'visual', 'brand'])
  assert.equal(parts[0].assemblySlot, 'brand')
  assert.equal(parts[1].finish.text, 'NOVA')
  assert.equal(parts[2].finish.text, 'Ideas in motion.')
  assert.equal(parts[3].finish.text, 'Explore')
  assert.equal(parts[4].finish.text, undefined)
})

test('a finish recipe preserves arbitrary valid colors', async () => {
  const { getLandingPartBlueprint } = await import('../src/factory/landingPartBlueprints.ts')
  const cta = getLandingPartBlueprint(3)
  assert.deepEqual(cta.finish, {
    fill: '#C7FF43',
    stroke: '#C7FF43',
    textColor: '#090909',
    text: 'Explore',
  })
})
```

- [ ] **Step 2: Run the focused tests and confirm the old model fails**

Run: `node --test --test-name-pattern="landing-page blueprints|arbitrary valid colors" tests/factory-flow.test.mjs`

Expected: FAIL because `role`, `finish`, `assemblySlot`, and `landingPartBlueprints.ts` do not exist.

- [ ] **Step 3: Add the semantic types and blueprint table**

Define these public shapes in `factoryTypes.ts`:

```ts
export type FactoryPartRole = 'brand' | 'heading' | 'copy' | 'cta' | 'visual'
export type FactoryAssemblySlot = FactoryPartRole
export type FactoryPartStage = 'raw' | 'formed' | 'printed' | 'inspected' | 'assembled'

export interface FactoryPartFinish {
  fill: string
  stroke?: string
  textColor?: string
  text?: string
  detailColor?: string
}
```

Keep raw geometry values needed before the press and add semantic geometry values to `FactoryPartShape`:

```ts
export type FactoryPartShape =
  | 'square' | 'circle' | 'bar' | 'diamond'
  | 'brand-mark' | 'headline' | 'copy-line' | 'cta-button' | 'visual-card'
```

Extend `FactoryPartSpec` with required `role`, `finish`, and `assemblySlot`; remove the fixed `FactoryPartColor` union and `color` field. In `landingPartBlueprints.ts`, export a readonly five-entry table and modulo-safe lookup. Use these exact roles/shapes/slots and a cohesive but non-global palette:

```ts
[
  { role: 'brand', shape: 'brand-mark', assemblySlot: 'brand', finish: { fill: '#FFFFFF', stroke: '#FFFFFF', detailColor: '#355CFF' } },
  { role: 'heading', shape: 'headline', assemblySlot: 'heading', finish: { fill: '#FFFFFF', textColor: '#090909', text: 'NOVA' } },
  { role: 'copy', shape: 'copy-line', assemblySlot: 'copy', finish: { fill: '#090909', stroke: '#FFFFFF', textColor: '#FFFFFF', text: 'Ideas in motion.' } },
  { role: 'cta', shape: 'cta-button', assemblySlot: 'cta', finish: { fill: '#C7FF43', stroke: '#C7FF43', textColor: '#090909', text: 'Explore' } },
  { role: 'visual', shape: 'visual-card', assemblySlot: 'visual', finish: { fill: '#355CFF', stroke: '#FFFFFF', detailColor: '#F21868' } },
]
```

Update `createFactoryPartSpec` so the role and final recipe are assigned once at spawn. The initially visible geometry remains one of the four raw shapes until the press forms it.

- [ ] **Step 4: Run the focused tests**

Run: `node --test --test-name-pattern="factory repeats five|arbitrary valid colors" tests/factory-flow.test.mjs`

Expected: PASS.

- [ ] **Step 5: Update all test fixtures to include semantic fields and run the full model suite**

Introduce a small test helper in `tests/factory-flow.test.mjs` for physical fixtures instead of repeating incomplete objects:

```js
const makePart = (overrides = {}) => ({
  id: 'test-part', sequence: 0, role: 'brand', shape: 'square',
  stage: 'raw', assemblySlot: 'brand',
  finish: { fill: '#FFFFFF', stroke: '#FFFFFF', detailColor: '#355CFF' },
  ...overrides,
})
```

Replace old inline `{ shape, color, stage }` fixtures with `makePart(...)` while retaining their original physics assertions.

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Commit the semantic model**

```bash
git add src/factory/factoryTypes.ts src/factory/landingPartBlueprints.ts src/factory/factoryFlowModel.ts tests/factory-flow.test.mjs
git commit -m "feat: define semantic factory parts"
```

### Task 2: Render and physically form the five real elements

**Files:**
- Modify: `src/factory/FactoryPartGraphic.tsx`
- Modify: `src/factory/factoryPartPhysics.ts`
- Modify: `src/factory/FactoryAct.tsx`
- Modify: `src/factory/stations/formingPressModel.ts`
- Modify: `src/factory/stations/FormingPress.tsx`
- Test: `tests/factory-flow.test.mjs`
- Test: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Consumes: `FactoryPartSpec.role`, `.finish`, `.shape`, `.stage`, and `getLandingPartBlueprint(sequence)` from Task 1.
- Produces: stage-aware `FactoryPartGraphic`, semantic Matter dimensions, `getFormedShape(sequence)`, and an `updatePartSpec` patch that accepts `shape`, `stage`, `role`, `finish`, and `assemblySlot` without losing fields.

- [ ] **Step 1: Write failing tests for formed geometry and body rebuild preservation**

Replace the old formed-shape expectation with:

```js
test('the forming press reveals the five landing-page element shapes', async () => {
  const { getFormedShape } = await import('../src/factory/stations/formingPressModel.ts')
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(getFormedShape), [
    'brand-mark', 'headline', 'copy-line', 'cta-button', 'visual-card', 'brand-mark',
  ])
})

test('semantic body rebuild preserves the complete part and motion snapshot', async () => {
  const physics = await import('../src/factory/factoryPartPhysics.ts')
  const part = makePart({ role: 'cta', shape: 'cta-button', stage: 'formed', assemblySlot: 'cta', finish: { fill: '#C7FF43', text: 'Explore', textColor: '#090909' } })
  const body = physics.createFactoryBody(part, { ...part, x: 40, y: 50, velocityX: 2, velocityY: 3, angle: 0.2, angularVelocity: 0.1 })
  assert.equal(body.plugin.factoryPartSpec.role, 'cta')
  assert.equal(body.plugin.factoryPartSpec.finish.text, 'Explore')
  assert.deepEqual(body.velocity, { x: 2, y: 3 })
  assert.equal(body.angle, 0.2)
})
```

Add source-contract assertions in `interface-foundry.test.mjs` that `FactoryPartGraphic.tsx` renders the finish text only for `printed`, `inspected`, or `assembled` stages and contains dedicated branches for all five semantic shapes.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `node --test --test-name-pattern="landing-page element shapes|semantic body rebuild|factory part graphic" tests/factory-flow.test.mjs tests/interface-foundry.test.mjs`

Expected: FAIL on the old four UI-control shapes and incomplete plugin spec.

- [ ] **Step 3: Implement semantic dimensions and stage-aware SVG rendering**

Use these base dimensions in `getFactoryPartDimensions`:

```ts
const SEMANTIC_DIMENSIONS = {
  'brand-mark': { width: 24, height: 24 },
  headline: { width: 58, height: 22 },
  'copy-line': { width: 68, height: 16 },
  'cta-button': { width: 54, height: 22 },
  'visual-card': { width: 54, height: 42 },
} as const
```

In `FactoryPartGraphic`, render unfinished semantic shapes with `fill="none"`, a white construction stroke, and no text. For `printed`, `inspected`, and `assembled`, render from `part.finish`. Use SVG `<text textAnchor="middle" dominantBaseline="central">` with a bounded font size; `brand-mark` and `visual-card` use `detailColor` for one simple internal shape. Do not attach handlers or interactive roles.

Update the Matter body plugin and `FactoryAct.updatePartSpec` typing so the entire semantic spec survives a geometry-triggered body rebuild. Preserve position, linear velocity, angle, and angular velocity exactly as the existing rebuild path does.

- [ ] **Step 4: Update the press to reveal blueprint geometry**

Change `FORMED_SHAPES` to the five semantic shapes. At `jaws-closed`, patch only `{ shape: next.shape, stage: 'formed' }`; do not recalculate role or finish. Initialize press state with the incoming part sequence and retain the existing close/reveal/release timing unless visual QA proves overlap.

- [ ] **Step 5: Run focused and full tests**

Run: `node --test --test-name-pattern="forming press|semantic body rebuild|factory part graphic" tests/factory-flow.test.mjs tests/interface-foundry.test.mjs`

Expected: PASS.

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Commit the real formed elements**

```bash
git add src/factory/FactoryPartGraphic.tsx src/factory/factoryPartPhysics.ts src/factory/FactoryAct.tsx src/factory/stations/formingPressModel.ts src/factory/stations/FormingPress.tsx tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git commit -m "feat: form real landing page elements"
```

### Task 3: Build the programmable finishing and inspection cycle

**Files:**
- Modify: `src/factory/stations/paintInspectionModel.ts`
- Modify: `src/factory/stations/PaintInspectionStation.tsx`
- Modify: `src/factory/factory-line.css`
- Test: `tests/factory-flow.test.mjs`
- Test: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Consumes: stable semantic parts from Task 2 and `updatePartSpec(id, patch)` from `FactoryAct`.
- Produces: `PaintInspectionPhase`, `createPaintInspectionState(part)`, `advancePaintInspection(state, event)`, `hasPrintableDetail(part)`, and a serialized station animation that ends at `stage: 'inspected'`.

- [ ] **Step 1: Replace fixed-palette tests with failing state-machine tests**

```js
test('the finishing station applies fill then print then inspection without changing identity', async () => {
  const model = await import('../src/factory/stations/paintInspectionModel.ts')
  const part = makePart({ id: 'cta-7', sequence: 7, role: 'cta', shape: 'cta-button', stage: 'formed', assemblySlot: 'cta', finish: { fill: '#C7FF43', textColor: '#090909', text: 'Explore' } })
  let state = model.createPaintInspectionState(part)
  state = model.advancePaintInspection(state, 'capture')
  state = model.advancePaintInspection(state, 'coat-complete')
  state = model.advancePaintInspection(state, 'print-complete')
  state = model.advancePaintInspection(state, 'inspection-complete')
  assert.equal(state.phase, 'released')
  assert.equal(state.part.id, 'cta-7')
  assert.equal(state.part.finish.fill, '#C7FF43')
  assert.equal(state.part.stage, 'inspected')
})

test('a part without text skips the print-head phase', async () => {
  const model = await import('../src/factory/stations/paintInspectionModel.ts')
  const visual = makePart({ role: 'visual', shape: 'visual-card', stage: 'formed', assemblySlot: 'visual', finish: { fill: '#355CFF' } })
  let state = model.advancePaintInspection(model.createPaintInspectionState(visual), 'capture')
  state = model.advancePaintInspection(state, 'coat-complete')
  assert.equal(state.phase, 'inspecting')
})

test('the paint station refuses a second active part until release', async () => {
  const model = await import('../src/factory/stations/paintInspectionModel.ts')
  assert.equal(model.canCapturePaintPart(null), true)
  assert.equal(model.canCapturePaintPart('part-1'), false)
})
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `node --test --test-name-pattern="finishing station|without text|second active part" tests/factory-flow.test.mjs`

Expected: FAIL because the old model only rotates three colors and immediately marks a part painted.

- [ ] **Step 3: Implement the pure finishing state machine**

Use explicit phases and events:

```ts
export type PaintInspectionPhase = 'falling' | 'captured' | 'coating' | 'printing' | 'inspecting' | 'released'
export type PaintInspectionEvent = 'capture' | 'coat-start' | 'coat-complete' | 'print-complete' | 'inspection-complete'
```

`coat-complete` advances to `printing` only when `finish.text` or `finish.detailColor` requires the narrow head; otherwise it advances directly to `inspecting`. `inspection-complete` returns a copied part with `stage: 'inspected'`. Export `canCapturePaintPart(activePartId)` and keep all decisions independent of concrete color strings.

- [ ] **Step 4: Replace the paint-zone rectangle with two programmable heads and a gate**

In `PaintInspectionStation.tsx`:

- retain the two vertical guide colliders,
- replace the large paint-zone sensor with a compact capture sensor and a physical gate,
- serialize one active part using `activePartIdRef`,
- drive coat, optional print, inspect, and release with named timing constants,
- update the part to `stage: 'printed'` when finishing is visible and to `stage: 'inspected'` at the inspection sensor,
- rebuild/re-register colliders when the gate opens exactly as the press already does,
- render a wide coating head, a narrow print head, animated spray groups colored with CSS custom properties from `part.finish`, and a separate inspection arch.

Use class/state names rather than inline animation definitions:

```tsx
<g className={`paint-head paint-head--coat${phase === 'coating' ? ' is-active' : ''}`}>
  <rect x="72" y="92" width="48" height="28" />
  <path d="M84 120 78 166M108 120 114 166" className="paint-spray" />
</g>
<g className={`paint-head paint-head--print${phase === 'printing' ? ' is-active' : ''}`}>
  <rect x="142" y="92" width="34" height="28" />
  <path d="M159 120V166" className="print-spray" />
</g>
```

In `factory-line.css`, animate only opacity and transforms. Add visible neutral housings, active color indicators, a short spray reveal, gate motion, and a blue inspection pulse. Remove `.factory-line__paint-zone` and its old rectangle styling.

- [ ] **Step 5: Add source-contract tests for the visual cause-and-effect**

Add assertions in `interface-foundry.test.mjs` that the station contains both `paint-head--coat` and `paint-head--print`, reads `part.finish` rather than `PAINT_COLORS`, renders an inspection arch separately, and that CSS contains reduced-motion overrides disabling spray animation.

Run: `node --test --test-name-pattern="finishing station|paint station|paint inspection" tests/factory-flow.test.mjs tests/interface-foundry.test.mjs`

Expected: PASS.

- [ ] **Step 6: Run all tests and commit**

Run: `npm test`

Expected: PASS.

```bash
git add src/factory/stations/paintInspectionModel.ts src/factory/stations/PaintInspectionStation.tsx src/factory/factory-line.css tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git commit -m "feat: add programmable finishing station"
```

### Task 4: Add the Experience and Certifications section heading

**Files:**
- Modify: `src/i18n/translations.ts`
- Modify: `src/components/Experience.tsx`
- Test: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Consumes: existing language context and Experience layout.
- Produces: `t.experience.sectionTitle` values `Zkušenosti & certifikace` and `Experience & Certifications`, rendered once as the section’s primary heading.

- [ ] **Step 1: Write a failing source-contract test for the heading**

```js
test('experience renders its localized primary heading above content and station', async () => {
  const experience = await read('src/components/Experience.tsx')
  const translations = await read('src/i18n/translations.ts')
  assert.match(experience, /t\.experience\.sectionTitle/)
  assert.ok(experience.indexOf('t.experience.sectionTitle') < experience.indexOf('<PaintInspectionStation'))
  assert.match(translations, /sectionTitle:\s*'Zkušenosti & certifikace'/)
  assert.match(translations, /sectionTitle:\s*'Experience & Certifications'/)
})
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test --test-name-pattern="experience renders its localized" tests/interface-foundry.test.mjs`

Expected: FAIL because the existing translation is shorter and the primary heading is not rendered.

- [ ] **Step 3: Implement the heading and preserve the content grid**

Change both translation values and insert a full-width heading inside `.foundry-container`, before a nested grid containing the existing experience rows, certifications, and station:

```tsx
<div className="foundry-container">
  <h2 className="max-w-4xl font-heading text-[clamp(2.7rem,5vw,5rem)] font-medium leading-[0.94] tracking-[-0.06em] text-soft-white">
    {t.experience.sectionTitle}
  </h2>
  <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,18rem)] lg:items-start lg:gap-20">
    {/* unchanged experience/certification content plus station */}
  </div>
</div>
```

Keep certification links, dates, roles, descriptions, and the smaller certification column label unchanged. Ensure heading levels below the new primary `h2` become `h3` where necessary.

- [ ] **Step 4: Run the focused test, build, and lint**

Run: `node --test --test-name-pattern="experience renders its localized" tests/interface-foundry.test.mjs`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 5: Commit the section hierarchy**

```bash
git add src/i18n/translations.ts src/components/Experience.tsx tests/interface-foundry.test.mjs
git commit -m "feat: title experience and certifications section"
```

### Task 5: Align reduced motion and preserve legacy assembler compatibility

**Files:**
- Modify: `src/factory/factoryFlowModel.ts`
- Modify: `src/factory/stations/finalAssemblerModel.ts`
- Modify: `src/factory/stations/FinalAssembler.tsx`
- Test: `tests/factory-flow.test.mjs`
- Test: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Consumes: semantic blueprints and finished stage rendering from Tasks 1–3.
- Produces: semantic reduced-motion snapshots and an explicit compatibility mapping that lets the old contact assembler consume parts without redefining their identity.

- [ ] **Step 1: Write failing reduced-motion and compatibility tests**

```js
test('reduced motion shows the same five finished semantic roles', async () => {
  const { getReducedFactorySnapshot } = await import('../src/factory/factoryFlowModel.ts')
  const snapshots = getReducedFactorySnapshot('experience')
  assert.deepEqual(snapshots.map(({ role }) => role), ['brand', 'heading', 'copy', 'cta', 'visual'])
  assert.ok(snapshots.every(({ stage }) => stage === 'inspected'))
})

test('legacy assembler slots use semantic assembly slots without changing the part', async () => {
  const { getBrowserSlot } = await import('../src/factory/stations/finalAssemblerModel.ts')
  assert.equal(getBrowserSlot(makePart({ role: 'cta', assemblySlot: 'cta' })), 'contact-action')
  assert.equal(getBrowserSlot(makePart({ role: 'visual', assemblySlot: 'visual' })), 'hero-visual')
})
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `node --test --test-name-pattern="same five finished|legacy assembler slots" tests/factory-flow.test.mjs`

Expected: FAIL because reduced snapshots are station-specific pseudo-parts and assembler slots are sequence-only.

- [ ] **Step 3: Build semantic reduced snapshots**

For `skills`, return a representative formed semantic part. For `experience`, return all five blueprints as static `inspected` parts distributed vertically inside the station. Preserve role, finish, shape, and assembly slot; do not create separate reduced-only identities with different visuals. Keep other station snapshots working with the new required fields.

- [ ] **Step 4: Add the temporary assembler mapping**

Change `getBrowserSlot` to accept `Pick<FactoryPartSpec, 'assemblySlot'>` and map:

```ts
const LEGACY_SLOT_MAP: Record<FactoryAssemblySlot, BrowserSlot> = {
  brand: 'hero-copy',
  heading: 'hero-copy',
  copy: 'content-left',
  cta: 'contact-action',
  visual: 'hero-visual',
}
```

Update `FinalAssembler.tsx` to read the stored spec from `part.plugin.factoryPartSpec` rather than recomputing a slot from sequence, and update every `getBrowserSlot` call and existing assertion to pass the semantic spec. Keep its current circles and browser frame; do not redesign the contact output. Add a comment explaining that this mapping is intentionally temporary until the separately scoped contact redesign.

- [ ] **Step 5: Run all automated verification**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 6: Commit compatibility and reduced motion**

```bash
git add src/factory/factoryFlowModel.ts src/factory/stations/finalAssemblerModel.ts src/factory/stations/FinalAssembler.tsx tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git commit -m "feat: carry semantic parts through factory fallbacks"
```

### Task 6: Perform bounded visual verification

**Files:**
- Modify if defects are found: `src/factory/factory-line.css`
- Modify if defects are found: `src/factory/stations/FormingPress.tsx`
- Modify if defects are found: `src/factory/stations/PaintInspectionStation.tsx`
- Modify if defects are found: `src/components/Experience.tsx`

**Interfaces:**
- Consumes: completed feature from Tasks 1–5.
- Produces: verified desktop, mobile, and reduced-motion presentation with no overlap or overflow.

- [ ] **Step 1: Start the app using the available project Node/npm runtime**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints a local URL. If the shell’s global npm shim is broken, invoke the bundled workspace Node/npm paths returned by the desktop workspace dependency loader; do not install or upgrade dependencies.

- [ ] **Step 2: Inspect desktop and mobile in one visual pass**

At approximately 1440×900 and 390×844, verify:

- the section heading precedes both content and station,
- every press output is recognizable as one of the five intended elements,
- the active coating/printing color visibly comes from the head,
- text appears only after the print step,
- capture, coat, optional print, inspect, and release are readable without explanation,
- the station never overlaps Experience text or certification links,
- `document.documentElement.scrollWidth <= window.innerWidth`.

- [ ] **Step 3: Inspect reduced motion**

Emulate `prefers-reduced-motion: reduce` and verify five finished semantic parts remain visible, spray and repeating head motion stop, and all Experience content remains readable and keyboard accessible.

- [ ] **Step 4: Fix all defects found in one batch and run one confirmation pass**

Restrict fixes to geometry, timing, CSS transforms/opacity, responsive spacing, and heading hierarchy. Do not redesign the contact assembler or add more decorative elements.

- [ ] **Step 5: Run final verification**

Run: `npm test && npm run build && npm run lint`

Expected: all commands exit 0.

- [ ] **Step 6: Commit visual corrections if any**

```bash
git add src/factory/factory-line.css src/factory/stations/FormingPress.tsx src/factory/stations/PaintInspectionStation.tsx src/components/Experience.tsx
git commit -m "fix: refine semantic factory presentation"
```
