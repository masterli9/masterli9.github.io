import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Bodies, Events, type Body as MatterBody } from 'matter-js'
import { useFactoryAct, useFactoryStation, type FactoryStationMetrics } from '../FactoryAct'
import {
  advanceFormingPress,
  FORMING_PRESS_MOTION,
  FORMING_PRESS_TIMING,
  getFormingPressGeometry,
  getFormingPressMotion,
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
  const { engine, updatePartSpec } = useFactoryAct()
  const activeState = activePartId ? states.get(activePartId) : undefined
  const pressGeometry = getFormingPressGeometry()
  const pressMotion = getFormingPressMotion(activeState?.phase ?? 'falling')
  const jawsEngaged = pressMotion.leftJawOffset > 0
  const gateOpen = pressMotion.gateOpen
  const pressStyle = {
    '--forming-press-close-duration': `${FORMING_PRESS_MOTION.closeDurationMs}ms`,
    '--forming-press-open-duration': `${FORMING_PRESS_MOTION.openDurationMs}ms`,
  } as CSSProperties

  const buildColliders = useCallback((metrics: FactoryStationMetrics): MatterBody[] => {
    const railCenterY = 260
    const railHeight = 472
    const colliders: MatterBody[] = [
      createPressRectangle(metrics, pressGeometry.leftRailX, railCenterY, 4, railHeight, 'skills-press-guide-left'),
      createPressRectangle(metrics, pressGeometry.rightRailX, railCenterY, 4, railHeight, 'skills-press-guide-right'),
      createPressRectangle(metrics, pressGeometry.centerX, 270, 70, 72, 'skills-press-sensor', { isSensor: true }),
    ]
    if (!gateOpen) {
      const gateWidth = pressGeometry.gate.x2 - pressGeometry.gate.x1
      colliders.push(createPressRectangle(
        metrics,
        pressGeometry.centerX,
        pressGeometry.gate.y,
        gateWidth,
        5,
        'skills-press-exit-gate',
      ))
    }
    return colliders
  }, [gateOpen, pressGeometry])

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
        statesRef.current.set(partId, { phase: 'falling', sequence: part.plugin.factoryPartSpec.sequence, shape: part.plugin.factoryPartSpec.shape })
        transition(partId, 'sensor-enter')
        scheduledRef.current.add(part.label)
        const closeTimer = window.setTimeout(() => transition(partId, 'jaws-closed'), FORMING_PRESS_TIMING.closeAt)
        const openTimer = window.setTimeout(() => transition(partId, 'jaws-open'), FORMING_PRESS_TIMING.revealAt)
        const releaseTimer = window.setTimeout(() => transition(partId, 'gate-open'), FORMING_PRESS_TIMING.releaseAt)
        const resetTimer = window.setTimeout(() => {
          activePressIdRef.current = null
          setActivePartId(null)
          scheduledRef.current.delete(part.label)
          statesRef.current.delete(partId)
          setStates(new Map(statesRef.current))
        }, FORMING_PRESS_TIMING.resetAt)
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
    <div ref={stationRef} className="factory-station forming-press" data-factory-station="skills" style={pressStyle}>
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} aria-hidden="true" focusable="false">
        <path
          d={`M${pressGeometry.leftRailX} 24V496M${pressGeometry.rightRailX} 24V496`}
          className="factory-line__rail factory-line__rail--white"
        />
        <path d={`M56 177H${pressGeometry.leftRailX}`} className="factory-line__rail factory-line__rail--white" />
        <path d={`M${pressGeometry.leftRailX - 3} 177H${pressGeometry.leftRailX}`} className="factory-line__rail factory-line__rail--pink" />
        <path
          d={`M${pressGeometry.gate.x1} ${pressGeometry.gate.y}H${pressGeometry.gate.x2}`}
          className={`factory-line__rail factory-line__rail--pink forming-press__gate${gateOpen ? ' is-open' : ''}`}
        />
        <g className={`forming-press__jaw forming-press__jaw--left${jawsEngaged ? ' is-engaged' : ''}`}>
          <rect {...pressGeometry.leftJaw} className="factory-line__jaw" />
        </g>
        <g className={`forming-press__jaw forming-press__jaw--right${jawsEngaged ? ' is-engaged' : ''}`}>
          <rect {...pressGeometry.rightJaw} className="factory-line__jaw" />
        </g>
      </svg>
    </div>
  )
}
