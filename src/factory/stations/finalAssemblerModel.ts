import type { FactoryAssemblySlot, FactoryPartSpec } from '../factoryTypes'

export type BrowserSlot = 'hero-copy' | 'hero-visual' | 'content-left' | 'content-right' | 'contact-action'

// Temporary compatibility until the separately scoped contact redesign.
const LEGACY_SLOT_MAP: Record<FactoryAssemblySlot, BrowserSlot> = {
  brand: 'hero-copy', heading: 'hero-copy', copy: 'content-left',
  cta: 'contact-action', visual: 'hero-visual',
}
const SLOT_COUNT = 5

export function getBrowserSlot(part: Pick<FactoryPartSpec, 'assemblySlot'>): BrowserSlot {
  return LEGACY_SLOT_MAP[part.assemblySlot]
}

export function advanceAssembly(state: { placedIds: string[]; assembled: boolean }, partId: string) {
  if (state.assembled || state.placedIds.includes(partId)) return state
  const placedIds = [...state.placedIds, partId]
  return { placedIds, assembled: placedIds.length === SLOT_COUNT }
}

export const getPostAssemblyCollisionMode = (assembled: boolean) => assembled ? 'frame-only' as const : 'capture' as const
