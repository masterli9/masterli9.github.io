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

test('the hero gate opens once the line starts and removes the waiting cap', async () => {
  const model = await import('../src/components/heroConveyorModel.ts')
  assert.deepEqual(model.getHeroGateState(false), { open: false, waitingLimit: 30 })
  assert.deepEqual(model.getHeroGateState(true), { open: true, waitingLimit: Number.POSITIVE_INFINITY })
})

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

test('the statement platform and catcher stay inside their station bounds', async () => {
  const { getReboundPlatformGeometry } = await import('../src/factory/stations/statementReboundModel.ts')
  const geometry = getReboundPlatformGeometry({ left: 0, top: 0, width: 360, height: 480 })
  assert.ok(geometry.platform.x1 >= 0)
  assert.ok(geometry.platform.x2 <= 360)
  assert.ok(geometry.catcher.x >= 0)
  assert.ok(geometry.catcher.x + geometry.catcher.width <= 360)
})

test('an act tears down only after neither it nor its boundary neighbor can be seen', async () => {
  const model = await import('../src/factory/factoryFlowModel.ts')
  assert.equal(model.shouldTeardownAct({ intersects: false, neighborVisible: false, documentVisible: true }), true)
  assert.equal(model.shouldTeardownAct({ intersects: false, neighborVisible: true, documentVisible: true }), false)
  assert.equal(model.shouldTeardownAct({ intersects: true, neighborVisible: false, documentVisible: true }), false)
})

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

test('paint colors repeat white, pink, and blue without changing part identity', async () => {
  const model = await import('../src/factory/stations/paintInspectionModel.ts').catch(() => ({}))
  assert.deepEqual([0, 1, 2, 3].map(model.getPaintColor), ['#FFFFFF', '#F21868', '#355CFF', '#FFFFFF'])
  assert.deepEqual(
    model.advanceInspection({ id: 'part-4', sequence: 4, shape: 'button', color: '#F21868', stage: 'formed' }, true),
    { id: 'part-4', sequence: 4, shape: 'button', color: '#F21868', stage: 'painted' },
  )
})

test('the goals sorter distributes parts across three lanes that share one exit', async () => {
  const model = await import('../src/factory/stations/goalSorterModel.ts').catch(() => ({}))
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(model.getGoalLane), [0, 1, 2, 0, 1, 2])
  const bounds = { left: 100, width: 600, bottom: 900 }
  assert.deepEqual([0, 1, 2].map((lane) => model.getGoalLaneExit(lane, bounds)), [
    { x: 400, y: 900 }, { x: 400, y: 900 }, { x: 400, y: 900 },
  ])
})

test('five unique parts assemble the browser once and later parts remain overflow', async () => {
  const model = await import('../src/factory/stations/finalAssemblerModel.ts').catch(() => ({}))
  let state = { placedIds: [], assembled: false }
  for (const id of ['a', 'b', 'c', 'd', 'e']) state = model.advanceAssembly(state, id)
  assert.equal(state.assembled, true)
  assert.equal(model.advanceAssembly(state, 'f'), state)
  assert.equal(model.getPostAssemblyCollisionMode(true), 'frame-only')
})

test('every factory station has a meaningful reduced-motion snapshot', async () => {
  const { getReducedFactorySnapshot } = await import('../src/factory/factoryFlowModel.ts')

  for (const station of ['statement', 'skills', 'experience', 'goals', 'contact']) {
    assert.ok(getReducedFactorySnapshot(station).length > 0, station)
  }
})

test('the factory narrows its active body pool on small viewports', async () => {
  const { getFactoryActiveLimit } = await import('../src/factory/factoryFlowModel.ts')

  assert.equal(getFactoryActiveLimit(1440), 42)
  assert.equal(getFactoryActiveLimit(390), 20)
})
