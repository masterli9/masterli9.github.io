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
  onPlacementComplete: (partId: string) => void
}

export function FinalAssemblerScene({
  stationRef, state, capturePose, reducedMotion, onPlacementComplete,
}: FinalAssemblerSceneProps) {
  const assemblyState = state.assembled ? 'complete' : state.active ? 'placing' : 'collecting'
  return (
    <div
      ref={stationRef}
      className={`factory-station final-assembler${state.assembled ? ' is-assembled' : ''}`}
      data-factory-station="contact"
      data-assembly-state={assemblyState}
      data-overflow-count={state.overflowedIds.length}
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${FINAL_ASSEMBLER_VIEWBOX.width} ${FINAL_ASSEMBLER_VIEWBOX.height}`} focusable="false">
        <path d="M40 170 320 158 600 170V555H40Z" className="final-assembler__nova-frame" />
        <path d="M40 215H600M360 215V555" className="final-assembler__nova-grid" />
        <path d="M40 170 320 158 600 170" className="final-assembler__roof" />
        <path d="M72 145H568" className="final-assembler__intake" />
        {FINAL_ASSEMBLY_SLOTS.map((slot) => {
          const target = FINAL_ASSEMBLY_LAYOUT[slot]
          const part = state.placements[slot]
          return part ? (
            <g key={slot} data-assembly-slot={slot} transform={`translate(${target.x} ${target.y}) rotate(${target.rotation}) scale(${target.scale})`}>
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
              initial={{ x: capturePose.x, y: capturePose.y, rotate: capturePose.angleDegrees, scale: 1 }}
              animate={reducedMotion ? { x: target.x, y: target.y, rotate: target.rotation, scale: target.scale } : {
                x: [capturePose.x, bendX, target.x],
                y: [capturePose.y, NOVA_FRAME.y - 24, target.y],
                rotate: [capturePose.angleDegrees, 0, target.rotation],
                scale: [1, 0.92, target.scale],
              }}
              transition={{ duration: reducedMotion ? 0 : 0.64, times: [0, 0.36, 1], ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => onPlacementComplete(state.active!.part.id)}
            >
              <FactoryPartGraphic part={{ ...state.active.part, stage: 'assembled' }} />
            </motion.g>
          )
        })()}
        <path d="M54 536H586" className="final-assembler__activation" />
      </svg>
    </div>
  )
}
