import { useCallback, useEffect, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Body, Bodies, type Body as MatterBody } from 'matter-js'
import {
  createFactoryPartSpec,
  getFactoryActiveLimit,
  getFactorySpawnDecision,
} from '../factory/factoryFlowModel'
import {
  useFactoryAct,
  useFactoryStation,
  type FactoryStationMetrics,
} from '../factory/FactoryAct'
import { useFactoryFlow } from '../factory/FactoryFlowProvider'
import type { FactoryPartColor, FactoryPartSpec } from '../factory/factoryTypes'
import {
  getConveyorBeltBottomY,
  getConveyorMotion,
  getConveyorPartCenterY,
  getHeroGateState,
  getRoundedEndReleaseX,
  getRoundedEndTangentVelocity,
  shouldReleaseConveyorPart,
  type ConveyorPartShape,
} from './heroConveyorModel'
import type { HeroConveyorIntroStage } from './heroTimeline'
import './hero-conveyor.css'

interface PartPosition {
  x: number
  y: number
  angle: number
}

interface ConveyorPart {
  id: string
  sequence: number
  shape: ConveyorPartShape
  released: boolean
}

const MAX_PARTS = 30
const MINIMUM_PAYLOAD = 4
const BELT_LEFT_X = 112
const BELT_TOP_Y = 83
const BELT_HEIGHT = 48
const PART_CLEARANCE = 2
const BELT_BOTTOM_Y = getConveyorBeltBottomY(BELT_TOP_Y, BELT_HEIGHT)
const BELT_RELEASE_X = getRoundedEndReleaseX(BELT_LEFT_X, BELT_HEIGHT)
const BELT_END_CENTER_Y = BELT_TOP_Y + (BELT_HEIGHT / 2)
const GRAVITY_PER_STEP = 0.00145 * (1000 / 60)
const SPAWN_INTERVAL = 1500
const VIEWBOX_WIDTH = 420
const VIEWBOX_HEIGHT = 350
const BELT_MOTION = getConveyorMotion({
  surfaceSpeed: 55,
  treadCycleLength: 28,
  rollerRadius: 17,
})
const PART_SHAPES = ['square', 'circle', 'bar', 'diamond'] as const
const PART_COLORS: FactoryPartColor[] = ['#F21868', '#355CFF', '#FFFFFF']

const STATIC_PARTS = [
  { id: 0, shape: 'square' as const, color: '#F21868', x: 31, y: 319, angle: -4 },
  { id: 1, shape: 'circle' as const, color: '#355CFF', x: 58, y: 320, angle: 0 },
  { id: 2, shape: 'bar' as const, color: '#FFFFFF', x: 88, y: 321, angle: 5 },
  { id: 3, shape: 'diamond' as const, color: '#F21868', x: 121, y: 319, angle: 45 },
  { id: 4, shape: 'circle' as const, color: '#FFFFFF', x: 145, y: 320, angle: 0 },
  { id: 5, shape: 'bar' as const, color: '#355CFF', x: 43, y: 294, angle: -7 },
  { id: 6, shape: 'square' as const, color: '#FFFFFF', x: 75, y: 293, angle: 6 },
  { id: 7, shape: 'circle' as const, color: '#F21868', x: 105, y: 294, angle: 0 },
  { id: 8, shape: 'diamond' as const, color: '#355CFF', x: 135, y: 292, angle: 45 },
]
const STARTER_POSITIONS: PartPosition[] = STATIC_PARTS
  .slice(0, MINIMUM_PAYLOAD)
  .map(({ x, y, angle }) => ({ x, y, angle }))

function createHeroPartSpec(sequence: number): FactoryPartSpec {
  const base = createFactoryPartSpec(sequence, 'raw')
  return {
    ...base,
    shape: PART_SHAPES[sequence % PART_SHAPES.length] ?? 'square',
    color: PART_COLORS[sequence % PART_COLORS.length] ?? '#FFFFFF',
  }
}

function createHeroColliders({ elementRect, actRect }: FactoryStationMetrics, lineStarted: boolean) {
  const scaleX = Math.max(elementRect.width, 1) / VIEWBOX_WIDTH
  const scaleY = Math.max(elementRect.height, 1) / VIEWBOX_HEIGHT
  const radiusScale = Math.min(scaleX, scaleY)
  const point = (x: number, y: number) => ({
    x: elementRect.left - actRect.left + (x * scaleX),
    y: elementRect.top - actRect.top + (y * scaleY),
  })
  const rectangle = (x: number, y: number, width: number, height: number, label: string) => {
    const center = point(x, y)
    return Bodies.rectangle(center.x, center.y, width * scaleX, height * scaleY, {
      isStatic: true,
      label,
      friction: 0.12,
      restitution: 0.08,
    })
  }
  const roundedEnd = point(BELT_RELEASE_X, BELT_END_CENTER_Y)
  const colliders: MatterBody[] = [
    Bodies.circle(roundedEnd.x, roundedEnd.y, 26 * radiusScale, {
      isStatic: true,
      friction: 0.12,
      restitution: 0,
      label: 'conveyor-rounded-end',
    }),
    rectangle(10, 267.5, 8, 143, 'box-left'),
    rectangle(160, 267.5, 8, 143, 'box-right'),
  ]

  if (!lineStarted) colliders.push(rectangle(85, 337, 158, 9, 'box-bottom'))
  return colliders
}

function getStationMapping(station: HTMLElement) {
  const act = station.closest<HTMLElement>('[data-factory-act]')
  if (!act) return null
  const elementRect = station.getBoundingClientRect()
  const actRect = act.getBoundingClientRect()
  const scaleX = Math.max(elementRect.width, 1) / VIEWBOX_WIDTH
  const scaleY = Math.max(elementRect.height, 1) / VIEWBOX_HEIGHT
  return {
    scaleX,
    scaleY,
    toActPoint: (x: number, y: number) => ({
      x: elementRect.left - actRect.left + (x * scaleX),
      y: elementRect.top - actRect.top + (y * scaleY),
    }),
    toLocalPoint: (x: number, y: number) => ({
      x: (x - (elementRect.left - actRect.left)) / scaleX,
      y: (y - (elementRect.top - actRect.top)) / scaleY,
    }),
  }
}

interface HeroConveyorProps {
  introStage: HeroConveyorIntroStage
}

const BOX_VISIBLE_STAGES: HeroConveyorIntroStage[] = [
  'box-flash-on',
  'box-visible',
  'machine-flash-on',
  'machine-flash-off',
  'machine-visible',
  'running',
]

const MACHINE_VISIBLE_STAGES: HeroConveyorIntroStage[] = [
  'machine-flash-on',
  'machine-visible',
  'running',
]

export default function HeroConveyor({ introStage }: HeroConveyorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const stationRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(false)
  const lineStartedRef = useRef(false)
  const reducedMotion = useReducedMotion() ?? false
  const isInView = useInView(svgRef, { amount: 0.15 })
  const { lineStarted } = useFactoryFlow()
  const { getPartBody, removePart, spawnPart } = useFactoryAct()
  const shouldAnimate = isInView && !reducedMotion && introStage === 'running'
  const isBoxVisible = BOX_VISIBLE_STAGES.includes(introStage)
  const isMachineVisible = MACHINE_VISIBLE_STAGES.includes(introStage)
  const heroGate = getHeroGateState(lineStarted)

  useEffect(() => {
    activeRef.current = !reducedMotion && introStage === 'running'
    lineStartedRef.current = lineStarted
  }, [introStage, lineStarted, reducedMotion])

  const buildColliders = useCallback(
    (metrics: FactoryStationMetrics) => createHeroColliders(metrics, heroGate.open),
    [heroGate.open],
  )
  useFactoryStation({ id: 'hero', elementRef: stationRef, buildColliders })

  useEffect(() => {
    if (!isBoxVisible) return
    const station = stationRef.current
    if (!station) return
    const liveParts = new Map<string, ConveyorPart>()
    let nextSequence = 0
    let frame = 0
    let previousTime = performance.now()
    let simulatedTime = 0
    let lastSpawnAt = -1100

    const addPart = (position?: PartPosition, released = false) => {
      const spec = createHeroPartSpec(nextSequence)
      const mapping = getStationMapping(station)
      if (!mapping) return
      const localX = position?.x ?? 455
      const localY = position?.y ?? getConveyorPartCenterY(BELT_TOP_Y, spec.shape as ConveyorPartShape, PART_CLEARANCE)
      const point = mapping.toActPoint(localX, localY)
      spawnPart(spec, {
        x: point.x,
        y: point.y,
        velocityX: released ? 0 : -BELT_MOTION.bodyVelocity * mapping.scaleX,
        velocityY: 0,
        angle: (position?.angle ?? (spec.shape === 'diamond' ? 45 : 0)) * (Math.PI / 180),
        angularVelocity: 0,
      })
      if (!getPartBody(spec.id)) return
      liveParts.set(spec.id, {
        id: spec.id,
        sequence: nextSequence,
        shape: spec.shape as ConveyorPartShape,
        released,
      })
      nextSequence += 1
    }

    const ensureMinimumPayload = () => {
      while (liveParts.size < MINIMUM_PAYLOAD) {
        addPart(STARTER_POSITIONS[liveParts.size], true)
        if (liveParts.size === 0) break
      }
    }

    ensureMinimumPayload()
    if (reducedMotion) return () => liveParts.forEach(({ id }) => removePart(id))

    const tick = (time: number) => {
      frame = window.requestAnimationFrame(tick)
      if (!activeRef.current || document.visibilityState !== 'visible') {
        previousTime = time
        return
      }

      const delta = Math.min(time - previousTime, 1000 / 60)
      previousTime = time
      simulatedTime += delta

      for (const [id] of liveParts) {
        if (!getPartBody(id)) liveParts.delete(id)
      }

      const decision = getFactorySpawnDecision({
        lineStarted: lineStartedRef.current,
        activeCount: liveParts.size,
        waitingCount: liveParts.size,
        waitingLimit: MAX_PARTS,
        activeLimit: getFactoryActiveLimit(window.innerWidth),
      })
      if (simulatedTime - lastSpawnAt >= SPAWN_INTERVAL && decision === 'spawn') {
        addPart()
        lastSpawnAt = simulatedTime
      }

      const mapping = getStationMapping(station)
      if (!mapping) return
      for (const part of liveParts.values()) {
        const body = getPartBody(part.id)
        if (!body) continue
        const localPosition = mapping.toLocalPoint(body.position.x, body.position.y)

        if (!part.released) {
          if (shouldReleaseConveyorPart(localPosition.x, BELT_RELEASE_X)) {
            part.released = true
            Body.setVelocity(body, { x: -BELT_MOTION.bodyVelocity * mapping.scaleX, y: body.velocity.y })
          } else {
            const beltPoint = mapping.toActPoint(
              localPosition.x,
              getConveyorPartCenterY(BELT_TOP_Y, part.shape, PART_CLEARANCE),
            )
            Body.setPosition(body, beltPoint)
            Body.setAngle(body, part.shape === 'diamond' ? Math.PI / 4 : 0)
            Body.setAngularVelocity(body, 0)
            Body.setVelocity(body, { x: -BELT_MOTION.bodyVelocity * mapping.scaleX, y: 0 })
          }
        }

        if (
          part.released
          && localPosition.x <= BELT_RELEASE_X + 2
          && localPosition.x > BELT_LEFT_X - 45
          && localPosition.y < BELT_END_CENTER_Y
        ) {
          const tangent = getRoundedEndTangentVelocity({
            bodyX: localPosition.x,
            bodyY: localPosition.y,
            centerX: BELT_RELEASE_X,
            centerY: BELT_END_CENTER_Y,
            releaseY: getConveyorPartCenterY(BELT_TOP_Y, part.shape, PART_CLEARANCE),
            minimumSpeed: BELT_MOTION.bodyVelocity,
            gravityPerStep: GRAVITY_PER_STEP,
          })
          Body.setVelocity(body, { x: tangent.x * mapping.scaleX, y: tangent.y * mapping.scaleY })
        }
      }
    }

    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      liveParts.forEach(({ id }) => removePart(id))
    }
  }, [getPartBody, isBoxVisible, reducedMotion, removePart, spawnPart])

  return (
    <div ref={stationRef} className="hero-conveyor-station">
      <svg
        ref={svgRef}
        viewBox="0 0 420 350"
        className={`hero-conveyor ${shouldAnimate ? '' : 'hero-conveyor--paused'}`.trim()}
        role="img"
        aria-label="A conveyor moving right to left drops simple shapes into a collection box"
        focusable="false"
      >
        <defs>
          <linearGradient id="hero-conveyor-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000000" stopOpacity="0" />
            <stop offset="1" stopColor="#000000" />
          </linearGradient>
        </defs>

        <g
          className="hero-conveyor__machine"
          visibility={isMachineVisible ? 'visible' : 'hidden'}
        >
          <path d={`M222 ${BELT_BOTTOM_Y}V210M368 ${BELT_BOTTOM_Y}V210M208 210H236M354 210H382`} />
          <rect className="hero-conveyor__belt" x="112" y="83" width="408" height="48" rx="24" />
          <motion.path
            className="hero-conveyor__tread"
            d="M136 107H492"
            animate={shouldAnimate ? { strokeDashoffset: 28 } : { strokeDashoffset: 0 }}
            transition={{
              duration: BELT_MOTION.treadCycleDuration,
              ease: 'linear',
              repeat: shouldAnimate ? Infinity : 0,
            }}
          />

          {[136, 496].map((x) => (
            <motion.g
              key={x}
              className="hero-conveyor__roller"
              animate={shouldAnimate ? { rotate: -360 } : { rotate: 0 }}
              transition={{
                duration: BELT_MOTION.rollerRotationDuration,
                ease: 'linear',
                repeat: shouldAnimate ? Infinity : 0,
              }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <circle cx={x} cy="107" r="17" />
              <path d={`M${x - 9} 107H${x + 9}M${x} 98V116`} />
            </motion.g>
          ))}
        </g>

        <g
          className="hero-conveyor__machine"
          visibility={isBoxVisible ? 'visible' : 'hidden'}
        >
          <path className="hero-conveyor__box" d="M10 196V337H160V196" />
          {heroGate.open
            ? <><path className="hero-conveyor__box-bottom" d="M10 337H18" /><path className="hero-conveyor__box-bottom" d="M152 337H160" /></>
            : <path className="hero-conveyor__box-bottom" data-conveyor-bottom="true" d="M10 337H160" />}
        </g>

        <rect className="hero-conveyor__fade" x="315" y="0" width="105" height="350" fill="url(#hero-conveyor-fade)" />
      </svg>
    </div>
  )
}
