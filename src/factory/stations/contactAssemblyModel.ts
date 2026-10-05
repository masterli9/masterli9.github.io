import { getLandingPartBlueprint } from '../landingPartBlueprints.ts'
import type { FactoryPartSpec } from '../factoryTypes'

export const FINAL_ASSEMBLY_SLOTS = ['brand', 'heading', 'copy', 'cta', 'visual', 'badge', 'divider', 'avatar'] as const
export type FinalAssemblySlot = typeof FINAL_ASSEMBLY_SLOTS[number]

export const getFinalAssemblySlot = (part: FactoryPartSpec): FinalAssemblySlot =>
  part.shape === 'badge' || part.shape === 'divider' || part.shape === 'avatar' ? part.shape : part.assemblySlot

export const FINAL_ASSEMBLER_VIEWBOX = { width: 640, height: 520 } as const
export const NOVA_FRAME = { x: 24, y: 80, width: 592, height: 420, centerX: 320 } as const

export interface FinalAssemblySlotTransform {
  x: number
  y: number
  rotation: number
  scale: number
  scaleY?: number
  guideWidth: number
  guideHeight: number
}

export const FINAL_ASSEMBLY_LAYOUT: Record<FinalAssemblySlot, FinalAssemblySlotTransform> = {
  brand: { x: 70, y: 145, rotation: 0, scale: 1.05, guideWidth: 26, guideHeight: 26 },
  heading: { x: 172, y: 250, rotation: 0, scale: 3.2, guideWidth: 185.6, guideHeight: 70.4 },
  copy: { x: 172, y: 301, rotation: 0, scale: 2.4, guideWidth: 163.2, guideHeight: 38.4 },
  cta: { x: 172, y: 374, rotation: 0, scale: 2.2, guideWidth: 118.8, guideHeight: 48.4 },
  visual: { x: 466, y: 292, rotation: 0, scale: 4, guideWidth: 216, guideHeight: 168 },
  badge: { x: 172, y: 198, rotation: 0, scale: 1.1, guideWidth: 46.2, guideHeight: 26.4 },
  divider: { x: 320, y: 429, rotation: 0, scale: 7.2, scaleY: 0.65, guideWidth: 475, guideHeight: 6 },
  avatar: { x: 563, y: 145, rotation: 0, scale: 0.8, guideWidth: 28.8, guideHeight: 28.8 },
}

export interface FinalAssemblyPlacement {
  part: FactoryPartSpec
  slot: FinalAssemblySlot
  capturePose?: FinalAssemblerCapturePose
}

export interface FinalAssemblyState {
  placements: Partial<Record<FinalAssemblySlot, FactoryPartSpec>>
  active: FinalAssemblyPlacement | null
  overflowedIds: string[]
  assembled: boolean
}

export type FinalAssemblyDecision =
  | { kind: 'capture'; slot: FinalAssemblySlot }
  | { kind: 'overflow'; reason: 'busy' | 'duplicate' | 'complete' | 'unfinished' | 'hidden' }

export interface FinalAssemblerCapturePose {
  x: number
  y: number
  angleDegrees: number
  scaleX: number
  scaleY: number
}

// Restored Matter specs can also contain snapshot coordinates. Keep only semantic data.
const semanticPart = (part: FactoryPartSpec): FactoryPartSpec => ({
  id: part.id, sequence: part.sequence, role: part.role, shape: part.shape,
  assemblySlot: part.assemblySlot, stage: part.stage, finish: { ...part.finish },
  coated: part.coated, scaleX: part.scaleX, scaleY: part.scaleY,
})

const hasAllSlots = (placements: FinalAssemblyState['placements']) =>
  FINAL_ASSEMBLY_SLOTS.every((slot) => placements[slot] !== undefined)

export function createFinalAssemblyState(seed: readonly FactoryPartSpec[] = []): FinalAssemblyState {
  const placements: FinalAssemblyState['placements'] = {}
  for (const part of seed) {
    const slot = getFinalAssemblySlot(part)
    if (!placements[slot]) placements[slot] = { ...semanticPart(part), stage: 'assembled', scaleX: 1, scaleY: 1 }
  }
  return { placements, active: null, overflowedIds: [], assembled: hasAllSlots(placements) }
}

export function decideFinalAssembly(state: FinalAssemblyState, part: FactoryPartSpec): FinalAssemblyDecision {
  if (part.stage !== 'inspected' && part.stage !== 'assembled') return { kind: 'overflow', reason: 'unfinished' }
  if (state.assembled) return { kind: 'overflow', reason: 'complete' }
  if (state.active) return { kind: 'overflow', reason: 'busy' }
  const slot = getFinalAssemblySlot(part)
  if (state.placements[slot]) return { kind: 'overflow', reason: 'duplicate' }
  return { kind: 'capture', slot }
}

export function beginFinalAssembly(state: FinalAssemblyState, part: FactoryPartSpec, options: {
  visible?: boolean
  capturePose?: FinalAssemblerCapturePose
} = {}) {
  const decision: FinalAssemblyDecision = options.visible === false
    ? { kind: 'overflow', reason: 'hidden' } : decideFinalAssembly(state, part)
  if (decision.kind === 'overflow') return { state, decision }
  return { state: { ...state, active: { part: semanticPart(part), slot: decision.slot, capturePose: options.capturePose } }, decision }
}

export function completeFinalAssembly(state: FinalAssemblyState, partId: string): FinalAssemblyState {
  if (!state.active || state.active.part.id !== partId) return state
  const placements = {
    ...state.placements,
    [state.active.slot]: { ...state.active.part, stage: 'assembled' as const, scaleX: 1, scaleY: 1 },
  }
  return { ...state, placements, active: null, assembled: hasAllSlots(placements) }
}

export function claimFinalOverflow(state: FinalAssemblyState, partId: string) {
  if (state.overflowedIds.includes(partId)) return { state, apply: false }
  return { state: { ...state, overflowedIds: [...state.overflowedIds, partId] }, apply: true }
}

export function getFinalOverflowImpulse(partX: number, centerX: number = NOVA_FRAME.centerX, mass = 1) {
  const boundedMass = Math.max(0.25, Math.min(mass, 8))
  return { x: (partX < centerX ? -0.025 : 0.025) * boundedMass, y: -0.045 * boundedMass }
}

export function projectFinalAssemblerPose(input: {
  bodyX: number
  bodyY: number
  angleRadians: number
  stationOffsetX: number
  stationOffsetY: number
  scaleX: number
  scaleY: number
  partScaleX?: number
  partScaleY?: number
  partShape?: FactoryPartSpec['shape']
}): FinalAssemblerCapturePose {
  const uniformScale = input.partShape === 'avatar' || input.partShape === 'circle'
    ? Math.min(input.partScaleX ?? 1, input.partScaleY ?? 1) : undefined
  return {
    x: (input.bodyX - input.stationOffsetX) / input.scaleX,
    y: (input.bodyY - input.stationOffsetY) / input.scaleY,
    angleDegrees: input.angleRadians * 180 / Math.PI,
    scaleX: (uniformScale ?? input.partScaleX ?? 1) / input.scaleX,
    scaleY: (uniformScale ?? input.partScaleY ?? 1) / input.scaleY,
  }
}

export type FinalAssemblerColliderSpec =
  | { kind: 'rectangle'; label: string; x: number; y: number; width: number; height: number; isSensor: boolean }
  | { kind: 'segment'; label: string; x1: number; y1: number; x2: number; y2: number; isSensor: boolean }

const FINAL_ASSEMBLER_COLLIDERS: readonly FinalAssemblerColliderSpec[] = [
  { kind: 'rectangle', label: 'contact-capture-zone', x: 320, y: -52, width: 592, height: 120, isSensor: true },
  { kind: 'segment', label: 'contact-overflow-roof-left', x1: 24, y1: 76, x2: 320, y2: -24, isSensor: false },
  { kind: 'segment', label: 'contact-overflow-roof-right', x1: 320, y1: -24, x2: 616, y2: 76, isSensor: false },
]

export const getFinalAssemblerColliderSpecs = () => FINAL_ASSEMBLER_COLLIDERS


export function createReducedFinalAssemblyParts(): FactoryPartSpec[] {
  return FINAL_ASSEMBLY_SLOTS.map((slot, sequence) => {
    const blueprint = getLandingPartBlueprint(sequence)
    return {
      id: `reduced-contact-${slot}`,
      sequence,
      role: blueprint.role,
      shape: blueprint.shape,
      assemblySlot: blueprint.assemblySlot,
      finish: { ...blueprint.finish },
      stage: 'assembled',
    }
  })
}
