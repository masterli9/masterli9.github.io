import { motion, useReducedMotion } from 'framer-motion'
import './assembly/assembly.css'

export type AssemblyCellMode =
  | 'hero'
  | 'selected-work'
  | 'trace'
  | 'queue'
  | 'static'

export interface AssemblyCellProps {
  mode?: AssemblyCellMode
  className?: string
  labelledBy?: string
}

const modulePositions = [
  { x: 26, y: 50, color: 'text-signal-pink' },
  { x: 72, y: 50, color: 'text-cobalt' },
  { x: 118, y: 50, color: 'text-soft-white' },
] as const

export default function AssemblyCell({ mode = 'hero', className = '', labelledBy }: AssemblyCellProps) {
  const reducedMotion = useReducedMotion()
  const shouldAnimate = mode !== 'static' && reducedMotion !== true
  const moduleCount = mode === 'queue' ? 3 : mode === 'trace' ? 2 : 3
  const stableOutput = mode === 'selected-work' || mode === 'static' || reducedMotion === true

  return (
    <svg
      viewBox="0 0 240 150"
      className={`assembly-cell assembly-cell--${mode} ${className}`.trim()}
      role="img"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : 'Interface assembly cell'}
      focusable="false"
    >
      <title id={labelledBy ? undefined : `assembly-cell-title-${mode}`}>Interface assembly cell</title>
      <g className="assembly-cell__rail text-line-gray">
        <path d="M18 60H166" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M18 92H166" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <circle cx="18" cy="60" r="2" fill="currentColor" />
        <circle cx="166" cy="60" r="2" fill="currentColor" />
      </g>

      {modulePositions.slice(0, moduleCount).map((module, index) => (
        <motion.g
          key={module.x}
          className={`assembly-cell__module ${module.color}`}
          data-module-index={index}
          initial={shouldAnimate ? { x: -30, opacity: 0.2 } : { x: stableOutput ? 0 : -30, opacity: 1 }}
          animate={shouldAnimate
            ? { x: [-30, 0, 0, 0], opacity: [0.2, 1, 1, 0.35] }
            : { x: 0, opacity: 1 }}
          transition={shouldAnimate
            ? {
                duration: 9,
                delay: index * 1.3,
                repeat: Infinity,
                repeatDelay: 2.5,
                times: [0, 0.28, 0.58, 1],
                ease: 'easeInOut',
              }
            : { duration: 0 }}
        >
          <rect x={module.x} y={module.y} width="18" height="18" fill="currentColor" />
        </motion.g>
      ))}

      <motion.path
        d="M166 60h20v18h22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className={`assembly-cell__output ${stableOutput ? 'assembly-cell__output--active' : ''}`}
        initial={shouldAnimate ? { pathLength: 0.35, opacity: 0.45 } : { pathLength: 1, opacity: 1 }}
        animate={shouldAnimate ? { pathLength: [0.35, 1, 1, 0.35], opacity: [0.45, 1, 1, 0.45] } : { pathLength: 1, opacity: 1 }}
        transition={shouldAnimate
          ? { duration: 9, repeat: Infinity, repeatDelay: 2.5, times: [0, 0.35, 0.7, 1], ease: 'easeInOut' }
          : { duration: 0 }}
      />

      <motion.rect
        x="208"
        y="54"
        width="24"
        height="36"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className={`assembly-cell__output ${stableOutput ? 'assembly-cell__output--active' : ''}`}
        initial={shouldAnimate ? { opacity: 0.45 } : { opacity: 1 }}
        animate={shouldAnimate ? { opacity: [0.45, 1, 1, 0.45] } : { opacity: 1 }}
        transition={shouldAnimate
          ? { duration: 9, repeat: Infinity, repeatDelay: 2.5, times: [0, 0.35, 0.7, 1], ease: 'easeInOut' }
          : { duration: 0 }}
      />

      <path d="M214 63h12M214 70h8M214 77h14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.65" />
      <rect x="24" y="108" width="8" height="8" fill="currentColor" opacity="0.8" />
      <path d="M38 112h76" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}
