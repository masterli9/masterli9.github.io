export interface ElementRect {
  left: number
  top: number
  width: number
  height: number
}

export interface ActRect {
  left: number
  top: number
}

export function toActPoint(
  rect: ElementRect,
  actRect: ActRect,
  xRatio: number,
  yRatio: number,
) {
  return {
    x: rect.left - actRect.left + (rect.width * xRatio),
    y: rect.top - actRect.top + (rect.height * yRatio),
  }
}

export function isStationWithinWindow(
  station: { top: number; bottom: number },
  window: { top: number; bottom: number },
) {
  return station.bottom >= window.top && station.top <= window.bottom
}
