import { Fragment, useEffect, useMemo, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import StatementRebound from '../factory/stations/StatementRebound'
import { createStatementReveal } from '../factory/stations/statementReboundModel'
import { useFactoryFlow } from '../factory/FactoryFlowProvider'
import { useLanguage } from '../i18n/useLanguage'

export default function Statement() {
  const { t } = useLanguage()
  const { startLine } = useFactoryFlow()
  const reducedMotion = useReducedMotion() ?? false
  const boundaryRef = useRef<HTMLDivElement>(null)
  const reveal = useMemo(() => createStatementReveal(t.statement.headline.split(/\s+/), 1), [t.statement.headline])

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
      <div className="foundry-container grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] lg:items-start lg:gap-20">
        <div className="max-w-3xl">
          <h2 className="max-w-2xl font-heading text-[clamp(2.4rem,5vw,4.8rem)] font-medium leading-[0.98] tracking-[-0.055em] text-soft-white">
            {reveal.map((item, index) => (
              <Fragment key={item.key}>
                <motion.span
                  className="inline-block"
                  initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : item.revealAt }}
                >
                  {item.word}
                </motion.span>
                {index < reveal.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-soft-white">
            {t.statement.description}
          </p>
        </div>
        <StatementRebound />
      </div>
    </section>
  )
}
