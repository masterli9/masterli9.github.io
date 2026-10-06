import assert from 'node:assert/strict'
import { test } from 'node:test'
import Matter from 'matter-js'
import { createFactoryBody } from '../src/factory/factoryPartPhysics.ts'
import { createFactoryPartSpec } from '../src/factory/factoryFlowModel.ts'

test('late parts wait on the closed paint intake without bouncing and fall when it opens', async () => {
  const { preventPaintIntakeBounce } = await import('../src/factory/stations/paintIntakePhysics.ts')
  for (const width of [192, 208, 288]) {
    for (let sequence = 0; sequence < 8; sequence++) {
      const scale = width / 260
      const engine = Matter.Engine.create({ gravity: { x: 0, y: 1, scale: 0.00145 } })
      const gate = Matter.Bodies.rectangle(130 * scale, 130 * scale, 156 * scale, 5 * scale, {
        isStatic: true, restitution: 0.12, label: 'experience-intake-gate',
      })
      const part = createFactoryBody(createFactoryPartSpec(sequence, 'formed'), {
        x: 130 * scale, y: 20 * scale, angle: 0,
        velocityX: 0, velocityY: 12, angularVelocity: 0,
      })
      const restitution = part.restitution
      const stop = preventPaintIntakeBounce(engine)
      Matter.Composite.add(engine.world, [gate, part])
      let touched = false
      Matter.Events.on(engine, 'collisionStart', ({ pairs }) => {
        if (pairs.some(pair => pair.bodyA === gate || pair.bodyB === gate)) touched = true
      })
      for (let step = 0; step < 240; step++) {
        Matter.Engine.update(engine, 1000 / 120)
        assert.ok(part.velocity.y >= -0.05, `${width}px recipe ${sequence} bounced: ${part.velocity.y}`)
      }
      assert.ok(touched, 'part must actually touch the closed intake')
      assert.ok(Math.abs(part.bounds.max.y - gate.bounds.min.y) < 1, 'part waits on the lid')
      Matter.Composite.remove(engine.world, gate)
      for (let step = 0; step < 120; step++) Matter.Engine.update(engine, 1000 / 120)
      assert.ok(part.bounds.min.y > 244 * scale, 'opening releases the waiting part')
      assert.equal(part.restitution, restitution, 'normal material is restored after leaving the lid')
      stop()
      Matter.Engine.clear(engine)
    }
  }
})

test('paint intake cleanup restores the material of a part still waiting on the lid', async () => {
  const { preventPaintIntakeBounce } = await import('../src/factory/stations/paintIntakePhysics.ts')
  const engine = Matter.Engine.create()
  const gate = Matter.Bodies.rectangle(0, 40, 156, 5, { isStatic: true, label: 'experience-intake-gate' })
  const part = Matter.Bodies.rectangle(0, 0, 20, 20, { restitution: 0.7, label: 'factory-part-cleanup' })
  const stop = preventPaintIntakeBounce(engine)
  Matter.Composite.add(engine.world, [gate, part])
  for (let step = 0; step < 120; step++) Matter.Engine.update(engine, 1000 / 120)
  assert.equal(part.restitution, 0)
  stop()
  assert.equal(part.restitution, 0.7)
})
