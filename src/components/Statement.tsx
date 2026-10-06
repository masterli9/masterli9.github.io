import { useMotionPreference } from '../hooks/useMotionPreference'
import { Fragment, useEffect, useMemo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import StatementRebound from '../factory/stations/StatementRebound'
import { createStatementHeadingReveal } from '../factory/stations/statementReboundModel'
import { shouldStartFactoryLine } from '../factory/factoryFlowModel'
import { useFactoryFlow } from '../factory/FactoryFlowProvider'
import { useLanguage } from '../i18n/useLanguage'

export default function Statement() {
  const { t } = useLanguage()
  const { lineStarted, startLine } = useFactoryFlow()
  const reducedMotion = useMotionPreference()
  const boundaryRef = useRef<HTMLDivElement>(null)
  const reveal = useMemo(() => createStatementHeadingReveal(t.statement.headline.split(/\s+/)), [t.statement.headline])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingVisible = useInView(headingRef, { once: true, amount: 0.2 })

  useEffect(() => {
    const marker = boundaryRef.current
    if (!marker) return
    const checkBoundary = () => {
      const markerTop = marker.getBoundingClientRect().top
      if (shouldStartFactoryLine({ markerTop, viewportHeight: window.innerHeight, lineStarted })) startLine()
    }
    const releaseObserver = new IntersectionObserver(() => checkBoundary(), { threshold: 0.15 })
    releaseObserver.observe(marker)
    window.addEventListener('scroll', checkBoundary, { passive: true })
    window.addEventListener('resize', checkBoundary)
    checkBoundary()
    return () => {
      releaseObserver.disconnect()
      window.removeEventListener('scroll', checkBoundary)
      window.removeEventListener('resize', checkBoundary)
    }
  }, [lineStarted, startLine])

  return (
    <section className="statement-section foundry-page py-28 md:py-44">
      <div ref={boundaryRef} data-factory-boundary="statement" aria-hidden="true" className="pointer-events-none h-px w-full" />
      <div className="foundry-container grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] lg:items-center lg:gap-20">
        <div className="max-w-3xl lg:translate-y-32">
          <div className="factory-reading-surface">
            <h2 ref={headingRef} className="max-w-2xl font-heading text-[clamp(2.4rem,5vw,4.8rem)] font-medium leading-[0.98] tracking-[-0.055em] text-soft-white">
              {reveal.map((item, index) => (
                <Fragment key={item.key}>
                  <motion.span
                    className="inline-block"
                    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                    animate={reducedMotion || headingVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                    transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : item.revealAt }}
                  >
                    {item.word}
                  </motion.span>
                  {index < reveal.length - 1 ? ' ' : null}
                </Fragment>
              ))}
            </h2>
            <motion.p className="mt-8 max-w-xl text-lg leading-relaxed text-soft-white"
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              animate={reducedMotion ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: reducedMotion ? 0 : 0.35, delay: reducedMotion ? 0 : 0.15 }}>
              {t.statement.description}
            </motion.p>
          </div>
        </div>
        <StatementRebound />
      </div>
    </section>
  )
}
