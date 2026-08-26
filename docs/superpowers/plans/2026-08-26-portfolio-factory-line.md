# Portfolio Factory Line Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the finished hero conveyor through the rest of the portfolio as two stable, physics-driven factory acts separated by a white About reading section, ending with UI parts assembling a browser beside the contact form.

**Architecture:** `FactoryFlowProvider` owns page-level start and completion state. Each black act uses one Matter.js engine and one document-coordinate part layer; station components register measured colliders with that act so simultaneously visible sections share the same bodies and cannot teleport at their boundary. Pure model modules own deterministic streams, active-band recycling, station state machines, and reduced-motion snapshots so the behavior is testable without a browser.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Matter.js 0.20, Framer Motion 12, Tailwind CSS 4, Node test runner, existing SVG/CSS visual system

**Spec:** `docs/superpowers/specs/2026-08-26-portfolio-factory-line-design.md`

## Global Constraints

- Preserve the current uncommitted baseline in `src/components/HeroConveyor.tsx`, `src/components/heroConveyorModel.ts`, and `tests/interface-foundry.test.mjs`; never reset, overwrite, or silently commit those user-owned edits.
- Keep the finished hero/navbar visual behavior, `Logo.png`, language switcher, cursor offsets and hover centering, project modal, EmailJS contact flow, cookie behavior, and anchors.
- Use only `#000000`, `#FFFFFF`, `#F21868`, and `#355CFF` for the approved page world; About is the only full white section.
- Remove eyebrow labels, section indices, gray text hierarchy, obsolete foundry traces, and decorative technical labels from active page sections.
- Pink means transformation/action; blue means direction/control/capability. Highlight at most one or two meaningful heading words in selected headings, not every heading.
- Scroll triggers station readiness and the one-time box release; scroll position never scrubs physics.
- Maintain a bounded body pool even after the visual stream becomes continuous.
- Keep visible content as semantic HTML. Physics layers are `aria-hidden`, non-focusable, and `pointer-events: none`.
- Every motion feature ships with a meaningful `prefers-reduced-motion` result, not a blank or hidden station.
- Do not add another animation or physics dependency.
- Use exact-path staging. Do not commit unrelated workspace changes.

## File and responsibility map

| File | Responsibility |
|---|---|
| `src/factory/factoryTypes.ts` | Shared act, station, part, color, stage, and serialized snapshot types. |
| `src/factory/factoryFlowModel.ts` | Deterministic sequence, waiting/continuous spawn policy, active band, recycling, teardown, and reduced-motion snapshots. |
| `src/factory/factoryGeometry.ts` | Convert measured section geometry into one act coordinate system and decide which stations overlap the active window. |
| `src/factory/FactoryFlowProvider.tsx` | Page-level `lineStarted`, reduced-motion, and final-browser completion state. |
| `src/factory/FactoryAct.tsx` | One Matter.js engine, body registry, station collider registry, measurement lifecycle, and shared SVG part layer per black act. |
| `src/factory/FactoryPartGraphic.tsx` | One reusable SVG representation for every raw and formed part shape. |
| `src/factory/factory-line.css` | Physics-layer stacking, station visuals, responsive geometry, and reduced-motion presentation. |
| `src/factory/stations/statementReboundModel.ts` | Stable word slots and rebound behavior. |
| `src/factory/stations/StatementRebound.tsx` | Statement platform collider and local machine SVG. |
| `src/factory/stations/formingPressModel.ts` | Deterministic UI-shape selection and press state machine. |
| `src/factory/stations/FormingPress.tsx` | Sensor, waiting shelf, jaws, stop, gate, and press visuals. |
| `src/factory/stations/paintInspectionModel.ts` | Color-role cycle and inspection transition. |
| `src/factory/stations/PaintInspectionStation.tsx` | Spray mask, paint transition, inspection sensor, and colliders. |
| `src/factory/stations/goalSorterModel.ts` | Three-lane selection and common exit geometry. |
| `src/factory/stations/GoalSorter.tsx` | Funnel, physical diverter, lane walls, merge slopes, and visuals. |
| `src/factory/stations/finalAssemblerModel.ts` | Five-slot one-time assembly and post-assembly collision mode. |
| `src/factory/stations/FinalAssembler.tsx` | Browser frame, capture slots, snap sequence, and overflow collisions. |
| `src/components/AccentWords.tsx` | Render explicitly translated heading parts with semantic pink/blue accents. |
| `src/components/ContactSection.tsx` | Preserve contact/copy behavior while composing the form with final assembly. |
| Existing page components | Own semantic content, station placement, and removal of obsolete visual scaffolding. |
| `tests/factory-flow.test.mjs` | Pure physics-flow, station state-machine, lifecycle, and geometry contracts. |
| `tests/interface-foundry.test.mjs` | Existing hero regressions plus page composition and preserved UI contracts. |

## Preflight: Establish the protected baseline

- [ ] **Step 1: Read the approved inputs and dirty baseline**

Run:

```powershell
Get-Content -Raw PRODUCT.md
Get-Content -Raw docs/superpowers/specs/2026-08-26-portfolio-factory-line-design.md
git -c safe.directory=D:/kodovani/Portfolio status --short
git -c safe.directory=D:/kodovani/Portfolio diff -- src/components/HeroConveyor.tsx src/components/heroConveyorModel.ts tests/interface-foundry.test.mjs
```

Expected: the spec and product record are present; the three known files may be modified and must be treated as the starting implementation, not discarded.

- [ ] **Step 2: Prove the starting test state**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: record the exact pass/fail baseline before changing code. At plan-writing time `npm test` passes 22/22; execution must use fresh evidence.

- [ ] **Step 3: Record staging ownership before the first overlapping edit**

Run:

```powershell
git -c safe.directory=D:/kodovani/Portfolio diff --binary -- src/components/HeroConveyor.tsx src/components/heroConveyorModel.ts tests/interface-foundry.test.mjs
```

Expected: preserve this output outside the repository or in the executor transcript. If a later commit would include pre-existing hunks from these files, ask the user whether they may join that commit; otherwise leave those overlapping files unstaged and commit only newly created/non-overlapping files.

---

### Task 1: Deterministic factory stream and bounded lifecycle

**Files:**
- Create: `src/factory/factoryTypes.ts`
- Create: `src/factory/factoryFlowModel.ts`
- Create: `tests/factory-flow.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `FactoryActId`, `FactoryStationId`, `FactoryPartShape`, `FactoryPartColor`, `FactoryPartStage`, `FactoryPartSpec`, `FactoryPartSnapshot`.
- Produces: `createFactoryPartSpec(sequence, stage)`, `getFactorySpawnDecision(input)`, `getActiveBand(viewportTop, viewportHeight)`, `shouldRecycleFactoryPart(y, band)`, and `serializeFactoryPart(body, spec)`.

- [ ] **Step 1: Make the test runner discover focused test files**

Change the script to:

```json
"test": "node --test tests"
```

Run `npm test` and expect the existing 22 tests to remain green before adding the new test file.

- [ ] **Step 2: Write failing deterministic-stream tests**

Create `tests/factory-flow.test.mjs`:

```js
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('the factory stream repeats a deterministic raw part sequence', async () => {
  const model = await import('../src/factory/factoryFlowModel.ts').catch(() => ({}))
  assert.equal(typeof model.createFactoryPartSpec, 'function')
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((sequence) => model.createFactoryPartSpec(sequence, 'raw')),
    [
      { id: 'part-0', sequence: 0, shape: 'square', color: '#FFFFFF', stage: 'raw' },
      { id: 'part-1', sequence: 1, shape: 'circle', color: '#FFFFFF', stage: 'raw' },
      { id: 'part-2', sequence: 2, shape: 'bar', color: '#FFFFFF', stage: 'raw' },
      { id: 'part-3', sequence: 3, shape: 'diamond', color: '#FFFFFF', stage: 'raw' },
      { id: 'part-4', sequence: 4, shape: 'square', color: '#FFFFFF', stage: 'raw' },
    ],
  )
})

test('the waiting box caps at thirty but a started line obeys only the active pool limit', async () => {
  const { getFactorySpawnDecision } = await import('../src/factory/factoryFlowModel.ts')
  assert.equal(getFactorySpawnDecision({ lineStarted: false, activeCount: 29, waitingCount: 29, waitingLimit: 30, activeLimit: 42 }), 'spawn')
  assert.equal(getFactorySpawnDecision({ lineStarted: false, activeCount: 30, waitingCount: 30, waitingLimit: 30, activeLimit: 42 }), 'hold')
  assert.equal(getFactorySpawnDecision({ lineStarted: true, activeCount: 30, waitingCount: 30, waitingLimit: 30, activeLimit: 42 }), 'spawn')
  assert.equal(getFactorySpawnDecision({ lineStarted: true, activeCount: 42, waitingCount: 0, waitingLimit: 30, activeLimit: 42 }), 'recycle')
})

test('the active band extends two viewports in both directions', async () => {
  const { getActiveBand, shouldRecycleFactoryPart } = await import('../src/factory/factoryFlowModel.ts')
  const band = getActiveBand(1000, 800)
  assert.deepEqual(band, { minY: -600, maxY: 3400 })
  assert.equal(shouldRecycleFactoryPart(3399, band), false)
  assert.equal(shouldRecycleFactoryPart(3401, band), true)
})
```

- [ ] **Step 3: Run the new tests and verify RED**

Run:

```powershell
node --test tests/factory-flow.test.mjs
```

Expected: FAIL because `src/factory/factoryFlowModel.ts` does not exist.

- [ ] **Step 4: Add the shared types and minimal model**

Create `src/factory/factoryTypes.ts`:

```ts
export type FactoryActId = 'upper' | 'lower'
export type FactoryStationId = 'hero' | 'statement' | 'projects' | 'skills' | 'experience' | 'goals' | 'contact'
export type FactoryPartShape = 'square' | 'circle' | 'bar' | 'diamond' | 'button' | 'cursor' | 'toggle' | 'radio'
export type FactoryPartColor = '#FFFFFF' | '#F21868' | '#355CFF'
export type FactoryPartStage = 'raw' | 'formed' | 'painted' | 'assembled'

export interface FactoryPartSpec {
  id: string
  sequence: number
  shape: FactoryPartShape
  color: FactoryPartColor
  stage: FactoryPartStage
}

export interface FactoryPartSnapshot extends FactoryPartSpec {
  x: number
  y: number
  velocityX: number
  velocityY: number
  angle: number
  angularVelocity: number
}
```

Create `src/factory/factoryFlowModel.ts`:

```ts
import type { Body as MatterBody } from 'matter-js'
import type { FactoryPartShape, FactoryPartSpec, FactoryPartStage } from './factoryTypes'

const RAW_SHAPES: FactoryPartShape[] = ['square', 'circle', 'bar', 'diamond']

export function createFactoryPartSpec(sequence: number, stage: FactoryPartStage): FactoryPartSpec {
  return {
    id: `part-${sequence}`,
    sequence,
    shape: RAW_SHAPES[sequence % RAW_SHAPES.length] ?? 'square',
    color: '#FFFFFF',
    stage,
  }
}

export function getFactorySpawnDecision(input: {
  lineStarted: boolean
  activeCount: number
  waitingCount: number
  waitingLimit: number
  activeLimit: number
}) {
  if (input.activeCount >= input.activeLimit) return 'recycle' as const
  if (!input.lineStarted && input.waitingCount >= input.waitingLimit) return 'hold' as const
  return 'spawn' as const
}

export function getActiveBand(viewportTop: number, viewportHeight: number) {
  return { minY: viewportTop - (viewportHeight * 2), maxY: viewportTop + (viewportHeight * 3) }
}

export function shouldRecycleFactoryPart(y: number, band: { minY: number; maxY: number }) {
  return y < band.minY || y > band.maxY
}

export function serializeFactoryPart(body: MatterBody, spec: FactoryPartSpec) {
  return {
    ...spec,
    x: body.position.x,
    y: body.position.y,
    velocityX: body.velocity.x,
    velocityY: body.velocity.y,
    angle: body.angle,
    angularVelocity: body.angularVelocity,
  }
}
```

- [ ] **Step 5: Verify GREEN and commit the isolated model**

Run:

```powershell
node --test tests/factory-flow.test.mjs
npm test
git -c safe.directory=D:/kodovani/Portfolio diff --check
```

Expected: all factory tests and the full suite pass.

Commit:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add package.json src/factory/factoryTypes.ts src/factory/factoryFlowModel.ts tests/factory-flow.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: add deterministic factory stream model"
```

---

### Task 2: Shared Matter.js runtime for each factory act

**Files:**
- Create: `src/factory/factoryGeometry.ts`
- Create: `src/factory/FactoryFlowProvider.tsx`
- Create: `src/factory/FactoryAct.tsx`
- Create: `src/factory/FactoryPartGraphic.tsx`
- Create: `src/factory/factory-line.css`
- Modify: `tests/factory-flow.test.mjs`

**Interfaces:**
- Consumes: types and stream helpers from Task 1.
- Produces: `FactoryFlowProvider`, `useFactoryFlow()`, `FactoryAct`, `useFactoryAct()`, and `useFactoryStation(registration)`.
- Produces: `FactoryStationRegistration` with `id`, `element`, and `buildColliders(metrics): MatterBody[]`.
- Produces: geometry helpers `toActPoint(rect, actRect, xRatio, yRatio)` and `isStationWithinWindow(station, window)`.

- [ ] **Step 1: Add failing runtime-contract tests**

Append to `tests/factory-flow.test.mjs`:

```js
test('station coordinates resolve in a shared act coordinate space', async () => {
  const geometry = await import('../src/factory/factoryGeometry.ts').catch(() => ({}))
  assert.equal(typeof geometry.toActPoint, 'function')
  assert.deepEqual(
    geometry.toActPoint(
      { left: 300, top: 900, width: 400, height: 200 },
      { left: 100, top: 500 },
      0.25,
      0.75,
    ),
    { x: 300, y: 550 },
  )
})

test('an act keeps neighboring stations active inside the same padded window', async () => {
  const { isStationWithinWindow } = await import('../src/factory/factoryGeometry.ts')
  assert.equal(isStationWithinWindow({ top: 700, bottom: 1500 }, { top: 0, bottom: 2400 }), true)
  assert.equal(isStationWithinWindow({ top: 2500, bottom: 2900 }, { top: 0, bottom: 2400 }), false)
})
```

- [ ] **Step 2: Run tests and verify RED**

Run `node --test tests/factory-flow.test.mjs`.

Expected: FAIL because `factoryGeometry.ts` and its exports do not exist.

- [ ] **Step 3: Implement document-coordinate geometry**

Create `src/factory/factoryGeometry.ts`:

```ts
export interface ElementRect { left: number; top: number; width: number; height: number }
export interface ActRect { left: number; top: number }

export function toActPoint(rect: ElementRect, actRect: ActRect, xRatio: number, yRatio: number) {
  return {
    x: rect.left - actRect.left + (rect.width * xRatio),
    y: rect.top - actRect.top + (rect.height * yRatio),
  }
}

export function isStationWithinWindow(
  station: { top: number; bottom: number },
  window: { top: number; bottom: number },
) {
  return station.bottom >= window.top && station.top <= window.bottom
}
```

- [ ] **Step 4: Implement the flow provider and act context**

`FactoryFlowProvider.tsx` must expose this stable API:

```ts
interface FactoryFlowValue {
  lineStarted: boolean
  startLine: () => void
  finalWebsiteAssembled: boolean
  markFinalWebsiteAssembled: () => void
  reducedMotion: boolean
}
```

Use `useReducedMotion() ?? false`; `startLine` and `markFinalWebsiteAssembled` must be idempotent state transitions.

`FactoryAct.tsx` must:

```tsx
<FactoryAct id="upper">
  {/* Hero, Statement, SelectedWork */}
</FactoryAct>
```

- create exactly one `Engine` per mounted act;
- render one absolute, full-act `<svg aria-hidden="true" focusable="false">` for moving parts;
- retain a registry of station collider factories;
- use `ResizeObserver` plus a throttled `requestAnimationFrame` measurement pass;
- update only while the document is visible and the act intersects the two-viewport active band;
- remove recycled bodies from Matter and the rendered part map in the same tick;
- clear the engine, observers, frames, and maps on unmount.

Import `./factory-line.css` from `FactoryAct.tsx` so the shared layer styles load exactly once with the runtime.

Export `useFactoryStation` as a thin registration hook with this exact input:

```ts
interface UseFactoryStationInput {
  id: FactoryStationId
  elementRef: React.RefObject<HTMLElement | null>
  buildColliders: (metrics: { elementRect: DOMRect; actRect: DOMRect }) => MatterBody[]
}
```

The context returned by `useFactoryAct()` must include:

```ts
interface FactoryActApi {
  actId: FactoryActId
  engine: Matter.Engine
  spawnPart: (spec: FactoryPartSpec, snapshot: Omit<FactoryPartSnapshot, keyof FactoryPartSpec>) => void
  registerStation: (registration: FactoryStationRegistration) => () => void
}
```

- [ ] **Step 5: Add the shared SVG part renderer**

`FactoryPartGraphic.tsx` renders every approved shape from a `FactoryPartSpec`. Use authored SVG paths/rects only; the physics layer gets `pointer-events: none` in `factory-line.css`.

```tsx
export function FactoryPartGraphic({ part }: { part: FactoryPartSpec }) {
  if (part.shape === 'circle' || part.shape === 'radio') return <circle r={part.shape === 'radio' ? 9 : 12} fill={part.color} />
  if (part.shape === 'bar' || part.shape === 'button') return <rect x={-18} y={-8} width={36} height={16} rx={part.shape === 'button' ? 8 : 0} fill={part.color} />
  if (part.shape === 'toggle') return <rect x={-20} y={-10} width={40} height={20} rx={10} fill={part.color} />
  if (part.shape === 'cursor') return <path d="M-10-14 12 5 2 7 7 17 1 20-4 10-11 16Z" fill={part.color} />
  return <rect x={-11} y={-11} width={22} height={22} fill={part.color} />
}
```

- [ ] **Step 6: Verify runtime build and commit**

Run:

```powershell
node --test tests/factory-flow.test.mjs
npm run lint
npm run build
git -c safe.directory=D:/kodovani/Portfolio diff --check
```

Expected: tests pass, TypeScript compiles, and ESLint reports no errors.

Commit only Task 2 files:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add src/factory/factoryGeometry.ts src/factory/FactoryFlowProvider.tsx src/factory/FactoryAct.tsx src/factory/FactoryPartGraphic.tsx src/factory/factory-line.css tests/factory-flow.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: add shared factory act runtime"
```

---

### Task 3: Compose the page into two physics acts

**Files:**
- Modify: `src/pages/home_impl.tsx`
- Create: `src/components/ContactSection.tsx`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Consumes: `FactoryFlowProvider` and `FactoryAct` from Task 2.
- Produces: one upper act around Hero/Statement/SelectedWork, one white About boundary, and one lower act around Skills/Experience/Goals/Contact.

- [ ] **Step 1: Write a failing composition test**

Add to `tests/interface-foundry.test.mjs`:

```js
test('the page separates two physics acts with the white about section', async () => {
  const source = await read('src/pages/home_impl.tsx')
  assert.match(source, /<FactoryFlowProvider>/)
  assert.match(source, /<FactoryAct id="upper">[\s\S]*<Hero \/>[\s\S]*<Statement \/>[\s\S]*<SelectedWork \/>[\s\S]*<\/FactoryAct>/)
  assert.match(source, /<About \/>[\s\S]*<FactoryAct id="lower">/)
  assert.match(source, /<Skills \/>[\s\S]*<Experience \/>[\s\S]*<Goals \/>[\s\S]*<ContactSection \/>/)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern="separates two physics acts" tests/interface-foundry.test.mjs
```

Expected: FAIL because the provider/act composition and `ContactSection` are absent.

- [ ] **Step 3: Extract the contact section without changing behavior**

Move the existing contact markup and `copyEmail` state from `home_impl.tsx` into `src/components/ContactSection.tsx`. The component must keep the exact email, `ContactForm`, copy feedback, and `id="contact"`.

Use this exported boundary:

```tsx
export default function ContactSection() {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  // existing copyEmail implementation and contact markup
}
```

- [ ] **Step 4: Wrap the page in the two acts**

The resulting `home_impl.tsx` structure must be:

```tsx
<Layout>
  <FactoryFlowProvider>
    <FactoryAct id="upper">
      <Hero />
      <Statement />
      <SelectedWork />
    </FactoryAct>
    <About />
    <FactoryAct id="lower">
      <Skills />
      <Experience />
      <Goals />
      <ContactSection />
    </FactoryAct>
  </FactoryFlowProvider>
</Layout>
```

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm test
npm run lint
npm run build
git -c safe.directory=D:/kodovani/Portfolio diff --check
```

Commit:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add src/pages/home_impl.tsx src/components/ContactSection.tsx tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "refactor: split portfolio into factory acts"
```

Do not stage pre-existing unrelated test-file hunks unless the user authorized them; use exact hunk staging or leave the overlapping test file for the integration commit.

---

### Task 4: Release the hero box and start the continuous stream

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/HeroConveyor.tsx`
- Modify: `src/components/heroConveyorModel.ts`
- Modify: `src/components/heroConveyorPhysics.ts`
- Modify: `src/components/hero-conveyor.css`
- Modify: `tests/factory-flow.test.mjs`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Consumes: `useFactoryFlow`, `useFactoryAct`, shared part types, spawn decisions, and station registration.
- Produces: `getHeroGateState(lineStarted)`, `getWaitingSpawnLimit(lineStarted)`, and hero station colliders registered in the upper act.

- [ ] **Step 1: Add failing gate and spawn-policy tests**

Append to `tests/factory-flow.test.mjs`:

```js
test('the hero gate opens once the line starts and removes the waiting cap', async () => {
  const model = await import('../src/components/heroConveyorModel.ts')
  assert.deepEqual(model.getHeroGateState(false), { open: false, waitingLimit: 30 })
  assert.deepEqual(model.getHeroGateState(true), { open: true, waitingLimit: Number.POSITIVE_INFINITY })
})
```

Add an integration assertion that `Statement.tsx` uses `startLine` from `useFactoryFlow()` and owns the boundary observer, while `HeroConveyor.tsx` reads `lineStarted` instead of tying release to animation time.

- [ ] **Step 2: Verify RED**

Run the two focused tests. Expect failure because the gate helper and flow integration do not exist.

- [ ] **Step 3: Move hero bodies into the upper act**

Keep `HeroConveyor` responsible for the belt/box SVG and intro choreography. Remove its private `Engine.create()` and local part-body ownership. Register belt end, box walls, and an openable bottom collider through `useFactoryAct()`.

Add this model helper:

```ts
export function getHeroGateState(lineStarted: boolean) {
  return {
    open: lineStarted,
    waitingLimit: lineStarted ? Number.POSITIVE_INFINITY : 30,
  }
}
```

The bottom collider must be removed from the upper act on the same state transition that starts its opening transform. Do not delete the visual bottom before the body is released.

- [ ] **Step 4: Trigger release from the Statement boundary**

Add an invisible semantic marker at the start of Statement. `Statement` reads `startLine()` from `useFactoryFlow()` and observes its own marker with a small positive threshold. Call `startLine()` only once when that marker enters.

```ts
const releaseObserver = new IntersectionObserver(
  ([entry]) => { if (entry?.isIntersecting) startLine() },
  { threshold: 0.15 },
)
```

The line then uses `getFactorySpawnDecision`; after release it can spawn forever but recycles at the upper act body limit.

- [ ] **Step 5: Preserve the protected hero baseline**

Before staging, compare the current diff with the Preflight snapshot. Confirm that `MAX_PARTS = 30`, starter-payload behavior, rounded release geometry, speed `55`, interval `1500`, and visibility gating remain intact unless a failing test requires an intentional change.

- [ ] **Step 6: Verify and commit with an ownership gate**

Run the focused model tests, full tests, lint, build, and diff check.

If the user authorized including the pre-existing hero hunks:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add src/components/Hero.tsx src/components/HeroConveyor.tsx src/components/heroConveyorModel.ts src/components/heroConveyorPhysics.ts src/components/hero-conveyor.css tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: release hero into continuous factory flow"
```

Otherwise commit only uncontested new/test files and leave overlapping files unstaged until the user resolves ownership.

---

### Task 5: Statement reveal, rebound platform, and first-act project passage

**Files:**
- Create: `src/factory/stations/StatementRebound.tsx`
- Create: `src/factory/stations/statementReboundModel.ts`
- Modify: `src/components/Statement.tsx`
- Modify: `src/components/SelectedWork.tsx`
- Modify: `src/components/Projects.tsx`
- Modify: `src/i18n/translations.ts`
- Modify: `src/factory/factory-line.css`
- Modify: `tests/factory-flow.test.mjs`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Produces: `createStatementReveal(words, minimumSlots, startAt = 0, stagger = 0.075)` with stable slot keys.
- Produces: `getReboundPlatformGeometry(bounds)` and a `StatementRebound` station registration.

- [ ] **Step 1: Write failing reveal and platform tests**

```js
test('statement words reveal once with stable language-independent slots', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts').catch(() => ({}))
  assert.deepEqual(model.createStatementReveal(['One', 'clear', 'idea'], 3), [
    { key: 'statement-0', word: 'One', revealAt: 0 },
    { key: 'statement-1', word: 'clear', revealAt: 0.075 },
    { key: 'statement-2', word: 'idea', revealAt: 0.15 },
  ])
  assert.deepEqual(model.createStatementReveal(['Jasná', 'myšlenka'], 3).map(({ key, word }) => ({ key, word })), [
    { key: 'statement-0', word: 'Jasná' },
    { key: 'statement-1', word: 'myšlenka' },
    { key: 'statement-2', word: '' },
  ])
})

test('the rebound platform sends released parts across the statement instead of into a pipe', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts')
  assert.deepEqual(model.getReboundImpulse({ incomingX: -0.4, incomingY: 3.2 }), { x: 2.4, y: -2.2 })
})
```

- [ ] **Step 2: Verify RED**

Run `node --test tests/factory-flow.test.mjs`; expect missing-module failure.

- [ ] **Step 3: Implement the model and station**

`StatementRebound` registers one angled static rectangle with restitution high enough to create one readable bounce, not pinball motion. It renders a single white platform in local station SVG; the shared act layer renders the parts.

Implement:

```ts
export function createStatementReveal(words: string[], minimumSlots: number, startAt = 0, stagger = 0.075) {
  return Array.from({ length: Math.max(words.length, minimumSlots) }, (_, index) => ({
    key: `statement-${index}`,
    word: words[index] ?? '',
    revealAt: startAt + (index * stagger),
  }))
}

export function getReboundImpulse(_: { incomingX: number; incomingY: number }) {
  return { x: 2.4, y: -2.2 }
}
```

- [ ] **Step 4: Redesign Statement and Selected Work**

Statement removes `FoundryTrace` and `foundry-label`, uses the fast word reveal, and places `StatementRebound` in the open side of the composition.

Selected Work:

- removes `featuredLabel`, preview numbering, `AssemblyCell`, and gray utility copy;
- keeps the real featured image, project description, technologies, external link, preview button, modal, and other projects;
- gives the preview the largest content footprint after hero;
- registers only a simple edge/slope collider so objects pass beside the project, never through controls.

- [ ] **Step 5: Verify and commit**

Run focused tests, full tests, lint, build, and diff check.

Commit:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add src/factory/stations/StatementRebound.tsx src/factory/stations/statementReboundModel.ts src/components/Statement.tsx src/components/SelectedWork.tsx src/components/Projects.tsx src/i18n/translations.ts src/factory/factory-line.css tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: carry factory flow through statement and work"
```

---

### Task 6: White About boundary and act teardown

**Files:**
- Modify: `src/components/About.tsx`
- Modify: `src/factory/FactoryAct.tsx`
- Modify: `src/factory/factoryFlowModel.ts`
- Modify: `src/index.css`
- Modify: `tests/factory-flow.test.mjs`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Produces: `shouldTeardownAct({ intersects, neighborVisible, documentVisible })`.
- Preserves: `id="about"`, language content, interests, school, and language levels.

- [ ] **Step 1: Write failing boundary tests**

```js
test('an act tears down only after neither it nor its boundary neighbor can be seen', async () => {
  const model = await import('../src/factory/factoryFlowModel.ts')
  assert.equal(model.shouldTeardownAct({ intersects: false, neighborVisible: false, documentVisible: true }), true)
  assert.equal(model.shouldTeardownAct({ intersects: false, neighborVisible: true, documentVisible: true }), false)
  assert.equal(model.shouldTeardownAct({ intersects: true, neighborVisible: false, documentVisible: true }), false)
})
```

Add source assertions that About has `foundry-reading-break`, uses black text, and no longer imports `SectionLabel`, `FoundryTrace`, or motion-based entrance translation.

- [ ] **Step 2: Verify RED**

Run the focused tests; expect the helper and white boundary to be absent.

- [ ] **Step 3: Implement teardown policy**

Add:

```ts
export function shouldTeardownAct(input: { intersects: boolean; neighborVisible: boolean; documentVisible: boolean }) {
  return input.documentVisible && !input.intersects && !input.neighborVisible
}
```

Use the policy to clear the upper engine only after the upper act and its lower edge are offscreen. The white About provides enough separation for the lower act to prewarm without either engine being visible together.

When the user scrolls back upward, recreate the cleared engine, rebuild registered static colliders from fresh measurements, and rehydrate the deterministic upper stream above the visible active band before resuming frames.

- [ ] **Step 4: Rebuild About as the single reading break**

Use `.foundry-reading-break` with `background:#FFFFFF; color:#000000`. Remove the section number and SVG traces. Preserve all factual copy. Use one optional semantic highlight from the existing `p2Highlight`, but do not add physics or new claims.

- [ ] **Step 5: Verify and commit**

Run tests, lint, build, and diff check.

Commit:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add src/components/About.tsx src/factory/FactoryAct.tsx src/factory/factoryFlowModel.ts src/index.css tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: add white about physics boundary"
```

---

### Task 7: Skills forming press

**Files:**
- Create: `src/factory/stations/formingPressModel.ts`
- Create: `src/factory/stations/FormingPress.tsx`
- Modify: `src/components/Skills.tsx`
- Modify: `src/factory/factory-line.css`
- Modify: `tests/factory-flow.test.mjs`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Produces: `FormingPressPhase = 'falling' | 'sensed' | 'clamped' | 'revealed' | 'released'`.
- Produces: `advanceFormingPress(state, event)` and `getFormedShape(sequence)`.

- [ ] **Step 1: Write the failing press state-machine test**

```js
test('the forming press senses, covers, transforms, reveals, and releases one part', async () => {
  const model = await import('../src/factory/stations/formingPressModel.ts').catch(() => ({}))
  let state = { phase: 'falling', sequence: 2, shape: 'bar' }
  state = model.advanceFormingPress(state, 'sensor-enter')
  assert.equal(state.phase, 'sensed')
  state = model.advanceFormingPress(state, 'jaws-closed')
  assert.deepEqual(state, { phase: 'clamped', sequence: 2, shape: 'toggle' })
  state = model.advanceFormingPress(state, 'jaws-open')
  assert.equal(state.phase, 'revealed')
  state = model.advanceFormingPress(state, 'gate-open')
  assert.equal(state.phase, 'released')
})
```

- [ ] **Step 2: Verify RED**

Run the focused test; expect missing-module failure.

- [ ] **Step 3: Implement the pure press model**

Use a fixed mapping:

```ts
const FORMED_SHAPES = ['button', 'cursor', 'toggle', 'radio'] as const

export function getFormedShape(sequence: number) {
  return FORMED_SHAPES[sequence % FORMED_SHAPES.length] ?? 'button'
}
```

`advanceFormingPress` accepts only the valid next event for its phase and otherwise returns the unchanged state. The shape changes only on `jaws-closed`, while the white jaws fully occlude the part.

- [ ] **Step 4: Build the physical station**

`FormingPress.tsx` must register:

- a short guide tube;
- a sensor region;
- a removable stop collider;
- upper and lower jaw visuals;
- a lower exit gate.

Sequence collision callbacks through the pure reducer. Only one part occupies the press chamber; subsequent parts wait on a physical upstream shelf. Remove the stop collider only in `released`, then restore it after the body exits.

- [ ] **Step 5: Redesign Skills around the press**

Remove `SectionLabel`, list chrome, and eyebrow-like category labels. Preserve every translated skill/tool item as readable HTML. Make the press the visual focus, with the headline using at most two semantic accent words.

- [ ] **Step 6: Verify and commit**

Run focused/full tests, lint, build, and diff check.

Stage and commit Task 7 files:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add src/factory/stations/formingPressModel.ts src/factory/stations/FormingPress.tsx src/components/Skills.tsx src/factory/factory-line.css tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: shape factory parts in skills press"
```

---

### Task 8: Experience paint and inspection station

**Files:**
- Create: `src/factory/stations/paintInspectionModel.ts`
- Create: `src/factory/stations/PaintInspectionStation.tsx`
- Modify: `src/components/Experience.tsx`
- Modify: `src/factory/factory-line.css`
- Modify: `tests/factory-flow.test.mjs`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Produces: `getPaintColor(sequence)` and `advanceInspection(part, sensorCrossed)`.
- Consumes formed parts from Task 7 and returns the same id/sequence with `stage:'painted'`.

- [ ] **Step 1: Write failing color-role tests**

```js
test('paint colors repeat white, pink, and blue without changing part identity', async () => {
  const model = await import('../src/factory/stations/paintInspectionModel.ts').catch(() => ({}))
  assert.deepEqual([0, 1, 2, 3].map(model.getPaintColor), ['#FFFFFF', '#F21868', '#355CFF', '#FFFFFF'])
  assert.deepEqual(
    model.advanceInspection({ id: 'part-4', sequence: 4, shape: 'button', color: '#F21868', stage: 'formed' }, true),
    { id: 'part-4', sequence: 4, shape: 'button', color: '#F21868', stage: 'painted' },
  )
})
```

- [ ] **Step 2: Verify RED**

Run the focused test; expect missing exports.

- [ ] **Step 3: Implement paint and inspection behavior**

```ts
const PAINT_COLORS = ['#FFFFFF', '#F21868', '#355CFF'] as const
export const getPaintColor = (sequence: number) => PAINT_COLORS[sequence % PAINT_COLORS.length] ?? '#FFFFFF'
export const advanceInspection = (part: FactoryPartSpec, sensorCrossed: boolean): FactoryPartSpec => (
  sensorCrossed ? { ...part, stage: 'painted' } : part
)
```

The station changes the SVG fill while the part is inside a bounded spray mask, then marks it painted only after it crosses the inspection sensor. No glow, gradients, particles, or new colors.

- [ ] **Step 4: Redesign Experience around proof**

Remove `SectionLabel`, `FoundryTrace`, section numbering, and gray dates. Preserve real employers/roles/descriptions and external certification links. Keep links keyboard accessible above the physics layer.

- [ ] **Step 5: Verify and commit**

Run tests, lint, build, diff check, then stage exact Task 8 files and commit:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add src/factory/stations/paintInspectionModel.ts src/factory/stations/PaintInspectionStation.tsx src/components/Experience.tsx src/factory/factory-line.css tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: paint and inspect formed interface parts"
```

---

### Task 9: Goals three-lane sorter

**Files:**
- Create: `src/factory/stations/goalSorterModel.ts`
- Create: `src/factory/stations/GoalSorter.tsx`
- Modify: `src/components/Goals.tsx`
- Modify: `src/factory/factory-line.css`
- Modify: `tests/factory-flow.test.mjs`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Produces: `GoalLane = 0 | 1 | 2`, `getGoalLane(sequence)`, and `getGoalLaneExit(lane, bounds)`.
- Guarantees: every lane rejoins the same downstream exit before Contact.

- [ ] **Step 1: Write failing route/rejoin tests**

```js
test('the goals sorter distributes parts across three lanes that share one exit', async () => {
  const model = await import('../src/factory/stations/goalSorterModel.ts').catch(() => ({}))
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(model.getGoalLane), [0, 1, 2, 0, 1, 2])
  const bounds = { left: 100, width: 600, bottom: 900 }
  assert.deepEqual([0, 1, 2].map((lane) => model.getGoalLaneExit(lane, bounds)), [
    { x: 400, y: 900 }, { x: 400, y: 900 }, { x: 400, y: 900 },
  ])
})
```

- [ ] **Step 2: Verify RED**

Run the focused test; expect missing module failure.

- [ ] **Step 3: Implement sorter geometry and physical gates**

Use `sequence % 3` for deterministic routing. `GoalSorter` registers a funnel, three short lane walls, one movable diverter, and shared merge slopes. Advance the diverter before the part reaches it; do not teleport bodies into lanes.

- [ ] **Step 4: Redesign Goals as three readable destinations**

Remove queue labels, `03 / 03`, section indices, and monospace numbering. Keep all three goal periods, titles, and descriptions next to their physical lanes. The animation supplements the content; it does not encode the only lane association.

- [ ] **Step 5: Verify and commit**

Run tests, lint, build, and diff check. Stage and commit exact files with:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add src/factory/stations/goalSorterModel.ts src/factory/stations/GoalSorter.tsx src/components/Goals.tsx src/factory/factory-line.css tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: route factory parts through goals sorter"
```

---

### Task 10: Contact browser assembly and continuous overflow

**Files:**
- Create: `src/factory/stations/finalAssemblerModel.ts`
- Create: `src/factory/stations/FinalAssembler.tsx`
- Modify: `src/components/ContactSection.tsx`
- Modify: `src/components/ContactForm.tsx`
- Modify: `src/factory/factory-line.css`
- Modify: `tests/factory-flow.test.mjs`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Produces: `BrowserSlot = 'hero-copy' | 'hero-visual' | 'content-left' | 'content-right' | 'contact-action'`.
- Produces: `getBrowserSlot(sequence)`, `advanceAssembly(state, partId)`, and `getPostAssemblyCollisionMode(assembled)`.
- Consumes/sets: `finalWebsiteAssembled` through `useFactoryFlow()`.

- [ ] **Step 1: Write failing one-time assembly tests**

```js
test('five unique parts assemble the browser once and later parts remain overflow', async () => {
  const model = await import('../src/factory/stations/finalAssemblerModel.ts').catch(() => ({}))
  let state = { placedIds: [], assembled: false }
  for (const id of ['a', 'b', 'c', 'd', 'e']) state = model.advanceAssembly(state, id)
  assert.equal(state.assembled, true)
  assert.equal(model.advanceAssembly(state, 'f'), state)
  assert.equal(model.getPostAssemblyCollisionMode(true), 'frame-only')
})
```

- [ ] **Step 2: Verify RED**

Run the focused test; expect missing model failure.

- [ ] **Step 3: Implement assembly state**

```ts
const SLOT_COUNT = 5

export function advanceAssembly(state: { placedIds: string[]; assembled: boolean }, partId: string) {
  if (state.assembled || state.placedIds.includes(partId)) return state
  const placedIds = [...state.placedIds, partId]
  return { placedIds, assembled: placedIds.length === SLOT_COUNT }
}

export const getPostAssemblyCollisionMode = (assembled: boolean) => assembled ? 'frame-only' as const : 'capture' as const
```

- [ ] **Step 4: Build the browser frame and capture sequence**

`FinalAssembler` renders an empty authored SVG browser. For the first five painted parts, collision with the capture zone removes the body only after a short snap animation has moved its graphic into its assigned slot. After the fifth slot, call `markFinalWebsiteAssembled()` and remove the capture collider.

Later bodies collide only with the browser frame, slide around/behind it, and recycle below Contact. The part layer stays below form controls and cannot receive pointer events.

- [ ] **Step 5: Redesign Contact without changing form behavior**

Remove `sectionLabel` and gray helper text. Keep all form labels, required inputs, honeypot, EmailJS call, rate limit, success/error states, disabled state, email copy button, and accessible live regions. Place `FinalAssembler` beside or below the form according to measured desktop/mobile layout.

- [ ] **Step 6: Verify and commit**

Run focused/full tests, lint, build, and diff check. Stage and commit exact Task 10 files:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add src/factory/stations/finalAssemblerModel.ts src/factory/stations/FinalAssembler.tsx src/components/ContactSection.tsx src/components/ContactForm.tsx src/factory/factory-line.css tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: assemble final website beside contact"
```

---

### Task 11: Visual-system cleanup, responsive rules, and reduced motion

**Files:**
- Create: `src/components/AccentWords.tsx`
- Modify: `src/index.css`
- Modify: `src/factory/factory-line.css`
- Modify: `src/components/Statement.tsx`
- Modify: `src/components/SelectedWork.tsx`
- Modify: `src/components/About.tsx`
- Modify: `src/components/Skills.tsx`
- Modify: `src/components/Experience.tsx`
- Modify: `src/components/Goals.tsx`
- Modify: `src/components/ContactSection.tsx`
- Modify: `tests/interface-foundry.test.mjs`
- Modify: `tests/factory-flow.test.mjs`

**Interfaces:**
- Produces: `getReducedFactorySnapshot(stationId)` returning a meaningful stable part layout for every animated station.
- Removes active-page dependence on `SectionLabel`, `FoundryTrace`, `.foundry-label`, `text-muted`, and `text-line-gray` for text hierarchy.

- [ ] **Step 1: Write failing visual-contract tests**

Add tests that read every active section source and assert:

```js
for (const path of activeSections) {
  const source = await read(path)
  assert.doesNotMatch(source, /SectionLabel|FoundryTrace|foundry-label|text-muted|text-line-gray/)
}
```

Add pure reduced-motion assertions:

```js
test('every factory station has a meaningful reduced-motion snapshot', async () => {
  const { getReducedFactorySnapshot } = await import('../src/factory/factoryFlowModel.ts')
  for (const station of ['statement', 'skills', 'experience', 'goals', 'contact']) {
    assert.ok(getReducedFactorySnapshot(station).length > 0)
  }
})
```

- [ ] **Step 2: Verify RED**

Run focused tests; expect obsolete imports/classes and missing snapshot helper.

- [ ] **Step 3: Implement semantic highlight and typography rules**

Create one reusable heading helper for the selected headings:

```tsx
import { Fragment } from 'react'

export function AccentWords({ parts }: { parts: ReadonlyArray<{ text: string; color?: 'pink' | 'blue' }> }) {
  return parts.map(({ text, color }, index) => (
    <Fragment key={`${text}-${index}`}>
      {index > 0 ? ' ' : null}
      <span className={color === 'pink' ? 'text-signal-pink' : color === 'blue' ? 'text-cobalt' : undefined}>{text}</span>
    </Fragment>
  ))
}
```

Do not split translated prose by hard-coded English/Czech word positions. Add explicit translated heading parts for exactly these accents:

- Czech `skills.headingParts`: `[{ text: 'Dovednosti &' }, { text: 'Tech Stack', color: 'blue' }]`.
- English `skills.headingParts`: `[{ text: 'Skills &' }, { text: 'Tech Stack', color: 'blue' }]`.
- Czech `goals.headingParts`: `[{ text: 'Cíle a' }, { text: 'plány', color: 'blue' }]`.
- English `goals.headingParts`: `[{ text: 'Goals &' }, { text: 'Plans', color: 'blue' }]`.
- Czech `contact.headingParts`: `[{ text: 'Pojďme' }, { text: 'tvořit spolu', color: 'pink' }]`.
- English `contact.headingParts`: `[{ text: "Let's" }, { text: 'create together', color: 'pink' }]`.

After every consumer uses `headingParts`, remove the superseded `skills.sectionTitle`, `skills.sectionTitle2`, `goals.sectionTitle`, `goals.queueTitle`, and `contact.title` keys in the same task. Keep all other translated content unchanged.

- [ ] **Step 4: Implement mobile and reduced-motion behavior**

Mobile rules must:

- place the heading/copy before its station;
- narrow free-fall spread and reduce active body limit;
- keep every station present;
- prevent horizontal overflow at 320px width;
- keep project controls and contact fields above the physics layer.

`getReducedFactorySnapshot` returns stable completed states: released parts near Statement, one revealed UI element in Skills, painted parts past inspection, one part in each Goals lane, and a completed browser in Contact.

- [ ] **Step 5: Remove dead active-page visual primitives**

After imports are removed, confirm whether `SectionLabel`, `FoundryTrace`, and `AssemblyCell` have any remaining consumers with:

```powershell
Get-ChildItem src -Recurse -File | Select-String -Pattern 'SectionLabel|FoundryTrace|AssemblyCell'
```

Delete a primitive only when the search proves there are no active consumers and it is not required by another route. Otherwise leave the file intact.

- [ ] **Step 6: Verify and commit**

Run full tests, lint, build, and diff check. Run the Impeccable detector once over all changed UI targets:

```powershell
node "C:\Users\andre\.codex\plugins\cache\impeccable\impeccable\4.0.4\skills\impeccable\scripts\detect.mjs" --json src/pages/home_impl.tsx src/components src/factory src/index.css
```

Fix mechanical findings in one batch, rerun tests/lint/build, and commit exact Task 11 files with:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add src/components/AccentWords.tsx src/index.css src/factory/factory-line.css src/components/Statement.tsx src/components/SelectedWork.tsx src/components/About.tsx src/components/Skills.tsx src/components/Experience.tsx src/components/Goals.tsx src/components/ContactSection.tsx tests/interface-foundry.test.mjs tests/factory-flow.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "style: unify factory line visual system"
```

Do not rerun the detector after the single prescribed pass.

---

### Task 12: Runtime trajectory QA and final integration gate

**Files:**
- Modify only files implicated by verified defects from this task.
- Update tests corresponding to every repaired behavior before its fix.
- Do not create committed screenshot or `.impeccable/` artifacts unless the user explicitly requests them.

**Interfaces:**
- Verifies the complete public behavior; produces no new architecture.

- [ ] **Step 1: Run the complete automated gate**

Run:

```powershell
npm test
npm run lint
npm run build
git -c safe.directory=D:/kodovani/Portfolio diff --check
```

Expected: zero test failures, zero lint errors, successful production build, and no whitespace errors. The existing Vite chunk-size warning may be reported but must not be described as an error.

- [ ] **Step 2: Start Vite and perform one batched browser inspection**

Use the available Playwright browser tooling against the running Vite app. Inspect together:

- desktop 1440×900;
- mobile 390×844;
- narrow mobile 320px width;
- default and reduced-motion modes;
- Czech and English;
- page top, every station boundary, and Contact.

Do not add a direct Playwright dependency for this inspection.

- [ ] **Step 3: Measure trajectories, not only screenshots**

In the browser, sample `[data-factory-part]` transforms across time and assert:

- no positive/negative discontinuity larger than one normal physics step when crossing visible section boundaries;
- no duplicate id visible in the same act;
- body count stays at or below the configured desktop/mobile active limit during a five-minute run;
- hero waits at 30 before release and produces sequence values beyond 30 afterward;
- upper engine is absent while the white About fills the viewport;
- the final browser assembles once and later objects leave below/around it;
- no runtime errors or warnings appear in the console.

- [ ] **Step 4: Test fast navigation and lifecycle edges**

Exercise:

- slow wheel scroll across every black-section boundary;
- fast scroll from Hero to Skills;
- direct anchor navigation to Projects, About, Skills, Experience, and Contact;
- resize from desktop to mobile and back while no station is capturing a part;
- language switch while Statement and a station are visible;
- tab hidden for at least one second and restored.

Any failure gets a new focused failing model/integration test before the minimal fix.

- [ ] **Step 5: Apply one batched defect fix round and one confirmation round**

Group all defects from the first desktop/mobile inspection, fix them together, then repeat the same automated gate and browser measurements once. Stop after the confirmation round and report any remaining material issue rather than entering an open-ended polish loop.

- [ ] **Step 6: Review exact scope and commit integration fixes**

Run:

```powershell
git -c safe.directory=D:/kodovani/Portfolio status --short
git -c safe.directory=D:/kodovani/Portfolio diff --stat
git -c safe.directory=D:/kodovani/Portfolio diff --check
```

Verify that no browser profiles, screenshots, `.impeccable/`, `.superpowers/`, build output, or unrelated user files are staged.

Commit only verified integration fixes:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add -p
git -c safe.directory=D:/kodovani/Portfolio diff --cached --check
git -c safe.directory=D:/kodovani/Portfolio commit -m "test: verify continuous factory line"
```

If no integration fix was needed, do not create an empty commit.

## Final acceptance checklist

- [ ] Hero waits at 30 objects, releases once at Statement, then streams continuously with a bounded pool.
- [ ] Statement uses the faster hero-style word reveal and a physical rebound platform.
- [ ] Selected Work remains the early dominant proof and all project interactions still work.
- [ ] About is the only white full-page reading break and contains no physics.
- [ ] Upper and lower acts each use one shared Matter.js engine for simultaneously visible black sections.
- [ ] Skills press performs sensor → stop → cover → transform → reveal → release.
- [ ] Experience applies white/pink/blue roles and visibly inspects each part.
- [ ] Goals routes bodies physically through three lanes and rejoins them before Contact.
- [ ] Contact assembles the browser once; later bodies bounce/slide around it without covering the form.
- [ ] No visible boundary contains teleportation, duplication, or discontinuous velocity.
- [ ] No eyebrow labels, section indices, gray hierarchy, or decorative foundry traces remain in active sections.
- [ ] Desktop, mobile, language switching, anchor jumps, hidden-tab recovery, resize, and reduced motion are verified.
- [ ] `npm test`, `npm run lint`, `npm run build`, and `git diff --check` pass on the final tree.
