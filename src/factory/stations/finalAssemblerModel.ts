export type BrowserSlot = 'hero-copy' | 'hero-visual' | 'content-left' | 'content-right' | 'contact-action'

const BROWSER_SLOTS: BrowserSlot[] = [
  'hero-copy',
  'hero-visual',
  'content-left',
  'content-right',
  'contact-action',
]
const SLOT_COUNT = 5

export function getBrowserSlot(sequence: number): BrowserSlot {
  return BROWSER_SLOTS[sequence % BROWSER_SLOTS.length] ?? 'hero-copy'
}

export function advanceAssembly(state: { placedIds: string[]; assembled: boolean }, partId: string) {
  if (state.assembled || state.placedIds.includes(partId)) return state
  const placedIds = [...state.placedIds, partId]
  return { placedIds, assembled: placedIds.length === SLOT_COUNT }
}

export const getPostAssemblyCollisionMode = (assembled: boolean) => assembled ? 'frame-only' as const : 'capture' as const
