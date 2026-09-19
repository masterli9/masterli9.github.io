import { getLandingPartBlueprint } from '../landingPartBlueprints.ts'
import type { FactoryPartShape } from '../factoryTypes'

export type FormingPressPhase = 'falling' | 'sensed' | 'clamped' | 'revealed' | 'released'

export type FormingPressEvent = 'sensor-enter' | 'jaws-closed' | 'jaws-open' | 'gate-open'

export interface FormingPressState {
  phase: FormingPressPhase
  sequence: number
  shape: FactoryPartShape
}

export const FACTORY_STREAM_CADENCE_MS = 1500
export const FORMING_PRESS_ENTRY_VELOCITY_Y = 3

export const FORMING_PRESS_TIMING = {
  closeAt: 90,
  revealAt: 520,
  releaseAt: 760,
  resetAt: 1180,
} as const

export const FORMING_PRESS_MOTION = {
  closeDurationMs: 80,
  openDurationMs: 220,
} as const

export interface FormingPressJawGeometry {
  x: number
  y: number
  width: number
  height: number
}

export interface FormingPressGeometry {
  centerX: number
  leftRailX: number
  rightRailX: number
  leftJaw: FormingPressJawGeometry
  rightJaw: FormingPressJawGeometry
  gate: { x1: number; x2: number; y: number }
}

const FORMING_PRESS_GEOMETRY: FormingPressGeometry = {
  centerX: 120,
  leftRailX: 82,
  rightRailX: 158,
  leftJaw: { x: 28, y: 229, width: 54, height: 76 },
  rightJaw: { x: 158, y: 229, width: 54, height: 76 },
  gate: { x1: 82, x2: 158, y: 291 },
}

export function getFormingPressGeometry(): FormingPressGeometry {
  return FORMING_PRESS_GEOMETRY
}

export function getFormingPressMotion(phase: FormingPressPhase) {
  const jawsClosed = phase === 'sensed' || phase === 'clamped'
  const jawTravel = FORMING_PRESS_GEOMETRY.centerX - FORMING_PRESS_GEOMETRY.leftRailX
  return {
    leftJawOffset: jawsClosed ? jawTravel : 0,
    rightJawOffset: jawsClosed ? -jawTravel : 0,
    gateOpen: phase === 'released',
  }
}

export function getFormedShape(sequence: number) {
  return getLandingPartBlueprint(sequence).shape
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
