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

export function getReboundLaunchVelocity(input: { incomingX: number; incomingY: number }) {
  const direction = getReboundImpulse(input)
  const length = Math.hypot(direction.x, direction.y)
  const launchSpeed = 16
  return {
    x: (direction.x / length) * launchSpeed,
    y: (direction.y / length) * launchSpeed,
  }
}

export function getReboundPlatformGeometry(bounds: StatementReboundBounds) {
  const width = Math.min(bounds.width, Math.max(180, Math.min(bounds.width * 0.92, 360)))
  const left = bounds.left
  const y = bounds.top + Math.min(bounds.height * 0.62, 300)
  const catcherWidth = 3.5
  const outputX = Math.min(left + width, bounds.left + (bounds.width * 0.8461538461538461))
  const platformEndClearance = 120
  const catcherY = bounds.top + 80
  return {
    platform: {
      x1: left,
      y1: y,
      x2: outputX - platformEndClearance,
      y2: y + 26,
      thickness: 3.5,
    },
    catcher: {
      x: outputX - (catcherWidth / 2),
      y: catcherY,
      width: catcherWidth,
      height: Math.max(120, bounds.height - (catcherY - bounds.top) - 24),
    },
  }
}
