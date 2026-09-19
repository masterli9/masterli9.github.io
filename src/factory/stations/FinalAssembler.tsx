import { useCallback, useEffect, useRef, useState } from 'react'
import { Body, Bodies, Composite, Constraint, Events, type Body as MatterBody } from 'matter-js'
import { useFactoryAct, useFactoryStation, type FactoryStationMetrics } from '../FactoryAct'
import { useFactoryFlow } from '../FactoryFlowProvider'
import {
  advanceAssembly,
  getBrowserSlot,
  getPostAssemblyCollisionMode,
  type BrowserSlot,
} from './finalAssemblerModel'

const VIEWBOX_WIDTH = 320
const VIEWBOX_HEIGHT = 520
const SLOT_POINTS: Record<BrowserSlot, { x: number; y: number }> = {
  'hero-copy': { x: 92, y: 278 },
  'hero-visual': { x: 128, y: 278 },
  'content-left': { x: 164, y: 278 },
  'content-right': { x: 200, y: 278 },
  'contact-action': { x: 236, y: 278 },
}

function createFrameSegment(
  metrics: FactoryStationMetrics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  options: { isSensor?: boolean } = {},
) {
  const scaleX = Math.max(metrics.elementRect.width, 1) / VIEWBOX_WIDTH
  const scaleY = Math.max(metrics.elementRect.height, 1) / VIEWBOX_HEIGHT
  const offsetX = metrics.elementRect.left - metrics.actRect.left
  const offsetY = metrics.elementRect.top - metrics.actRect.top
  const start = { x: offsetX + (x1 * scaleX), y: offsetY + (y1 * scaleY) }
  const end = { x: offsetX + (x2 * scaleX), y: offsetY + (y2 * scaleY) }
  const body = Bodies.rectangle(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2,
    Math.hypot(end.x - start.x, end.y - start.y),
    3.5 * Math.min(scaleX, scaleY),
    { isStatic: true, isSensor: options.isSensor ?? false, friction: 0.12, restitution: 0.22, label },
  )
  Body.setAngle(body, Math.atan2(end.y - start.y, end.x - start.x))
  return body
}

function createFrameRectangle(
  metrics: FactoryStationMetrics,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  isSensor = false,
) {
  const scaleX = Math.max(metrics.elementRect.width, 1) / VIEWBOX_WIDTH
  const scaleY = Math.max(metrics.elementRect.height, 1) / VIEWBOX_HEIGHT
  return Bodies.rectangle(
    metrics.elementRect.left - metrics.actRect.left + (x * scaleX),
    metrics.elementRect.top - metrics.actRect.top + (y * scaleY),
    width * scaleX,
    height * scaleY,
    { isStatic: true, isSensor, friction: 0.12, restitution: 0.18, label },
  )
}

function getPartId(body: MatterBody) {
  return body.label.replace(/^factory-part-/, '')
}

export default function FinalAssembler() {
  const [placedSlots, setPlacedSlots] = useState<Record<string, BrowserSlot>>({})
  const stationRef = useRef<HTMLDivElement>(null)
  const capturedRef = useRef(new Set<string>())
  const constraintsRef = useRef(new Map<string, Matter.Constraint>())
  const assemblyRef = useRef({ placedIds: [] as string[], assembled: false })
  const { engine, removePart, updatePartSpec } = useFactoryAct()
  const { markFinalWebsiteAssembled, reducedMotion } = useFactoryFlow()
  const [assemblyState, setAssemblyState] = useState(() => ({ placedIds: [] as string[], assembled: reducedMotion }))
  const captureEnabled = getPostAssemblyCollisionMode(assemblyState.assembled) === 'capture'

  useEffect(() => {
    if (reducedMotion) markFinalWebsiteAssembled()
  }, [markFinalWebsiteAssembled, reducedMotion])

  const buildColliders = useCallback((metrics: FactoryStationMetrics): MatterBody[] => {
    const frame = [
      createFrameSegment(metrics, 40, 180, 280, 180, 'contact-frame-top', { isSensor: true }),
      createFrameSegment(metrics, 40, 180, 40, 400, 'contact-frame-left'),
      createFrameSegment(metrics, 280, 180, 280, 400, 'contact-frame-right'),
      createFrameSegment(metrics, 40, 400, 280, 400, 'contact-frame-bottom'),
    ]
    const selectors: MatterBody[] = [
      createFrameSegment(metrics, 96, 58, 224, 100, 'contact-selector'),
    ]
    if (captureEnabled) selectors.push(createFrameRectangle(metrics, 52, 116, 216, 76, 'contact-capture-zone', true))
    if (!captureEnabled) {
      selectors.push(
        createFrameSegment(metrics, 58, 160, 280, 236, 'contact-overflow-slope'),
        createFrameSegment(metrics, 280, 236, 280, 488, 'contact-overflow-rail'),
      )
    }
    return [...frame, ...selectors]
  }, [captureEnabled])

  useFactoryStation({ id: 'contact', elementRef: stationRef, buildColliders })

  useEffect(() => {
    const timers: number[] = []
    const constraints = constraintsRef.current
    const capturePart = (part: MatterBody) => {
      const partId = getPartId(part)
      if (!captureEnabled || capturedRef.current.has(partId)) return
      capturedRef.current.add(partId)
      const slot = getBrowserSlot(part.plugin.factoryPartSpec)
      const station = stationRef.current
      if (!station) return
      const act = station.closest<HTMLElement>('[data-factory-act]')
      if (!act) return
      const stationRect = station.getBoundingClientRect()
      const actRect = act.getBoundingClientRect()
      const scaleX = Math.max(stationRect.width, 1) / VIEWBOX_WIDTH
      const scaleY = Math.max(stationRect.height, 1) / VIEWBOX_HEIGHT
      const slotPoint = SLOT_POINTS[slot]
      const pointB = {
        x: stationRect.left - actRect.left + (slotPoint.x * scaleX),
        y: stationRect.top - actRect.top + (slotPoint.y * scaleY),
      }
      const constraint = Constraint.create({
        bodyA: part,
        pointB,
        length: 0,
        stiffness: 0.16,
        damping: 0.16,
      })
      constraintsRef.current.set(partId, constraint)
      Composite.add(engine.world, constraint)
      const timer = window.setTimeout(() => {
        Composite.remove(engine.world, constraint, true)
        constraintsRef.current.delete(partId)
        const nextState = advanceAssembly(assemblyRef.current, partId)
        assemblyRef.current = nextState
        setPlacedSlots((current) => ({ ...current, [partId]: slot }))
        setAssemblyState(nextState)
        updatePartSpec(partId, { stage: 'assembled' })
        if (nextState.assembled) markFinalWebsiteAssembled()
        removePart(partId)
        capturedRef.current.delete(partId)
      }, 420)
      timers.push(timer)
    }

    const handleCollision = ({ pairs }: { pairs: Array<{ bodyA: MatterBody; bodyB: MatterBody }> }) => {
      for (const pair of pairs) {
        const part = pair.bodyA.label.startsWith('factory-part-')
          ? pair.bodyA
          : pair.bodyB.label.startsWith('factory-part-')
            ? pair.bodyB
            : null
        const surface = pair.bodyA.label.startsWith('contact-')
          ? pair.bodyA
          : pair.bodyB.label.startsWith('contact-')
            ? pair.bodyB
            : null
        if (!part || !surface) continue
        if (surface.label === 'contact-capture-zone') capturePart(part)
        if (!captureEnabled && (surface.label === 'contact-frame-top' || surface.label === 'contact-overflow-slope')) {
          Body.applyForce(part, part.position, { x: 0.0016, y: 0.0002 })
        }
      }
    }
    Events.on(engine, 'collisionStart', handleCollision)
    return () => {
      Events.off(engine, 'collisionStart', handleCollision)
      timers.forEach((timer) => window.clearTimeout(timer))
      for (const constraint of constraints.values()) Composite.remove(engine.world, constraint, true)
      constraints.clear()
    }
  }, [captureEnabled, engine, markFinalWebsiteAssembled, removePart, updatePartSpec])

  return (
    <div ref={stationRef} className="factory-station final-assembler" data-factory-station="contact">
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} aria-hidden="true" focusable="false">
        <path d="M96 58 224 100" className="factory-line__rail factory-line__rail--pink" />
        {captureEnabled && <rect x="52" y="116" width="216" height="76" className="factory-line__capture-zone" />}
        <rect x="40" y="180" width="240" height="220" className="factory-line__browser-frame" />
        <path d="M58 236H262" className="factory-line__rail factory-line__rail--blue" />
        {assemblyState.placedIds.map((id) => {
          const slot = placedSlots[id]
          const point = SLOT_POINTS[slot]
          return <circle key={id} cx={point.x} cy={point.y} r="10" className="factory-line__assembled-part" />
        })}
        {!captureEnabled && <path d="M58 160 280 236V488" className="factory-line__rail factory-line__rail--white" />}
      </svg>
    </div>
  )
}
