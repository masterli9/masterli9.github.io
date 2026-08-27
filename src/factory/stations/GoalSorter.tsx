import { useCallback, useEffect, useRef } from 'react'
import { Body, Bodies, Events, type Body as MatterBody } from 'matter-js'
import { useFactoryAct, useFactoryStation, type FactoryStationMetrics } from '../FactoryAct'
import { getGoalLane } from './goalSorterModel'

const VIEWBOX_WIDTH = 320
const VIEWBOX_HEIGHT = 620

function createSegment(
  metrics: FactoryStationMetrics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
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
    { isStatic: true, friction: 0.08, restitution: 0.2, label },
  )
  Body.setAngle(body, Math.atan2(end.y - start.y, end.x - start.x))
  return body
}

function getPartId(body: MatterBody) {
  return body.label.replace(/^factory-part-/, '')
}

export default function GoalSorter() {
  const stationRef = useRef<HTMLDivElement>(null)
  const routedRef = useRef(new Set<string>())
  const { engine } = useFactoryAct()

  const buildColliders = useCallback((metrics: FactoryStationMetrics): MatterBody[] => [
    createSegment(metrics, 38, 44, 112, 198, 'goals-funnel-left'),
    createSegment(metrics, 282, 44, 208, 198, 'goals-funnel-right'),
    Bodies.rectangle(
      metrics.elementRect.left - metrics.actRect.left + (160 * (metrics.elementRect.width / VIEWBOX_WIDTH)),
      metrics.elementRect.top - metrics.actRect.top + (208 * (metrics.elementRect.height / VIEWBOX_HEIGHT)),
      92 * (metrics.elementRect.width / VIEWBOX_WIDTH),
      5 * (metrics.elementRect.height / VIEWBOX_HEIGHT),
      { isStatic: true, friction: 0.08, restitution: 0.2, label: 'goals-diverter' },
    ),
    createSegment(metrics, 30, 226, 30, 416, 'goals-lane-left'),
    createSegment(metrics, 130, 226, 130, 416, 'goals-lane-0-1-boundary'),
    createSegment(metrics, 190, 226, 190, 416, 'goals-lane-1-2-boundary'),
    createSegment(metrics, 290, 226, 290, 416, 'goals-lane-right'),
    createSegment(metrics, 30, 416, 160, 570, 'goals-merge-0'),
    createSegment(metrics, 160, 416, 160, 570, 'goals-merge-1'),
    createSegment(metrics, 290, 416, 160, 570, 'goals-merge-2'),
  ], [])

  useFactoryStation({ id: 'goals', elementRef: stationRef, buildColliders })

  useEffect(() => {
    const handleCollision = ({ pairs }: { pairs: Array<{ bodyA: MatterBody; bodyB: MatterBody }> }) => {
      for (const pair of pairs) {
        const part = pair.bodyA.label.startsWith('factory-part-')
          ? pair.bodyA
          : pair.bodyB.label.startsWith('factory-part-')
            ? pair.bodyB
            : null
        const diverter = pair.bodyA.label === 'goals-diverter' || pair.bodyB.label === 'goals-diverter'
        if (!part || !diverter || routedRef.current.has(part.label)) continue
        routedRef.current.add(part.label)
        const lane = getGoalLane(Number(getPartId(part).replace('part-', '')))
        const direction = lane - 1
        Body.applyForce(part, part.position, { x: direction * 0.0018, y: 0.0002 })
      }
    }
    Events.on(engine, 'collisionStart', handleCollision)
    return () => Events.off(engine, 'collisionStart', handleCollision)
  }, [engine])

  return (
    <div ref={stationRef} className="factory-station goal-sorter" data-factory-station="goals">
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} aria-hidden="true" focusable="false">
        <path d="M38 44 112 198M282 44 208 198" className="factory-line__rail factory-line__rail--white" />
        <path d="M114 208H206" className="factory-line__rail factory-line__rail--pink" />
        <path d="M30 226V416M130 226V416M190 226V416M290 226V416" className="factory-line__rail factory-line__rail--white" />
        <path d="M30 416 160 570M160 416V570M290 416 160 570" className="factory-line__rail factory-line__rail--blue" />
      </svg>
    </div>
  )
}
