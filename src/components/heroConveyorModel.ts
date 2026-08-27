export interface ConveyorSpawnState {
  activeCount: number
  maxParts: number
  isActive: boolean
  reducedMotion: boolean
}

export type ConveyorPartShape = 'square' | 'circle' | 'bar' | 'diamond'

export function canSpawnConveyorPart({
  activeCount,
  maxParts,
  isActive,
  reducedMotion,
}: ConveyorSpawnState) {
  return isActive && !reducedMotion && activeCount < maxParts
}

export interface ConveyorPayloadState {
  activeCount: number
  minimumPayload: number
  maxParts: number
}

export function getConveyorPayloadDeficit({
  activeCount,
  minimumPayload,
  maxParts,
}: ConveyorPayloadState) {
  const targetCount = Math.min(minimumPayload, maxParts)
  return Math.max(0, targetCount - activeCount)
}

export function getHeroGateState(lineStarted: boolean) {
  return {
    open: lineStarted,
    waitingLimit: lineStarted ? Number.POSITIVE_INFINITY : 30,
  }
}

export function clampPhysicsDelta(elapsedMilliseconds: number) {
  return Math.min(elapsedMilliseconds, 1000 / 60)
}

export function shouldReleaseConveyorPart(positionX: number, releaseX: number) {
  return positionX <= releaseX
}

export function getRoundedEndReleaseX(beltLeftX: number, beltHeight: number) {
  return beltLeftX + (beltHeight / 2)
}

export function getConveyorPartCenterY(
  beltTopY: number,
  shape: ConveyorPartShape,
  clearance = 0,
) {
  const halfHeight = shape === 'bar'
    ? 6.5
    : shape === 'diamond'
      ? 11 * Math.SQRT2
      : 11

  return beltTopY - halfHeight - clearance
}

export function getConveyorBeltBottomY(beltTopY: number, beltHeight: number) {
  return beltTopY + beltHeight
}

export interface ConveyorMotionInput {
  surfaceSpeed: number
  treadCycleLength: number
  rollerRadius: number
}

export function getConveyorMotion({
  surfaceSpeed,
  treadCycleLength,
  rollerRadius,
}: ConveyorMotionInput) {
  return {
    bodyVelocity: surfaceSpeed / 60,
    treadCycleDuration: treadCycleLength / surfaceSpeed,
    rollerRotationDuration: (2 * Math.PI * rollerRadius) / surfaceSpeed,
  }
}

export interface RoundedEndTangentInput {
  bodyX: number
  bodyY: number
  centerX: number
  centerY: number
  releaseY: number
  minimumSpeed: number
  gravityPerStep: number
}

export function getRoundedEndTangentVelocity({
  bodyX,
  bodyY,
  centerX,
  centerY,
  releaseY,
  minimumSpeed,
  gravityPerStep,
}: RoundedEndTangentInput) {
  const radialX = bodyX - centerX
  const radialY = bodyY - centerY
  const radialLength = Math.hypot(radialX, radialY)

  if (radialLength === 0) return { x: -minimumSpeed, y: 0 }

  const tangentUnitX = radialY / radialLength
  const tangentUnitY = -radialX / radialLength
  const verticalDrop = Math.max(0, bodyY - releaseY)
  const tangentialSpeed = Math.sqrt(
    (minimumSpeed * minimumSpeed) + (2 * gravityPerStep * verticalDrop),
  )
  const tangentX = tangentUnitX * tangentialSpeed
  const tangentY = tangentUnitY * tangentialSpeed

  return {
    x: Math.abs(tangentX) < 1e-12 ? 0 : tangentX,
    y: Math.abs(tangentY) < 1e-12 ? 0 : tangentY,
  }
}
