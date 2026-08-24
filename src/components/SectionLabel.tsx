import type { ReactNode } from 'react'

export interface SectionLabelProps {
  index: string
  children: ReactNode
  tone?: 'dark' | 'light'
}

export default function SectionLabel({ index, children, tone = 'dark' }: SectionLabelProps) {
  const isDark = tone === 'dark'
  return (
    <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-ink' : 'text-soft-white'}`}>
      <span className="font-mono text-xs text-signal-pink">{index}</span>
      <span className={`h-px w-8 ${isDark ? 'bg-ink/30' : 'bg-white-line'}`} aria-hidden="true" />
      <span className="font-semibold">{children}</span>
    </div>
  )
}
