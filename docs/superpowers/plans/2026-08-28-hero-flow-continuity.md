# Hero Flow Continuity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animate the Hero box floor as two trap doors while keeping every part constrained to the conveyor until its rounded release point, preserving a continuous stream through Statement, and correcting the fade and Statement rail visuals.

**Architecture:** Keep viewport-only decorative motion separate from the feed controller that owns unreleased Matter.js bodies. Model the gate's visual and collider phases explicitly, use the Hero SVG as a transparent foreground overlay above the shared part layer, and keep Statement physics geometry independent from its single-stroke visual geometry.

**Tech Stack:** React 19, TypeScript, Framer Motion, Matter.js, CSS, Node test runner, Playwright MCP

**Spec:** `docs/superpowers/specs/2026-08-26-portfolio-factory-line-design.md`, amended by the user-approved 2026-08-28 Hero continuity design in the current task.

## Global Constraints

- Preserve the established Hero conveyor height, part dimensions, release point, and rounded-end trajectory.
- Existing parts must collide with one another.
- Decorative tread and roller motion may pause offscreen; the physical feed must continue after the Statement boundary starts the line.
- Do not overwrite unrelated working-tree changes.
- Reduced motion opens the gate immediately and does not run continuous physics.

---

### Task 1: Model continuous feed and gate phases

**Files:**
- Modify: `src/components/heroConveyorModel.ts`
- Test: `tests/interface-foundry.test.mjs`
- Test: `tests/factory-flow.test.mjs`

**Interfaces:**
- Produces: `shouldRunHeroFeed({ shouldAnimate, lineStarted, reducedMotion }): boolean`
- Produces: `getHeroGateState(lineStarted, colliderReleased): { open, colliderOpen, waitingLimit }`

- [ ] Write failing tests proving an activated offscreen feed stays controlled, pre-activation physics remains paused, and the collider remains closed until the door animation reaches its release point.
- [ ] Run `npm.cmd test` and confirm the new assertions fail for the missing contracts.
- [ ] Implement the minimal pure helpers.
- [ ] Run `npm.cmd test` and confirm the model tests pass.

### Task 2: Animate the Hero trap doors and preserve conveyor ownership

**Files:**
- Modify: `src/components/HeroConveyor.tsx`
- Modify: `src/components/hero-conveyor.css`

**Interfaces:**
- Consumes: `shouldRunHeroFeed` and the explicit gate collider phase from Task 1.
- Produces: two Framer Motion SVG door paths hinged at the box walls and delayed collider removal.

- [ ] Add a failing integration assertion for the door/collider timing contract if Task 1 does not already cover it.
- [ ] Drive the Hero feed tick with the persistent feed state while leaving tread and roller animation tied to viewport visibility.
- [ ] Split the floor into left and right motion paths and release the physical floor after 240 ms of a 350 ms opening.
- [ ] Let the doors overflow below the box while clipping the long conveyor machine to the original viewBox.
- [ ] Run the focused tests.

### Task 3: Correct Hero fade layering and Statement rail geometry

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/hero-conveyor.css`
- Modify: `src/factory/factory-line.css`
- Modify: `src/factory/stations/StatementRebound.tsx`
- Modify: `src/factory/stations/statementReboundModel.ts`
- Test: `tests/factory-flow.test.mjs`

**Interfaces:**
- Produces: `getCatcherVisualLine(bounds)` with a centered x coordinate and y endpoints.

- [ ] Write a failing test proving the Statement catcher visual is a single centered line independent of its collider width.
- [ ] Render the Hero section as a transparent foreground overlay above shared parts, keep the belt fill transparent, and leave the fade above the parts.
- [ ] Render the Statement catcher as a line while retaining its rectangular Matter.js collider.
- [ ] Run the focused tests.

### Task 4: Verify real trajectories and presentation

**Files:**
- No production files unless verification exposes a focused regression.

**Interfaces:**
- Consumes the rendered `[data-factory-part]` stream and computed SVG/CSS geometry.

- [ ] Run `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build`.
- [ ] In Playwright MCP, activate Statement early and sample unreleased parts to prove they keep their belt-center y until `x <= 136`.
- [ ] Verify new parts continue entering while Statement is visible and existing parts fall only from the rounded end.
- [ ] Verify the right fade visually occludes parts, door halves animate, and the Statement catcher stroke matches Hero at desktop and mobile widths.
- [ ] Verify reduced-motion and fast-scroll states contain no stuck or duplicated parts.
