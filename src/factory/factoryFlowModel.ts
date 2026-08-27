import type { Body as MatterBody } from 'matter-js'
import type {
  FactoryPartColor,
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
    color: '#FFFFFF',
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
  return viewportBand
}

export function shouldRecycleFactoryPart(y: number, band: { minY: number; maxY: number }) {
  return y < band.minY || y > band.maxY
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
  shape: FactoryPartShape,
  color: FactoryPartColor,
  stage: FactoryPartStage,
  xRatio: number,
  yRatio: number,
): ReducedFactoryPartSnapshot {
  return {
    id: `reduced-${station}-${sequence}`,
    sequence,
    shape,
    color,
    stage,
    xRatio,
    yRatio,
    angle: 0,
  }
}

export function getReducedFactorySnapshot(station: FactoryStationId): ReducedFactoryPartSnapshot[] {
  if (station === 'statement') {
    return [
      createReducedPart(station, 0, 'button', '#F21868', 'formed', 0.43, 0.68),
      createReducedPart(station, 1, 'cursor', '#355CFF', 'formed', 0.62, 0.78),
    ]
  }
  if (station === 'skills') {
    return [createReducedPart(station, 0, 'button', '#FFFFFF', 'formed', 0.5, 0.73)]
  }
  if (station === 'experience') {
    return [
      createReducedPart(station, 0, 'button', '#FFFFFF', 'painted', 0.42, 0.74),
      createReducedPart(station, 1, 'cursor', '#F21868', 'painted', 0.58, 0.82),
    ]
  }
  if (station === 'goals') {
    return [
      createReducedPart(station, 0, 'radio', '#FFFFFF', 'painted', 0.25, 0.62),
      createReducedPart(station, 1, 'radio', '#F21868', 'painted', 0.5, 0.62),
      createReducedPart(station, 2, 'radio', '#355CFF', 'painted', 0.75, 0.62),
    ]
  }
  if (station === 'contact') {
    return [
      createReducedPart(station, 0, 'button', '#FFFFFF', 'assembled', 0.2875, 0.5346),
      createReducedPart(station, 1, 'cursor', '#FFFFFF', 'assembled', 0.4, 0.5346),
      createReducedPart(station, 2, 'toggle', '#F21868', 'assembled', 0.5125, 0.5346),
      createReducedPart(station, 3, 'radio', '#355CFF', 'assembled', 0.625, 0.5346),
      createReducedPart(station, 4, 'square', '#FFFFFF', 'assembled', 0.7375, 0.5346),
    ]
  }
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
