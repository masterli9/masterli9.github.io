import Matter from 'matter-js'

const { Bodies } = Matter

export interface RoundedBeltEndGeometry {
  left: number
  top: number
  height: number
  clearance?: number
}

export function createRoundedBeltEndCollider({
  left,
  top,
  height,
  clearance = 0,
}: RoundedBeltEndGeometry) {
  const visualRadius = height / 2
  const colliderRadius = visualRadius + clearance

  return Bodies.circle(left + visualRadius, top + visualRadius, colliderRadius, {
    isStatic: true,
    friction: 0.12,
    restitution: 0,
    label: 'conveyor-rounded-end',
  })
}
