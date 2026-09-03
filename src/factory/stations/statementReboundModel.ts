export interface StatementReboundBounds {
  left: number
  top: number
  width: number
  height: number
}

export const STATEMENT_STALL_SPEED_THRESHOLD = 5
export const STATEMENT_STALL_TIMEOUT_MS = 400

export function shouldDismissStalledStatementPart(input: {
  speed: number
  stalledForMs: number
}) {
  return input.speed <= STATEMENT_STALL_SPEED_THRESHOLD
    && input.stalledForMs >= STATEMENT_STALL_TIMEOUT_MS
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

export function getReboundPlatformGeometry(bounds: StatementReboundBounds) {
  const width = Math.min(bounds.width, Math.max(180, Math.min(bounds.width * 0.92, 360)))
  const left = bounds.left
  const y = bounds.top + Math.min(bounds.height * 0.42, 200)
  const catcherWidth = 3.5
  const outputX = Math.min(left + width, bounds.left + (bounds.width * 0.8461538461538461))
  const platformEndClearance = 70
  const catcherY = bounds.top + 80
  return {
    platform: {
      x1: left,
      y1: y,
      x2: outputX - platformEndClearance,
      y2: y + 72,
      thickness: 18,
      friction: 0.001,
      frictionStatic: 0,
      restitution: 0.35,
    },
    catcher: {
      x: outputX - (catcherWidth / 2),
      y: catcherY,
      width: catcherWidth,
      height: Math.max(120, bounds.height - (catcherY - bounds.top) - 24),
    },
  }
}

export function getCatcherVisualLine(catcher: {
  x: number
  y: number
  width: number
  height: number
}) {
  return {
    x: catcher.x + (catcher.width / 2),
    y1: catcher.y,
    y2: catcher.y + catcher.height,
  }
}

export function shouldUseReboundCatcher(layoutWidth: number) {
  return layoutWidth >= 1024
}

export function getStatementSpoonGeometry(
  entryAnchor: { x: number; y: number },
) {
  const radius = 280
  const colliderThickness = 18
  const visualRadius = radius + colliderThickness
  const entryAngle = (-69 * Math.PI) / 180
  const startAngle = (-67 * Math.PI) / 180
  const endAngle = (125 * Math.PI) / 180
  const center = {
    x: entryAnchor.x - (radius * Math.cos(entryAngle)),
    y: entryAnchor.y - (radius * Math.sin(entryAngle)),
  }
  const pointAt = (angle: number) => ({
    x: center.x + (radius * Math.cos(angle)),
    y: center.y + (radius * Math.sin(angle)),
  })
  const visualPointAt = (angle: number) => ({
    x: center.x + (visualRadius * Math.cos(angle)),
    y: center.y + (visualRadius * Math.sin(angle)),
  })
  const points = Array.from({ length: 241 }, (_, index) => {
    const angle = startAngle + ((endAngle - startAngle) * (index / 240))
    return {
      x: pointAt(angle).x,
      y: pointAt(angle).y,
    }
  })
  const start = pointAt(startAngle)
  const end = pointAt(endAngle)
  const visualStart = visualPointAt(startAngle)
  const visualEnd = visualPointAt(endAngle)

  return {
    entryAnchor,
    start,
    center,
    radius,
    visualRadius,
    visualStart,
    visualEnd,
    lowest: { x: center.x, y: center.y + radius },
    end,
    points,
    collisionSurfacePath: `M${start.x} ${start.y}A${radius} ${radius} 0 1 1 ${end.x} ${end.y}`,
    exitTangent: {
      x: -Math.sin(endAngle),
      y: Math.cos(endAngle),
    },
    path: `M${visualStart.x} ${visualStart.y}A${visualRadius} ${visualRadius} 0 1 1 ${visualEnd.x} ${visualEnd.y}`,
    friction: 0,
    frictionStatic: 0,
    frictionAir: 0,
    restitution: 0,
    colliderThickness,
  }
}
