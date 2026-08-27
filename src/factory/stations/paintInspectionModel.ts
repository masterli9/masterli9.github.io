import type { FactoryPartSpec } from '../factoryTypes'

const PAINT_COLORS = ['#FFFFFF', '#F21868', '#355CFF'] as const

export const getPaintColor = (sequence: number) => PAINT_COLORS[sequence % PAINT_COLORS.length] ?? '#FFFFFF'

export const advanceInspection = (part: FactoryPartSpec, sensorCrossed: boolean): FactoryPartSpec => (
  sensorCrossed ? { ...part, stage: 'painted' } : part
)
