import { motion } from 'framer-motion'
import type { RefObject } from 'react'
import { FactoryPartGraphic } from '../FactoryPartGraphic'
import {
  FINAL_ASSEMBLER_VIEWBOX,
  FINAL_ASSEMBLY_LAYOUT,
  FINAL_ASSEMBLY_SLOTS,
  NOVA_FRAME,
  type FinalAssemblerCapturePose,
  type FinalAssemblyState,
} from './contactAssemblyModel'

interface FinalAssemblerSceneProps {
  stationRef: RefObject<HTMLDivElement | null>
  state: FinalAssemblyState
  capturePose: FinalAssemblerCapturePose | null
  reducedMotion: boolean
  assemblyPlaying: boolean
  onPlacementComplete: (partId: string) => void
}

export function FinalAssemblerScene({
  stationRef, state, capturePose, reducedMotion, assemblyPlaying, onPlacementComplete,
}: FinalAssemblerSceneProps) {
  // Reveal the page alongside the first three arrivals, not after the hero is complete.
  const arrivalCount = Object.keys(state.placements).length + (state.active ? 1 : 0)
  const reveal = (arrival: number, delay = 0) => {
    const visible = reducedMotion || arrivalCount >= arrival
    return {
      initial: false as const,
      animate: { opacity: visible ? 1 : 0, y: visible ? 0 : -12 },
      transition: { duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
    }
  }
  const assemblyState = state.assembled ? 'complete' : state.active ? 'placing' : 'collecting'
  return (
    <div
      ref={stationRef}
      className={`factory-station final-assembler${state.assembled ? ' is-assembled' : ''}`}
      data-factory-station="contact"
      data-assembly-state={assemblyState}
      data-assembly-playing={assemblyPlaying}
      data-overflow-count={state.overflowedIds.length}
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${FINAL_ASSEMBLER_VIEWBOX.width} ${FINAL_ASSEMBLER_VIEWBOX.height}`} focusable="false">
        <rect x={NOVA_FRAME.x} y={NOVA_FRAME.y} width={NOVA_FRAME.width} height={NOVA_FRAME.height} rx="14" className="final-assembler__nova-frame" />
          <motion.g data-page-reveal="chrome" {...reveal(0)} className="final-assembler__browser-chrome">
            <circle cx="44" cy="98" r="3" /><circle cx="56" cy="98" r="3" /><circle cx="68" cy="98" r="3" />
            <rect x="242" y="94" width="156" height="8" rx="4" className="final-assembler__text-line" />
            <path d="M24 116H616" />
          </motion.g>
          <motion.g data-page-reveal="navigation" {...reveal(1, 0.12)}>
            <text x="92" y="150" className="final-assembler__wordmark">NOVA</text>
            <rect x="404" y="142" width="40" height="6" rx="3" className="final-assembler__text-line" />
            <rect x="468" y="142" width="40" height="6" rx="3" className="final-assembler__text-line" />
          </motion.g>
          <motion.g data-page-reveal="copy" {...reveal(2)}>
            <rect x="70" y="325" width="204" height="6" rx="3" className="final-assembler__text-line" />
            <rect x="99" y="336" width="146" height="5" rx="2.5" className="final-assembler__text-line" />
          </motion.g>
          <motion.g data-page-reveal="footer" {...reveal(3)}>
            <rect x="62" y="410" width="516" height="76" rx="8" className="final-assembler__footer" />
            {[82, 260, 438].map((x) => (
              <g key={x}>
                <rect x={x} y="450" width="112" height="7" rx="3.5" className="final-assembler__text-line" />
                <rect x={x} y="466" width="72" height="5" rx="2.5" className="final-assembler__text-line" />
              </g>
            ))}
          </motion.g>
        {FINAL_ASSEMBLY_SLOTS.map((slot) => {
          const target = FINAL_ASSEMBLY_LAYOUT[slot]
          const part = state.placements[slot]
          return part ? (
            <g key={slot} data-assembly-slot={slot} data-assembly-part-id={part.id} data-assembly-shape={part.shape} transform={`translate(${target.x} ${target.y}) rotate(${target.rotation}) scale(${target.scale} ${target.scaleY ?? target.scale})`}>
              <FactoryPartGraphic part={part} />
            </g>
          ) : (
            <rect
              key={slot}
              data-slot-placeholder={slot}
              x={target.x - target.guideWidth / 2}
              y={target.y - target.guideHeight / 2}
              width={target.guideWidth}
              height={target.guideHeight}
              rx="5"
              className="final-assembler__slot"
            />
          )
        })}
        {state.active && capturePose && (() => {
          const target = FINAL_ASSEMBLY_LAYOUT[state.active.slot]
          const bendX = capturePose.x + ((target.x - capturePose.x) * 0.34)
          return (
            <motion.g
              key={state.active.part.id}
              data-assembly-active={state.active.part.id}
              initial={{ x: capturePose.x, y: capturePose.y, rotate: capturePose.angleDegrees, scaleX: capturePose.scaleX, scaleY: capturePose.scaleY }}
              animate={reducedMotion ? { x: target.x, y: target.y, rotate: target.rotation, scaleX: target.scale, scaleY: target.scaleY ?? target.scale } : {
                x: [capturePose.x, bendX, target.x],
                y: [capturePose.y, NOVA_FRAME.y - 24, target.y],
                rotate: [capturePose.angleDegrees, 0, target.rotation],
                scaleX: [capturePose.scaleX, 0.92, target.scale],
                scaleY: [capturePose.scaleY, 0.92, target.scaleY ?? target.scale],
              }}
              transition={{ duration: reducedMotion ? 0 : 0.64, times: [0, 0.36, 1], ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => onPlacementComplete(state.active!.part.id)}
            >
              <FactoryPartGraphic part={{ ...state.active.part, stage: 'assembled', scaleX: 1, scaleY: 1 }} />
            </motion.g>
          )
        })()}
        <path d="M62 492H578" className="final-assembler__activation" />
      </svg>
    </div>
  )
}
