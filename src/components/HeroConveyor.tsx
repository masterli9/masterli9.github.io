import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
  Bodies,
  Body,
  Composite,
  Engine,
  type Body as MatterBody,
} from 'matter-js'
import {
  canSpawnConveyorPart,
  clampPhysicsDelta,
  getConveyorBeltBottomY,
  getConveyorMotion,
  getConveyorPayloadDeficit,
  getConveyorPartCenterY,
  getRoundedEndTangentVelocity,
  getRoundedEndReleaseX,
  shouldReleaseConveyorPart,
  type ConveyorPartShape,
} from './heroConveyorModel'
import type { HeroConveyorIntroStage } from './heroTimeline'
import { createRoundedBeltEndCollider } from './heroConveyorPhysics'
import './hero-conveyor.css'

interface PartSpec {
  shape: ConveyorPartShape
  color: string
}

interface ConveyorPart extends PartSpec {
  id: number
  body: MatterBody
  released: boolean
}

interface PartPosition {
  x: number
  y: number
  angle: number
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
const BELT_MOTION = getConveyorMotion({
  surfaceSpeed: 55,
  treadCycleLength: 28,
  rollerRadius: 17,
})
const PART_SHAPES = ['square', 'circle', 'bar', 'diamond'] as const
const PART_COLORS = ['#F21868', '#355CFF', '#FFFFFF'] as const
const PART_SPECS: PartSpec[] = Array.from({ length: MAX_PARTS }, (_, index) => ({
  shape: PART_SHAPES[index % PART_SHAPES.length] ?? 'square',
  color: PART_COLORS[index % PART_COLORS.length] ?? '#FFFFFF',
}))

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

function createPartBody(spec: PartSpec, index: number, position?: PartPosition) {
  const x = position?.x ?? 455
  const y = position?.y ?? getConveyorPartCenterY(BELT_TOP_Y, spec.shape, PART_CLEARANCE)
  const options = {
    friction: 0.16,
    frictionAir: 0.008,
    restitution: 0.12,
    density: 0.0018,
    label: `conveyor-part-${index}`,
  }

  const body = spec.shape === 'circle'
    ? Bodies.circle(x, y, 11, options)
    : spec.shape === 'bar'
      ? Bodies.rectangle(x, y, 30, 13, options)
      : Bodies.rectangle(x, y, 22, 22, options)

  if (position) Body.setAngle(body, position.angle * (Math.PI / 180))
  else if (spec.shape === 'diamond') Body.setAngle(body, Math.PI / 4)
  return body
}

function PartGraphic({ shape, color }: PartSpec) {
  if (shape === 'circle') return <circle cx="0" cy="0" r="11" fill={color} />
  if (shape === 'bar') return <rect x="-15" y="-6.5" width="30" height="13" fill={color} />
  return <rect x="-11" y="-11" width="22" height="22" fill={color} />
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
  const partNodes = useRef(new Map<number, SVGGElement>())
  const activeRef = useRef(false)
  const [parts, setParts] = useState<ConveyorPart[]>([])
  const reducedMotion = useReducedMotion() ?? false
  const isInView = useInView(svgRef, { amount: 0.15 })
  const shouldAnimate = isInView && !reducedMotion && introStage === 'running'
  const isBoxVisible = BOX_VISIBLE_STAGES.includes(introStage)
  const isMachineVisible = MACHINE_VISIBLE_STAGES.includes(introStage)

  useEffect(() => {
    activeRef.current = shouldAnimate
  }, [shouldAnimate])

  useEffect(() => {
    if (reducedMotion) return

    const nodeMap = partNodes.current
    const engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.00145 },
    })
    const world = engine.world
    const roundedBeltEnd = createRoundedBeltEndCollider({
      left: BELT_LEFT_X,
      top: BELT_TOP_Y,
      height: BELT_HEIGHT,
      clearance: PART_CLEARANCE,
    })
    const boxLeft = Bodies.rectangle(10, 267.5, 8, 143, { isStatic: true, label: 'box-left' })
    const boxRight = Bodies.rectangle(160, 267.5, 8, 143, { isStatic: true, label: 'box-right' })
    const boxBottom = Bodies.rectangle(85, 337, 158, 9, { isStatic: true, label: 'box-bottom' })
    Composite.add(world, [roundedBeltEnd, boxLeft, boxRight, boxBottom])

    const liveParts: ConveyorPart[] = []
    let frame = 0
    let previousTime = performance.now()
    let simulatedTime = 0
    let lastSpawnAt = -1100

    const addPart = (spec: PartSpec, position?: PartPosition, released = false) => {
      const id = liveParts.length
      const body = createPartBody(spec, id, position)
      const part = { id, ...spec, body, released }
      liveParts.push(part)
      Composite.add(world, body)
      return part
    }

    const spawnPart = () => {
      const spec = PART_SPECS[liveParts.length]
      if (!spec) return

      addPart(spec)
      setParts([...liveParts])
    }

    const ensureMinimumPayload = (minimumPayload: number) => {
      const deficit = getConveyorPayloadDeficit({
        activeCount: liveParts.length,
        minimumPayload,
        maxParts: MAX_PARTS,
      })

      for (let index = 0; index < deficit; index += 1) {
        const spec = PART_SPECS[liveParts.length]
        const position = STARTER_POSITIONS[liveParts.length]
        if (!spec || !position) break
        addPart(spec, position, true)
      }

      setParts([...liveParts])
    }

    ensureMinimumPayload(MINIMUM_PAYLOAD)

    const tick = (time: number) => {
      frame = window.requestAnimationFrame(tick)
      const isRunning = activeRef.current && document.visibilityState === 'visible'
      if (!isRunning) {
        previousTime = time
        return
      }

      const delta = clampPhysicsDelta(time - previousTime)
      previousTime = time
      simulatedTime += delta

      if (
        simulatedTime - lastSpawnAt >= SPAWN_INTERVAL
        && canSpawnConveyorPart({
          activeCount: liveParts.length,
          maxParts: MAX_PARTS,
          isActive: true,
          reducedMotion: false,
        })
      ) {
        spawnPart()
        lastSpawnAt = simulatedTime
      }

      Engine.update(engine, delta)

      for (const part of liveParts) {
        if (!part.released) {
          if (shouldReleaseConveyorPart(part.body.position.x, BELT_RELEASE_X)) {
            part.released = true
            Body.setVelocity(part.body, { x: -BELT_MOTION.bodyVelocity, y: part.body.velocity.y })
          } else {
            Body.setPosition(part.body, {
              x: part.body.position.x,
              y: getConveyorPartCenterY(BELT_TOP_Y, part.shape, PART_CLEARANCE),
            })
            Body.setAngle(part.body, part.shape === 'diamond' ? Math.PI / 4 : 0)
            Body.setAngularVelocity(part.body, 0)
            Body.setVelocity(part.body, { x: -BELT_MOTION.bodyVelocity, y: 0 })
          }
        }

        if (
          part.released
          && part.body.position.x <= BELT_RELEASE_X + 2
          && part.body.position.x > BELT_LEFT_X - 45
          && part.body.position.y < BELT_END_CENTER_Y
        ) {
          Body.setVelocity(part.body, getRoundedEndTangentVelocity({
            bodyX: part.body.position.x,
            bodyY: part.body.position.y,
            centerX: BELT_RELEASE_X,
            centerY: BELT_END_CENTER_Y,
            releaseY: getConveyorPartCenterY(BELT_TOP_Y, part.shape, PART_CLEARANCE),
            minimumSpeed: BELT_MOTION.bodyVelocity,
            gravityPerStep: GRAVITY_PER_STEP,
          }))
        }

        const node = nodeMap.get(part.id)
        if (!node) continue
        const angle = part.body.angle * (180 / Math.PI)
        node.setAttribute(
          'transform',
          `translate(${part.body.position.x.toFixed(2)} ${part.body.position.y.toFixed(2)}) rotate(${angle.toFixed(2)})`,
        )
      }
    }

    frame = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frame)
      Composite.clear(world, false, true)
      Engine.clear(engine)
      nodeMap.clear()
    }
  }, [reducedMotion])

  return (
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

      <g visibility={isBoxVisible ? 'visible' : 'hidden'}>
        {reducedMotion
          ? STATIC_PARTS.map((part) => (
            <g key={part.id} transform={`translate(${part.x} ${part.y}) rotate(${part.angle})`}>
              <PartGraphic shape={part.shape} color={part.color} />
            </g>
          ))
          : parts.map((part) => (
            <g
              key={part.id}
              data-conveyor-part={part.id}
              transform={`translate(${part.body.position.x} ${part.body.position.y}) rotate(${part.body.angle * (180 / Math.PI)})`}
              ref={(node) => {
                if (node) partNodes.current.set(part.id, node)
                else partNodes.current.delete(part.id)
              }}
            >
              <PartGraphic shape={part.shape} color={part.color} />
            </g>
          ))}
      </g>

      <g
        className="hero-conveyor__machine"
        visibility={isBoxVisible ? 'visible' : 'hidden'}
      >
        <path className="hero-conveyor__box" d="M10 196V337H160V196" />
        <path className="hero-conveyor__box-bottom" data-conveyor-bottom="true" d="M10 337H160" />
      </g>

      <rect className="hero-conveyor__fade" x="315" y="0" width="105" height="350" fill="url(#hero-conveyor-fade)" />
    </svg>
  )
}
