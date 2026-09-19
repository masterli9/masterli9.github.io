export type FactoryActId = 'upper' | 'lower'

export type FactoryStationId =
  | 'hero'
  | 'statement'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'goals'
  | 'contact'

export type FactoryPartShape =
  | 'square'
  | 'circle'
  | 'bar'
  | 'diamond'
  | 'brand-mark'
  | 'headline'
  | 'copy-line'
  | 'cta-button'
  | 'visual-card'

export type FactoryPartRole = 'brand' | 'heading' | 'copy' | 'cta' | 'visual'
export type FactoryAssemblySlot = FactoryPartRole

export interface FactoryPartFinish {
  fill: string
  stroke?: string
  textColor?: string
  text?: string
  detailColor?: string
}

export type FactoryPartStage = 'raw' | 'formed' | 'printed' | 'inspected' | 'assembled'

export interface FactoryPartSpec {
  id: string
  sequence: number
  shape: FactoryPartShape
  role: FactoryPartRole
  finish: FactoryPartFinish
  assemblySlot: FactoryAssemblySlot
  stage: FactoryPartStage
  scaleX?: number
  scaleY?: number
}

export interface FactoryPartSnapshot extends FactoryPartSpec {
  x: number
  y: number
  velocityX: number
  velocityY: number
  angle: number
  angularVelocity: number
  fading?: boolean
}
