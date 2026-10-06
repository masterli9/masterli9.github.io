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
  Composite,
  Engine,
  type Body as MatterBody,
} from 'matter-js'
import {
  createFactoryPartSpec,
  getFactoryActBand,
  getFactoryActiveLimit,
  getReducedFactorySnapshot,
  serializeFactoryPart,
  shouldSpawnFactoryPart,
  shouldRecycleFactoryPart,
  shouldRecycleFactoryPartAtActBoundary,
  shouldRunFactoryPhysics,
  shouldTeardownAct,
} from './factoryFlowModel'
import type {
  FactoryActId,
  FactoryPartSnapshot,
  FactoryPartSpec,
  FactoryStationId,
} from './factoryTypes'
import { FactoryPartGraphic } from './FactoryPartGraphic'
import { createFactoryBody } from './factoryPartPhysics'
import { FactoryFlowProvider, useFactoryFlow } from './FactoryFlowProvider'
import { FACTORY_STREAM_CADENCE_MS, FORMING_PRESS_ENTRY_VELOCITY_Y } from './stations/formingPressModel'
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
  simulationActive: boolean
  engine: Engine
  spawnPart: (
    spec: FactoryPartSpec,
    snapshot: Omit<FactoryPartSnapshot, keyof FactoryPartSpec>,
  ) => void
  registerStation: (registration: FactoryStationRegistration) => () => void
  getPartBody: (id: string) => MatterBody | undefined
  removePart: (id: string) => void
  fadeOutPart: (id: string) => void
  updatePartSpec: (id: string, patch: Partial<Pick<FactoryPartSpec, 'shape' | 'stage' | 'role' | 'finish' | 'assemblySlot' | 'coated'>>) => void
}

const FactoryActContext = createContext<FactoryActApi | null>(null)

interface LivePart {
  body: MatterBody
  spec: FactoryPartSpec
}

const FACTORY_PART_FADE_OUT_MS = 260

export function FactoryAct({ id, children }: { id: FactoryActId; children: React.ReactNode }) {
  const { reducedMotion } = useFactoryFlow()
  const rootRef = useRef<HTMLDivElement>(null)
  const registrationsRef = useRef(new Map<FactoryStationId, FactoryStationRegistration>())
  const collidersRef = useRef(new Map<FactoryStationId, MatterBody[]>())
  const partsRef = useRef(new Map<string, LivePart>())
  const fadingPartsRef = useRef(new Map<string, FactoryPartSnapshot>())
  const suspendedPartsRef = useRef<FactoryPartSnapshot[]>([])
  const lowerSequenceRef = useRef(0)
  const engineClearedRef = useRef(false)
  const [parts, setParts] = useState<FactoryPartSnapshot[]>([])
  const [viewport, setViewport] = useState({ width: 1, height: 1 })
  const [isVisible, setIsVisible] = useState(false)
  const [isSuspended, setIsSuspended] = useState(false)
  const [documentVisible, setDocumentVisible] = useState(() => document.visibilityState === 'visible')
  const [engine] = useState(() => Engine.create({ gravity: { x: 0, y: 1, scale: 0.00145 } }))
  const physicsRunning = shouldRunFactoryPhysics({
    actVisible: isVisible,
    documentVisible,
    reducedMotion,
  })
  const simulationActive = physicsRunning && !isSuspended

  const refreshRenderedParts = useCallback(() => {
    setParts([
      ...Array.from(partsRef.current.values(), ({ body, spec }) => serializeFactoryPart(body, spec)),
      ...fadingPartsRef.current.values(),
    ])
  }, [])

  const measure = useCallback(() => {
    const root = rootRef.current
    if (!root || engineClearedRef.current) return
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
    refreshRenderedParts()
  }, [engine, refreshRenderedParts])

  const getPartBody = useCallback((id: string) => partsRef.current.get(id)?.body, [])

  const removePart = useCallback((id: string) => {
    const livePart = partsRef.current.get(id)
    if (!livePart) return
    Composite.remove(engine.world, livePart.body, true)
    partsRef.current.delete(id)
    refreshRenderedParts()
  }, [engine, refreshRenderedParts])

  const fadeOutPart = useCallback((id: string) => {
    const livePart = partsRef.current.get(id)
    if (!livePart || fadingPartsRef.current.has(id)) return
    const snapshot = { ...serializeFactoryPart(livePart.body, livePart.spec), fading: true }
    Composite.remove(engine.world, livePart.body, true)
    partsRef.current.delete(id)
    fadingPartsRef.current.set(id, snapshot)
    refreshRenderedParts()
    window.setTimeout(() => {
      if (fadingPartsRef.current.get(id) !== snapshot) return
      fadingPartsRef.current.delete(id)
      refreshRenderedParts()
    }, FACTORY_PART_FADE_OUT_MS)
  }, [engine, refreshRenderedParts])

  const updatePartSpec = useCallback((id: string, patch: Partial<Pick<FactoryPartSpec, 'shape' | 'stage' | 'role' | 'finish' | 'assemblySlot' | 'coated'>>) => {
    const livePart = partsRef.current.get(id)
    if (!livePart) return
    const snapshot = serializeFactoryPart(livePart.body, livePart.spec)
    const spec = { ...livePart.spec, ...patch }
    if (spec.shape === livePart.spec.shape) {
      livePart.spec = spec
      livePart.body.plugin.factoryPartSpec = spec
      refreshRenderedParts()
      return
    }
    const body = createFactoryBody(spec, snapshot)
    Composite.remove(engine.world, livePart.body, true)
    partsRef.current.set(id, { body, spec })
    Composite.add(engine.world, body)
    refreshRenderedParts()
  }, [engine, refreshRenderedParts])

  const suspendAct = useCallback(() => {
    if (engineClearedRef.current) return
    suspendedPartsRef.current = Array.from(
      partsRef.current.values(),
      ({ body, spec }) => serializeFactoryPart(body, spec),
    )
    for (const { body } of partsRef.current.values()) Composite.remove(engine.world, body, true)
    for (const colliders of collidersRef.current.values()) Composite.remove(engine.world, colliders, true)
    partsRef.current.clear()
    collidersRef.current.clear()
    fadingPartsRef.current.clear()
    Engine.clear(engine)
    engineClearedRef.current = true
    setIsSuspended(true)
    setParts([])
  }, [engine])

  const restoreAct = useCallback(() => {
    if (!engineClearedRef.current) return
    for (const snapshot of suspendedPartsRef.current) {
      const body = createFactoryBody(snapshot, snapshot)
      partsRef.current.set(snapshot.id, { body, spec: snapshot })
      Composite.add(engine.world, body)
    }
    suspendedPartsRef.current = []
    engineClearedRef.current = false
    setIsSuspended(false)
    measure()
    refreshRenderedParts()
  }, [engine, measure, refreshRenderedParts])

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
    if (!simulationActive) return
    let frame = 0
    let previousTime = performance.now()
    const tick = (time: number) => {
      frame = window.requestAnimationFrame(tick)
      const root = rootRef.current
      if (!root || document.visibilityState !== 'visible') {
        previousTime = time
        return
      }
      const delta = Math.min(time - previousTime, 1000 / 60)
      previousTime = time
      Engine.update(engine, delta)
      const viewportTop = window.scrollY
      const rootRect = root.getBoundingClientRect()
      const band = getFactoryActBand(id, viewportTop, window.innerHeight, {
        minY: rootRect.top + window.scrollY,
        maxY: rootRect.bottom + window.scrollY,
      })
      for (const [id, livePart] of partsRef.current) {
        const y = livePart.body.position.y + rootRect.top + window.scrollY
        const reachedActBoundary = shouldRecycleFactoryPartAtActBoundary(
          livePart.body.bounds.max.y,
          rootRect.height,
        )
        if (!reachedActBoundary && !shouldRecycleFactoryPart(y, band)) continue
        Composite.remove(engine.world, livePart.body, true)
        partsRef.current.delete(id)
      }
      refreshRenderedParts()
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [engine, id, refreshRenderedParts, simulationActive])

  useEffect(() => {
    if (id !== 'lower') return
    if (!shouldSpawnFactoryPart({
      actVisible: simulationActive,
      documentVisible: document.visibilityState === 'visible',
      reducedMotion,
    })) return
    const spawnAtSkillsEntry = () => {
      if (!shouldSpawnFactoryPart({
        actVisible: simulationActive,
        documentVisible: document.visibilityState === 'visible',
        reducedMotion,
      })) return
      if (partsRef.current.size >= getFactoryActiveLimit(window.innerWidth)) return
      const root = rootRef.current
      if (!root) return
      const station = root.querySelector<HTMLElement>('[data-factory-station="skills"]')
      const rootRect = root.getBoundingClientRect()
      const stationRect = station?.getBoundingClientRect()
      const x = stationRect
        ? stationRect.left - rootRect.left + (stationRect.width / 2)
        : root.clientWidth * 0.82
      const y = 0
      spawnPart({
        ...createFactoryPartSpec(lowerSequenceRef.current, 'raw'),
        scaleX: 1.25,
        scaleY: 1.5,
      }, {
        x,
        y,
        velocityX: 0,
        velocityY: FORMING_PRESS_ENTRY_VELOCITY_Y,
        angle: 0,
        angularVelocity: 0,
      })
      lowerSequenceRef.current += 1
    }
    const initial = window.setTimeout(spawnAtSkillsEntry, 80)
    if (reducedMotion) return () => window.clearTimeout(initial)
    const interval = window.setInterval(spawnAtSkillsEntry, FACTORY_STREAM_CADENCE_MS)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
    }
  }, [id, reducedMotion, simulationActive, spawnPart])

  useEffect(() => {
    if (!reducedMotion) return
    const liveParts = partsRef.current
    let frame = 0
    const seedReducedSnapshot = () => {
      const root = rootRef.current
      if (!root) return
      const rootRect = root.getBoundingClientRect()
      for (const registration of registrationsRef.current.values()) {
        const stationRect = registration.element.getBoundingClientRect()
        for (const snapshot of getReducedFactorySnapshot(registration.id)) {
          if (partsRef.current.has(snapshot.id)) continue
          const spec: FactoryPartSpec = {
            id: snapshot.id,
            sequence: snapshot.sequence,
            shape: snapshot.shape,
            role: snapshot.role,
            finish: snapshot.finish,
            assemblySlot: snapshot.assemblySlot,
            stage: snapshot.stage,
          }
          const body = createFactoryBody(spec, {
            x: stationRect.left - rootRect.left + (stationRect.width * snapshot.xRatio),
            y: stationRect.top - rootRect.top + (stationRect.height * snapshot.yRatio),
            velocityX: 0,
            velocityY: 0,
            angle: snapshot.angle,
            angularVelocity: 0,
          })
          partsRef.current.set(spec.id, { body, spec })
          Composite.add(engine.world, body)
        }
      }
      refreshRenderedParts()
    }
    frame = window.requestAnimationFrame(seedReducedSnapshot)
    return () => {
      window.cancelAnimationFrame(frame)
      for (const [id, { body }] of liveParts) {
        if (!id.startsWith('reduced-')) continue
        Composite.remove(engine.world, body, true)
        liveParts.delete(id)
      }
      suspendedPartsRef.current = suspendedPartsRef.current.filter(({ id }) => !id.startsWith('reduced-'))
      refreshRenderedParts()
    }
  }, [engine, reducedMotion, refreshRenderedParts])

  useEffect(() => {
    const syncDocumentVisibility = () => {
      setDocumentVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', syncDocumentVisibility)
    return () => document.removeEventListener('visibilitychange', syncDocumentVisibility)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry?.isIntersecting ?? false)
    }, { rootMargin: '200% 0px 300% 0px' })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || !documentVisible) return
    const acts = Array.from(document.querySelectorAll<HTMLElement>('[data-factory-act]'))
    const visibleActs = new Map<Element, boolean>(acts.map((element) => {
      const rect = element.getBoundingClientRect()
      return [element, rect.bottom >= 0 && rect.top <= window.innerHeight]
    }))
    const reconcileBoundary = () => {
      const intersects = visibleActs.get(root) ?? false
      const neighborVisible = acts
        .filter((element) => element !== root)
        .some((element) => visibleActs.get(element) ?? false)
      if (shouldTeardownAct({ intersects, neighborVisible, documentVisible: true })) suspendAct()
      else restoreAct()
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) visibleActs.set(entry.target, entry.isIntersecting)
      reconcileBoundary()
    })
    for (const act of acts) observer.observe(act)
    reconcileBoundary()
    return () => observer.disconnect()
  }, [documentVisible, restoreAct, suspendAct])

  useEffect(() => () => {
    for (const { body } of partsRef.current.values()) Composite.remove(engine.world, body, true)
    for (const colliders of collidersRef.current.values()) Composite.remove(engine.world, colliders, true)
    partsRef.current.clear()
    collidersRef.current.clear()
    registrationsRef.current.clear()
    Engine.clear(engine)
  }, [engine])

  const api = useMemo(() => ({ actId: id, simulationActive, engine, spawnPart, registerStation, getPartBody, removePart, fadeOutPart, updatePartSpec }), [engine, fadeOutPart, getPartBody, id, registerStation, removePart, simulationActive, spawnPart, updatePartSpec])

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
