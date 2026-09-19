import Matter, { type Body as MatterBody } from 'matter-js'
import type { FactoryPartShape, FactoryPartSnapshot, FactoryPartSpec } from './factoryTypes'

const { Bodies, Body } = Matter

export type FactoryPartDimensions =
  | { radius: number }
  | { width: number; height: number }

const SEMANTIC_DIMENSIONS = {
  'brand-mark': { width: 24, height: 24 },
  headline: { width: 58, height: 22 },
  'copy-line': { width: 68, height: 16 },
  'cta-button': { width: 54, height: 22 },
  'visual-card': { width: 54, height: 42 },
} as const

export function getFactoryPartDimensions(
  shape: FactoryPartShape,
  scaleX = 1,
  scaleY = 1,
): FactoryPartDimensions {
  if (shape === 'circle') return { radius: 11 * Math.min(scaleX, scaleY) }
  if (shape === 'bar') return { width: 30 * scaleX, height: 13 * scaleY }
  const semantic = SEMANTIC_DIMENSIONS[shape as keyof typeof SEMANTIC_DIMENSIONS]
  if (semantic) return { width: semantic.width * scaleX, height: semantic.height * scaleY }

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

  body.plugin.factoryPartSpec = spec
  Body.setAngle(body, snapshot.angle)
  Body.setVelocity(body, { x: snapshot.velocityX, y: snapshot.velocityY })
  Body.setAngularVelocity(body, snapshot.angularVelocity)
  return body
}
