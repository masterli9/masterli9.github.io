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
  | 'button'
  | 'cursor'
  | 'toggle'
  | 'radio'

export type FactoryPartColor = '#FFFFFF' | '#F21868' | '#355CFF'

export type FactoryPartStage = 'raw' | 'formed' | 'painted' | 'assembled'

export interface FactoryPartSpec {
  id: string
  sequence: number
  shape: FactoryPartShape
  color: FactoryPartColor
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
