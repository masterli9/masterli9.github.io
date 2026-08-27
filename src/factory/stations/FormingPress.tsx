import { useCallback, useEffect, useRef, useState } from 'react'
import { Bodies, Events, type Body as MatterBody } from 'matter-js'
import { useFactoryAct, useFactoryStation, type FactoryStationMetrics } from '../FactoryAct'
import {
  advanceFormingPress,
  type FormingPressState,
} from './formingPressModel'

const VIEWBOX_WIDTH = 240
const VIEWBOX_HEIGHT = 520

function mapPoint(metrics: FactoryStationMetrics, x: number, y: number) {
  const scaleX = Math.max(metrics.elementRect.width, 1) / VIEWBOX_WIDTH
  const scaleY = Math.max(metrics.elementRect.height, 1) / VIEWBOX_HEIGHT
  return {
    x: metrics.elementRect.left - metrics.actRect.left + (x * scaleX),
    y: metrics.elementRect.top - metrics.actRect.top + (y * scaleY),
    scaleX,
    scaleY,
  }
}

function createPressRectangle(
  metrics: FactoryStationMetrics,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  options: { isSensor?: boolean } = {},
) {
  const point = mapPoint(metrics, x, y)
  return Bodies.rectangle(point.x, point.y, width * point.scaleX, height * point.scaleY, {
    isStatic: true,
    isSensor: options.isSensor ?? false,
    friction: 0.12,
    restitution: 0.1,
    label,
  })
}

function getPartId(body: MatterBody) {
  return body.label.replace(/^factory-part-/, '')
}

export default function FormingPress() {
  const stationRef = useRef<HTMLDivElement>(null)
  const statesRef = useRef(new Map<string, FormingPressState>())
  const activePressIdRef = useRef<string | null>(null)
  const scheduledRef = useRef(new Set<string>())
  const timersRef = useRef<number[]>([])
  const [states, setStates] = useState(new Map<string, FormingPressState>())
  const [activePartId, setActivePartId] = useState<string | null>(null)
  const [stopOpen, setStopOpen] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const { engine, updatePartSpec } = useFactoryAct()
  const activeState = activePartId ? states.get(activePartId) : undefined
  const jawsClosed = activeState?.phase === 'clamped'

  const buildColliders = useCallback((metrics: FactoryStationMetrics): MatterBody[] => {
    const colliders: MatterBody[] = [
      createPressRectangle(metrics, 72, 108, 4, 168, 'skills-press-guide-left'),
      createPressRectangle(metrics, 168, 108, 4, 168, 'skills-press-guide-right'),
      createPressRectangle(metrics, 120, 184, 82, 34, 'skills-press-sensor', { isSensor: true }),
      createPressRectangle(metrics, 38, 236, 72, 4, 'skills-press-upstream-shelf'),
    ]
    if (!stopOpen) colliders.push(createPressRectangle(metrics, 120, 246, 108, 5, 'skills-press-stop'))
    if (jawsClosed) {
      colliders.push(
        createPressRectangle(metrics, 120, 278, 110, 12, 'skills-press-upper-jaw'),
        createPressRectangle(metrics, 120, 326, 110, 12, 'skills-press-lower-jaw'),
      )
    }
    if (!gateOpen) colliders.push(createPressRectangle(metrics, 120, 390, 110, 5, 'skills-press-exit-gate'))
    return colliders
  }, [gateOpen, jawsClosed, stopOpen])

  useFactoryStation({ id: 'skills', elementRef: stationRef, buildColliders })

  useEffect(() => {
    const transition = (partId: string, event: Parameters<typeof advanceFormingPress>[1]) => {
      const current = statesRef.current.get(partId)
      if (!current) return
      const next = advanceFormingPress(current, event)
      if (next === current) return
      statesRef.current.set(partId, next)
      setStates(new Map(statesRef.current))
      if (event === 'jaws-closed') updatePartSpec(partId, { shape: next.shape, stage: 'formed' })
      if (event === 'gate-open') {
        setStopOpen(true)
        setGateOpen(true)
      }
    }

    const handleCollision = ({ pairs }: { pairs: Array<{ bodyA: MatterBody; bodyB: MatterBody }> }) => {
      for (const pair of pairs) {
        const part = pair.bodyA.label.startsWith('factory-part-')
          ? pair.bodyA
          : pair.bodyB.label.startsWith('factory-part-')
            ? pair.bodyB
            : null
        const sensor = pair.bodyA.label === 'skills-press-sensor' || pair.bodyB.label === 'skills-press-sensor'
        if (!part || !sensor || scheduledRef.current.has(part.label)) continue
        const partId = getPartId(part)
        if (activePressIdRef.current && activePressIdRef.current !== partId) continue
        activePressIdRef.current = partId
        setActivePartId(partId)
        statesRef.current.set(partId, { phase: 'falling', sequence: Number(partId.replace('part-', '')), shape: 'square' })
        transition(partId, 'sensor-enter')
        scheduledRef.current.add(part.label)
        const closeTimer = window.setTimeout(() => transition(partId, 'jaws-closed'), 120)
        const openTimer = window.setTimeout(() => transition(partId, 'jaws-open'), 360)
        const releaseTimer = window.setTimeout(() => transition(partId, 'gate-open'), 500)
        const resetTimer = window.setTimeout(() => {
          activePressIdRef.current = null
          setActivePartId(null)
          scheduledRef.current.delete(part.label)
          statesRef.current.delete(partId)
          setStates(new Map(statesRef.current))
          setStopOpen(false)
          setGateOpen(false)
        }, 1200)
        timersRef.current.push(closeTimer, openTimer, releaseTimer, resetTimer)
      }
    }

    Events.on(engine, 'collisionStart', handleCollision)
    return () => {
      Events.off(engine, 'collisionStart', handleCollision)
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
    }
  }, [engine, updatePartSpec])

  return (
    <div ref={stationRef} className="factory-station forming-press" data-factory-station="skills">
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} aria-hidden="true" focusable="false">
        <path d="M72 24V276M168 24V276" className="factory-line__rail factory-line__rail--white" />
        <rect x="79" y="167" width="82" height="34" className="factory-line__sensor" />
        <path d="M38 236H110" className="factory-line__rail factory-line__rail--white" />
        {!stopOpen && <path d="M66 246H174" className="factory-line__rail factory-line__rail--pink" />}
        <g aria-hidden="true">
          <rect x="65" y="272" width="110" height="12" className="factory-line__jaw" />
          <rect x="65" y="320" width="110" height="12" className="factory-line__jaw" />
        </g>
        {!gateOpen && <path d="M66 390H174" className="factory-line__rail factory-line__rail--pink" />}
        <path d="M72 430H168" className="factory-line__rail factory-line__rail--white" />
      </svg>
    </div>
  )
}
