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
