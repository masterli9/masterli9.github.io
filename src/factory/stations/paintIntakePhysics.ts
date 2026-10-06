import Matter, { type Body, type Engine, type IEventCollision } from 'matter-js'

const { Body: MatterBody, Events } = Matter

export function preventPaintIntakeBounce(engine: Engine) {
  const waiting = new Map<Body, { restitution: number; contacts: Set<string> }>()
  const onStart = ({ pairs }: IEventCollision<Engine>) => {
    for (const pair of pairs) {
      const gate = pair.bodyA.label === 'experience-intake-gate' ? pair.bodyA
        : pair.bodyB.label === 'experience-intake-gate' ? pair.bodyB : null
      if (!gate) continue
      const part = gate === pair.bodyA ? pair.bodyB : pair.bodyA
      if (!part.label.startsWith('factory-part-')) continue
      const material = waiting.get(part) ?? { restitution: part.restitution, contacts: new Set<string>() }
      material.contacts.add(pair.id)
      waiting.set(part, material)
      // Matter uses the larger restitution of both bodies. Change both as well
      // as the already-created pair before the first velocity solve.
      gate.restitution = 0
      part.restitution = 0
      pair.restitution = 0
      // Settle late arrivals like the press instead of turning their impact
      // into rotation, which can kick even an inelastic thin part upward.
      MatterBody.setVelocity(part, { x: 0, y: 0 })
      MatterBody.setAngularVelocity(part, 0)
    }
  }
  const onEnd = ({ pairs }: IEventCollision<Engine>) => {
    for (const pair of pairs) {
      for (const body of [pair.bodyA, pair.bodyB]) {
        const material = waiting.get(body)
        if (!material || !material.contacts.delete(pair.id) || material.contacts.size > 0) continue
        body.restitution = material.restitution
        waiting.delete(body)
      }
    }
  }
  Events.on(engine, 'collisionStart', onStart)
  Events.on(engine, 'collisionEnd', onEnd)
  return () => {
    Events.off(engine, 'collisionStart', onStart)
    Events.off(engine, 'collisionEnd', onEnd)
    for (const [body, material] of waiting) body.restitution = material.restitution
    waiting.clear()
  }
}
