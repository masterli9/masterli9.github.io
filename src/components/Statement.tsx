import { useEffect, useRef } from 'react'
import FoundryTrace from './FoundryTrace'
import { useLanguage } from '../i18n/useLanguage'
import { useFactoryFlow } from '../factory/FactoryFlowProvider'

export default function Statement() {
  const { t } = useLanguage()
  const { startLine } = useFactoryFlow()
  const boundaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const marker = boundaryRef.current
    if (!marker) return
    const releaseObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) startLine()
      },
      { threshold: 0.15 },
    )
    releaseObserver.observe(marker)
    return () => releaseObserver.disconnect()
  }, [startLine])

  return (
    <section className="foundry-page py-28 md:py-44">
      <div ref={boundaryRef} data-factory-boundary="statement" aria-hidden="true" className="pointer-events-none h-px w-full" />
      <div className="foundry-container grid gap-10 md:grid-cols-[minmax(8rem,0.35fr)_minmax(0,1fr)] md:gap-16">
        <div className="flex items-start gap-4 pt-2">
          <FoundryTrace variant="rail" className="mt-1 h-6 w-20 text-line-gray" />
          <p className="foundry-label">{t.statement.label}</p>
        </div>
        <div className="max-w-3xl">
          <h2 className="max-w-2xl font-heading text-[clamp(2.4rem,5vw,4.8rem)] font-medium leading-[0.98] tracking-[-0.055em] text-soft-white">
            {t.statement.headline}
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
            {t.statement.description}
          </p>
        </div>
      </div>
    </section>
  )
}
