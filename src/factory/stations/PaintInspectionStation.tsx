import { useCallback, useEffect, useRef } from 'react'
import { Bodies, type Body as MatterBody, Events } from 'matter-js'
import { useFactoryAct, useFactoryStation, type FactoryStationMetrics } from '../FactoryAct'
import type { FactoryPartShape } from '../factoryTypes'
import { advanceInspection, getPaintColor } from './paintInspectionModel'

const VIEWBOX_WIDTH = 260
const VIEWBOX_HEIGHT = 520

function createPaintCollider(
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
    {
      isStatic: true,
      isSensor,
      friction: 0.12,
      restitution: 0.12,
      label,
    },
  )
}

function getPartId(body: MatterBody) {
  return body.label.replace(/^factory-part-/, '')
}

function getSequence(partId: string) {
  return Number(partId.replace('part-', ''))
}

export default function PaintInspectionStation() {
  const stationRef = useRef<HTMLDivElement>(null)
  const paintedRef = useRef(new Set<string>())
  const inspectedRef = useRef(new Set<string>())
  const { engine, updatePartSpec } = useFactoryAct()

  const buildColliders = useCallback((metrics: FactoryStationMetrics): MatterBody[] => [
    createPaintCollider(metrics, 52, 190, 4, 260, 'experience-paint-guide-left'),
    createPaintCollider(metrics, 208, 190, 4, 260, 'experience-paint-guide-right'),
    createPaintCollider(metrics, 130, 178, 148, 170, 'experience-paint-zone', true),
    createPaintCollider(metrics, 130, 326, 124, 20, 'experience-inspection-sensor', true),
    createPaintCollider(metrics, 82, 454, 4, 190, 'experience-exit-guide-left'),
    createPaintCollider(metrics, 178, 454, 4, 190, 'experience-exit-guide-right'),
  ], [])

  useFactoryStation({ id: 'experience', elementRef: stationRef, buildColliders })

  useEffect(() => {
    const handleCollision = ({ pairs }: { pairs: Array<{ bodyA: MatterBody; bodyB: MatterBody }> }) => {
      for (const pair of pairs) {
        const part = pair.bodyA.label.startsWith('factory-part-')
          ? pair.bodyA
          : pair.bodyB.label.startsWith('factory-part-')
            ? pair.bodyB
            : null
        const surface = pair.bodyA.label.startsWith('experience-')
          ? pair.bodyA
          : pair.bodyB.label.startsWith('experience-')
            ? pair.bodyB
            : null
        if (!part || !surface) continue
        const partId = getPartId(part)
        const sequence = getSequence(partId)
        if (surface.label === 'experience-paint-zone' && !paintedRef.current.has(partId)) {
          paintedRef.current.add(partId)
          updatePartSpec(partId, { color: getPaintColor(sequence) })
        }
        if (surface.label === 'experience-inspection-sensor' && !inspectedRef.current.has(partId)) {
          inspectedRef.current.add(partId)
          const inspected = advanceInspection({
            id: partId,
            sequence,
            shape: 'button' as FactoryPartShape,
            color: getPaintColor(sequence),
            stage: 'formed',
          }, true)
          updatePartSpec(partId, { stage: inspected.stage })
        }
      }
    }
    Events.on(engine, 'collisionStart', handleCollision)
    return () => Events.off(engine, 'collisionStart', handleCollision)
  }, [engine, updatePartSpec])

  return (
    <div ref={stationRef} className="factory-station paint-inspection" data-factory-station="experience">
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} aria-hidden="true" focusable="false">
        <path d="M52 60V320M208 60V320" className="factory-line__rail factory-line__rail--white" />
        <rect x="56" y="93" width="148" height="170" className="factory-line__paint-zone" />
        <path d="M76 120H184M76 160H184M76 200H184" className="factory-line__rail factory-line__rail--pink" />
        <path d="M68 326H192" className="factory-line__rail factory-line__rail--blue" />
        <path d="M82 454H178" className="factory-line__rail factory-line__rail--white" />
        <path d="M82 454V505M178 454V505" className="factory-line__rail factory-line__rail--white" />
      </svg>
    </div>
  )
}
