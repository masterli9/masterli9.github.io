import { useCallback, useEffect, useRef } from 'react'
import { Body, Bodies, Events, type Body as MatterBody } from 'matter-js'
import { useFactoryAct, useFactoryStation, type FactoryStationMetrics } from '../FactoryAct'
import { getReboundImpulse, getReboundPlatformGeometry } from './statementReboundModel'

const VIEWBOX_WIDTH = 360
const VIEWBOX_HEIGHT = 480

function createSegmentCollider(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number,
  label: string,
  scaleX: number,
  scaleY: number,
  offsetX: number,
  offsetY: number,
) {
  const start = { x: offsetX + (x1 * scaleX), y: offsetY + (y1 * scaleY) }
  const end = { x: offsetX + (x2 * scaleX), y: offsetY + (y2 * scaleY) }
  const length = Math.hypot(end.x - start.x, end.y - start.y)
  const body = Bodies.rectangle(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2,
    length,
    thickness * Math.min(scaleX, scaleY),
    { isStatic: true, friction: 0.08, restitution: 0.68, label },
  )
  Body.setAngle(body, Math.atan2(end.y - start.y, end.x - start.x))
  return body
}

function getStationGeometry() {
  return getReboundPlatformGeometry({ left: 0, top: 0, width: VIEWBOX_WIDTH, height: VIEWBOX_HEIGHT })
}

export default function StatementRebound() {
  const stationRef = useRef<HTMLDivElement>(null)
  const { engine } = useFactoryAct()
  const geometry = getStationGeometry()

  const buildColliders = useCallback(({ elementRect, actRect }: FactoryStationMetrics): MatterBody[] => {
    const scaleX = Math.max(elementRect.width, 1) / VIEWBOX_WIDTH
    const scaleY = Math.max(elementRect.height, 1) / VIEWBOX_HEIGHT
    const offsetX = elementRect.left - actRect.left
    const offsetY = elementRect.top - actRect.top
    const platform = createSegmentCollider(
      geometry.platform.x1,
      geometry.platform.y1,
      geometry.platform.x2,
      geometry.platform.y2,
      geometry.platform.thickness,
      'statement-rebound-platform',
      scaleX,
      scaleY,
      offsetX,
      offsetY,
    )
    const catcherCenterX = offsetX + ((geometry.catcher.x + (geometry.catcher.width / 2)) * scaleX)
    const catcherCenterY = offsetY + ((geometry.catcher.y + (geometry.catcher.height / 2)) * scaleY)
    const catcher = Bodies.rectangle(
      catcherCenterX,
      catcherCenterY,
      geometry.catcher.width * scaleX,
      geometry.catcher.height * scaleY,
      { isStatic: true, friction: 0.16, restitution: 0.18, label: 'statement-rebound-catcher' },
    )
    return [platform, catcher]
  }, [geometry.catcher.height, geometry.catcher.width, geometry.catcher.x, geometry.catcher.y, geometry.platform.thickness, geometry.platform.x1, geometry.platform.x2, geometry.platform.y1, geometry.platform.y2])

  useFactoryStation({ id: 'statement', elementRef: stationRef, buildColliders })

  useEffect(() => {
    const handled = new Set<number>()
    const handleCollision = ({ pairs }: { pairs: Array<{ bodyA: MatterBody; bodyB: MatterBody }> }) => {
      for (const pair of pairs) {
        const part = pair.bodyA.label.startsWith('factory-part-')
          ? pair.bodyA
          : pair.bodyB.label.startsWith('factory-part-')
            ? pair.bodyB
            : null
        const surface = pair.bodyA.label === 'statement-rebound-platform'
          || pair.bodyA.label === 'statement-rebound-catcher'
          ? pair.bodyA
          : pair.bodyB.label === 'statement-rebound-platform'
            || pair.bodyB.label === 'statement-rebound-catcher'
            ? pair.bodyB
            : null
        if (!part || !surface || handled.has(part.id)) continue
        handled.add(part.id)
        const direction = getReboundImpulse({ incomingX: part.velocity.x, incomingY: part.velocity.y })
        const forceScale = surface.label === 'statement-rebound-platform' ? 0.0014 : 0.0005
        Body.applyForce(part, part.position, {
          x: direction.x * forceScale,
          y: direction.y * forceScale,
        })
      }
    }
    Events.on(engine, 'collisionStart', handleCollision)
    return () => Events.off(engine, 'collisionStart', handleCollision)
  }, [engine])

  return (
    <div ref={stationRef} className="factory-station statement-rebound" data-factory-station="statement">
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} aria-hidden="true" focusable="false">
        <line
          x1={geometry.platform.x1}
          y1={geometry.platform.y1}
          x2={geometry.platform.x2}
          y2={geometry.platform.y2}
          className="factory-line__rail factory-line__rail--white"
        />
        <rect
          x={geometry.catcher.x}
          y={geometry.catcher.y}
          width={geometry.catcher.width}
          height={geometry.catcher.height}
          className="factory-line__rail factory-line__rail--white"
        />
        <path
          d={`M${geometry.catcher.x} ${geometry.catcher.y + geometry.catcher.height}H${geometry.catcher.x - 36}`}
          className="factory-line__rail factory-line__rail--pink"
        />
      </svg>
    </div>
  )
}
