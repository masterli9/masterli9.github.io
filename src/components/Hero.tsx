import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import AssemblyCell from './AssemblyCell'
import { useLanguage } from '../i18n/useLanguage'

export default function Hero() {
  const { t } = useLanguage()
  const [showNavbarName, setShowNavbarName] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowNavbarName(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section id="hero" className="foundry-page flex items-center py-24 md:min-h-[min(52rem,100dvh)] md:py-36">
      <div className="foundry-container grid items-center gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.7fr)] md:gap-12">
        <div className="max-w-2xl md:col-start-1">
          <div className="mb-7 flex items-center gap-4 text-cobalt">
            <span className="foundry-rule" aria-hidden="true" />
            <p className="foundry-label text-cobalt">{t.hero.role}</p>
          </div>

          <div className="min-h-[9rem] md:min-h-[12rem]">
            {!showNavbarName && (
              <motion.h1
                layoutId="shared-name"
                className="font-heading text-[clamp(3.8rem,9vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.075em] text-soft-white"
              >
                Andrej<br />Zdvořák
              </motion.h1>
            )}
          </div>

          <p
            className="mt-8 max-w-xl text-lg leading-relaxed text-muted md:text-xl"
            style={{ opacity: showNavbarName ? 0 : 1 }}
          >
            {t.hero.description}
          </p>

        </div>

        <div className="flex flex-col items-start gap-5 md:items-end">
          <p id="hero-assembly-label" className="text-sm text-line-gray">{t.hero.assemblyLabel}</p>
          <AssemblyCell mode="hero" labelledBy="hero-assembly-label" />
          <div className="flex items-center gap-3 text-xs text-line-gray">
            <span className="h-2 w-2 bg-signal-pink" aria-hidden="true" />
            <span>{t.hero.assemblyStatus}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row md:col-start-1">
          <a
            href="#projects"
            className="inline-flex items-center justify-center gap-3 bg-soft-white px-6 py-4 font-semibold text-ink transition-colors hover:bg-signal-pink"
          >
            {t.hero.projectsBtn}
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-3 border border-white-line px-6 py-4 font-semibold text-soft-white transition-colors hover:border-signal-pink hover:text-signal-pink"
          >
            {t.hero.contactBtn}
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
