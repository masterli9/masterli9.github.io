export interface FoundryTraceProps {
  variant?: 'rail' | 'module' | 'frame' | 'inspection'
  className?: string
  ariaHidden?: boolean
}

const tracePaths = {
  rail: (
    <>
      <path d="M4 12h72" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="14" cy="12" r="2" fill="currentColor" />
      <circle cx="66" cy="12" r="2" fill="currentColor" />
    </>
  ),
  module: <rect x="3" y="3" width="18" height="18" fill="currentColor" />,
  frame: (
    <>
      <rect x="2" y="2" width="42" height="28" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M8 10h16M8 15h11M8 20h20" fill="none" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  inspection: <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1" />,
} as const

export default function FoundryTrace({ variant = 'rail', className = '', ariaHidden = true }: FoundryTraceProps) {
  const dimensions = {
    rail: '0 0 80 24',
    module: '0 0 24 24',
    frame: '0 0 46 32',
    inspection: '0 0 24 24',
  }[variant]

  return (
    <svg
      viewBox={dimensions}
      className={className}
      role={ariaHidden ? undefined : 'img'}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : 'Interface construction trace'}
      focusable="false"
    >
      {tracePaths[variant]}
    </svg>
  )
}
