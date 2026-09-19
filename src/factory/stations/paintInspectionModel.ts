import type { FactoryPartSpec } from '../factoryTypes'

export type PaintInspectionPhase = 'falling' | 'captured' | 'coating' | 'printing' | 'inspecting' | 'released'
export type PaintInspectionEvent = 'capture' | 'coat-start' | 'coat-complete' | 'print-complete' | 'inspection-complete'
export interface PaintInspectionState { phase: PaintInspectionPhase; part: FactoryPartSpec }

export const PAINT_INSPECTION_TIMING = { settle: 120, coat: 340, print: 300, inspection: 180 } as const
export const hasPrintableDetail = (part: FactoryPartSpec) => Boolean(part.finish.text || part.finish.detailColor)
export const canCapturePaintPart = (activePartId: string | null) => activePartId === null
export const createPaintInspectionState = (part: FactoryPartSpec): PaintInspectionState => ({ phase: 'falling', part })

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
