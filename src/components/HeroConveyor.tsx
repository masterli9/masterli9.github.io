import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Body, Bodies, type Body as MatterBody } from 'matter-js'
import {
  createFactoryPartSpec,
  getFactoryActiveLimit,
  getRawFactoryPartColor,
  getFactorySpawnDecision,
} from '../factory/factoryFlowModel'
import {
  useFactoryAct,
  useFactoryStation,
  type FactoryStationMetrics,
} from '../factory/FactoryAct'
import { useFactoryFlow } from '../factory/FactoryFlowProvider'
import type { FactoryPartSpec } from '../factory/factoryTypes'
import {
  getConveyorBeltBottomY,
  getConveyorMotion,
  getConveyorOccluderEndX,
  getConveyorPartCenterY,
  getHeroDoorColliderPose,
  getHeroGateGeometry,
  getHeroGateState,
  getRoundedEndReleaseX,
  getRoundedEndTangentVelocity,
  shouldRunHeroFeed,
  shouldRunHeroPhysics,
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
const SPAWN_X = 455
const VIEWBOX_WIDTH = 420
const VIEWBOX_HEIGHT = 350
const FADE_START_X = 315
const MAX_PART_HALF_WIDTH = 18
const FADE_END_X = getConveyorOccluderEndX({
  viewportRightX: VIEWBOX_WIDTH,
  spawnX: SPAWN_X,
  maxPartHalfWidth: MAX_PART_HALF_WIDTH,
})
const BELT_MOTION = getConveyorMotion({
  surfaceSpeed: 55,
  treadCycleLength: 28,
  rollerRadius: 17,
})
const PART_SHAPES = ['square', 'circle', 'bar', 'diamond'] as const

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
    color: getRawFactoryPartColor(sequence),
  }
}

function createHeroColliders({ elementRect, actRect }: FactoryStationMetrics, gateProgress: number) {
  const scaleX = Math.max(elementRect.width, 1) / VIEWBOX_WIDTH
  const scaleY = Math.max(elementRect.height, 1) / VIEWBOX_HEIGHT
  const radiusScale = Math.min(scaleX, scaleY)
  const offsetX = elementRect.left - actRect.left
  const offsetY = elementRect.top - actRect.top
  const point = (x: number, y: number) => ({
    x: offsetX + (x * scaleX),
    y: offsetY + (y * scaleY),
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
  const door = (
    segment: ReturnType<typeof getHeroGateGeometry>['leftDoor'],
    label: string,
  ) => {
    const pose = getHeroDoorColliderPose(segment, { scaleX, scaleY, offsetX, offsetY })
    return Bodies.rectangle(pose.x, pose.y, pose.length, 9 * radiusScale, {
      isStatic: true,
      angle: pose.angle,
      label,
      friction: 0.12,
      restitution: 0.08,
    })
  }
  const roundedEnd = point(BELT_RELEASE_X, BELT_END_CENTER_Y)
  const gateGeometry = getHeroGateGeometry(gateProgress)
  const leftDoor = door(gateGeometry.leftDoor, 'box-bottom-left')
  const rightDoor = door(gateGeometry.rightDoor, 'box-bottom-right')
  const colliders: MatterBody[] = [
    Bodies.circle(roundedEnd.x, roundedEnd.y, 26 * radiusScale, {
      isStatic: true,
      friction: 0.12,
      restitution: 0,
      label: 'conveyor-rounded-end',
    }),
    rectangle(10, 267.5, 8, 143, 'box-left'),
    rectangle(160, 267.5, 8, 143, 'box-right'),
    leftDoor,
    rightDoor,
  ]

  return { colliders, doors: { left: leftDoor, right: rightDoor } }
}

function getStationMapping(station: HTMLElement) {
  const act = station.closest<HTMLElement>('[data-factory-act]')
  if (!act) return null
  const elementRect = station.getBoundingClientRect()
  const actRect = act.getBoundingClientRect()
  const scaleX = Math.max(elementRect.width, 1) / VIEWBOX_WIDTH
  const scaleY = Math.max(elementRect.height, 1) / VIEWBOX_HEIGHT
  const offsetX = elementRect.left - actRect.left
  const offsetY = elementRect.top - actRect.top
  return {
    scaleX,
    scaleY,
    offsetX,
    offsetY,
    toActPoint: (x: number, y: number) => ({
      x: offsetX + (x * scaleX),
      y: offsetY + (y * scaleY),
    }),
    toLocalPoint: (x: number, y: number) => ({
      x: (x - offsetX) / scaleX,
      y: (y - offsetY) / scaleY,
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
  const heroPartIdsRef = useRef(new Set<string>())
  const activeRef = useRef(false)
  const lineStartedRef = useRef(false)
  const gateProgressRef = useRef(0)
  const gateDoorBodiesRef = useRef<{ left: MatterBody; right: MatterBody } | null>(null)
  const [gateProgress, setGateProgress] = useState(0)
  const reducedMotion = useReducedMotion() ?? false
  const isInView = useInView(svgRef, { amount: 0.15 })
  const { lineStarted } = useFactoryFlow()
  const { getPartBody, removePart, spawnPart } = useFactoryAct()
  const shouldAnimate = shouldRunHeroPhysics({ isInView, reducedMotion, introStage })
  const shouldFeed = shouldRunHeroFeed({ shouldAnimate, lineStarted, reducedMotion })
  const isBoxVisible = BOX_VISIBLE_STAGES.includes(introStage)
  const isMachineVisible = MACHINE_VISIBLE_STAGES.includes(introStage)
  const heroGate = getHeroGateState(lineStarted)
  const gateGeometry = getHeroGateGeometry(heroGate.open && reducedMotion ? 1 : gateProgress)

  const updateGateColliders = useCallback((progress: number) => {
    const station = stationRef.current
    const doors = gateDoorBodiesRef.current
    if (!station || !doors) return
    const mapping = getStationMapping(station)
    if (!mapping) return
    const geometry = getHeroGateGeometry(progress)
    const mapped = {
      scaleX: mapping.scaleX,
      scaleY: mapping.scaleY,
      offsetX: mapping.offsetX,
      offsetY: mapping.offsetY,
    }
    const leftPose = getHeroDoorColliderPose(geometry.leftDoor, mapped)
    const rightPose = getHeroDoorColliderPose(geometry.rightDoor, mapped)

    Body.setPosition(doors.left, { x: leftPose.x, y: leftPose.y })
    Body.setAngle(doors.left, leftPose.angle)
    Body.setPosition(doors.right, { x: rightPose.x, y: rightPose.y })
    Body.setAngle(doors.right, rightPose.angle)
  }, [])

  const buildColliders = useCallback((metrics: FactoryStationMetrics) => {
    const result = createHeroColliders(metrics, gateProgressRef.current)
    gateDoorBodiesRef.current = result.doors
    return result.colliders
  }, [])
  useFactoryStation({ id: 'hero', elementRef: stationRef, buildColliders })

  useEffect(() => {
    if (!lineStarted) return
    if (reducedMotion) {
      gateProgressRef.current = 1
      updateGateColliders(1)
      return
    }
    let frame = 0
    const startedAt = performance.now()
    const animateGate = (time: number) => {
      const rawProgress = Math.min(1, (time - startedAt) / 350)
      const nextProgress = 1 - ((1 - rawProgress) ** 4)
      gateProgressRef.current = nextProgress
      updateGateColliders(nextProgress)
      setGateProgress(nextProgress)
      if (rawProgress < 1) frame = window.requestAnimationFrame(animateGate)
    }
    frame = window.requestAnimationFrame(animateGate)
    return () => window.cancelAnimationFrame(frame)
  }, [lineStarted, reducedMotion, updateGateColliders])

  useEffect(() => {
    activeRef.current = shouldFeed
    lineStartedRef.current = lineStarted

    for (const id of heroPartIdsRef.current) {
      const body = getPartBody(id)
      if (!body) {
        heroPartIdsRef.current.delete(id)
        continue
      }
      Body.setStatic(body, !shouldFeed)
    }
  }, [getPartBody, lineStarted, shouldFeed])

  useEffect(() => {
    if (!isBoxVisible) return
    const station = stationRef.current
    if (!station) return
    const heroPartIds = heroPartIdsRef.current
    const liveParts = new Map<string, ConveyorPart>()
    let nextSequence = 0
    let frame = 0
    let previousTime = performance.now()
    let simulatedTime = 0
    let lastSpawnAt = -1100

    const addPart = (position?: PartPosition, released = false) => {
      const mapping = getStationMapping(station)
      if (!mapping) return
      const spec = {
        ...createHeroPartSpec(nextSequence),
        scaleX: mapping.scaleX,
        scaleY: mapping.scaleY,
      }
      const localX = position?.x ?? SPAWN_X
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
      const body = getPartBody(spec.id)
      if (!body) return
      heroPartIds.add(spec.id)
      Body.setStatic(body, !activeRef.current)
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
        if (!getPartBody(id)) {
          liveParts.delete(id)
          heroPartIds.delete(id)
        }
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
      liveParts.forEach(({ id }) => {
        heroPartIds.delete(id)
        removePart(id)
      })
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
          <linearGradient
            id="hero-conveyor-fade"
            gradientUnits="userSpaceOnUse"
            x1={FADE_START_X}
            y1="0"
            x2={VIEWBOX_WIDTH}
            y2="0"
          >
            <stop offset="0" stopColor="#000000" stopOpacity="0" />
            <stop offset="1" stopColor="#000000" />
          </linearGradient>
          <clipPath id="hero-conveyor-machine-clip">
            <rect x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} />
          </clipPath>
        </defs>

        <g
          className="hero-conveyor__machine"
          visibility={isMachineVisible ? 'visible' : 'hidden'}
          clipPath="url(#hero-conveyor-machine-clip)"
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
          <path className="hero-conveyor__box" d={gateGeometry.wallsPath} />
          <line
            className="hero-conveyor__box-bottom"
            data-conveyor-door="left"
            x1={gateGeometry.leftDoor.x1}
            y1={gateGeometry.leftDoor.y1}
            x2={gateGeometry.leftDoor.x2}
            y2={gateGeometry.leftDoor.y2}
          />
          <line
            className="hero-conveyor__box-bottom"
            data-conveyor-door="right"
            x1={gateGeometry.rightDoor.x1}
            y1={gateGeometry.rightDoor.y1}
            x2={gateGeometry.rightDoor.x2}
            y2={gateGeometry.rightDoor.y2}
          />
        </g>

        <rect
          className="hero-conveyor__fade"
          x={FADE_START_X}
          y="0"
          width={FADE_END_X - FADE_START_X}
          height={VIEWBOX_HEIGHT}
          fill="url(#hero-conveyor-fade)"
        />
      </svg>
    </div>
  )
}
