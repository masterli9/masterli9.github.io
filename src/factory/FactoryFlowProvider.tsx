import { useMotionPreference } from '../hooks/useMotionPreference'
/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'


export interface FactoryFlowValue {
  lineStarted: boolean
  startLine: () => void
  finalWebsiteAssembled: boolean
  markFinalWebsiteAssembled: () => void
  reducedMotion: boolean
}

const FactoryFlowContext = createContext<FactoryFlowValue | null>(null)

export function FactoryFlowProvider({ children }: { children: ReactNode }) {
  const [lineStarted, setLineStarted] = useState(false)
  const [finalWebsiteAssembled, setFinalWebsiteAssembled] = useState(false)
  const reducedMotion = useMotionPreference()

  const startLine = useCallback(() => setLineStarted(true), [])
  const markFinalWebsiteAssembled = useCallback(() => setFinalWebsiteAssembled(true), [])
  const value = useMemo(() => ({
    lineStarted,
    startLine,
    finalWebsiteAssembled,
    markFinalWebsiteAssembled,
    reducedMotion,
  }), [finalWebsiteAssembled, lineStarted, markFinalWebsiteAssembled, reducedMotion, startLine])

  return <FactoryFlowContext.Provider value={value}>{children}</FactoryFlowContext.Provider>
}

export function useFactoryFlow() {
  const context = useContext(FactoryFlowContext)
  if (!context) throw new Error('useFactoryFlow must be used inside FactoryFlowProvider')
  return context
}
