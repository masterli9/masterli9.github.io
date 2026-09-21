# Contact NOVA Final Assembler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nahradit současný úzký Contact a kruhový placeholder assembler rovnocenným desktopovým layoutem 1:1, širokým funkčním formulářem a hybridním sestavením pěti skutečných dílů do mini landing page NOVA.

**Architecture:** Matter.js řídí díly až po capture senzor nad NOVA rámem. Čistý stavový model atomicky rezervuje jeden z pěti sémantických slotů; React/Framer Motion převezme díl na stejné obrazovkové pozici, usadí sdílený `FactoryPartGraphic` do přesného SVG slotu a po dokončení aktivuje jednorázový fyzikální odraz dalších dílů. Contact layout a formulář zůstávají oddělené od fyzikálního controlleru.

**Tech Stack:** React 19, TypeScript 5.9, Matter.js 0.20, Framer Motion 12, Tailwind CSS 4 plus lokální CSS, Node test runner, Vite 7, Playwright MCP.

**Spec:** `docs/superpowers/specs/2026-09-21-contact-final-assembler-design.md`

## Global Constraints

- Výstup je dekorativní landing page `NOVA / Ideas in motion. / Explore`, nikoliv screenshot portfolia ani interaktivní vložený web.
- Desktopový Contact používá dvě rovnocenné poloviny 1:1; levá patří úvodu a formuláři, pravá assembleru.
- Sekce nemá horní dělící čáru. Mobilní pořadí je úvod → assembler → formulář.
- Zachovat EmailJS, honeypot `website_url`, pětiminutový localStorage rate limit, českou/anglickou lokalizaci a pole `from_name`, `reply_to`, `subject`, `message`.
- Matter.js řídí vstupní pád; finální usazení řídí SVG/Framer Motion bez viditelného skoku.
- Sestavení vyžaduje právě pět unikátních slotů `brand`, `heading`, `copy`, `cta`, `visual`; v jednom okamžiku se usazuje nejvýše jeden díl.
- Duplicita a každý díl po dokončení dostanou nejvýše jeden omezený impuls vzhůru a od středu a potom pokračují fyzikou.
- `prefers-reduced-motion: reduce` vykreslí rovnou hotovou NOVA stránku bez volných Contact snapshotů, přeletu, aktivační animace a overflow impulsů.
- Nepřidávat závislosti. Nepoužívat gradienty, glow, stíny, glassmorphism, zaoblené card-grid prvky ani náhradní kruhy.
- Neměnit Hero, Statement collider, Selected Work, About, Skills ani Experience kromě nutného pokračování existujícího spodního factory toku.
- Všechny producenty a kolizní obsluhu gateovat přes `simulationActive`; hotový stav nesmí po suspend/restore vytvořit duplicitní tělo.

## File Map

- Create `src/factory/stations/contactAssemblyModel.ts`: čistý stav, rozhodování capture/overflow, viewBox geometrie, sloty, projekce souřadnic a impuls.
- Create `src/factory/stations/FinalAssemblerScene.tsx`: čisté SVG NOVA, prázdné sloty, trvalé díly a jeden Framer Motion handoff.
- Modify `src/factory/stations/FinalAssembler.tsx`: Matter collidery, kolizní controller, atomické odebrání těla a lifecycle napojení.
- Delete `src/factory/stations/finalAssemblerModel.ts`: odstranit dočasnou legacy mapu a počet-ID assembly.
- Modify `src/factory/factoryFlowModel.ts`: v reduced motion nevytvářet volné Contact snapshoty.
- Modify `src/factory/factory-line.css`: NOVA scene, fyzicky shodná horní hrana, aktivace a reduced-motion pravidla.
- Modify `src/components/ContactSection.tsx`: grid-area struktura pro desktop 1:1 a mobilní pořadí.
- Modify `src/components/ContactForm.tsx`: široká field grid kompozice při zachování submit kontraktu.
- Create `src/components/contact.css`: layout, pole, submit a copy-feedback stavy.
- Modify `tests/factory-flow.test.mjs`: čistý assembly model, projekce, collidery, overflow a reduced snapshoty.
- Modify `tests/interface-foundry.test.mjs`: source kontrakty scény, controlleru, layoutu, formuláře a přístupnosti.

## Review Focus

- Jedna Matter událost může obsahovat capture i roof kontakt stejného těla; Task 3 testuje dvoufázové zpracování, ve kterém úspěšně zachycené ID nikdy nedostane overflow impuls.
- Nehotový, duplicitní nebo během jiného handoffu příchozí díl nesmí obsadit slot; Task 1 testuje výsledky `unfinished`, `duplicate` a `busy`.
- Opakované collision pairs stejného těla nesmějí násobit sílu; Task 1 testuje idempotentní `claimFinalOverflow`.
- Přepnutí reduced motion a návrat po suspend/restore nesmějí vykreslit assembled SVG zároveň s volnými Contact snapshoty; Task 4 testuje prázdný reduced snapshot a browser acceptance kontroluje návrat.
- Na šířce 320 px nesmí dlouhý e-mail, field grid ani submit rozšířit dokument; Task 5 přidává layout kontrakt a Task 6 měří `scrollWidth`.

---

### Task 1: Vytvořit čistý model sémantického assembleru

**Files:**
- Create: `src/factory/stations/contactAssemblyModel.ts`
- Modify: `tests/factory-flow.test.mjs`

**Interfaces:**
- Consumes: `FactoryAssemblySlot`, `FactoryPartSpec` z `src/factory/factoryTypes.ts`.
- Produces: `FINAL_ASSEMBLY_SLOTS`, `FINAL_ASSEMBLER_VIEWBOX`, `NOVA_FRAME`, `FINAL_ASSEMBLY_LAYOUT`, `FinalAssemblyState`, `FinalAssemblyDecision`, `FinalAssemblerCapturePose`, `FinalAssemblerColliderSpec`, `createFinalAssemblyState`, `decideFinalAssembly`, `beginFinalAssembly`, `completeFinalAssembly`, `claimFinalOverflow`, `getFinalOverflowImpulse`, `projectFinalAssemblerPose`, `getFinalAssemblerColliderSpecs`.

- [ ] **Step 1: Napsat failing testy pro unikátní sloty, nehotové díly a single-flight rezervaci**

Do `tests/factory-flow.test.mjs` přidej:

```js
test('final assembly accepts one inspected part per unique semantic slot', async () => {
  const model = await import('../src/factory/stations/contactAssemblyModel.ts')
  let state = model.createFinalAssemblyState()
  const brand = makePart({ id: 'brand-1', role: 'brand', assemblySlot: 'brand', stage: 'inspected' })
  const heading = makePart({ id: 'heading-1', role: 'heading', assemblySlot: 'heading', stage: 'inspected' })

  let result = model.beginFinalAssembly(state, brand)
  assert.deepEqual(result.decision, { kind: 'capture', slot: 'brand' })
  state = result.state
  assert.equal(state.active?.part.id, 'brand-1')

  result = model.beginFinalAssembly(state, heading)
  assert.deepEqual(result.decision, { kind: 'overflow', reason: 'busy' })
  state = model.completeFinalAssembly(state, 'brand-1')
  assert.equal(state.placements.brand?.stage, 'assembled')

  result = model.beginFinalAssembly(state, makePart({ id: 'brand-2', assemblySlot: 'brand', stage: 'inspected' }))
  assert.deepEqual(result.decision, { kind: 'overflow', reason: 'duplicate' })

  result = model.beginFinalAssembly(state, makePart({ id: 'raw-1', assemblySlot: 'visual', stage: 'formed' }))
  assert.deepEqual(result.decision, { kind: 'overflow', reason: 'unfinished' })
})

test('final assembly completes only after all five unique slots settle', async () => {
  const model = await import('../src/factory/stations/contactAssemblyModel.ts')
  let state = model.createFinalAssemblyState()
  for (const [index, slot] of model.FINAL_ASSEMBLY_SLOTS.entries()) {
    const part = makePart({ id: `${slot}-${index}`, role: slot, assemblySlot: slot, stage: 'inspected' })
    state = model.beginFinalAssembly(state, part).state
    state = model.completeFinalAssembly(state, part.id)
    assert.equal(state.assembled, index === model.FINAL_ASSEMBLY_SLOTS.length - 1)
  }
  assert.deepEqual(Object.keys(state.placements).sort(), [...model.FINAL_ASSEMBLY_SLOTS].sort())
  assert.deepEqual(model.beginFinalAssembly(state, makePart({ id: 'late', stage: 'inspected' })).decision, {
    kind: 'overflow', reason: 'complete',
  })
})
```

- [ ] **Step 2: Napsat failing testy pro idempotentní overflow, projekci a fyzickou střechu**

```js
test('overflow impulse is claimed once and points up and away from center', async () => {
  const model = await import('../src/factory/stations/contactAssemblyModel.ts')
  let state = model.createFinalAssemblyState()
  let claim = model.claimFinalOverflow(state, 'overflow-1')
  assert.equal(claim.apply, true)
  state = claim.state
  claim = model.claimFinalOverflow(state, 'overflow-1')
  assert.equal(claim.apply, false)
  assert.deepEqual(model.getFinalOverflowImpulse(200), { x: -0.0018, y: -0.0036 })
  assert.deepEqual(model.getFinalOverflowImpulse(440), { x: 0.0018, y: -0.0036 })
  assert.deepEqual(model.getFinalOverflowImpulse(320), { x: 0.0018, y: -0.0036 })
})

test('assembler pose projection and slot layout remain in viewBox coordinates', async () => {
  const model = await import('../src/factory/stations/contactAssemblyModel.ts')
  assert.deepEqual(model.projectFinalAssemblerPose({
    bodyX: 420, bodyY: 310, angleRadians: Math.PI / 2,
    stationOffsetX: 100, stationOffsetY: 0, scaleX: 0.5, scaleY: 0.5,
  }), { x: 640, y: 620, angleDegrees: 90 })
  for (const slot of model.FINAL_ASSEMBLY_SLOTS) {
    const point = model.FINAL_ASSEMBLY_LAYOUT[slot]
    assert.ok(point.x > model.NOVA_FRAME.x && point.x < model.NOVA_FRAME.x + model.NOVA_FRAME.width)
    assert.ok(point.y > model.NOVA_FRAME.y && point.y < model.NOVA_FRAME.y + model.NOVA_FRAME.height)
  }
  const colliders = model.getFinalAssemblerColliderSpecs()
  assert.equal(colliders[0].label, 'contact-capture-zone')
  assert.equal(colliders[0].kind, 'rectangle')
  assert.equal(colliders[0].isSensor, true)
  assert.deepEqual(colliders.slice(1).map(({ label }) => label), [
    'contact-overflow-roof-left', 'contact-overflow-roof-right',
  ])
})
```

- [ ] **Step 3: Spustit focused test a potvrdit očekávaný fail**

Run:

```powershell
node --test --test-name-pattern "final assembly|overflow impulse|assembler pose" tests/factory-flow.test.mjs
```

Expected: FAIL s `ERR_MODULE_NOT_FOUND` pro `contactAssemblyModel.ts`.

- [ ] **Step 4: Implementovat přesný stav, sloty a deterministická rozhodnutí**

Vytvoř `src/factory/stations/contactAssemblyModel.ts` s těmito veřejnými typy a konstantami:

```ts
import type { FactoryAssemblySlot, FactoryPartSpec } from '../factoryTypes'

export const FINAL_ASSEMBLY_SLOTS = ['brand', 'heading', 'copy', 'cta', 'visual'] as const
export const FINAL_ASSEMBLER_VIEWBOX = { width: 640, height: 620 } as const
export const NOVA_FRAME = { x: 40, y: 170, width: 560, height: 385, centerX: 320 } as const

export interface FinalAssemblySlotTransform {
  x: number
  y: number
  rotation: number
  scale: number
  guideWidth: number
  guideHeight: number
}

export const FINAL_ASSEMBLY_LAYOUT: Record<FactoryAssemblySlot, FinalAssemblySlotTransform> = {
  brand: { x: 92, y: 205, rotation: 0, scale: 1.15, guideWidth: 28, guideHeight: 28 },
  heading: { x: 196, y: 320, rotation: -2, scale: 2.2, guideWidth: 128, guideHeight: 48 },
  copy: { x: 202, y: 382, rotation: 0, scale: 1.8, guideWidth: 126, guideHeight: 30 },
  cta: { x: 154, y: 446, rotation: 1, scale: 1.65, guideWidth: 92, guideHeight: 38 },
  visual: { x: 450, y: 368, rotation: 3, scale: 3.25, guideWidth: 190, guideHeight: 148 },
}

export interface FinalAssemblyPlacement {
  part: FactoryPartSpec
  slot: FactoryAssemblySlot
}

export interface FinalAssemblyState {
  placements: Partial<Record<FactoryAssemblySlot, FactoryPartSpec>>
  active: FinalAssemblyPlacement | null
  overflowedIds: string[]
  assembled: boolean
}

export type FinalAssemblyDecision =
  | { kind: 'capture'; slot: FactoryAssemblySlot }
  | { kind: 'overflow'; reason: 'busy' | 'duplicate' | 'complete' | 'unfinished' }

export interface FinalAssemblerCapturePose {
  x: number
  y: number
  angleDegrees: number
}
```

Implementuj přechody bez mutace vstupního stavu:

```ts
const hasAllSlots = (placements: FinalAssemblyState['placements']) =>
  FINAL_ASSEMBLY_SLOTS.every((slot) => placements[slot] !== undefined)

export function createFinalAssemblyState(seed: readonly FactoryPartSpec[] = []): FinalAssemblyState {
  const placements: FinalAssemblyState['placements'] = {}
  for (const part of seed) {
    if (!placements[part.assemblySlot]) placements[part.assemblySlot] = { ...part, stage: 'assembled' }
  }
  return { placements, active: null, overflowedIds: [], assembled: hasAllSlots(placements) }
}

export function decideFinalAssembly(state: FinalAssemblyState, part: FactoryPartSpec): FinalAssemblyDecision {
  if (part.stage !== 'inspected' && part.stage !== 'assembled') return { kind: 'overflow', reason: 'unfinished' }
  if (state.assembled) return { kind: 'overflow', reason: 'complete' }
  if (state.active) return { kind: 'overflow', reason: 'busy' }
  if (state.placements[part.assemblySlot]) return { kind: 'overflow', reason: 'duplicate' }
  return { kind: 'capture', slot: part.assemblySlot }
}

export function beginFinalAssembly(state: FinalAssemblyState, part: FactoryPartSpec) {
  const decision = decideFinalAssembly(state, part)
  if (decision.kind === 'overflow') return { state, decision }
  return { state: { ...state, active: { part: { ...part }, slot: decision.slot } }, decision }
}

export function completeFinalAssembly(state: FinalAssemblyState, partId: string): FinalAssemblyState {
  if (!state.active || state.active.part.id !== partId) return state
  const placements = {
    ...state.placements,
    [state.active.slot]: { ...state.active.part, stage: 'assembled' as const },
  }
  return { ...state, placements, active: null, assembled: hasAllSlots(placements) }
}

export function claimFinalOverflow(state: FinalAssemblyState, partId: string) {
  if (state.overflowedIds.includes(partId)) return { state, apply: false }
  return { state: { ...state, overflowedIds: [...state.overflowedIds, partId] }, apply: true }
}

export function getFinalOverflowImpulse(partX: number, centerX = NOVA_FRAME.centerX) {
  return { x: partX < centerX ? -0.0018 : 0.0018, y: -0.0036 }
}
```

- [ ] **Step 5: Implementovat projekci a collider descriptors ve stejném modelu**

```ts
export function projectFinalAssemblerPose(input: {
  bodyX: number
  bodyY: number
  angleRadians: number
  stationOffsetX: number
  stationOffsetY: number
  scaleX: number
  scaleY: number
}): FinalAssemblerCapturePose {
  return {
    x: (input.bodyX - input.stationOffsetX) / input.scaleX,
    y: (input.bodyY - input.stationOffsetY) / input.scaleY,
    angleDegrees: input.angleRadians * 180 / Math.PI,
  }
}

export type FinalAssemblerColliderSpec =
  | { kind: 'rectangle'; label: string; x: number; y: number; width: number; height: number; isSensor: boolean }
  | { kind: 'segment'; label: string; x1: number; y1: number; x2: number; y2: number; isSensor: boolean }

const FINAL_ASSEMBLER_COLLIDERS: readonly FinalAssemblerColliderSpec[] = [
  { kind: 'rectangle', label: 'contact-capture-zone', x: 320, y: 108, width: 520, height: 96, isSensor: true },
  { kind: 'segment', label: 'contact-overflow-roof-left', x1: 40, y1: 170, x2: 320, y2: 158, isSensor: false },
  { kind: 'segment', label: 'contact-overflow-roof-right', x1: 320, y1: 158, x2: 600, y2: 170, isSensor: false },
]

export const getFinalAssemblerColliderSpecs = () => FINAL_ASSEMBLER_COLLIDERS
```

Collider bodies vytvoří až runtime; model nesmí importovat Matter.js ani DOM typy.

- [ ] **Step 6: Spustit focused a celý modelový suite**

Run:

```powershell
node --test --test-name-pattern "final assembly|overflow impulse|assembler pose" tests/factory-flow.test.mjs
npm.cmd test
```

Expected: nové testy PASS; celý současný suite PASS.

- [ ] **Step 7: Commitnout čistý model**

```powershell
git -c safe.directory=D:/kodovani/Portfolio add -- src/factory/stations/contactAssemblyModel.ts tests/factory-flow.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: model semantic contact assembly"
```

### Task 2: Vykreslit skutečnou NOVA stránku a řízený handoff

**Files:**
- Create: `src/factory/stations/FinalAssemblerScene.tsx`
- Modify: `src/factory/factory-line.css`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Consumes: `FinalAssemblyState`, `FinalAssemblerCapturePose`, `FINAL_ASSEMBLY_SLOTS`, `FINAL_ASSEMBLY_LAYOUT`, `FINAL_ASSEMBLER_VIEWBOX`, `NOVA_FRAME`; lokální větev `FactoryPartGraphic` pro `FactoryPartSpec`.
- Produces: `FinalAssemblerScene({ stationRef, state, capturePose, reducedMotion, onPlacementComplete })` a stabilní DOM markery `data-assembly-state`, `data-assembly-slot`, `data-overflow-count`.

- [ ] **Step 1: Napsat failing source-kontrakt pro NOVA scénu**

Do `tests/interface-foundry.test.mjs` přidej:

```js
test('the final assembler scene renders semantic NOVA parts instead of placeholder circles', async () => {
  const source = await read('src/factory/stations/FinalAssemblerScene.tsx')
  const css = await read('src/factory/factory-line.css')
  assert.match(source, /FactoryPartGraphic/)
  assert.match(source, /motion\.g/)
  assert.match(source, /FINAL_ASSEMBLY_LAYOUT/)
  assert.match(source, /data-assembly-slot/)
  assert.match(source, /aria-hidden="true"/)
  assert.doesNotMatch(source, /factory-line__assembled-part|<circle[^>]+assembled/)
  assert.match(css, /\.final-assembler__nova-frame/)
  assert.match(css, /\.final-assembler__activation/)
  assert.match(css, /@media \(max-width:\s*640px\)[\s\S]*factory-station\.final-assembler[\s\S]*width:\s*100%/)
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*final-assembler__activation/)
})
```

- [ ] **Step 2: Spustit test a potvrdit očekávaný fail**

Run:

```powershell
node --test --test-name-pattern "final assembler scene" tests/interface-foundry.test.mjs
```

Expected: FAIL s `ENOENT` pro `FinalAssemblerScene.tsx`.

- [ ] **Step 3: Vytvořit prezentaci s viewBoxem, reálnými díly a slot guides**

V `FinalAssemblerScene.tsx` definuj přesné props:

```tsx
import { motion } from 'framer-motion'
import type { RefObject } from 'react'
import { FactoryPartGraphic } from '../FactoryPartGraphic'
import {
  FINAL_ASSEMBLER_VIEWBOX,
  FINAL_ASSEMBLY_LAYOUT,
  FINAL_ASSEMBLY_SLOTS,
  NOVA_FRAME,
  type FinalAssemblerCapturePose,
  type FinalAssemblyState,
} from './contactAssemblyModel'

interface FinalAssemblerSceneProps {
  stationRef: RefObject<HTMLDivElement | null>
  state: FinalAssemblyState
  capturePose: FinalAssemblerCapturePose | null
  reducedMotion: boolean
  onPlacementComplete: (partId: string) => void
}
```

Vrať jednu dekorativní stanici s fyzicky shodným horním obrysem a bez interaktivních prvků:

```tsx
export function FinalAssemblerScene({
  stationRef, state, capturePose, reducedMotion, onPlacementComplete,
}: FinalAssemblerSceneProps) {
  const assemblyState = state.assembled ? 'complete' : state.active ? 'placing' : 'collecting'
  return (
    <div
      ref={stationRef}
      className={`factory-station final-assembler${state.assembled ? ' is-assembled' : ''}`}
      data-factory-station="contact"
      data-assembly-state={assemblyState}
      data-overflow-count={state.overflowedIds.length}
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${FINAL_ASSEMBLER_VIEWBOX.width} ${FINAL_ASSEMBLER_VIEWBOX.height}`} focusable="false">
        <path d="M40 170 320 158 600 170V555H40Z" className="final-assembler__nova-frame" />
        <path d="M40 215H600M360 215V555" className="final-assembler__nova-grid" />
        <path d="M40 170 320 158 600 170" className="final-assembler__roof" />
        <path d="M72 145H568" className="final-assembler__intake" />
        {FINAL_ASSEMBLY_SLOTS.map((slot) => {
          const target = FINAL_ASSEMBLY_LAYOUT[slot]
          const part = state.placements[slot]
          return part ? (
            <g key={slot} data-assembly-slot={slot} transform={`translate(${target.x} ${target.y}) rotate(${target.rotation}) scale(${target.scale})`}>
              <FactoryPartGraphic part={part} />
            </g>
          ) : (
            <rect
              key={slot}
              data-slot-placeholder={slot}
              x={target.x - target.guideWidth / 2}
              y={target.y - target.guideHeight / 2}
              width={target.guideWidth}
              height={target.guideHeight}
              className="final-assembler__slot"
            />
          )
        })}
        {state.active && capturePose && (() => {
          const target = FINAL_ASSEMBLY_LAYOUT[state.active.slot]
          const bendX = capturePose.x + ((target.x - capturePose.x) * 0.34)
          return (
            <motion.g
              key={state.active.part.id}
              data-assembly-active={state.active.part.id}
              initial={{ x: capturePose.x, y: capturePose.y, rotate: capturePose.angleDegrees, scale: 1 }}
              animate={reducedMotion ? { x: target.x, y: target.y, rotate: target.rotation, scale: target.scale } : {
                x: [capturePose.x, bendX, target.x],
                y: [capturePose.y, NOVA_FRAME.y - 24, target.y],
                rotate: [capturePose.angleDegrees, 0, target.rotation],
                scale: [1, 0.92, target.scale],
              }}
              transition={{ duration: reducedMotion ? 0 : 0.64, times: [0, 0.36, 1], ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => onPlacementComplete(state.active!.part.id)}
            >
              <FactoryPartGraphic part={{ ...state.active.part, stage: 'assembled' }} />
            </motion.g>
          )
        })()}
        <path d="M54 536H586" className="final-assembler__activation" />
      </svg>
    </div>
  )
}
```

`NOVA_FRAME` použij alespoň pro motion waypoint a budoucí geometrii; nenechávej mrtvý import.

- [ ] **Step 4: Nahradit staré Contact CSS jasným NOVA systémem**

V `factory-line.css` odstraň `.factory-line__browser-frame`, `.factory-line__capture-zone`, `.factory-line__assembled-part` a starý portrétní `aspect-ratio: 8 / 13`. Přidej:

```css
.final-assembler {
  width: 100%;
  max-width: none;
  aspect-ratio: 32 / 31;
}

.final-assembler__nova-frame {
  fill: #050505;
  stroke: var(--color-soft-white);
  stroke-width: 3;
  stroke-linejoin: round;
}

.final-assembler__nova-grid,
.final-assembler__roof,
.final-assembler__intake {
  fill: none;
  stroke: var(--color-soft-white);
  stroke-width: 2;
}

.final-assembler__intake {
  stroke: var(--color-signal-pink);
  stroke-dasharray: 12 10;
}

.final-assembler__slot {
  fill: none;
  stroke: var(--color-cobalt);
  stroke-width: 1.5;
  stroke-dasharray: 5 6;
  opacity: 0.38;
}

.final-assembler__activation {
  fill: none;
  stroke: var(--color-signal-pink);
  stroke-width: 4;
  stroke-dasharray: 532;
  stroke-dashoffset: 532;
}

.final-assembler.is-assembled .final-assembler__activation {
  animation: final-assembler-activate 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes final-assembler-activate {
  to { stroke-dashoffset: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .final-assembler__activation { animation: none !important; stroke-dashoffset: 0; }
}

@media (max-width: 640px) {
  .factory-station.final-assembler { width: 100%; }
}
```

- [ ] **Step 5: Spustit source test, lint a build**

Run:

```powershell
node --test --test-name-pattern "final assembler scene" tests/interface-foundry.test.mjs
npm.cmd run lint
npm.cmd run build
```

Expected: PASS; build smí obsahovat pouze existující upozornění na velikost chunku.

- [ ] **Step 6: Commitnout samostatnou scénu**

```powershell
git -c safe.directory=D:/kodovani/Portfolio add -- src/factory/stations/FinalAssemblerScene.tsx src/factory/factory-line.css tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: render NOVA contact assembly scene"
```

### Task 3: Zapojit Matter capture, atomický handoff a horní odraz

**Files:**
- Modify: `src/factory/stations/FinalAssembler.tsx`
- Delete: `src/factory/stations/finalAssemblerModel.ts`
- Modify: `tests/factory-flow.test.mjs`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Consumes: všechny veřejné funkce z `contactAssemblyModel.ts`, `useFactoryAct().simulationActive`, `removePart`, `useFactoryStation`, Matter `Body`, `Bodies`, `Events` a `FinalAssemblerScene`.
- Produces: kolizní controller, který nejdřív zpracuje capture pairs, poté roof pairs, a předává prezentaci pouze serializovatelný assembly stav a lokální capture pose.

- [ ] **Step 1: Nahradit legacy source testy failing controller kontraktem**

V `tests/factory-flow.test.mjs` smaž test `legacy assembler slots use semantic assembly slots without changing the part`.

V `tests/interface-foundry.test.mjs` nahraď test o passable top edge tímto:

```js
test('the contact controller hands Matter parts to semantic assembly before overflow processing', async () => {
  const source = await read('src/factory/stations/FinalAssembler.tsx')
  assert.match(source, /simulationActive/)
  assert.match(source, /beginFinalAssembly/)
  assert.match(source, /projectFinalAssemblerPose/)
  assert.match(source, /removePart\(partId\)/)
  assert.match(source, /const capturedBodies = new Set/)
  assert.ok(source.indexOf('const capturePairs') < source.indexOf('const roofPairs'))
  assert.match(source, /claimFinalOverflow/)
  assert.match(source, /Body\.applyForce/)
  assert.match(source, /<FinalAssemblerScene/)
  assert.doesNotMatch(source, /Constraint\.create|window\.setTimeout|factory-line__assembled-part/)
})
```

- [ ] **Step 2: Spustit focused test a potvrdit fail proti legacy controlleru**

Run:

```powershell
node --test --test-name-pattern "contact controller" tests/interface-foundry.test.mjs
```

Expected: FAIL, protože současná komponenta používá `Constraint.create`, timeout a kruhy.

- [ ] **Step 3: Převést collider descriptors na Matter body**

Ve `FinalAssembler.tsx` ponech `getPartId`, odstraň `Constraint`, `Composite`, `placedSlots`, `capturedRef`, `constraintsRef`, `assemblyRef` a timers. Přidej converter:

```ts
function createCollider(metrics: FactoryStationMetrics, spec: FinalAssemblerColliderSpec) {
  const scaleX = Math.max(metrics.elementRect.width, 1) / FINAL_ASSEMBLER_VIEWBOX.width
  const scaleY = Math.max(metrics.elementRect.height, 1) / FINAL_ASSEMBLER_VIEWBOX.height
  const offsetX = metrics.elementRect.left - metrics.actRect.left
  const offsetY = metrics.elementRect.top - metrics.actRect.top
  if (spec.kind === 'rectangle') {
    return Bodies.rectangle(
      offsetX + spec.x * scaleX,
      offsetY + spec.y * scaleY,
      spec.width * scaleX,
      spec.height * scaleY,
      { isStatic: true, isSensor: spec.isSensor, label: spec.label },
    )
  }
  const start = { x: offsetX + spec.x1 * scaleX, y: offsetY + spec.y1 * scaleY }
  const end = { x: offsetX + spec.x2 * scaleX, y: offsetY + spec.y2 * scaleY }
  const body = Bodies.rectangle(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2,
    Math.hypot(end.x - start.x, end.y - start.y),
    4 * Math.min(scaleX, scaleY),
    { isStatic: true, isSensor: spec.isSensor, friction: 0.02, restitution: 0.92, label: spec.label },
  )
  Body.setAngle(body, Math.atan2(end.y - start.y, end.x - start.x))
  return body
}
```

`buildColliders` bude stabilní callback bez assembly-state dependency:

```ts
const stationCenterXRef = useRef(0)
const buildColliders = useCallback((metrics: FactoryStationMetrics) => {
  const scaleX = Math.max(metrics.elementRect.width, 1) / FINAL_ASSEMBLER_VIEWBOX.width
  stationCenterXRef.current = metrics.elementRect.left - metrics.actRect.left + NOVA_FRAME.centerX * scaleX
  return getFinalAssemblerColliderSpecs().map((spec) => createCollider(metrics, spec))
}, [])
```

- [ ] **Step 4: Implementovat atomický capture a lokální pose**

Drž React state i synchronní ref, aby jeden collision frame nemohl rezervovat dva díly:

```ts
const stationRef = useRef<HTMLDivElement>(null)
const [assemblyState, setAssemblyState] = useState(() => createFinalAssemblyState())
const assemblyStateRef = useRef(assemblyState)
const [capturePose, setCapturePose] = useState<FinalAssemblerCapturePose | null>(null)

const commitAssemblyState = useCallback((next: FinalAssemblyState) => {
  assemblyStateRef.current = next
  setAssemblyState(next)
}, [])
```

`capturePart` musí vrátit `true` pouze při skutečném převzetí těla:

```ts
const capturePart = useCallback((part: MatterBody) => {
  if (!simulationActive) return false
  const spec = part.plugin.factoryPartSpec as FactoryPartSpec
  const result = beginFinalAssembly(assemblyStateRef.current, spec)
  if (result.decision.kind !== 'capture') return false
  const station = stationRef.current
  const act = station?.closest<HTMLElement>('[data-factory-act]')
  if (!station || !act) return false
  const stationRect = station.getBoundingClientRect()
  const actRect = act.getBoundingClientRect()
  const scaleX = Math.max(stationRect.width, 1) / FINAL_ASSEMBLER_VIEWBOX.width
  const scaleY = Math.max(stationRect.height, 1) / FINAL_ASSEMBLER_VIEWBOX.height
  const partId = getPartId(part)
  setCapturePose(projectFinalAssemblerPose({
    bodyX: part.position.x,
    bodyY: part.position.y,
    angleRadians: part.angle,
    stationOffsetX: stationRect.left - actRect.left,
    stationOffsetY: stationRect.top - actRect.top,
    scaleX,
    scaleY,
  }))
  commitAssemblyState(result.state)
  removePart(partId)
  return true
}, [commitAssemblyState, removePart, simulationActive])
```

Nevolej `updatePartSpec`: živé tělo se odstraní a persistentní SVG díl nastaví `completeFinalAssembly` na `assembled`.

- [ ] **Step 5: Zpracovat capture pairs před roof pairs a aplikovat impuls jednou**

V collision efektu nejdřív vytvoř normalizované kontakty `{ part, surface }`, potom dvě explicitní kolekce:

```ts
const handleCollision = ({ pairs }: { pairs: Array<{ bodyA: MatterBody; bodyB: MatterBody }> }) => {
  if (!simulationActive) return
  const contacts = pairs.flatMap((pair) => {
    const part = pair.bodyA.label.startsWith('factory-part-') ? pair.bodyA
      : pair.bodyB.label.startsWith('factory-part-') ? pair.bodyB : null
    const surface = pair.bodyA.label.startsWith('contact-') ? pair.bodyA
      : pair.bodyB.label.startsWith('contact-') ? pair.bodyB : null
    return part && surface ? [{ part, surface }] : []
  })
  const capturedBodies = new Set<number>()
  const capturePairs = contacts.filter(({ surface }) => surface.label === 'contact-capture-zone')
  for (const { part } of capturePairs) if (capturePart(part)) capturedBodies.add(part.id)

  const roofPairs = contacts.filter(({ surface }) => surface.label.startsWith('contact-overflow-roof-'))
  for (const { part } of roofPairs) {
    if (capturedBodies.has(part.id)) continue
    const partId = getPartId(part)
    const claim = claimFinalOverflow(assemblyStateRef.current, partId)
    if (!claim.apply) continue
    commitAssemblyState(claim.state)
    Body.applyForce(
      part,
      part.position,
      getFinalOverflowImpulse(part.position.x, stationCenterXRef.current),
    )
  }
}
```

`stationCenterXRef` se nastavuje při měření colliderů, takže směr impulzu používá skutečný střed stanice v act souřadnicích, ne raw viewBox hodnotu.

- [ ] **Step 6: Dokončit placement callback a vykreslit scénu**

```ts
const finishPlacement = useCallback((partId: string) => {
  const previous = assemblyStateRef.current
  const next = completeFinalAssembly(previous, partId)
  if (next === previous) return
  commitAssemblyState(next)
  setCapturePose(null)
  if (next.assembled) markFinalWebsiteAssembled()
}, [commitAssemblyState, markFinalWebsiteAssembled])

return (
  <FinalAssemblerScene
    stationRef={stationRef}
    state={assemblyState}
    capturePose={capturePose}
    reducedMotion={reducedMotion}
    onPlacementComplete={finishPlacement}
  />
)
```

Efekt registrující `Events.on(engine, 'collisionStart', handleCollision)` musí ve cleanup vždy zavolat odpovídající `Events.off`.

- [ ] **Step 7: Odstranit legacy model a spustit focused suite**

Odstraň `src/factory/stations/finalAssemblerModel.ts` a všechny importy `getBrowserSlot`, `advanceAssembly`, `getPostAssemblyCollisionMode` a `BrowserSlot`.

Run:

```powershell
node --test --test-name-pattern "final assembly|overflow impulse|contact controller|final assembler scene" tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
npm.cmd run lint
npm.cmd run build
```

Expected: PASS; žádné reference na legacy model.

- [ ] **Step 8: Commitnout hybridní runtime**

```powershell
git -c safe.directory=D:/kodovani/Portfolio add -- src/factory/stations/FinalAssembler.tsx src/factory/stations/finalAssemblerModel.ts tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: assemble NOVA through hybrid motion"
```

### Task 4: Uzavřít reduced-motion a suspend/restore kontrakt

**Files:**
- Modify: `src/factory/stations/contactAssemblyModel.ts`
- Modify: `src/factory/stations/FinalAssembler.tsx`
- Modify: `src/factory/factoryFlowModel.ts`
- Modify: `tests/factory-flow.test.mjs`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Consumes: `getLandingPartBlueprint(sequence)`, `createFinalAssemblyState`, `simulationActive`, `reducedMotion`, `markFinalWebsiteAssembled`.
- Produces: `createReducedFinalAssemblyParts(): FactoryPartSpec[]`, hotový seed se stejnými pěti recepty a nulové volné reduced Contact snapshoty.

- [ ] **Step 1: Napsat failing reduced-motion testy**

Do `tests/factory-flow.test.mjs` přidej:

```js
test('reduced contact renders one complete semantic NOVA without free factory snapshots', async () => {
  const assembly = await import('../src/factory/stations/contactAssemblyModel.ts')
  const flow = await import('../src/factory/factoryFlowModel.ts')
  const parts = assembly.createReducedFinalAssemblyParts()
  assert.deepEqual(parts.map(({ assemblySlot }) => assemblySlot), ['brand', 'heading', 'copy', 'cta', 'visual'])
  assert.ok(parts.every(({ stage }) => stage === 'assembled'))
  assert.equal(assembly.createFinalAssemblyState(parts).assembled, true)
  assert.deepEqual(flow.getReducedFactorySnapshot('contact'), [])
})
```

Do `tests/interface-foundry.test.mjs` přidej:

```js
test('the final assembler gates collisions on the factory lifecycle and seeds reduced motion once', async () => {
  const source = await read('src/factory/stations/FinalAssembler.tsx')
  assert.match(source, /if \(!simulationActive \|\| reducedMotion\) return false/)
  assert.match(source, /createReducedFinalAssemblyParts/)
  assert.match(source, /markFinalWebsiteAssembled/)
  assert.match(source, /assemblyStateRef/)
})
```

- [ ] **Step 2: Spustit focused test a potvrdit fail**

Run:

```powershell
node --test --test-name-pattern "reduced contact|factory lifecycle" tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
```

Expected: FAIL, protože helper neexistuje a Contact stále vrací pět reduced bodies.

- [ ] **Step 3: Vytvořit hotový reduced seed z existujících blueprintů**

Do `contactAssemblyModel.ts` importuj `getLandingPartBlueprint` a přidej:

```ts
import { getLandingPartBlueprint } from '../landingPartBlueprints.ts'

export function createReducedFinalAssemblyParts(): FactoryPartSpec[] {
  return FINAL_ASSEMBLY_SLOTS.map((slot, sequence) => {
    const blueprint = getLandingPartBlueprint(sequence)
    return {
      id: `reduced-contact-${slot}`,
      sequence,
      role: blueprint.role,
      shape: blueprint.shape,
      assemblySlot: blueprint.assemblySlot,
      finish: { ...blueprint.finish },
      stage: 'assembled',
    }
  })
}
```

Pořadí prvních pěti blueprintů je již contract-testované jako pět unikátních rolí; helper je nesmí mapovat podle náhradního indexu mimo blueprint.

- [ ] **Step 4: Zabránit dvojím reduced dílům a gateovat runtime**

Ve `factoryFlowModel.ts` změň Contact větev na:

```ts
if (station === 'contact') return []
```

Ve `FinalAssembler.tsx` inicializuj stav podle preference a reaguj i na její pozdější změnu:

```ts
const makeInitialState = () => createFinalAssemblyState(
  reducedMotion ? createReducedFinalAssemblyParts() : [],
)
const [assemblyState, setAssemblyState] = useState(makeInitialState)

useEffect(() => {
  if (!reducedMotion) return
  const complete = createFinalAssemblyState(createReducedFinalAssemblyParts())
  commitAssemblyState(complete)
  setCapturePose(null)
  markFinalWebsiteAssembled()
}, [commitAssemblyState, markFinalWebsiteAssembled, reducedMotion])
```

Capture i overflow vrať okamžitě pro `!simulationActive || reducedMotion`. Nepřidávej cleanup, který by nuloval `assemblyState`; React stav musí přežít interní `FactoryAct.suspendAct()`.

- [ ] **Step 5: Spustit focused a celý automatický suite**

Run:

```powershell
node --test --test-name-pattern "reduced contact|factory lifecycle|final assembly" tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Expected: PASS; pouze známé Vite chunk-size warning.

- [ ] **Step 6: Commitnout lifecycle kontrakt**

```powershell
git -c safe.directory=D:/kodovani/Portfolio add -- src/factory/stations/contactAssemblyModel.ts src/factory/stations/FinalAssembler.tsx src/factory/factoryFlowModel.ts tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "fix: preserve contact assembly lifecycle"
```

### Task 5: Přestavět Contact na desktop 1:1 a široký formulář

**Files:**
- Modify: `src/components/ContactSection.tsx`
- Modify: `src/components/ContactForm.tsx`
- Create: `src/components/contact.css`
- Modify: `src/factory/factory-line.css`
- Modify: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Consumes: současné `t.contact.*`, `copyEmail`, `ContactForm`, `FinalAssembler`, EmailJS env proměnné a stavový submit handler.
- Produces: grid areas `intro`, `assembler`, `form`; formulářové třídy `contact-form__field--name|email|subject|message`; viditelný `aria-live` copy feedback.

- [ ] **Step 1: Napsat failing layout, form a accessibility kontrakty**

Do `tests/interface-foundry.test.mjs` přidej:

```js
test('contact uses an equal desktop split and intro-assembler-form mobile order without a top divider', async () => {
  const section = await read('src/components/ContactSection.tsx')
  const css = await read('src/components/contact.css')
  const factoryCss = await read('src/factory/factory-line.css')
  assert.doesNotMatch(section, /border-t/)
  assert.match(section, /contact-layout/)
  assert.match(section, /contact-intro/)
  assert.match(section, /contact-assembler-column/)
  assert.ok(section.indexOf('contact-intro') < section.indexOf('contact-assembler-column'))
  assert.ok(section.indexOf('contact-assembler-column') < section.indexOf('contact-form-column'))
  assert.match(css, /grid-template-areas:\s*"intro"\s*"assembler"\s*"form"/)
  assert.match(css, /@media \(min-width:\s*1024px\)[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)/)
  assert.match(css, /grid-template-areas:\s*"intro assembler"\s*"form assembler"/)
  assert.match(factoryCss, /\.factory-act\s*>\s*#contact\s*\{[\s\S]*z-index:\s*7/)
})

test('contact form preserves delivery fields in a wide accessible field grid', async () => {
  const form = await read('src/components/ContactForm.tsx')
  for (const name of ['from_name', 'reply_to', 'subject']) {
    assert.match(form, new RegExp(`name:\\s*['"]${name}['"]`))
  }
  assert.match(form, /name="message"/)
  assert.match(form, /name="website_url"/)
  assert.match(form, /contact-form__grid/)
  assert.match(form, /contact-form__field--name/)
  assert.match(form, /contact-form__field--email/)
  assert.match(form, /contact-form__field--message/)
  assert.match(form, /role="status"/)
  assert.match(form, /role="alert"/)
})
```

- [ ] **Step 2: Spustit focused test a potvrdit fail**

Run:

```powershell
node --test --test-name-pattern "contact uses|contact form preserves" tests/interface-foundry.test.mjs
```

Expected: FAIL, protože `contact.css` ani nové grid-area třídy neexistují a sekce stále obsahuje `border-t`.

- [ ] **Step 3: Přestavět DOM pořadí ContactSection bez změny copy**

Importuj `./contact.css` a použij tuto topologii:

```tsx
<section id="contact" className="foundry-page contact-section py-28 md:py-40">
  <div className="foundry-container contact-layout">
    <header className="contact-intro">
      <h2 className="max-w-2xl font-heading text-[clamp(2.75rem,5vw,5.5rem)] font-medium leading-[0.94] tracking-[-0.055em] text-soft-white">
        <AccentWords parts={t.contact.headingParts} />
      </h2>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-soft-white">{t.contact.subtitle}</p>
      <div className="contact-direct">
        <p className="text-sm text-soft-white">{t.contact.orEmail}</p>
        <button onClick={copyEmail} className="contact-copy">
          <Mail size={17} aria-hidden="true" />
          <span className="contact-copy__address">andrej.zdvorak.123@gmail.com</span>
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          <span className="contact-copy__feedback" aria-live="polite">{copied ? t.contact.copied : ''}</span>
        </button>
      </div>
    </header>
    <div className="contact-assembler-column"><FinalAssembler /></div>
    <div className="contact-form-column"><ContactForm /></div>
  </div>
</section>
```

Zachovej stávající `copyEmail` hodnotu a dvousekundový reset. Horní border ani náhradní divider nepřidávej.

- [ ] **Step 4: Přestavět pouze JSX formuláře a zachovat submit handler**

Rozšiř field definice o layout class a autocomplete:

```ts
const fields = [
  { id: 'from_name', name: 'from_name', type: 'text', label: t.contact.form.name, area: 'name', autoComplete: 'name' },
  { id: 'reply_to', name: 'reply_to', type: 'email', label: t.contact.form.email, area: 'email', autoComplete: 'email' },
  { id: 'subject', name: 'subject', type: 'text', label: t.contact.form.subject, area: 'subject', autoComplete: 'off' },
] as const
```

Formulář vykresli jako jednu grid plochu s honeypotem mimo tok:

```tsx
<form ref={formRef} onSubmit={handleSubmit} className={`contact-form is-${status}`}>
  <div className="absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
    <label htmlFor="website_url">Website</label>
    <input id="website_url" type="text" name="website_url" tabIndex={-1} autoComplete="off" />
  </div>
  <div className="contact-form__grid">
    {fields.map((field) => (
      <div key={field.id} className={`contact-form__field contact-form__field--${field.area}`}>
        <label htmlFor={field.id}>{field.label}</label>
        <input id={field.id} name={field.name} type={field.type} required autoComplete={field.autoComplete} />
      </div>
    ))}
    <div className="contact-form__field contact-form__field--message">
      <label htmlFor="message">{t.contact.form.message}</label>
      <textarea id="message" name="message" required rows={7} />
    </div>
  </div>
  <button type="submit" disabled={status === 'sending'} className="contact-form__submit">
    {status === 'sending' && <span className="h-4 w-4 animate-spin border-2 border-ink border-t-transparent" aria-hidden="true" />}
    {status === 'success' && <CheckCircle size={18} aria-hidden="true" />}
    {status === 'error' && <WarningCircle size={18} aria-hidden="true" />}
    {status === 'idle' && <PaperPlaneRight size={18} aria-hidden="true" />}
    <span>{status === 'sending' ? t.contact.form.sending : status === 'success' ? t.contact.form.sent : status === 'error' ? t.contact.form.retry : t.contact.form.send}</span>
  </button>
  {status === 'success' && <p className="contact-form__notice" role="status"><CheckCircle size={16} aria-hidden="true" />{t.contact.form.success}</p>}
  {status === 'error' && <p className="contact-form__notice is-error" role="alert"><WarningCircle size={16} aria-hidden="true" />{errorMessage}</p>}
</form>
```

Neměň `handleSubmit`, EmailJS argumenty, rate-limit klíč ani timeouty.

- [ ] **Step 5: Vytvořit přesný responsive layout a field styly**

V `src/components/contact.css` přidej:

```css
.contact-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: "intro" "assembler" "form";
  gap: 4rem;
}

.contact-intro { grid-area: intro; min-width: 0; }
.contact-assembler-column { grid-area: assembler; min-width: 0; align-self: start; }
.contact-form-column { grid-area: form; min-width: 0; }
.contact-direct { margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid var(--color-white-line); }
.contact-copy { margin-top: 0.75rem; display: flex; max-width: 100%; align-items: center; gap: 0.75rem; color: var(--color-soft-white); text-align: left; }
.contact-copy:hover, .contact-copy:focus-visible { color: var(--color-signal-pink); outline: none; }
.contact-copy__address { min-width: 0; overflow-wrap: anywhere; }
.contact-copy__feedback { min-width: 0; color: var(--color-signal-pink); font-size: 0.8125rem; }

.contact-form { width: 100%; border: 1px solid var(--color-white-line); }
.contact-form__grid { display: grid; grid-template-columns: minmax(0, 1fr); }
.contact-form__field { min-width: 0; padding: 1.25rem; border-bottom: 1px solid var(--color-white-line); }
.contact-form__field label { display: block; margin-bottom: 0.75rem; font-size: 0.875rem; font-weight: 600; }
.contact-form__field input, .contact-form__field textarea { display: block; width: 100%; min-width: 0; resize: vertical; border: 0; background: transparent; color: var(--color-soft-white); font-size: 1.125rem; outline: none; }
.contact-form__field:focus-within { box-shadow: inset 3px 0 0 var(--color-signal-pink); }
.contact-form__submit { display: flex; width: 100%; min-height: 3.75rem; align-items: center; justify-content: center; gap: 0.75rem; background: var(--color-signal-pink); color: var(--color-ink); font-weight: 600; transition: background-color 160ms ease, color 160ms ease; }
.contact-form__submit:hover:not(:disabled), .contact-form__submit:focus-visible { background: var(--color-soft-white); outline: none; }
.contact-form__submit:disabled { cursor: not-allowed; opacity: 0.6; }
.contact-form.is-error .contact-form__submit { background: transparent; color: var(--color-signal-pink); outline: 1px solid var(--color-signal-pink); outline-offset: -1px; }
.contact-form__notice { display: flex; align-items: center; gap: 0.5rem; padding: 1rem 1.25rem; color: var(--color-signal-pink); font-size: 0.875rem; }

@media (min-width: 640px) {
  .contact-form__grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .contact-form__field--name { border-right: 1px solid var(--color-white-line); }
  .contact-form__field--subject, .contact-form__field--message { grid-column: 1 / -1; }
}

@media (min-width: 1024px) {
  .contact-layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas: "intro assembler" "form assembler";
    column-gap: clamp(3rem, 5vw, 6rem);
    row-gap: 3rem;
    align-items: start;
  }
}

@media (max-width: 639px) {
  .contact-layout { gap: 3rem; }
  .contact-form__field { padding-inline: 1rem; }
}
```

Z `factory-line.css` odstraň starou `.contact-form-column`, protože ji nyní vlastní `contact.css`. Ve stejném souboru drž interaktivní Contact nad globální physics vrstvou bez zakrytí samotného přísunu:

```css
.factory-act > #contact {
  z-index: 7;
}
```

- [ ] **Step 6: Spustit focused testy, celý suite, lint a build**

Run:

```powershell
node --test --test-name-pattern "contact uses|contact form preserves|obsolete visual hierarchy" tests/interface-foundry.test.mjs
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Expected: PASS; žádná změna překladů nebo EmailJS kontraktu.

- [ ] **Step 7: Commitnout Contact layout a formulář**

```powershell
git -c safe.directory=D:/kodovani/Portfolio add -- src/components/ContactSection.tsx src/components/ContactForm.tsx src/components/contact.css src/factory/factory-line.css tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "feat: redesign contact around NOVA assembly"
```

### Task 6: Prokázat živou trajektorii, responsive layout a lifecycle

**Files:**
- Modify if defects are found: `src/factory/stations/contactAssemblyModel.ts`
- Modify if defects are found: `src/factory/stations/FinalAssembler.tsx`
- Modify if defects are found: `src/factory/stations/FinalAssemblerScene.tsx`
- Modify if defects are found: `src/factory/factory-line.css`
- Modify if defects are found: `src/components/contact.css`
- Modify if a regression contract is missing: `tests/factory-flow.test.mjs`
- Modify if a regression contract is missing: `tests/interface-foundry.test.mjs`

**Interfaces:**
- Consumes: hotovou implementaci z Tasks 1–5 a DOM markery `data-assembly-state`, `data-assembly-slot`, `data-assembly-active`, `data-overflow-count`, `data-factory-part`.
- Produces: ověřenou desktopovou, mobilní, reduced-motion a suspend/restore variantu; každý nalezený defect musí získat focused regression test před opravou.

- [ ] **Step 1: Spustit úplnou automatickou baseline kontrolu**

Run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
git -c safe.directory=D:/kodovani/Portfolio diff --check
```

Expected: všechny příkazy exit 0; build smí hlásit pouze stávající upozornění na velikost chunku.

- [ ] **Step 2: Spustit Vite pro browser acceptance**

Run:

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

Expected: Vite vypíše lokální URL. Použij Playwright MCP, ne přímý Node `playwright`.

- [ ] **Step 3: Ověřit desktopový průchod na 1440×900**

V Playwright MCP:

1. nastav viewport 1440×900 a proveď čistý reload,
2. přejdi přes stránku směrem dolů tak, aby spodní factory act zůstal aktivní a díly skutečně prošly Experience,
3. čekej na `[data-factory-station="contact"][data-assembly-state="complete"]`, nejvýše 45 sekund,
4. ověř přesně pět `[data-assembly-slot]` s hodnotami `brand`, `heading`, `copy`, `cta`, `visual`, žádné `.factory-line__assembled-part` a žádný `[data-assembly-active]`,
5. ověř `Number(station.dataset.overflowCount) >= 3`, potom po dobu dvou sekund vzorkuj bounding boxy `[data-factory-part]` nad stanicí a potvrď, že nejméně tři další díly po přiblížení k roof zmenší své viewportové `y` nebo opustí horní/boční hranici stanice,
6. zkontroluj, že `ContactSection` má dva stejně široké grid tracky s odchylkou nejvýše 2 px a že NOVA frame ani factory parts nepřekrývají žádný `input`, `textarea` nebo submit,
7. pořiď jeden screenshot celé Contact sekce jako dočasný QA artefakt mimo sledovaný source tree.

Pokud se complete stav do 45 sekund nedostaví, ulož posloupnost rolí, slotů, pozic a `data-assembly-state`; neprodlužuj timeout ani neprohlašuj úspěch.

- [ ] **Step 4: Ověřit mobilní a narrow pořadí na 390×844 a 320×700**

Na obou šířkách proveď čistý reload a kontroluj:

```js
document.documentElement.scrollWidth <= window.innerWidth
```

Bounding boxy musí potvrdit `contact-intro.top < contact-assembler-column.top < contact-form-column.top`. E-mail se smí zalomit, ale nesmí být oříznutý. Každé pole, textarea a submit musí mít šířku nejvýše svého Contact containeru. NOVA stránka musí být čitelná, nesmí být vyšší prázdný portrétní rám a padající objekty nesmějí procházet přes formulář.

- [ ] **Step 5: Ověřit reduced motion, resize, jazyk a anchor jump**

1. emuluj `prefers-reduced-motion: reduce` a reload,
2. ověř okamžitý `data-assembly-state="complete"`, pět slotů, nulový `[data-assembly-active]` a žádné volné `reduced-contact-*` v globální `[data-factory-part]` vrstvě,
3. přepni 1440 → 390 → 1440 a ověř, že všech pět slotů zůstalo uvnitř NOVA frame a neduplikovalo se,
4. přepni CZ → EN → CZ a ověř, že `data-assembly-state` zůstal `complete` a NOVA obsah zůstal stejný,
5. proveď čistý reload, skoč přímo na `#contact` a ověř, že se Contact vykreslí bez console error i v collecting stavu.

- [ ] **Step 6: Ověřit suspend/restore regresi v obou směrech**

Bez reduced motion:

1. reload, scroll na Contact a zaznamenej mapu `data-factory-part` ID → zaokrouhlená pozice,
2. scroll úplně nahoru, čekej 8 sekund, vrať se na Contact,
3. ověř nulové duplicitní ID, nulové dvojice se shodnou pozicí ±1 px a nejvýše jeden `[data-assembly-active]`,
4. počkej na complete, scroll nahoru a zpět ještě jednou,
5. ověř stále právě pět unikátních `[data-assembly-slot]`, žádné obnovené Matter tělo se stejným ID jako usazený díl a pokračující overflow bez hromadění na roof.

- [ ] **Step 7: Opravit všechny nalezené vady v jednom batchi s failing testem**

Pro každý skutečný defect nejprve přidej nejmenší reprodukci do `factory-flow.test.mjs` nebo source kontrakt do `interface-foundry.test.mjs`, spusť ji do červena a teprve potom oprav geometrii, impuls, state transition nebo CSS. Povolené tuning body jsou pouze:

```ts
FINAL_ASSEMBLY_LAYOUT
FINAL_ASSEMBLER_COLLIDERS
getFinalOverflowImpulse
```

a CSS spacing, sizing, transform, opacity nebo stroke hodnoty v Contact/assembler souborech. Neměň Hero ani Statement geometrii.

- [ ] **Step 8: Provést nejvýše jeden confirmation browser pass**

Zopakuj společně desktop 1440×900 a mobil 390×844, plus konkrétní scénář každého opraveného defectu. Pokud zůstane chyba, reportuj přesný nesplněný gate; neotevírej další neomezené polish kolo.

- [ ] **Step 9: Spustit finální verifikaci a zkontrolovat scope**

Run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
git -c safe.directory=D:/kodovani/Portfolio diff --check
git -c safe.directory=D:/kodovani/Portfolio status --short
git -c safe.directory=D:/kodovani/Portfolio diff --stat aaa7d0c..HEAD
```

Expected: test, lint, build a diff-check exit 0; status neobsahuje dočasné screenshots ani jiné QA artefakty; diff od spec commit `aaa7d0c` obsahuje tento plán a pouze implementační soubory vyjmenované v jeho File Map.

- [ ] **Step 10: Commitnout případné regression opravy**

Pokud browser QA vyžadovala změny:

```powershell
git -c safe.directory=D:/kodovani/Portfolio add -- src/factory/stations/contactAssemblyModel.ts src/factory/stations/FinalAssembler.tsx src/factory/stations/FinalAssemblerScene.tsx src/factory/factory-line.css src/components/contact.css tests/factory-flow.test.mjs tests/interface-foundry.test.mjs
git -c safe.directory=D:/kodovani/Portfolio commit -m "fix: harden contact assembly trajectories"
```

Pokud žádná změna nebyla nutná, nevytvářej prázdný commit.
