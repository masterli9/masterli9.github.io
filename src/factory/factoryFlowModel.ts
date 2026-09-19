import { getLandingPartBlueprint } from './landingPartBlueprints.ts'
import type { Body as MatterBody } from 'matter-js'
import type {
  FactoryPartShape,
  FactoryPartSnapshot,
  FactoryPartSpec,
  FactoryPartStage,
  FactoryStationId,
} from './factoryTypes'

const RAW_SHAPES: FactoryPartShape[] = ['square', 'circle', 'bar', 'diamond']
export function createFactoryPartSpec(sequence: number, stage: FactoryPartStage): FactoryPartSpec {
  return {
    id: `part-${sequence}`,
    sequence,
    shape: RAW_SHAPES[sequence % RAW_SHAPES.length] ?? 'square',
    role: getLandingPartBlueprint(sequence).role,
    assemblySlot: getLandingPartBlueprint(sequence).assemblySlot,
    finish: { ...getLandingPartBlueprint(sequence).finish },
    stage,
  }
}

export function getFactorySpawnDecision(input: {
  lineStarted: boolean
  activeCount: number
  waitingCount: number
  waitingLimit: number
  activeLimit: number
}) {
  if (input.activeCount >= input.activeLimit) return 'recycle' as const
  if (!input.lineStarted && input.waitingCount >= input.waitingLimit) return 'hold' as const
  return 'spawn' as const
}

export function getFactoryActiveLimit(viewportWidth: number) {
  return viewportWidth <= 640 ? 20 : 42
}

export function shouldSpawnFactoryPart(input: {
  actVisible: boolean
  documentVisible: boolean
  reducedMotion: boolean
}) {
  return input.actVisible && input.documentVisible && !input.reducedMotion
}

export function shouldStartFactoryLine(input: {
  markerTop: number
  viewportHeight: number
  lineStarted: boolean
}) {
  return !input.lineStarted && input.markerTop <= input.viewportHeight
}

export function getActiveBand(viewportTop: number, viewportHeight: number) {
  return {
    minY: viewportTop - (viewportHeight * 2),
    maxY: viewportTop + (viewportHeight * 3),
  }
}

export function getFactoryActBand(
  actId: 'upper' | 'lower',
  viewportTop: number,
  viewportHeight: number,
  actBounds?: { minY: number; maxY: number },
) {
  const viewportBand = getActiveBand(viewportTop, viewportHeight)
  if (actId === 'lower') {
    const lowerBand = {
      minY: viewportTop - (viewportHeight * 3),
      maxY: viewportTop + (viewportHeight * 4),
    }
    if (actBounds) {
      return {
        minY: actBounds.minY,
        maxY: actBounds.maxY,
      }
    }
    return lowerBand
  }
  if (actBounds) {
    return {
      minY: Math.min(viewportBand.minY, actBounds.minY),
      maxY: viewportBand.maxY,
    }
  }
  return viewportBand
}

export function shouldRecycleFactoryPart(y: number, band: { minY: number; maxY: number }) {
  return y < band.minY || y > band.maxY
}

export function shouldRecycleFactoryPartAtActBoundary(bodyMaxY: number, actHeight: number) {
  return bodyMaxY >= actHeight
}

export function shouldTeardownAct(input: {
  intersects: boolean
  neighborVisible: boolean
  documentVisible: boolean
}) {
  return input.documentVisible && !input.intersects && !input.neighborVisible
}

export interface ReducedFactoryPartSnapshot extends FactoryPartSpec {
  xRatio: number
  yRatio: number
  angle: number
}

function createReducedPart(
  station: FactoryStationId,
  sequence: number,
  stage: FactoryPartStage,
  xRatio: number,
  yRatio: number,
): ReducedFactoryPartSnapshot {
  return {
    ...createFactoryPartSpec(sequence, stage),
    shape: stage === 'raw' ? RAW_SHAPES[sequence % RAW_SHAPES.length] : getLandingPartBlueprint(sequence).shape,
    id: `reduced-${station}-${sequence}`,
    xRatio, yRatio, angle: 0,
  }
}

export function getReducedFactorySnapshot(station: FactoryStationId): ReducedFactoryPartSnapshot[] {
  if (station === 'statement') return [
    createReducedPart(station, 0, 'raw', 0.43, 0.68),
    createReducedPart(station, 1, 'raw', 0.62, 0.78),
  ]
  if (station === 'skills') return [createReducedPart(station, 3, 'formed', 0.5, 0.73)]
  if (station === 'experience') return [0, 1, 2, 3, 4].map((sequence) =>
    createReducedPart(station, sequence, 'inspected', 0.5, 0.36 + sequence * 0.115))
  if (station === 'goals') return [0, 1, 2].map((sequence) =>
    createReducedPart(station, sequence, 'inspected', 0.25 + sequence * 0.25, 0.62))
  if (station === 'contact') return [0, 1, 2, 3, 4].map((sequence) =>
    createReducedPart(station, sequence, 'assembled', 0.5, 0.51 + sequence * 0.058))
  return []
}

export function serializeFactoryPart(body: MatterBody, spec: FactoryPartSpec): FactoryPartSnapshot {
  return {
    ...spec,
    x: body.position.x,
    y: body.position.y,
    velocityX: body.velocity.x,
    velocityY: body.velocity.y,
    angle: body.angle,
    angularVelocity: body.angularVelocity,
  }
}
