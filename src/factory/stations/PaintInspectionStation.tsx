import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Bodies, Body, type Body as MatterBody, Events } from 'matter-js'
import { useFactoryAct, useFactoryStation, type FactoryStationMetrics } from '../FactoryAct'
import type { FactoryPartSpec } from '../factoryTypes'
import { advancePaintInspection, canCapturePaintPart, createPaintInspectionState, getPaintInspectionGeometry, PAINT_INSPECTION_TIMING, shouldShowPaintMist, type PaintInspectionState, type PaintInspectionEvent } from './paintInspectionModel'

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

export default function PaintInspectionStation() {
  const stationRef = useRef<HTMLDivElement>(null)
  const activePartIdRef = useRef<string | null>(null)
  const stateRef = useRef<PaintInspectionState | null>(null)
  const [state, setState] = useState<PaintInspectionState | null>(null)
  const { engine, updatePartSpec, getPartBody } = useFactoryAct()
  const phase = state?.phase ?? 'falling'
  const busy = state !== null
  const gateOpen = phase === 'inspecting' || phase === 'released'
  const geometry = getPaintInspectionGeometry()
  const coatColor = state?.part.finish.fill ?? '#FFFFFF'
  const printColor = state?.part.finish.textColor ?? state?.part.finish.detailColor ?? '#FFFFFF'
  const coatNeedsMist = shouldShowPaintMist(coatColor)
  const printNeedsMist = shouldShowPaintMist(printColor)
  const style = {
    '--coat-color': coatColor,
    '--print-color': printColor,
  } as CSSProperties

  const buildColliders = useCallback((metrics: FactoryStationMetrics): MatterBody[] => {
    const colliders = [
      createPaintCollider(metrics, 52, 190, 4, 260, 'experience-paint-guide-left'),
      createPaintCollider(metrics, 208, 190, 4, 260, 'experience-paint-guide-right'),
      createPaintCollider(metrics, 130, 218, 148, 14, 'experience-capture-sensor', true),
      createPaintCollider(metrics, 130, 326, 152, 20, 'experience-inspection-sensor', true),
      createPaintCollider(metrics, 82, 454, 4, 190, 'experience-exit-guide-left'),
      createPaintCollider(metrics, 178, 454, 4, 190, 'experience-exit-guide-right'),
    ]
    if (!gateOpen) colliders.push(createPaintCollider(metrics, 130, 244, 156, 5, 'experience-exit-gate'))
    // Hold arriving parts upstream while the active recipe finishes and is inspected.
    if (busy) colliders.push(createPaintCollider(metrics, 130, geometry.intakeY, 156, 5, 'experience-intake-gate'))
    return colliders
  }, [busy, gateOpen, geometry.intakeY])
  useFactoryStation({ id: 'experience', elementRef: stationRef, buildColliders })

  useEffect(() => {
    const timers = new Set<number>()
    const later = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => { timers.delete(timer); callback() }, delay)
      timers.add(timer)
    }
    const reset = () => {
      activePartIdRef.current = null
      stateRef.current = null
      setState(null)
    }
    const transition = (event: PaintInspectionEvent) => {
      const current = stateRef.current
      if (!current) return
      const next = advancePaintInspection(current, event)
      if (next === current) return
      stateRef.current = next
      setState(next)
      updatePartSpec(next.part.id, { stage: next.part.stage, coated: next.part.coated })
      if (next.phase === 'inspecting') {
        const body = getPartBody(next.part.id)
        if (body) { Body.setStatic(body, false); Body.setVelocity(body, { x: 0, y: 3 }) }
        else reset()
      }
    }
    const handleCollision = ({ pairs }: { pairs: Array<{ bodyA: MatterBody; bodyB: MatterBody }> }) => {
      for (const { bodyA, bodyB } of pairs) {
        const part = bodyA.label.startsWith('factory-part-') ? bodyA : bodyB.label.startsWith('factory-part-') ? bodyB : null
        const surface = bodyA.label.startsWith('experience-') ? bodyA : bodyB
        if (!part) continue
        const spec: FactoryPartSpec = part.plugin.factoryPartSpec
        if (!spec) continue
        if (surface.label === 'experience-inspection-sensor' && activePartIdRef.current === spec.id && stateRef.current?.phase === 'inspecting') {
          transition('inspection-complete')
          later(reset, PAINT_INSPECTION_TIMING.inspection)
        }
        if (surface.label !== 'experience-capture-sensor' || spec.stage !== 'formed' || !canCapturePaintPart(activePartIdRef.current)) continue
        activePartIdRef.current = spec.id
        stateRef.current = createPaintInspectionState(spec)
        Body.setAngle(part, 0)
        Body.setAngularVelocity(part, 0)
        Body.setVelocity(part, { x: 0, y: 0 })
        const station = stationRef.current
        const act = station?.closest<HTMLElement>('[data-factory-act]')
        if (station && act) {
          const rect = station.getBoundingClientRect()
          const root = act.getBoundingClientRect()
          Body.setPosition(part, { x: rect.left - root.left + rect.width / 2, y: rect.top - root.top + rect.height * 220 / VIEWBOX_HEIGHT })
        }
        Body.setStatic(part, true)
        transition('capture')
        later(() => {
          transition('coat-start')
          later(() => {
            transition('coat-complete')
            if (stateRef.current?.phase === 'printing') later(() => transition('print-complete'), PAINT_INSPECTION_TIMING.print)
          }, PAINT_INSPECTION_TIMING.coat)
        }, PAINT_INSPECTION_TIMING.settle)
      }
    }
    const recoverRemovedPart = () => {
      if (activePartIdRef.current && !getPartBody(activePartIdRef.current)) {
        timers.forEach((timer) => window.clearTimeout(timer))
        timers.clear()
        reset()
      }
    }
    Events.on(engine, 'collisionStart', handleCollision)
    Events.on(engine, 'collisionActive', handleCollision)
    Events.on(engine, 'beforeUpdate', recoverRemovedPart)
    return () => {
      Events.off(engine, 'collisionStart', handleCollision)
      Events.off(engine, 'collisionActive', handleCollision)
      Events.off(engine, 'beforeUpdate', recoverRemovedPart)
      timers.forEach((timer) => window.clearTimeout(timer))
      if (activePartIdRef.current) {
        const body = getPartBody(activePartIdRef.current)
        if (body) Body.setStatic(body, false)
      }
      activePartIdRef.current = null
      stateRef.current = null
    }
  }, [engine, getPartBody, updatePartSpec])

  return (
    <div ref={stationRef} className="factory-station paint-inspection" data-factory-station="experience" data-paint-phase={phase} style={style}>
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} aria-hidden="true" focusable="false">
        <path d="M52 60V320M208 60V320" className="factory-line__rail factory-line__rail--white" />
        <g className={`paint-head paint-head--coat${phase === 'coating' ? ' is-active' : ''}`}>
          <path d={`M52 ${geometry.coatHead.y + 14}H${geometry.coatHead.x}`} className="paint-head__mount" />
          <rect x={geometry.coatHead.x} y={geometry.coatHead.y} width={geometry.coatHead.width} height={geometry.coatHead.height} rx="3" />
          <rect x={geometry.coatHead.x + 6} y={geometry.coatHead.y + 8} width="24" height="12" rx="6" className="paint-head__cartridge" />
          <path d={`M${geometry.coatHead.x + 10} ${geometry.coatHead.y + 14}H${geometry.coatHead.x + 26}`} className="paint-head__indicator" />
          <path d={`M${geometry.coatHead.x + geometry.coatHead.width} ${geometry.coatHead.y + 9}L${geometry.coatHead.nozzleX} ${geometry.coatHead.nozzleY} ${geometry.coatHead.x + geometry.coatHead.width} ${geometry.coatHead.y + 19}Z`} className="paint-head__nozzle" />
          <path d={`M${geometry.coatHead.nozzleX} ${geometry.coatHead.nozzleY}L${geometry.coatTarget.x} ${geometry.coatTarget.y}`} className="paint-spray" />
          {coatNeedsMist && <g className="paint-spray__mist"><circle cx="103" cy="188" r="1.5" /><circle cx="110" cy="199" r="1.2" /><circle cx="117" cy="210" r="1" /></g>}
        </g>
        <g className={`paint-head paint-head--print${phase === 'printing' ? ' is-active' : ''}`}>
          <path d={`M${geometry.printHead.x + geometry.printHead.width} ${geometry.printHead.y + 14}H208`} className="paint-head__mount" />
          <rect x={geometry.printHead.x} y={geometry.printHead.y} width={geometry.printHead.width} height={geometry.printHead.height} rx="3" />
          <rect x={geometry.printHead.x + 6} y={geometry.printHead.y + 8} width="24" height="12" rx="6" className="paint-head__cartridge" />
          <path d={`M${geometry.printHead.x + 10} ${geometry.printHead.y + 14}H${geometry.printHead.x + 26}`} className="paint-head__indicator" />
          <path d={`M${geometry.printHead.x} ${geometry.printHead.y + 9}L${geometry.printHead.nozzleX} ${geometry.printHead.nozzleY} ${geometry.printHead.x} ${geometry.printHead.y + 19}Z`} className="paint-head__nozzle" />
          <path d={`M${geometry.printHead.nozzleX} ${geometry.printHead.nozzleY}L${geometry.printTarget.x} ${geometry.printTarget.y}`} className="print-spray" />
          {printNeedsMist && <g className="paint-spray__mist"><circle cx="157" cy="188" r="1.5" /><circle cx="150" cy="199" r="1.2" /><circle cx="143" cy="210" r="1" /></g>}
        </g>
        <path d={`M52 ${geometry.intakeY}H208`} className={`factory-line__rail factory-line__rail--white paint-inspection__intake${busy ? ' is-closed' : ''}`} />
        <path d="M52 244H208" className={`factory-line__rail factory-line__rail--white paint-inspection__gate${gateOpen ? ' is-open' : ''}`} />
        <g className={`paint-inspection__arch${phase === 'inspecting' ? ' is-active' : ''}`}>
          <path d="M60 346V312H200V346" />
          <path d="M70 326H190" className="paint-inspection__scan" />
        </g>
        <path d="M82 454V505M178 454V505" className="factory-line__rail factory-line__rail--white" />
      </svg>
    </div>
  )
}
