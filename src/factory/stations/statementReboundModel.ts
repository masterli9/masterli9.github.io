export interface StatementReboundBounds {
  left: number
  top: number
  width: number
  height: number
}

export function createStatementReveal(
  words: string[],
  minimumSlots: number,
  startAt = 0,
  stagger = 0.075,
) {
  return Array.from({ length: Math.max(words.length, minimumSlots) }, (_, index) => ({
    key: `statement-${index}`,
    word: words[index] ?? '',
    revealAt: startAt + (index * stagger),
  }))
}

export function getReboundImpulse(input: { incomingX: number; incomingY: number }) {
  void input
  return { x: 2.4, y: -2.2 }
}

export function getReboundPlatformGeometry(bounds: StatementReboundBounds) {
  const width = Math.max(180, Math.min(bounds.width * 0.92, 360))
  const left = bounds.left + ((bounds.width - width) / 2)
  const y = bounds.top + Math.min(bounds.height * 0.62, 300)
  const catcherWidth = 3.5
  return {
    platform: {
      x1: left,
      y1: y + 26,
      x2: left + width,
      y2: y,
      thickness: 3.5,
    },
    catcher: {
      x: left + width - catcherWidth,
      y: y,
      width: catcherWidth,
      height: Math.max(120, bounds.height - (y - bounds.top) - 24),
    },
  }
}
