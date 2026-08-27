import type { Body as MatterBody } from 'matter-js'
import type { FactoryPartShape, FactoryPartSnapshot, FactoryPartSpec, FactoryPartStage } from './factoryTypes'

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

export function getActiveBand(viewportTop: number, viewportHeight: number) {
  return {
    minY: viewportTop - (viewportHeight * 2),
    maxY: viewportTop + (viewportHeight * 3),
  }
}

export function shouldRecycleFactoryPart(y: number, band: { minY: number; maxY: number }) {
  return y < band.minY || y > band.maxY
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
