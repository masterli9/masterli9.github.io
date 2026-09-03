import { useCallback, useEffect, useRef } from 'react'
import { Events, type Body as MatterBody } from 'matter-js'
import { useFactoryAct, useFactoryStation, type FactoryStationMetrics } from '../FactoryAct'
import {
  getReboundPlatformGeometry,
  getStatementSpoonGeometry,
  shouldDismissStalledStatementPart,
  shouldUseReboundCatcher,
  STATEMENT_STALL_SPEED_THRESHOLD,
} from './statementReboundModel'
import {
  applyStatementPlatformMaterial,
  applyStatementSpoonMaterial,
  createStatementStationColliders,
  propagateStatementPlatformMaterial,
} from './statementReboundPhysics'

const VIEWBOX_WIDTH = 360
const VIEWBOX_HEIGHT = 480

function getStationGeometry() {
  return getReboundPlatformGeometry({ left: 0, top: 0, width: VIEWBOX_WIDTH, height: VIEWBOX_HEIGHT })
}

const STATEMENT_GEOMETRY = getStationGeometry()
const STATEMENT_EXIT_SPOON = getStatementSpoonGeometry({
  x: STATEMENT_GEOMETRY.platform.x2 + 25.38461538461536,
  y: STATEMENT_GEOMETRY.platform.y2 - 47,
})

export default function StatementRebound() {
  const stationRef = useRef<HTMLDivElement>(null)
  const { engine, fadeOutPart } = useFactoryAct()
  const stalledSinceRef = useRef(new Map<string, number>())
  const geometry = STATEMENT_GEOMETRY
  const spoon = STATEMENT_EXIT_SPOON

  const buildColliders = useCallback(({ elementRect, actRect }: FactoryStationMetrics): MatterBody[] => {
    const scaleX = Math.max(elementRect.width, 1) / VIEWBOX_WIDTH
    const scaleY = Math.max(elementRect.height, 1) / VIEWBOX_HEIGHT
    const offsetX = elementRect.left - actRect.left
    const offsetY = elementRect.top - actRect.top
    return createStatementStationColliders({
      platform: geometry.platform,
      catcher: geometry.catcher,
      spoon,
      outputEndY: VIEWBOX_HEIGHT - 4,
      includeExitRoute: shouldUseReboundCatcher(actRect.width),
    }, {
      scaleX,
      scaleY,
      offsetX,
      offsetY,
    })
  }, [geometry.catcher, geometry.platform, spoon])

  useFactoryStation({ id: 'statement', elementRef: stationRef, buildColliders })

  useEffect(() => {
    const stalledSince = stalledSinceRef.current
    const handleCollision = ({ pairs }: { pairs: Array<{ bodyA: MatterBody; bodyB: MatterBody }> }) => {
      const now = performance.now()
      for (const pair of pairs) {
        propagateStatementPlatformMaterial(pair.bodyA, pair.bodyB, STATEMENT_GEOMETRY.platform)
        const part = pair.bodyA.label.startsWith('factory-part-')
          ? pair.bodyA
          : pair.bodyB.label.startsWith('factory-part-')
            ? pair.bodyB
            : null
        const spoonSurface = pair.bodyA.label.startsWith('statement-exit-spoon-')
          || pair.bodyA.label === 'statement-spoon-material-sensor'
          ? pair.bodyA
          : pair.bodyB.label.startsWith('statement-exit-spoon-')
            || pair.bodyB.label === 'statement-spoon-material-sensor'
              ? pair.bodyB
              : null
        const platformSurface = pair.bodyA.label === 'statement-rebound-platform'
          ? pair.bodyA
          : pair.bodyB.label === 'statement-rebound-platform'
            ? pair.bodyB
            : null
        if (part && platformSurface) applyStatementPlatformMaterial(part, STATEMENT_GEOMETRY.platform)
        if (part && spoonSurface) applyStatementSpoonMaterial(part, STATEMENT_EXIT_SPOON)
        if (part && spoonSurface?.label.startsWith('statement-exit-spoon-')) {
          const partId = part.label.slice('factory-part-'.length)
          const speed = Math.hypot(part.velocity.x, part.velocity.y)
          if (speed > STATEMENT_STALL_SPEED_THRESHOLD) {
            stalledSince.delete(partId)
            continue
          }
          const startedAt = stalledSince.get(partId) ?? now
          stalledSince.set(partId, startedAt)
          if (shouldDismissStalledStatementPart({ speed, stalledForMs: now - startedAt })) {
            stalledSince.delete(partId)
            fadeOutPart(partId)
          }
        }
      }
    }
    Events.on(engine, 'collisionStart', handleCollision)
    Events.on(engine, 'collisionActive', handleCollision)
    return () => {
      Events.off(engine, 'collisionStart', handleCollision)
      Events.off(engine, 'collisionActive', handleCollision)
      stalledSince.clear()
    }
  }, [engine, fadeOutPart])

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
        <g className="statement-rebound__wide-guide">
          <path
            d={spoon.collisionSurfacePath}
            className="factory-line__rail factory-line__rail--white statement-rebound__exit-spoon"
          />
        </g>
      </svg>
    </div>
  )
}
