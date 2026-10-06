import type { FactoryPartSpec } from '../factoryTypes'
import { LANDING_PART_BLUEPRINTS } from '../landingPartBlueprints.ts'
import { getFactoryPartDimensions } from '../factoryPartPhysics.ts'

export type PaintInspectionPhase = 'falling' | 'captured' | 'coating' | 'printing' | 'inspecting' | 'released'
export type PaintInspectionEvent = 'capture' | 'coat-start' | 'coat-complete' | 'print-complete' | 'inspection-complete'
export interface PaintInspectionState { phase: PaintInspectionPhase; part: FactoryPartSpec }

export const PAINT_INSPECTION_TIMING = { settle: 120, coat: 340, print: 300, inspection: 180 } as const
export const hasPrintableDetail = (part: FactoryPartSpec) => Boolean(part.finish.text || part.finish.detailColor)
export const canCapturePaintPart = (activePartId: string | null) => activePartId === null
export const createPaintInspectionState = (part: FactoryPartSpec): PaintInspectionState => ({ phase: 'falling', part })

const PAINT_INSPECTION_GEOMETRY = {
  paintY: 218,
  inspectionY: 326,
  intakeY: 130,
  clearPath: { x1: 102, x2: 158 },
  coatHead: { x: 54, y: 144, width: 36, height: 28, nozzleX: 96, nozzleY: 158 },
  printHead: { x: 170, y: 144, width: 36, height: 28, nozzleX: 164, nozzleY: 158 },
  coatTarget: { x: 121, y: 218 },
  printTarget: { x: 139, y: 218 },
} as const

export function getPaintInspectionGeometry() {
  return PAINT_INSPECTION_GEOMETRY
}

const widestFinishedPart = Math.max(...LANDING_PART_BLUEPRINTS.map(({ shape }) => {
  const dimensions = getFactoryPartDimensions(shape, 1.25, 1.5)
  return 'width' in dimensions ? dimensions.width : dimensions.radius * 2
}))

export function getPaintInspectionExitGeometry(stationWidth: number) {
  // Bodies keep their actual pixel dimensions when the SVG station shrinks.
  const gap = Math.max(96, (widestFinishedPart + 8) * 260 / Math.max(stationWidth, 1) + 4)
  return { x1: 130 - gap / 2, x2: 130 + gap / 2 }
}

export function shouldShowPaintMist(color: string) {
  const hex = color.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1]
  if (!hex) return false
  const normalized = hex.length === 3 ? [...hex].map((value) => value + value).join('') : hex
  const channels = [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16))
  return channels.reduce((total, value) => total + value, 0) / channels.length < 32
}

export function advancePaintInspection(state: PaintInspectionState, event: PaintInspectionEvent): PaintInspectionState {
  if (state.phase === 'falling' && event === 'capture') return { ...state, phase: 'captured' }
  if (state.phase === 'captured' && event === 'coat-start') return { ...state, phase: 'coating' }
  if ((state.phase === 'coating' || state.phase === 'captured') && event === 'coat-complete') {
    const print = hasPrintableDetail(state.part)
    return { phase: print ? 'printing' : 'inspecting', part: { ...state.part, coated: true, stage: print ? 'formed' : 'printed' } }
  }
  if (state.phase === 'printing' && event === 'print-complete') return { phase: 'inspecting', part: { ...state.part, stage: 'printed' } }
  if (state.phase === 'inspecting' && event === 'inspection-complete') return { phase: 'released', part: { ...state.part, stage: 'inspected' } }
  return state
}
