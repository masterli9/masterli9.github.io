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

export function getHeroGateGeometry(progress: number) {
  const clampedProgress = Math.min(1, Math.max(0, progress))
  const interpolate = (closed: number, open: number) => (
    closed + ((open - closed) * clampedProgress)
  )
  return {
    wallsPath: 'M10 337V196M160 337V196',
    leftDoor: {
      x1: 10,
      y1: 337,
      x2: interpolate(85, 28),
      y2: interpolate(337, 409),
    },
    rightDoor: {
      x1: 160,
      y1: 337,
      x2: interpolate(85, 142),
      y2: interpolate(337, 409),
    },
  }
}

interface HeroDoorSegment {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface HeroDoorMapping {
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
}

export function getHeroDoorColliderPose(
  segment: HeroDoorSegment,
  mapping: HeroDoorMapping,
) {
  const x1 = mapping.offsetX + (segment.x1 * mapping.scaleX)
  const y1 = mapping.offsetY + (segment.y1 * mapping.scaleY)
  const x2 = mapping.offsetX + (segment.x2 * mapping.scaleX)
  const y2 = mapping.offsetY + (segment.y2 * mapping.scaleY)

  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
    length: Math.hypot(x2 - x1, y2 - y1),
    angle: Math.atan2(y2 - y1, x2 - x1),
  }
}

export function getConveyorOccluderEndX(input: {
  viewportRightX: number
  spawnX: number
  maxPartHalfWidth: number
}) {
  return Math.max(input.viewportRightX, input.spawnX + input.maxPartHalfWidth)
}

export function shouldRunHeroPhysics(input: {
  isInView: boolean
  reducedMotion: boolean
  introStage: string
}) {
  return input.isInView && !input.reducedMotion && input.introStage === 'running'
}

export function shouldRunHeroFeed(input: {
  actActive: boolean
  shouldAnimate: boolean
  lineStarted: boolean
  reducedMotion: boolean
}) {
  return input.actActive && !input.reducedMotion && (input.shouldAnimate || input.lineStarted)
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

export function getHeroStarterPosition(index: number, shape: ConveyorPartShape) {
  return {
    x: 176 + (index * 56),
    y: getConveyorPartCenterY(83, shape, 2),
    angle: shape === 'diamond' ? 45 : 0,
  }
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
