/* eslint-disable react-refresh/only-export-components */
import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import {
  Body,
  Bodies,
  Composite,
  Engine,
  type Body as MatterBody,
} from 'matter-js'
import { getActiveBand, serializeFactoryPart, shouldRecycleFactoryPart } from './factoryFlowModel'
import type {
  FactoryActId,
  FactoryPartSnapshot,
  FactoryPartSpec,
  FactoryStationId,
} from './factoryTypes'
import { FactoryPartGraphic } from './FactoryPartGraphic'
import { FactoryFlowProvider, useFactoryFlow } from './FactoryFlowProvider'
import './factory-line.css'

export interface FactoryStationMetrics {
  elementRect: DOMRect
  actRect: DOMRect
}

export interface FactoryStationRegistration {
  id: FactoryStationId
  element: HTMLElement
  buildColliders: (metrics: FactoryStationMetrics) => MatterBody[]
}

export interface FactoryActApi {
  actId: FactoryActId
  engine: Engine
  spawnPart: (
    spec: FactoryPartSpec,
    snapshot: Omit<FactoryPartSnapshot, keyof FactoryPartSpec>,
  ) => void
  registerStation: (registration: FactoryStationRegistration) => () => void
  getPartBody: (id: string) => MatterBody | undefined
  removePart: (id: string) => void
}

const FactoryActContext = createContext<FactoryActApi | null>(null)

function createFactoryBody(spec: FactoryPartSpec, snapshot: Omit<FactoryPartSnapshot, keyof FactoryPartSpec>) {
  const options = {
    friction: 0.16,
    frictionAir: 0.008,
    restitution: 0.12,
    density: 0.0018,
    label: `factory-part-${spec.id}`,
  }
  const body = spec.shape === 'circle' || spec.shape === 'radio'
    ? Bodies.circle(snapshot.x, snapshot.y, spec.shape === 'radio' ? 9 : 12, options)
    : spec.shape === 'bar' || spec.shape === 'button'
      ? Bodies.rectangle(snapshot.x, snapshot.y, spec.shape === 'button' ? 36 : 30, spec.shape === 'button' ? 16 : 13, options)
      : spec.shape === 'toggle'
        ? Bodies.rectangle(snapshot.x, snapshot.y, 40, 20, options)
        : Bodies.rectangle(snapshot.x, snapshot.y, 22, 22, options)

  Body.setAngle(body, snapshot.angle)
  Body.setVelocity(body, { x: snapshot.velocityX, y: snapshot.velocityY })
  Body.setAngularVelocity(body, snapshot.angularVelocity)
  return body
}

interface LivePart {
  body: MatterBody
  spec: FactoryPartSpec
}

export function FactoryAct({ id, children }: { id: FactoryActId; children: React.ReactNode }) {
  const { reducedMotion } = useFactoryFlow()
  const rootRef = useRef<HTMLDivElement>(null)
  const registrationsRef = useRef(new Map<FactoryStationId, FactoryStationRegistration>())
  const collidersRef = useRef(new Map<FactoryStationId, MatterBody[]>())
  const partsRef = useRef(new Map<string, LivePart>())
  const [parts, setParts] = useState<FactoryPartSnapshot[]>([])
  const [viewport, setViewport] = useState({ width: 1, height: 1 })
  const [isVisible, setIsVisible] = useState(true)
  const [engine] = useState(() => Engine.create({ gravity: { x: 0, y: 1, scale: 0.00145 } }))

  const measure = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    const rootRect = root.getBoundingClientRect()
    setViewport({ width: Math.max(root.clientWidth, 1), height: Math.max(rootRect.height, 1) })
    for (const [id, registration] of registrationsRef.current) {
      const previous = collidersRef.current.get(id) ?? []
      Composite.remove(engine.world, previous, true)
      const colliders = registration.buildColliders({
        elementRect: registration.element.getBoundingClientRect(),
        actRect: rootRect,
      })
      collidersRef.current.set(id, colliders)
      Composite.add(engine.world, colliders)
    }
  }, [engine])

  const registerStation = useCallback((registration: FactoryStationRegistration) => {
    registrationsRef.current.set(registration.id, registration)
    measure()
    return () => {
      const current = registrationsRef.current.get(registration.id)
      if (current !== registration) return
      registrationsRef.current.delete(registration.id)
      const colliders = collidersRef.current.get(registration.id) ?? []
      Composite.remove(engine.world, colliders, true)
      collidersRef.current.delete(registration.id)
    }
  }, [engine, measure])

  const spawnPart = useCallback((spec: FactoryPartSpec, snapshot: Omit<FactoryPartSnapshot, keyof FactoryPartSpec>) => {
    if (partsRef.current.has(spec.id)) return
    const body = createFactoryBody(spec, snapshot)
    partsRef.current.set(spec.id, { body, spec })
    Composite.add(engine.world, body)
    setParts(Array.from(partsRef.current.values(), ({ body: currentBody, spec: currentSpec }) => serializeFactoryPart(currentBody, currentSpec)))
  }, [engine])

  const getPartBody = useCallback((id: string) => partsRef.current.get(id)?.body, [])

  const removePart = useCallback((id: string) => {
    const livePart = partsRef.current.get(id)
    if (!livePart) return
    Composite.remove(engine.world, livePart.body, true)
    partsRef.current.delete(id)
    setParts(Array.from(partsRef.current.values(), ({ body: currentBody, spec: currentSpec }) => serializeFactoryPart(currentBody, currentSpec)))
  }, [engine])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let frame = 0
    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(measure)
    }
    const resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(root)
    for (const registration of registrationsRef.current.values()) resizeObserver.observe(registration.element)
    scheduleMeasure()
    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
    }
  }, [measure])

  useEffect(() => {
    if (reducedMotion) return
    let frame = 0
    let previousTime = performance.now()
    const tick = (time: number) => {
      frame = window.requestAnimationFrame(tick)
      const root = rootRef.current
      if (!root || document.visibilityState !== 'visible' || !isVisible) {
        previousTime = time
        return
      }
      const delta = Math.min(time - previousTime, 1000 / 60)
      previousTime = time
      Engine.update(engine, delta)
      const viewportTop = window.scrollY
      const band = getActiveBand(viewportTop, window.innerHeight)
      for (const [id, livePart] of partsRef.current) {
        const y = livePart.body.position.y + root.getBoundingClientRect().top + window.scrollY
        if (!shouldRecycleFactoryPart(y, band)) continue
        Composite.remove(engine.world, livePart.body, true)
        partsRef.current.delete(id)
      }
      setParts(Array.from(partsRef.current.values(), ({ body: currentBody, spec: currentSpec }) => serializeFactoryPart(currentBody, currentSpec)))
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [engine, isVisible, reducedMotion])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry?.isIntersecting ?? false)
    }, { rootMargin: '200% 0px 300% 0px' })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => {
    for (const { body } of partsRef.current.values()) Composite.remove(engine.world, body, true)
    for (const colliders of collidersRef.current.values()) Composite.remove(engine.world, colliders, true)
    partsRef.current.clear()
    collidersRef.current.clear()
    registrationsRef.current.clear()
    Engine.clear(engine)
  }, [engine])

  const api = useMemo(() => ({ actId: id, engine, spawnPart, registerStation, getPartBody, removePart }), [engine, getPartBody, id, registerStation, removePart, spawnPart])

  return (
    <FactoryActContext.Provider value={api}>
      <div ref={rootRef} className="factory-act" data-factory-act={id}>
        {children}
        <svg
          className="factory-line__parts"
          viewBox={`0 0 ${viewport.width} ${viewport.height}`}
          width={viewport.width}
          height={viewport.height}
          aria-hidden="true"
          focusable="false"
        >
          {parts.map((part) => <FactoryPartGraphic key={part.id} part={part} />)}
        </svg>
      </div>
    </FactoryActContext.Provider>
  )
}

export function useFactoryAct() {
  const context = useContext(FactoryActContext)
  if (!context) throw new Error('useFactoryAct must be used inside FactoryAct')
  return context
}

export interface UseFactoryStationInput {
  id: FactoryStationId
  elementRef: RefObject<HTMLElement | null>
  buildColliders: (metrics: FactoryStationMetrics) => MatterBody[]
}

export function useFactoryStation({ id, elementRef, buildColliders }: UseFactoryStationInput) {
  const act = useFactoryAct()
  useEffect(() => {
    const element = elementRef.current
    if (!element) return undefined
    return act.registerStation({ id, element, buildColliders })
  }, [act, buildColliders, elementRef, id])
}

export { FactoryFlowProvider }
