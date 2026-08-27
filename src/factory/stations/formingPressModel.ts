import type { FactoryPartShape } from '../factoryTypes'

export type FormingPressPhase = 'falling' | 'sensed' | 'clamped' | 'revealed' | 'released'

export type FormingPressEvent = 'sensor-enter' | 'jaws-closed' | 'jaws-open' | 'gate-open'

export interface FormingPressState {
  phase: FormingPressPhase
  sequence: number
  shape: FactoryPartShape
}

const FORMED_SHAPES = ['button', 'cursor', 'toggle', 'radio'] as const

export function getFormedShape(sequence: number) {
  return FORMED_SHAPES[sequence % FORMED_SHAPES.length] ?? 'button'
}

export function advanceFormingPress(state: FormingPressState, event: FormingPressEvent): FormingPressState {
  if (state.phase === 'falling' && event === 'sensor-enter') return { ...state, phase: 'sensed' }
  if (state.phase === 'sensed' && event === 'jaws-closed') {
    return { phase: 'clamped', sequence: state.sequence, shape: getFormedShape(state.sequence) }
  }
  if (state.phase === 'clamped' && event === 'jaws-open') return { ...state, phase: 'revealed' }
  if (state.phase === 'revealed' && event === 'gate-open') return { ...state, phase: 'released' }
  return state
}
