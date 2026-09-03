import Matter, { type Body as MatterBody } from 'matter-js'
import type { FactoryPartShape, FactoryPartSnapshot, FactoryPartSpec } from './factoryTypes'

const { Bodies, Body } = Matter

export type FactoryPartDimensions =
  | { radius: number }
  | { width: number; height: number }

export function getFactoryPartDimensions(
  shape: FactoryPartShape,
  scaleX = 1,
  scaleY = 1,
): FactoryPartDimensions {
  if (shape === 'circle' || shape === 'radio') {
    return { radius: (shape === 'radio' ? 9 : 11) * Math.min(scaleX, scaleY) }
  }

  if (shape === 'bar' || shape === 'button') {
    return {
      width: (shape === 'button' ? 36 : 30) * scaleX,
      height: (shape === 'button' ? 16 : 13) * scaleY,
    }
  }

  if (shape === 'toggle') return { width: 40 * scaleX, height: 20 * scaleY }
  return { width: 22 * scaleX, height: 22 * scaleY }
}

export function createFactoryBody(
  spec: FactoryPartSpec,
  snapshot: Omit<FactoryPartSnapshot, keyof FactoryPartSpec>,
): MatterBody {
  const options = {
    friction: 0.16,
    frictionAir: 0.008,
    restitution: 0.12,
    density: 0.0018,
    label: `factory-part-${spec.id}`,
  }
  const dimensions = getFactoryPartDimensions(spec.shape, spec.scaleX, spec.scaleY)
  const body = 'radius' in dimensions
    ? Bodies.circle(snapshot.x, snapshot.y, dimensions.radius, options)
    : Bodies.rectangle(snapshot.x, snapshot.y, dimensions.width, dimensions.height, options)

  Body.setAngle(body, snapshot.angle)
  Body.setVelocity(body, { x: snapshot.velocityX, y: snapshot.velocityY })
  Body.setAngularVelocity(body, snapshot.angularVelocity)
  return body
}
