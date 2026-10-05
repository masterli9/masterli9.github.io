import assert from 'node:assert/strict'
import { test } from 'node:test'
import Matter from 'matter-js'

const { Body, Bodies, Composite, Engine, Events } = Matter

const makePart = (overrides = {}) => ({
  id: 'test-part', sequence: 0, role: 'brand', shape: 'square', stage: 'raw',
  assemblySlot: 'brand', finish: { fill: '#FFFFFF', stroke: '#FFFFFF', detailColor: '#355CFF' },
  ...overrides,
})

test('the factory repeats eight stable landing-page blueprints', async () => {
  const { createFactoryPartSpec } = await import('../src/factory/factoryFlowModel.ts')
  const parts = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => createFactoryPartSpec(n, 'raw'))
  assert.deepEqual(parts.map(({ role }) => role), ['brand', 'heading', 'copy', 'cta', 'visual', 'heading', 'copy', 'visual', 'brand'])
  assert.equal(parts[0].assemblySlot, 'brand')
  assert.equal(parts[1].finish.text, 'NOVA')
  assert.equal(parts[2].finish.text, 'Ideas in motion.')
  assert.equal(parts[3].finish.text, 'Explore')
  assert.equal(parts[4].finish.text, undefined)
  assert.deepEqual(parts.slice(0, 4).map(({ shape }) => shape), ['square', 'circle', 'bar', 'diamond'])
})

test('a finish recipe preserves arbitrary valid colors', async () => {
  const { getLandingPartBlueprint } = await import('../src/factory/landingPartBlueprints.ts')
  assert.deepEqual(getLandingPartBlueprint(3).finish, {
    fill: '#C7FF43', stroke: '#C7FF43', textColor: '#090909', text: 'Explore',
  })
  assert.equal(getLandingPartBlueprint(-1).role, 'visual')
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

test('the lower act keeps its longer mobile route inside a bounded active band', async () => {
  const { getFactoryActBand } = await import('../src/factory/factoryFlowModel.ts')

  assert.deepEqual(getFactoryActBand('upper', 1000, 800), { minY: -600, maxY: 3400 })
  assert.deepEqual(getFactoryActBand('lower', 1000, 800), { minY: -1400, maxY: 4200 })
  assert.deepEqual(
    getFactoryActBand('lower', 1000, 800, { minY: 500, maxY: 6500 }),
    { minY: 500, maxY: 6500 },
  )
})

test('the upper act keeps its Hero source alive while Projects is visible', async () => {
  const { getFactoryActBand } = await import('../src/factory/factoryFlowModel.ts')

  assert.deepEqual(
    getFactoryActBand('upper', 2473, 900, { minY: 0, maxY: 3445 }),
    { minY: 0, maxY: 5173 },
  )
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

test('the Hero gate starts the line without a separate binary floor release', async () => {
  const model = await import('../src/components/heroConveyorModel.ts')
  assert.deepEqual(model.getHeroGateState(false), {
    open: false,
    waitingLimit: 30,
  })
  assert.deepEqual(model.getHeroGateState(true), {
    open: true,
    waitingLimit: Number.POSITIVE_INFINITY,
  })
})

test('the Hero box uses fixed hinges and has no permanent bottom behind its doors', async () => {
  const model = await import('../src/components/heroConveyorModel.ts').catch(() => ({}))
  assert.equal(typeof model.getHeroGateGeometry, 'function')
  assert.deepEqual(model.getHeroGateGeometry(0), {
    wallsPath: 'M10 337V196M160 337V196',
    leftDoor: { x1: 10, y1: 337, x2: 85, y2: 337 },
    rightDoor: { x1: 160, y1: 337, x2: 85, y2: 337 },
  })
  assert.deepEqual(model.getHeroGateGeometry(1), {
    wallsPath: 'M10 337V196M160 337V196',
    leftDoor: { x1: 10, y1: 337, x2: 28, y2: 409 },
    rightDoor: { x1: 160, y1: 337, x2: 142, y2: 409 },
  })
  assert.deepEqual(model.getHeroGateGeometry(0.5), {
    wallsPath: 'M10 337V196M160 337V196',
    leftDoor: { x1: 10, y1: 337, x2: 56.5, y2: 373 },
    rightDoor: { x1: 160, y1: 337, x2: 113.5, y2: 373 },
  })
})

test('each physical Hero door follows the center and angle of its visual segment', async () => {
  const model = await import('../src/components/heroConveyorModel.ts').catch(() => ({}))
  assert.equal(typeof model.getHeroDoorColliderPose, 'function')

  const geometry = model.getHeroGateGeometry(0.5)
  const mapping = { scaleX: 2, scaleY: 2, offsetX: 100, offsetY: 200 }

  assert.deepEqual(model.getHeroDoorColliderPose(geometry.leftDoor, mapping), {
    x: 166.5,
    y: 910,
    length: 117.61377470347595,
    angle: 0.6588060361174762,
  })
  assert.deepEqual(model.getHeroDoorColliderPose(geometry.rightDoor, mapping), {
    x: 373.5,
    y: 910,
    length: 117.61377470347595,
    angle: 2.4827866174723168,
  })
})

test('the factory line starts even when a fast scroll skips past its boundary', async () => {
  const { shouldStartFactoryLine } = await import('../src/factory/factoryFlowModel.ts')

  assert.equal(shouldStartFactoryLine({ markerTop: 899, viewportHeight: 900, lineStarted: false }), true)
  assert.equal(shouldStartFactoryLine({ markerTop: -142, viewportHeight: 900, lineStarted: false }), true)
  assert.equal(shouldStartFactoryLine({ markerTop: 1008, viewportHeight: 900, lineStarted: false }), false)
  assert.equal(shouldStartFactoryLine({ markerTop: -142, viewportHeight: 900, lineStarted: true }), false)
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

test('the statement platform and catcher stay inside their station bounds', async () => {
  const { getReboundPlatformGeometry } = await import('../src/factory/stations/statementReboundModel.ts')
  const geometry = getReboundPlatformGeometry({ left: 0, top: 0, width: 360, height: 480 })
  assert.ok(geometry.platform.x1 >= 0)
  assert.ok(geometry.platform.x2 <= 360)
  assert.ok(geometry.catcher.x >= 0)
  assert.ok(geometry.catcher.x + geometry.catcher.width <= 360)
})

test('the Statement visual platform line sits on the upper edge of the existing collider', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts')
  const geometry = model.getReboundPlatformGeometry({ left: 0, top: 0, width: 360, height: 480 })
  const line = model.getReboundPlatformVisualLine(geometry.platform)

  assert.ok(line.y1 < geometry.platform.y1)
  assert.ok(line.y2 < geometry.platform.y2)
  assert.ok(Math.abs(
    Math.hypot(line.x2 - geometry.platform.x2, line.y2 - geometry.platform.y2)
      - (geometry.platform.thickness / 2),
  ) < 0.001)
})

test('the statement platform catches the hero box span and exits on the selected-work spine', async () => {
  const { getReboundPlatformGeometry } = await import('../src/factory/stations/statementReboundModel.ts')
  const geometry = getReboundPlatformGeometry({ left: 0, top: 0, width: 360, height: 480 })
  const outputX = geometry.catcher.x + (geometry.catcher.width / 2)

  assert.equal(geometry.platform.x1, 0)
  assert.ok(geometry.platform.x2 > 160)
  assert.ok(geometry.platform.y2 - geometry.platform.y1 >= 70)
  assert.ok(outputX - geometry.platform.x2 >= 65)
  assert.ok(outputX - geometry.platform.x2 <= 75)
  assert.ok(outputX < 320)
})

test('the statement catcher renders as one centered stroke independent of collider width', async () => {
  const { getCatcherVisualLine } = await import('../src/factory/stations/statementReboundModel.ts').catch(() => ({}))
  assert.equal(typeof getCatcherVisualLine, 'function')

  assert.deepEqual(
    getCatcherVisualLine({ x: 302.25, y: 80, width: 3.5, height: 376 }),
    { x: 304, y1: 80, y2: 456 },
  )
})

test('the statement catcher and spoon exist only where their full-width visual route is shown', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts').catch(() => ({}))
  assert.equal(typeof model.shouldUseReboundCatcher, 'function')
  assert.equal(model.shouldUseReboundCatcher(288), false)
  assert.equal(model.shouldUseReboundCatcher(1023), false)
  assert.equal(model.shouldUseReboundCatcher(1024), true)
})

test('the statement exit is one large circular spoon with an upward-left tangent', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts').catch(() => ({}))
  assert.equal(typeof model.getStatementSpoonGeometry, 'function')

  const entryAnchor = { x: 260, y: 243 }
  const spoon = model.getStatementSpoonGeometry(entryAnchor)
  assert.deepEqual(spoon.entryAnchor, entryAnchor)
  assert.ok(spoon.start.x > entryAnchor.x + 6)
  assert.ok(spoon.start.y > entryAnchor.y + 1)
  assert.ok(spoon.center.x < entryAnchor.x)
  assert.ok(spoon.center.y > entryAnchor.y)
  assert.equal(spoon.radius, 280)
  assert.deepEqual(spoon.lowest, { x: spoon.center.x, y: spoon.center.y + 280 })
  assert.ok(spoon.points.length >= 200)
  for (const point of spoon.points) {
    assert.ok(Math.abs(Math.hypot(point.x - spoon.center.x, point.y - spoon.center.y) - 280) < 1e-9)
  }
  assert.ok(spoon.exitTangent.x < -0.8)
  assert.ok(spoon.exitTangent.y < -0.55)
  assert.ok(spoon.end.y <= spoon.lowest.y - 50)
  assert.ok(spoon.friction <= 0.001)
  assert.equal(spoon.frictionStatic, 0)
  assert.ok(spoon.frictionAir <= 0.001)
  assert.ok(spoon.colliderThickness >= 18)
})

test('the statement spoon changes material without injecting velocity', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts')
  const physics = await import('../src/factory/stations/statementReboundPhysics.ts').catch(() => ({}))
  const partPhysics = await import('../src/factory/factoryPartPhysics.ts')
  assert.equal(typeof physics.applyStatementSpoonMaterial, 'function')

  const spoon = model.getStatementSpoonGeometry({ x: 260, y: 243 })
  const part = partPhysics.createFactoryBody(
    {
      id: 'passive-spoon-part',
      sequence: 0,
      shape: 'square',
      role: 'brand', assemblySlot: 'brand', finish: { fill: '#FFFFFF' },
      stage: 'raw',
    },
    {
      x: 300,
      y: 420,
      velocityX: 3,
      velocityY: 4,
      angle: 0,
      angularVelocity: 0,
    },
  )

  physics.applyStatementSpoonMaterial(part, spoon)

  assert.deepEqual(part.velocity, { x: 3, y: 4 })
  assert.equal(part.friction, spoon.friction)
  assert.equal(part.frictionStatic, spoon.frictionStatic)
  assert.equal(part.frictionAir, spoon.frictionAir)
  assert.equal(part.restitution, spoon.restitution)
})

test('the visible spoon path follows the outer collision edge', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts')
  const physics = await import('../src/factory/stations/statementReboundPhysics.ts')
  const spoon = model.getStatementSpoonGeometry({ x: 260, y: 225 })
  const [collider] = physics.createStatementSpoonColliders(
    spoon,
    { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 },
  )
  const radii = collider.parts.slice(1).flatMap((part) => part.vertices.map((vertex) => (
    Math.hypot(vertex.x - spoon.center.x, vertex.y - spoon.center.y)
  )))

  assert.ok(Math.min(...radii) >= spoon.radius - 1e-6)
  assert.ok(Math.max(...radii) >= spoon.radius + spoon.colliderThickness - 1e-6)
  assert.equal(spoon.visualRadius, 298)
  assert.ok(Math.abs(
    Math.hypot(spoon.visualStart.x - spoon.center.x, spoon.visualStart.y - spoon.center.y)
      - spoon.visualRadius
  ) < 1e-9)
  assert.ok(Math.abs(
    Math.hypot(spoon.visualEnd.x - spoon.center.x, spoon.visualEnd.y - spoon.center.y)
      - spoon.visualRadius
  ) < 1e-9)
  assert.equal(
    spoon.path,
    `M${spoon.visualStart.x} ${spoon.visualStart.y}A298 298 0 1 1 ${spoon.visualEnd.x} ${spoon.visualEnd.y}`,
  )
})

test('a fast part cannot tunnel through to the outside of the visible spoon', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts')
  const physics = await import('../src/factory/stations/statementReboundPhysics.ts')
  const spoon = model.getStatementSpoonGeometry({ x: 260, y: 225 })
  const [collider] = physics.createStatementSpoonColliders(
    spoon,
    { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 },
  )
  const partRadius = 11
  const part = Bodies.circle(spoon.center.x, spoon.lowest.y - 70, partRadius, {
    friction: 0,
    frictionAir: 0,
    restitution: 0,
  })
  Body.setVelocity(part, { x: 0, y: 25 })
  const engine = Engine.create({ gravity: { x: 0, y: 0 } })
  Composite.add(engine.world, [collider, part])
  let maximumY = part.position.y
  for (let frame = 0; frame < 12; frame += 1) {
    Engine.update(engine, 1000 / 60)
    maximumY = Math.max(maximumY, part.position.y)
  }

  assert.ok(maximumY <= spoon.lowest.y - partRadius + 1)
})

test('the Statement platform material releases stacked parts without injecting velocity', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts')
  const physics = await import('../src/factory/stations/statementReboundPhysics.ts').catch(() => ({}))
  const partPhysics = await import('../src/factory/factoryPartPhysics.ts')
  assert.equal(typeof physics.propagateStatementPlatformMaterial, 'function')

  const platform = model.getReboundPlatformGeometry({ left: 0, top: 0, width: 360, height: 480 }).platform
  const lower = partPhysics.createFactoryBody(
    makePart({ id: 'stack-lower', sequence: 0 }),
    { x: 0, y: 0, velocityX: 2, velocityY: 3, angle: 0, angularVelocity: 0 },
  )
  const upper = partPhysics.createFactoryBody(
    makePart({ id: 'stack-upper', sequence: 1 }),
    { x: 0, y: -22, velocityX: 1, velocityY: 2, angle: 0, angularVelocity: 0 },
  )

  physics.applyStatementPlatformMaterial(lower, platform)
  physics.propagateStatementPlatformMaterial(lower, upper, platform)

  assert.equal(upper.frictionStatic, 0)
  assert.ok(platform.restitution <= 0.4)
  assert.equal(upper.restitution, 0.12)
  assert.deepEqual(lower.velocity, { x: 2, y: 3 })
  assert.deepEqual(upper.velocity, { x: 1, y: 2 })
})

test('the Statement route resets platform material before the visible spoon collider', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts')
  const physics = await import('../src/factory/stations/statementReboundPhysics.ts')
  const partPhysics = await import('../src/factory/factoryPartPhysics.ts')
  const station = model.getReboundPlatformGeometry({ left: 0, top: 0, width: 360, height: 480 })
  const spoon = model.getStatementSpoonGeometry({
    x: station.platform.x2 + 25.38461538461536,
    y: station.platform.y2 - 47,
  })
  const colliders = physics.createStatementStationColliders(
    { platform: station.platform, catcher: station.catcher, spoon, outputEndY: 476, includeExitRoute: true },
    { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 },
  )
  const sensor = colliders.find((body) => body.label === 'statement-spoon-material-sensor')
  const firstSpoonCollider = colliders.find((body) => body.label.startsWith('statement-exit-spoon'))
  assert.equal(sensor?.isSensor, true)
  assert.ok(sensor.position.x < firstSpoonCollider.position.x)

  const part = partPhysics.createFactoryBody(
    makePart({ id: 'material-transition', sequence: 0 }),
    { x: 0, y: 0, velocityX: 3, velocityY: 4, angle: 0, angularVelocity: 0 },
  )
  physics.applyStatementPlatformMaterial(part, station.platform)
  physics.applyStatementSpoonMaterial(part, spoon)

  assert.equal(part.plugin.statementPlatformMaterial, false)
  assert.equal(part.restitution, spoon.restitution)
  assert.deepEqual(part.velocity, { x: 3, y: 4 })
})

test('the full passive Statement route gives every shape launch speed and crosses the Projects heading', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts')
  const physics = await import('../src/factory/stations/statementReboundPhysics.ts').catch(() => ({}))
  const partPhysics = await import('../src/factory/factoryPartPhysics.ts')
  assert.equal(typeof physics.createStatementStationColliders, 'function')
  assert.equal(typeof physics.applyStatementPlatformMaterial, 'function')
  assert.equal(typeof physics.applyStatementSpoonMaterial, 'function')

  const station = model.getReboundPlatformGeometry({ left: 0, top: 0, width: 360, height: 480 })
  const spoon = model.getStatementSpoonGeometry({
    x: station.platform.x2 + 25.38461538461536,
    y: station.platform.y2 - 47,
  })
  const mapping = {
    scaleX: 1.4444444444444444,
    scaleY: 1.4444444444444444,
    offsetX: 0,
    offsetY: 0,
  }
  const shapes = ['square', 'circle', 'bar', 'diamond']
  const headingHits = []
  const trajectories = []
  const headingTarget = { left: -480, right: 192, top: 1029, bottom: 1117 }
  for (const [index, shape] of shapes.entries()) {
    const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.00145 } })
    const colliders = physics.createStatementStationColliders({
      platform: station.platform,
      catcher: station.catcher,
      spoon,
      outputEndY: 476,
      includeExitRoute: true,
    }, mapping)
    const part = partPhysics.createFactoryBody(
      {
        id: `spoon-part-${shape}`,
        sequence: index,
        shape,
        role: 'brand', assemblySlot: 'brand', finish: { fill: '#FFFFFF' },
        stage: 'raw',
        scaleX: 1.25,
        scaleY: 1.5,
      },
      {
        x: 85 * mapping.scaleX,
        y: -140 * mapping.scaleY,
        velocityX: 0,
        velocityY: 0,
        angle: shape === 'diamond' ? Math.PI / 4 : 0,
        angularVelocity: 0,
      },
    )
    const contactOrder = []
    let firstPlatformVelocity = null
    let firstSpoonVelocity = null
    let maxPreSpoonVelocityX = Number.NEGATIVE_INFINITY
    let minPostSpoonX = Number.POSITIVE_INFINITY
    let platformExit = null
    const handleSpoonCollision = ({ pairs }) => {
      for (const pair of pairs) {
        const surface = pair.bodyA === part
          ? pair.bodyB
          : pair.bodyB === part
            ? pair.bodyA
            : null
        if (surface?.label === 'statement-rebound-platform' && !contactOrder.includes('platform')) {
          firstPlatformVelocity = { x: part.velocity.x, y: part.velocity.y }
          contactOrder.push('platform')
        }
        if (surface?.label === 'statement-rebound-platform') {
          physics.applyStatementPlatformMaterial(part, station.platform)
        }
        if (surface?.label === 'statement-spoon-material-sensor') {
          physics.applyStatementSpoonMaterial(part, spoon)
        }
        if (surface?.label.startsWith('statement-exit-spoon-')) {
          firstSpoonVelocity ??= { x: part.velocity.x, y: part.velocity.y }
          if (!contactOrder.includes('spoon')) contactOrder.push('spoon')
          physics.applyStatementSpoonMaterial(part, spoon)
        }
      }
    }
    Events.on(engine, 'collisionStart', handleSpoonCollision)
    Events.on(engine, 'collisionActive', handleSpoonCollision)
    Composite.add(engine.world, [...colliders, part])

    for (let frame = 0; frame < 1200; frame += 1) {
      Engine.update(engine, 1000 / 60)
      if (contactOrder.includes('platform') && !contactOrder.includes('spoon')) {
        maxPreSpoonVelocityX = Math.max(maxPreSpoonVelocityX, part.velocity.x)
        if (!platformExit && part.bounds.min.x > station.platform.x2 * mapping.scaleX) {
          platformExit = {
            position: { x: part.position.x, y: part.position.y },
            velocity: { x: part.velocity.x, y: part.velocity.y },
          }
        }
      }
      if (contactOrder.includes('spoon')) minPostSpoonX = Math.min(minPostSpoonX, part.position.x)
      if (
        part.bounds.max.x >= headingTarget.left
        && part.bounds.min.x <= headingTarget.right
        && part.bounds.max.y >= headingTarget.top
        && part.bounds.min.y <= headingTarget.bottom
      ) {
        if (!headingHits.includes(shape)) headingHits.push(shape)
      }
    }
    trajectories.push({
      shape,
      contactOrder,
      firstPlatformVelocity,
      firstSpoonVelocity,
      maxPreSpoonVelocityX,
      minPostSpoonX,
      platformExit,
      final: { x: part.position.x, y: part.position.y },
      bounds: {
        minX: part.bounds.min.x,
        minY: part.bounds.min.y,
        maxX: part.bounds.max.x,
        maxY: part.bounds.max.y,
      },
    })
    assert.deepEqual(contactOrder, ['platform', 'spoon'], `${shape}: ${JSON.stringify(trajectories.at(-1))}`)
    assert.ok(maxPreSpoonVelocityX > 6, `${shape}: ${JSON.stringify(trajectories.at(-1))}`)
    assert.ok(minPostSpoonX < 0, `${shape}: ${JSON.stringify(trajectories.at(-1))}`)
  }

  assert.ok(headingHits.length >= 2, JSON.stringify(trajectories))
})

test('the Statement watchdog dismisses only a spoon part that has stalled long enough', async () => {
  const model = await import('../src/factory/stations/statementReboundModel.ts')

  assert.equal(typeof model.shouldDismissStalledStatementPart, 'function')
  assert.equal(model.shouldDismissStalledStatementPart({ speed: 4.99, stalledForMs: 399 }), false)
  assert.equal(model.shouldDismissStalledStatementPart({ speed: 4.99, stalledForMs: 400 }), true)
  assert.equal(model.shouldDismissStalledStatementPart({ speed: 5.01, stalledForMs: 1200 }), false)
})

test('a factory part is removed before it can cross an act boundary', async () => {
  const model = await import('../src/factory/factoryFlowModel.ts')

  assert.equal(typeof model.shouldRecycleFactoryPartAtActBoundary, 'function')
  assert.equal(model.shouldRecycleFactoryPartAtActBoundary(799, 800), false)
  assert.equal(model.shouldRecycleFactoryPartAtActBoundary(800, 800), true)
  assert.equal(model.shouldRecycleFactoryPartAtActBoundary(801, 800), true)
})

test('an act tears down only after neither it nor its boundary neighbor can be seen', async () => {
  const model = await import('../src/factory/factoryFlowModel.ts')
  assert.equal(model.shouldTeardownAct({ intersects: false, neighborVisible: false, documentVisible: true }), true)
  assert.equal(model.shouldTeardownAct({ intersects: false, neighborVisible: true, documentVisible: true }), false)
  assert.equal(model.shouldTeardownAct({ intersects: true, neighborVisible: false, documentVisible: true }), false)
})

test('factory physics schedules frames only for a visible active act', async () => {
  const model = await import('../src/factory/factoryFlowModel.ts')

  assert.equal(model.shouldRunFactoryPhysics({ actVisible: true, documentVisible: true, reducedMotion: false }), true)
  assert.equal(model.shouldRunFactoryPhysics({ actVisible: false, documentVisible: true, reducedMotion: false }), false)
  assert.equal(model.shouldRunFactoryPhysics({ actVisible: true, documentVisible: false, reducedMotion: false }), false)
  assert.equal(model.shouldRunFactoryPhysics({ actVisible: true, documentVisible: true, reducedMotion: true }), false)
})

test('the forming press senses, covers, transforms, reveals, and releases one part', async () => {
  const model = await import('../src/factory/stations/formingPressModel.ts').catch(() => ({}))
  let state = { phase: 'falling', sequence: 2, shape: 'bar' }
  state = model.advanceFormingPress(state, 'sensor-enter')
  assert.equal(state.phase, 'sensed')
  state = model.advanceFormingPress(state, 'jaws-closed')
  assert.deepEqual(state, { phase: 'clamped', sequence: 2, shape: 'copy-line' })
  state = model.advanceFormingPress(state, 'jaws-open')
  assert.equal(state.phase, 'revealed')
  state = model.advanceFormingPress(state, 'gate-open')
  assert.equal(state.phase, 'released')
})

test('the forming press closes two side blocks over the part before opening its exit', async () => {
  const model = await import('../src/factory/stations/formingPressModel.ts').catch(() => ({}))
  assert.equal(typeof model.getFormingPressGeometry, 'function')
  assert.equal(typeof model.getFormingPressMotion, 'function')

  const geometry = model.getFormingPressGeometry()
  const idle = model.getFormingPressMotion('falling')
  const closing = model.getFormingPressMotion('sensed')
  const clamped = model.getFormingPressMotion('clamped')
  const released = model.getFormingPressMotion('released')

  assert.equal(geometry.leftJaw.x + geometry.leftJaw.width, geometry.leftRailX)
  assert.equal(geometry.rightJaw.x, geometry.rightRailX)
  const jawCenterY = geometry.leftJaw.y + (geometry.leftJaw.height / 2)
  assert.equal(geometry.gate.y, 291)
  assert.ok(geometry.gate.y > jawCenterY)
  assert.ok(geometry.gate.y < geometry.leftJaw.y + geometry.leftJaw.height)
  assert.equal(
    geometry.leftJaw.x + geometry.leftJaw.width + clamped.leftJawOffset,
    geometry.centerX,
  )
  assert.equal(geometry.rightJaw.x + clamped.rightJawOffset, geometry.centerX)
  assert.deepEqual(idle, { leftJawOffset: 0, rightJawOffset: 0, gateOpen: false, partLocked: false })
  assert.deepEqual(closing, clamped)
  assert.ok(clamped.leftJawOffset > 0)
  assert.ok(clamped.rightJawOffset < 0)
  assert.equal(clamped.gateOpen, false)
  assert.deepEqual(released, { leftJawOffset: 0, rightJawOffset: 0, gateOpen: true, partLocked: false })
})

test('the forming press keeps the part locked until the exit gate opens', async () => {
  const model = await import('../src/factory/stations/formingPressModel.ts')

  assert.equal(model.getFormingPressMotion('falling').partLocked, false)
  assert.equal(model.getFormingPressMotion('sensed').partLocked, true)
  assert.equal(model.getFormingPressMotion('clamped').partLocked, true)
  assert.equal(model.getFormingPressMotion('revealed').partLocked, true)
  assert.equal(model.getFormingPressMotion('released').partLocked, false)
  assert.deepEqual(model.getFormingPressReleaseVelocity(), { x: 0, y: 3 })
})

test('the forming press seats every formed body just above the stop surface', async () => {
  const model = await import('../src/factory/stations/formingPressModel.ts')

  assert.equal(model.getFormingPressRestY({
    gateCenterY: 100,
    gateThickness: 6,
    bodyHeight: 20,
    clearance: 1,
  }), 86)
  assert.equal(model.getFormingPressRestY({
    gateCenterY: 100,
    gateThickness: 6,
    bodyHeight: 42,
    clearance: 1,
  }), 75)
})

test('the forming press jaws span the full channel when closed', async () => {
  const model = await import('../src/factory/stations/formingPressModel.ts')
  const geometry = model.getFormingPressGeometry()
  const clamped = model.getFormingPressMotion('clamped')

  assert.equal(geometry.leftJaw.x, 0)
  assert.equal(geometry.rightJaw.x + geometry.rightJaw.width, 240)
  assert.equal(geometry.leftJaw.width, clamped.leftJawOffset)
  assert.equal(geometry.rightJaw.width, -clamped.rightJawOffset)
})

test('the forming press finishes one shaping cycle before the next Hero-paced part arrives', async () => {
  const model = await import('../src/factory/stations/formingPressModel.ts').catch(() => ({}))
  assert.equal(typeof model.FACTORY_STREAM_CADENCE_MS, 'number')
  assert.equal(typeof model.FORMING_PRESS_TIMING, 'object')

  assert.equal(model.FACTORY_STREAM_CADENCE_MS, 1500)
  assert.equal(model.FORMING_PRESS_ENTRY_VELOCITY_Y, 3)
  assert.equal(model.FORMING_PRESS_MOTION.closeDurationMs, 80)
  assert.equal(model.FORMING_PRESS_MOTION.openDurationMs, 220)
  assert.ok(model.FORMING_PRESS_MOTION.closeDurationMs < model.FORMING_PRESS_MOTION.openDurationMs)
  assert.ok(model.FORMING_PRESS_TIMING.closeAt >= model.FORMING_PRESS_MOTION.closeDurationMs)
  assert.ok(model.FORMING_PRESS_TIMING.closeAt > 0)
  assert.ok(model.FORMING_PRESS_TIMING.revealAt > model.FORMING_PRESS_TIMING.closeAt)
  assert.ok(model.FORMING_PRESS_TIMING.releaseAt > model.FORMING_PRESS_TIMING.revealAt)
  assert.ok(model.FORMING_PRESS_TIMING.resetAt > model.FORMING_PRESS_TIMING.releaseAt)
  assert.ok(model.FORMING_PRESS_TIMING.resetAt < model.FACTORY_STREAM_CADENCE_MS)
})

test('the finishing station applies fill then print then inspection without changing identity', async () => {
  const m = await import('../src/factory/stations/paintInspectionModel.ts')
  const part = makePart({ id: 'cta-7', sequence: 7, role: 'cta', shape: 'cta-button', stage: 'formed', assemblySlot: 'cta', finish: { fill: 'hsl(80 100% 63%)', text: 'Explore', textColor: '#090909' } })
  let state = m.createPaintInspectionState(part)
  assert.equal(m.advancePaintInspection(state, 'inspection-complete'), state)
  state = m.advancePaintInspection(state, 'capture')
  assert.equal(state.phase, 'captured')
  state = m.advancePaintInspection(state, 'coat-start')
  assert.equal(state.phase, 'coating')
  state = m.advancePaintInspection(state, 'coat-complete')
  assert.equal(state.phase, 'printing')
  assert.equal(state.part.stage, 'formed')
  assert.equal(state.part.coated, true)
  state = m.advancePaintInspection(state, 'print-complete')
  assert.equal(state.part.stage, 'printed')
  state = m.advancePaintInspection(state, 'inspection-complete')
  assert.equal(state.phase, 'released')
  assert.deepEqual(state.part, { ...part, coated: true, stage: 'inspected' })
  assert.equal(part.stage, 'formed')
})

test('a part without text skips the print-head phase unless it has graphic detail', async () => {
  const m = await import('../src/factory/stations/paintInspectionModel.ts')
  for (const [finish, expected] of [[{ fill: '#355CFF' }, 'inspecting'], [{ fill: '#355CFF', detailColor: 'rebeccapurple' }, 'printing']]) {
    let state = m.advancePaintInspection(m.createPaintInspectionState(makePart({ stage: 'formed', finish })), 'capture')
    state = m.advancePaintInspection(state, 'coat-complete')
    assert.equal(state.phase, expected)
  }
})

test('the paint station refuses a second active part until release', async () => {
  const m = await import('../src/factory/stations/paintInspectionModel.ts')
  assert.equal(m.canCapturePaintPart(null), true)
  assert.equal(m.canCapturePaintPart('part-1'), false)
})

test('the paint station keeps both applicators beside the falling path', async () => {
  const m = await import('../src/factory/stations/paintInspectionModel.ts')
  const geometry = m.getPaintInspectionGeometry()

  assert.ok(geometry.coatHead.x + geometry.coatHead.width <= geometry.clearPath.x1)
  assert.ok(geometry.printHead.x >= geometry.clearPath.x2)
  assert.ok(geometry.coatHead.nozzleX < geometry.clearPath.x1)
  assert.ok(geometry.printHead.nozzleX > geometry.clearPath.x2)
  assert.ok(geometry.paintY - geometry.coatHead.nozzleY >= 56)
  assert.ok(geometry.paintY - geometry.printHead.nozzleY >= 56)
  assert.ok(geometry.intakeY + 12 <= geometry.coatHead.y)
  assert.ok(geometry.intakeY + 12 <= geometry.printHead.y)
  assert.ok(geometry.coatTarget.x > geometry.coatHead.nozzleX)
  assert.ok(geometry.printTarget.x < geometry.printHead.nozzleX)
  assert.equal(geometry.inspectionY > geometry.paintY, true)
})

test('only near-black paint receives a separate atomized mist cue', async () => {
  const m = await import('../src/factory/stations/paintInspectionModel.ts')

  assert.equal(m.shouldShowPaintMist('#090909'), true)
  assert.equal(m.shouldShowPaintMist('#000'), true)
  assert.equal(m.shouldShowPaintMist('#355CFF'), false)
  assert.equal(m.shouldShowPaintMist('#FFFFFF'), false)
})

test('the factory cycles through at least eight visibly distinct forming and finish recipes', async () => {
  const { LANDING_PART_BLUEPRINTS } = await import('../src/factory/landingPartBlueprints.ts')
  const shapes = new Set(LANDING_PART_BLUEPRINTS.map(({ shape }) => shape))
  const fills = new Set(LANDING_PART_BLUEPRINTS.map(({ finish }) => finish.fill))

  assert.ok(LANDING_PART_BLUEPRINTS.length >= 8)
  assert.ok(shapes.size >= 8)
  assert.ok(fills.size >= 5)
})

test('every factory station has a meaningful reduced-motion snapshot', async () => {
  const { getReducedFactorySnapshot } = await import('../src/factory/factoryFlowModel.ts')

  for (const station of ['statement', 'skills', 'experience']) {
    assert.ok(getReducedFactorySnapshot(station).length > 0, station)
  }
})

test('the factory narrows its active body pool on small viewports', async () => {
  const { getFactoryActiveLimit } = await import('../src/factory/factoryFlowModel.ts')

  assert.equal(getFactoryActiveLimit(1440), 42)
  assert.equal(getFactoryActiveLimit(390), 20)
})

test('a continuous stream only spawns while its act is active and visible', async () => {
  const { shouldSpawnFactoryPart } = await import('../src/factory/factoryFlowModel.ts')

  assert.equal(shouldSpawnFactoryPart({ actVisible: true, documentVisible: true, reducedMotion: false }), true)
  assert.equal(shouldSpawnFactoryPart({ actVisible: false, documentVisible: true, reducedMotion: false }), false)
  assert.equal(shouldSpawnFactoryPart({ actVisible: true, documentVisible: false, reducedMotion: false }), false)
  assert.equal(shouldSpawnFactoryPart({ actVisible: true, documentVisible: true, reducedMotion: true }), false)
})

test('factory parts collide with one another while sharing the same act', async () => {
  const physics = await import('../src/factory/factoryPartPhysics.ts').catch(() => ({}))
  assert.equal(typeof physics.createFactoryBody, 'function')

  const engine = Engine.create({ gravity: { x: 0, y: 0 } })
  const left = physics.createFactoryBody(
    makePart({ id: 'left', sequence: 0 }),
    { x: 100, y: 100, velocityX: 1, velocityY: 0, angle: 0, angularVelocity: 0 },
  )
  const right = physics.createFactoryBody(
    makePart({ id: 'right', sequence: 1 }),
    { x: 120, y: 100, velocityX: -1, velocityY: 0, angle: 0, angularVelocity: 0 },
  )
  let partCollision = false
  Events.on(engine, 'collisionStart', ({ pairs }) => {
    partCollision ||= pairs.some(({ bodyA, bodyB }) => (
      bodyA.label.startsWith('factory-part-')
      && bodyB.label.startsWith('factory-part-')
    ))
  })
  Composite.add(engine.world, [left, right])

  Engine.update(engine, 1000 / 60)

  assert.equal(partCollision, true)
})

test('raw factory parts preserve the original Hero conveyor dimensions at its rendered scale', async () => {
  const physics = await import('../src/factory/factoryPartPhysics.ts').catch(() => ({}))
  assert.equal(typeof physics.getFactoryPartDimensions, 'function')

  assert.deepEqual(physics.getFactoryPartDimensions('square', 1.25, 1.5), { width: 27.5, height: 33 })
  assert.deepEqual(physics.getFactoryPartDimensions('circle', 1.25, 1.5), { radius: 13.75 })
  assert.deepEqual(physics.getFactoryPartDimensions('bar', 1.25, 1.5), { width: 37.5, height: 19.5 })
})

test('the forming press reveals the eight landing-page element shapes', async () => {
  const { getFormedShape } = await import('../src/factory/stations/formingPressModel.ts')
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7, 8].map(getFormedShape), ['brand-mark', 'headline', 'copy-line', 'cta-button', 'visual-card', 'badge', 'divider', 'avatar', 'brand-mark'])
})

test('semantic body rebuild preserves the complete part and motion snapshot', async () => {
  const physics = await import('../src/factory/factoryPartPhysics.ts')
  const { serializeFactoryPart } = await import('../src/factory/factoryFlowModel.ts')
  const part = makePart({ role: 'cta', shape: 'cta-button', stage: 'formed', assemblySlot: 'cta', finish: { fill: 'hsl(80 100% 63%)', text: 'Explore', textColor: '#090909' } })
  const motion = { x: 40, y: 50, velocityX: 2, velocityY: 3, angle: 0.2, angularVelocity: 0.1 }
  const body = physics.createFactoryBody(part, motion)
  const rebuilt = physics.createFactoryBody(part, serializeFactoryPart(body, part))
  assert.deepEqual(rebuilt.plugin.factoryPartSpec, part)
  assert.deepEqual(serializeFactoryPart(rebuilt, part), { ...part, ...motion })
  assert.deepEqual(physics.getFactoryPartDimensions('cta-button'), { width: 54, height: 22 })
  assert.deepEqual(physics.getFactoryPartDimensions('copy-line'), { width: 68, height: 16 })
})

test('reduced motion shows the same five finished semantic roles', async () => {
  const { getReducedFactorySnapshot, createFactoryPartSpec } = await import('../src/factory/factoryFlowModel.ts')
  const snapshots = getReducedFactorySnapshot('experience')
  assert.deepEqual(snapshots.map(({ role }) => role), ['brand', 'heading', 'copy', 'cta', 'visual'])
  assert.ok(snapshots.every(({ stage }) => stage === 'inspected'))
  assert.deepEqual(snapshots.map(({ shape }) => shape), ['brand-mark', 'headline', 'copy-line', 'cta-button', 'visual-card'])
  for (const part of snapshots) assert.deepEqual(part.finish, createFactoryPartSpec(part.sequence, 'raw').finish)
})

test('reduced finished parts avoid the inspection arch and closed gate', async () => {
  const { getReducedFactorySnapshot } = await import('../src/factory/factoryFlowModel.ts')
  const { getFactoryPartDimensions } = await import('../src/factory/factoryPartPhysics.ts')
  for (const part of getReducedFactorySnapshot('experience')) {
    const { height } = getFactoryPartDimensions(part.shape)
    const y = part.yRatio * 520
    assert.ok(Math.abs(y - 244) > height / 2 + 3, `${part.role} overlaps closed gate`)
    assert.ok(y + height / 2 < 312 || y - height / 2 > 346, `${part.role} overlaps inspection arch`)
  }
})

test('forming press rails clear every rotated semantic body at the narrow station width', async () => {
  const { getFormingPressGeometry } = await import('../src/factory/stations/formingPressModel.ts')
  const { getFactoryPartDimensions } = await import('../src/factory/factoryPartPhysics.ts')
  const geometry = getFormingPressGeometry()
  const clearance = (geometry.rightRailX - geometry.leftRailX - 4) * 208 / 240
  for (const shape of ['brand-mark', 'headline', 'copy-line', 'cta-button', 'visual-card', 'badge', 'divider', 'avatar']) {
    const dimensions = getFactoryPartDimensions(shape, 1.25, 1.5)
    const { width, height } = 'radius' in dimensions
      ? { width: dimensions.radius * 2, height: dimensions.radius * 2 }
      : dimensions
    assert.ok(Math.hypot(width, height) < clearance, `${shape} can wedge across both rails`)
  }
})

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

test('contact captures only a current visible arrival without replaying earlier parts', async () => {
  const m = await import('../src/factory/stations/contactAssemblyModel.ts')
  const pose = { x: 421, y: -31, angleDegrees: 14, scaleX: 1.4, scaleY: 1.7 }
  let state = m.createFinalAssemblyState()
  const earlier = makePart({ id: 'earlier-brand', stage: 'inspected' })
  assert.equal(m.beginFinalAssembly(state, earlier, { visible: false, capturePose: pose }).state, state)
  assert.equal(state.active, null)
  assert.deepEqual(state.placements, {})
  const current = makePart({ id: 'current-heading', assemblySlot: 'heading', stage: 'inspected' })
  state = m.beginFinalAssembly(state, current, { visible: true, capturePose: pose }).state
  assert.equal(state.active.part.id, 'current-heading')
  assert.deepEqual(state.active.capturePose, pose)
  assert.equal(m.beginFinalAssembly(state, earlier, { visible: true, capturePose: pose }).state, state)
  state = m.completeFinalAssembly(state, 'current-heading')
  assert.equal(state.active, null)
  assert.deepEqual(Object.keys(state.placements), ['heading'])
  assert.equal(m.beginFinalAssembly(state, earlier, { visible: false, capturePose: pose }).state, state)
  const arrivingNow = makePart({ id: 'new-brand', stage: 'inspected' })
  state = m.beginFinalAssembly(state, arrivingNow, { visible: true, capturePose: pose }).state
  assert.equal(state.active.part.id, 'new-brand')
})

test('final assembly completes only after all eight unique slots settle', async () => {
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

test('overflow impulse is claimed once and points up and away from center', async () => {
  const model = await import('../src/factory/stations/contactAssemblyModel.ts')
  let state = model.createFinalAssemblyState()
  let claim = model.claimFinalOverflow(state, 'overflow-1')
  assert.equal(claim.apply, true)
  state = claim.state
  claim = model.claimFinalOverflow(state, 'overflow-1')
  assert.equal(claim.apply, false)
  assert.deepEqual(model.getFinalOverflowImpulse(200), { x: -0.025, y: -0.045 })
  assert.deepEqual(model.getFinalOverflowImpulse(440), { x: 0.025, y: -0.045 })
  assert.deepEqual(model.getFinalOverflowImpulse(320), { x: 0.025, y: -0.045 })
})

test('assembler pose projection and slot layout remain in viewBox coordinates', async () => {
  const model = await import('../src/factory/stations/contactAssemblyModel.ts')
  assert.deepEqual(model.projectFinalAssemblerPose({
    bodyX: 420, bodyY: 310, angleRadians: Math.PI / 2,
    stationOffsetX: 100, stationOffsetY: 0, scaleX: 0.5, scaleY: 0.5,
  }), { x: 640, y: 620, angleDegrees: 90, scaleX: 2, scaleY: 2 })
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

test('capture preserves pixel size and settled parts use normalized scene dimensions', async () => {
  const m = await import('../src/factory/stations/contactAssemblyModel.ts')
  const pose = m.projectFinalAssemblerPose({ bodyX: 100, bodyY: 100, angleRadians: 0, stationOffsetX: 0, stationOffsetY: 0, scaleX: 0.5, scaleY: 0.5, partScaleX: 1.25, partScaleY: 1.25 })
  assert.equal(pose.scaleX * 0.5, 1.25)
  assert.equal(pose.scaleY * 0.5, 1.25)
  const part = makePart({ stage: 'inspected', scaleX: 1.25, scaleY: 1.25 })
  const settled = m.completeFinalAssembly(m.beginFinalAssembly(m.createFinalAssemblyState(), part).state, part.id)
  assert.equal(settled.placements.brand.scaleX, 1)
  assert.equal(settled.placements.brand.scaleY, 1)
})

test('reduced contact renders one complete semantic NOVA without free factory snapshots', async () => {
  const assembly = await import('../src/factory/stations/contactAssemblyModel.ts')
  const flow = await import('../src/factory/factoryFlowModel.ts')
  const parts = assembly.createReducedFinalAssemblyParts()
  assert.deepEqual(parts.map(assembly.getFinalAssemblySlot), ['brand', 'heading', 'copy', 'cta', 'visual', 'badge', 'divider', 'avatar'])
  assert.ok(parts.every(({ stage }) => stage === 'assembled'))
  assert.equal(assembly.createFinalAssemblyState(parts).assembled, true)
  assert.deepEqual(flow.getReducedFactorySnapshot('contact'), [])
})

test('restored snapshots cannot leak world coordinates into assembled graphics', async () => {
  const m = await import('../src/factory/stations/contactAssemblyModel.ts')
  const snapshot = {...makePart({stage: 'inspected'}), x: 900, y: 2400, angle: 1, velocityX: 0, velocityY: 2, angularVelocity: 0}
  const begun = m.beginFinalAssembly(m.createFinalAssemblyState(), snapshot).state
  assert.equal('x' in begun.active.part, false)
  const settled = m.completeFinalAssembly(begun, snapshot.id)
  assert.equal('x' in settled.placements.brand, false)
  assert.equal('x' in m.createFinalAssemblyState([snapshot]).placements.brand, false)
})

test('overflow launches light and heavy parts beyond the roof after a single queued force', async () => {
  const m = await import('../src/factory/stations/contactAssemblyModel.ts')
  const {createFactoryBody} = await import('../src/factory/factoryPartPhysics.ts')
  for (const shape of ['brand-mark','headline','copy-line','cta-button','visual-card']) {
    for (const side of [-1,1]) {
      const engine=Engine.create({gravity:{x:0,y:1,scale:0.00145}})
      const part=createFactoryBody(makePart({shape,scaleX:1.25,scaleY:1.5}),{x:320+side*80,y:130,angle:0,velocityX:0,velocityY:0,angularVelocity:0})
      Composite.add(engine.world,part)
      const force=m.getFinalOverflowImpulse(part.position.x,320,part.mass)
      Body.applyForce(part,part.position,force)
      Engine.update(engine,1000/60)
      assert.ok(part.velocity.y < -5, shape+' must visibly rebound')
      for(let n=0;n<60;n++) Engine.update(engine,1000/60)
      assert.ok(side<0 ? part.bounds.max.x < 40 : part.bounds.min.x > 600,shape+' must clear roof side')
      Engine.clear(engine)
    }
  }
})

test('contact website slots are upright and its hidden roof stays above the white page', async () => {
  const m=await import('../src/factory/stations/contactAssemblyModel.ts')
  for(const slot of m.FINAL_ASSEMBLY_SLOTS) assert.equal(m.FINAL_ASSEMBLY_LAYOUT[slot].rotation,0)
  for(const roof of m.getFinalAssemblerColliderSpecs().filter(s=>s.kind==='segment')) {
    assert.ok(roof.y1<=m.NOVA_FRAME.y && roof.y2<=m.NOVA_FRAME.y)
  }
})

test('contact uses every blueprint once without changing its finish', async () => {
  const m=await import('../src/factory/stations/contactAssemblyModel.ts')
  const {LANDING_PART_BLUEPRINTS}=await import('../src/factory/landingPartBlueprints.ts')
  let state=m.createFinalAssemblyState()
  for(const [sequence,blueprint] of LANDING_PART_BLUEPRINTS.entries()) {
    const part=makePart({...blueprint,id:'recipe-'+sequence,sequence,stage:'inspected'})
    const next=m.beginFinalAssembly(state,part)
    assert.equal(next.decision.kind,'capture',blueprint.shape)
    state=m.completeFinalAssembly(next.state,part.id)
    assert.equal(state.assembled,sequence===7)
    assert.deepEqual(state.placements[next.decision.slot].finish,blueprint.finish)
  }
  assert.equal(Object.keys(state.placements).length,8)
})

test('contact hidden roof has enough pitch to shed resting bodies', async () => {
  const m=await import('../src/factory/stations/contactAssemblyModel.ts')
  for(const s of m.getFinalAssemblerColliderSpecs().filter(s=>s.kind==='segment')) {
    assert.ok(Math.abs((s.y2-s.y1)/(s.x2-s.x1))>=0.3)
  }
})

test('avatar handoff keeps the same circular scale as its Matter body', async () => {
  const m=await import('../src/factory/stations/contactAssemblyModel.ts')
  const p=m.projectFinalAssemblerPose({bodyX:10,bodyY:10,angleRadians:0,stationOffsetX:0,stationOffsetY:0,scaleX:0.5,scaleY:0.5,partScaleX:1.25,partScaleY:1.5,partShape:'avatar'})
  assert.equal(p.scaleX,2.5)
  assert.equal(p.scaleY,2.5)
})

test('contact roof clears every finished shape at 60 and 120 Hz with one impulse', async () => {
  const m=await import('../src/factory/stations/contactAssemblyModel.ts')
  const {createFactoryBody}=await import('../src/factory/factoryPartPhysics.ts')
  const {LANDING_PART_BLUEPRINTS}=await import('../src/factory/landingPartBlueprints.ts')
  for(const hz of [60,120]) for(const blueprint of LANDING_PART_BLUEPRINTS) {
    const engine=Engine.create({gravity:{x:0,y:1,scale:0.00145}})
    const roofs=m.getFinalAssemblerColliderSpecs().filter(s=>s.kind==='segment').map(s=>{
      const b=Bodies.rectangle((s.x1+s.x2)/2,(s.y1+s.y2)/2,Math.hypot(s.x2-s.x1,s.y2-s.y1),4,{isStatic:true,friction:0.02,restitution:0.92})
      Body.setAngle(b,Math.atan2(s.y2-s.y1,s.x2-s.x1));return b
    })
    const part=createFactoryBody(makePart({...blueprint,scaleX:1.25,scaleY:1.5}),{x:478,y:-200,angle:0,velocityX:0,velocityY:15,angularVelocity:0})
    Composite.add(engine.world,[part,...roofs])
    let pending=false,claimed=false
    Events.on(engine,'collisionStart',({pairs})=>{if(!claimed&&pairs.some(p=>p.bodyA===part||p.bodyB===part)){claimed=true;pending=true}})
    Events.on(engine,'beforeUpdate',()=>{if(pending){Body.applyForce(part,part.position,m.getFinalOverflowImpulse(part.position.x,320,part.mass));pending=false}})
    for(let step=0;step<hz*3;step++) Engine.update(engine,1000/hz)
    assert.ok(claimed,blueprint.shape+' hit roof')
    assert.ok(part.bounds.min.x>616,blueprint.shape+' clears right edge at '+hz+' Hz: '+part.position.x)
    Engine.clear(engine)
  }
})
