import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Body, Bodies, Events, type Body as MatterBody } from 'matter-js'
import { useFactoryAct, useFactoryStation, type FactoryStationMetrics } from '../FactoryAct'
import { useFactoryFlow } from '../FactoryFlowProvider'
import type { FactoryPartSpec } from '../factoryTypes'
import { FinalAssemblerScene } from './FinalAssemblerScene'
import {
  FINAL_ASSEMBLER_VIEWBOX, NOVA_FRAME, createFinalAssemblyState, createReducedFinalAssemblyParts,
  beginFinalAssembly, completeFinalAssembly, claimFinalOverflow,
  getFinalOverflowImpulse, projectFinalAssemblerPose, getFinalAssemblerColliderSpecs,
  type FinalAssemblyState, type FinalAssemblerCapturePose, type FinalAssemblerColliderSpec,
} from './contactAssemblyModel'

function createCollider(metrics: FactoryStationMetrics, spec: FinalAssemblerColliderSpec) {
  const scaleX = Math.max(metrics.elementRect.width, 1) / FINAL_ASSEMBLER_VIEWBOX.width
  const scaleY = Math.max(metrics.elementRect.height, 1) / FINAL_ASSEMBLER_VIEWBOX.height
  const offsetX = metrics.elementRect.left - metrics.actRect.left
  const offsetY = metrics.elementRect.top - metrics.actRect.top
  if (spec.kind === 'rectangle') {
    return Bodies.rectangle(
      offsetX + spec.x * scaleX,
      offsetY + spec.y * scaleY,
      spec.width * scaleX,
      spec.height * scaleY,
      { isStatic: true, isSensor: spec.isSensor, label: spec.label },
    )
  }
  const start = { x: offsetX + spec.x1 * scaleX, y: offsetY + spec.y1 * scaleY }
  const end = { x: offsetX + spec.x2 * scaleX, y: offsetY + spec.y2 * scaleY }
  const body = Bodies.rectangle(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2,
    Math.hypot(end.x - start.x, end.y - start.y),
    4 * Math.min(scaleX, scaleY),
    { isStatic: true, isSensor: spec.isSensor, friction: 0.02, restitution: 0.92, label: spec.label },
  )
  Body.setAngle(body, Math.atan2(end.y - start.y, end.x - start.x))
  return body
}

// Framer Motion's current hook snapshots this preference only at mount.
const getReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
function subscribeReducedMotion(notify: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}

function getPartId(body: MatterBody) { return body.label.replace(/^factory-part-/, '') }

export default function FinalAssembler() {
  const { engine, removePart, getPartBody, simulationActive } = useFactoryAct()
  const { markFinalWebsiteAssembled } = useFactoryFlow()
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true)
  const pendingOverflowRef = useRef(new Set<string>())
  const stationRef = useRef<HTMLDivElement>(null)
  const [assemblyState, setAssemblyState] = useState(() => createFinalAssemblyState(reducedMotion ? createReducedFinalAssemblyParts() : []))
  const assemblyStateRef = useRef(assemblyState)
  const [capturePose, setCapturePose] = useState<FinalAssemblerCapturePose | null>(null)

  const commitAssemblyState = useCallback((next: FinalAssemblyState) => {
    assemblyStateRef.current = next
    setAssemblyState(next)
  }, [])

  useEffect(() => {
    if (!reducedMotion) return
    // Synchronize the external Matter collision ref and React scene when motion is disabled.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    commitAssemblyState(createFinalAssemblyState(createReducedFinalAssemblyParts()))
    setCapturePose(null)
    pendingOverflowRef.current.clear()
    markFinalWebsiteAssembled()
  }, [commitAssemblyState, markFinalWebsiteAssembled, reducedMotion])

  const stationCenterXRef = useRef(0)
  const buildColliders = useCallback((metrics: FactoryStationMetrics) => {
    const scaleX = Math.max(metrics.elementRect.width, 1) / FINAL_ASSEMBLER_VIEWBOX.width
    stationCenterXRef.current = metrics.elementRect.left - metrics.actRect.left + NOVA_FRAME.centerX * scaleX
    return getFinalAssemblerColliderSpecs().map((spec) => createCollider(metrics, spec))
  }, [])

  useFactoryStation({ id: 'contact', elementRef: stationRef, buildColliders })
  const capturePart = useCallback((part: MatterBody) => {
    if (!simulationActive || reducedMotion) return false
    const spec = part.plugin.factoryPartSpec as FactoryPartSpec
    const result = beginFinalAssembly(assemblyStateRef.current, spec)
    if (result.decision.kind !== 'capture') return false
    const station = stationRef.current
    const act = station?.closest<HTMLElement>('[data-factory-act]')
    if (!station || !act) return false
    const stationRect = station.getBoundingClientRect()
    const actRect = act.getBoundingClientRect()
    const scaleX = Math.max(stationRect.width, 1) / FINAL_ASSEMBLER_VIEWBOX.width
    const scaleY = Math.max(stationRect.height, 1) / FINAL_ASSEMBLER_VIEWBOX.height
    const partId = getPartId(part)
    setCapturePose(projectFinalAssemblerPose({
      bodyX: part.position.x,
      bodyY: part.position.y,
      angleRadians: part.angle,
      stationOffsetX: stationRect.left - actRect.left,
      stationOffsetY: stationRect.top - actRect.top,
      scaleX,
      scaleY,
      partScaleX: spec.scaleX,
      partScaleY: spec.scaleY,
    }))
    commitAssemblyState(result.state)
    removePart(partId)
    return true
  }, [commitAssemblyState, removePart, simulationActive, reducedMotion])

  useEffect(() => {
    const applyPendingOverflow = () => {
      if (!simulationActive || reducedMotion) return
      for (const partId of pendingOverflowRef.current) {
        const part = getPartBody(partId)
        if (part) Body.applyForce(part, part.position,
          getFinalOverflowImpulse(part.position.x, stationCenterXRef.current, part.mass))
      }
      pendingOverflowRef.current.clear()
    }

    const handleCollision = ({ pairs }: { pairs: Array<{ bodyA: MatterBody; bodyB: MatterBody }> }) => {
      if (!simulationActive || reducedMotion) return
      const contacts = pairs.flatMap((pair) => {
        const part = pair.bodyA.label.startsWith('factory-part-') ? pair.bodyA
          : pair.bodyB.label.startsWith('factory-part-') ? pair.bodyB : null
        const surface = pair.bodyA.label.startsWith('contact-') ? pair.bodyA
          : pair.bodyB.label.startsWith('contact-') ? pair.bodyB : null
        return part && surface ? [{ part, surface }] : []
      })
      const capturedBodies = new Set<number>()
      const capturePairs = contacts.filter(({ surface }) => surface.label === 'contact-capture-zone')
      for (const { part } of capturePairs) if (capturePart(part)) capturedBodies.add(part.id)

      const roofPairs = contacts.filter(({ surface }) => surface.label.startsWith('contact-overflow-roof-'))
      for (const { part } of roofPairs) {
        if (capturedBodies.has(part.id)) continue
        const partId = getPartId(part)
        const claim = claimFinalOverflow(assemblyStateRef.current, partId)
        if (!claim.apply) continue
        commitAssemblyState(claim.state)
        pendingOverflowRef.current.add(partId)
      }
    }

    Events.on(engine, 'beforeUpdate', applyPendingOverflow)
    Events.on(engine, 'collisionStart', handleCollision)
    return () => {
      Events.off(engine, 'collisionStart', handleCollision)
      Events.off(engine, 'beforeUpdate', applyPendingOverflow)
    }
  }, [engine, getPartBody, simulationActive, reducedMotion, capturePart, commitAssemblyState])
  const finishPlacement = useCallback((partId: string) => {
    const previous = assemblyStateRef.current
    const next = completeFinalAssembly(previous, partId)
    if (next === previous) return
    commitAssemblyState(next)
    setCapturePose(null)
    if (next.assembled) markFinalWebsiteAssembled()
  }, [commitAssemblyState, markFinalWebsiteAssembled])

  return (
    <FinalAssemblerScene
      stationRef={stationRef}
      state={assemblyState}
      capturePose={capturePose}
      reducedMotion={reducedMotion}
      onPlacementComplete={finishPlacement}
    />
  )

}
