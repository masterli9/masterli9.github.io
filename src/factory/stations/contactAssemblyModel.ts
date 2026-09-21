import type { FactoryAssemblySlot, FactoryPartSpec } from '../factoryTypes'

export const FINAL_ASSEMBLY_SLOTS = ['brand', 'heading', 'copy', 'cta', 'visual'] as const
export const FINAL_ASSEMBLER_VIEWBOX = { width: 640, height: 620 } as const
export const NOVA_FRAME = { x: 40, y: 170, width: 560, height: 385, centerX: 320 } as const

export interface FinalAssemblySlotTransform {
  x: number
  y: number
  rotation: number
  scale: number
  guideWidth: number
  guideHeight: number
}

export const FINAL_ASSEMBLY_LAYOUT: Record<FactoryAssemblySlot, FinalAssemblySlotTransform> = {
  brand: { x: 92, y: 205, rotation: 0, scale: 1.15, guideWidth: 28, guideHeight: 28 },
  heading: { x: 196, y: 320, rotation: -2, scale: 2.2, guideWidth: 128, guideHeight: 48 },
  copy: { x: 202, y: 382, rotation: 0, scale: 1.8, guideWidth: 126, guideHeight: 30 },
  cta: { x: 154, y: 446, rotation: 1, scale: 1.65, guideWidth: 92, guideHeight: 38 },
  visual: { x: 450, y: 368, rotation: 3, scale: 3.25, guideWidth: 190, guideHeight: 148 },
}

export interface FinalAssemblyPlacement {
  part: FactoryPartSpec
  slot: FactoryAssemblySlot
}

export interface FinalAssemblyState {
  placements: Partial<Record<FactoryAssemblySlot, FactoryPartSpec>>
  active: FinalAssemblyPlacement | null
  overflowedIds: string[]
  assembled: boolean
}

export type FinalAssemblyDecision =
  | { kind: 'capture'; slot: FactoryAssemblySlot }
  | { kind: 'overflow'; reason: 'busy' | 'duplicate' | 'complete' | 'unfinished' }

export interface FinalAssemblerCapturePose {
  x: number
  y: number
  angleDegrees: number
}

const hasAllSlots = (placements: FinalAssemblyState['placements']) =>
  FINAL_ASSEMBLY_SLOTS.every((slot) => placements[slot] !== undefined)

export function createFinalAssemblyState(seed: readonly FactoryPartSpec[] = []): FinalAssemblyState {
  const placements: FinalAssemblyState['placements'] = {}
  for (const part of seed) {
    if (!placements[part.assemblySlot]) placements[part.assemblySlot] = { ...part, stage: 'assembled' }
  }
  return { placements, active: null, overflowedIds: [], assembled: hasAllSlots(placements) }
}

export function decideFinalAssembly(state: FinalAssemblyState, part: FactoryPartSpec): FinalAssemblyDecision {
  if (part.stage !== 'inspected' && part.stage !== 'assembled') return { kind: 'overflow', reason: 'unfinished' }
  if (state.assembled) return { kind: 'overflow', reason: 'complete' }
  if (state.active) return { kind: 'overflow', reason: 'busy' }
  if (state.placements[part.assemblySlot]) return { kind: 'overflow', reason: 'duplicate' }
  return { kind: 'capture', slot: part.assemblySlot }
}

export function beginFinalAssembly(state: FinalAssemblyState, part: FactoryPartSpec) {
  const decision = decideFinalAssembly(state, part)
  if (decision.kind === 'overflow') return { state, decision }
  return { state: { ...state, active: { part: { ...part }, slot: decision.slot } }, decision }
}

export function completeFinalAssembly(state: FinalAssemblyState, partId: string): FinalAssemblyState {
  if (!state.active || state.active.part.id !== partId) return state
  const placements = {
    ...state.placements,
    [state.active.slot]: { ...state.active.part, stage: 'assembled' as const },
  }
  return { ...state, placements, active: null, assembled: hasAllSlots(placements) }
}

export function claimFinalOverflow(state: FinalAssemblyState, partId: string) {
  if (state.overflowedIds.includes(partId)) return { state, apply: false }
  return { state: { ...state, overflowedIds: [...state.overflowedIds, partId] }, apply: true }
}

export function getFinalOverflowImpulse(partX: number, centerX = NOVA_FRAME.centerX) {
  return { x: partX < centerX ? -0.0018 : 0.0018, y: -0.0036 }
}

export function projectFinalAssemblerPose(input: {
  bodyX: number
  bodyY: number
  angleRadians: number
  stationOffsetX: number
  stationOffsetY: number
  scaleX: number
  scaleY: number
}): FinalAssemblerCapturePose {
  return {
    x: (input.bodyX - input.stationOffsetX) / input.scaleX,
    y: (input.bodyY - input.stationOffsetY) / input.scaleY,
    angleDegrees: input.angleRadians * 180 / Math.PI,
  }
}

export type FinalAssemblerColliderSpec =
  | { kind: 'rectangle'; label: string; x: number; y: number; width: number; height: number; isSensor: boolean }
  | { kind: 'segment'; label: string; x1: number; y1: number; x2: number; y2: number; isSensor: boolean }

const FINAL_ASSEMBLER_COLLIDERS: readonly FinalAssemblerColliderSpec[] = [
  { kind: 'rectangle', label: 'contact-capture-zone', x: 320, y: 108, width: 520, height: 96, isSensor: true },
  { kind: 'segment', label: 'contact-overflow-roof-left', x1: 40, y1: 170, x2: 320, y2: 158, isSensor: false },
  { kind: 'segment', label: 'contact-overflow-roof-right', x1: 320, y1: 158, x2: 600, y2: 170, isSensor: false },
]

export const getFinalAssemblerColliderSpecs = () => FINAL_ASSEMBLER_COLLIDERS
