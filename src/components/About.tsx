import { BookOpen, MusicNotes, RocketLaunch, Trophy } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import FoundryTrace from './FoundryTrace'
import SectionLabel from './SectionLabel'
import { useLanguage } from '../i18n/useLanguage'

export default function About() {
  const { t } = useLanguage()
  const interests = [
    { key: 'music' as const, icon: MusicNotes },
    { key: 'reading' as const, icon: BookOpen },
    { key: 'motorsport' as const, icon: RocketLaunch },
    { key: 'collecting' as const, icon: Trophy },
  ]

  return (
    <section id="about" className="foundry-light py-28 md:py-40">
      <div className="foundry-container">
        <div className="grid gap-12 md:grid-cols-[minmax(10rem,0.4fr)_minmax(0,1.2fr)] md:gap-20">
          <div>
            <SectionLabel index="02">{t.about.sectionTitle}</SectionLabel>
            <FoundryTrace variant="module" className="mt-16 h-7 w-7 text-signal-pink" />
          </div>

          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.6fr)] lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <h2 className="font-heading text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.96] tracking-[-0.06em] text-ink">
                {t.about.headline}
              </h2>
              <div className="mt-9 space-y-6 text-lg leading-relaxed text-ink/70">
                <p>{t.about.p1} <span className="font-semibold text-ink">{t.about.school}</span>{t.about.p1End}</p>
                <p>{t.about.p2Start} <span className="font-semibold text-signal-pink">{t.about.p2Highlight}</span> {t.about.p2End}</p>
              </div>

              <div className="mt-12 grid gap-5 border-t border-ink/15 pt-6 sm:grid-cols-2">
                <div>
                  <p className="font-heading text-3xl font-medium tracking-[-0.04em] text-ink">{t.about.czechLevel}</p>
                  <p className="mt-1 text-sm text-ink/55">{t.about.czech}</p>
                </div>
                <div>
                  <p className="font-heading text-3xl font-medium tracking-[-0.04em] text-ink">{t.about.englishLevel}</p>
                  <p className="mt-1 text-sm text-ink/55">{t.about.english}</p>
                </div>
              </div>
            </motion.div>

            <div className="lg:pt-24">
              <h3 className="text-sm font-semibold text-signal-pink">{t.about.outsideCode}</h3>
              <div className="mt-5 divide-y divide-ink/15 border-y border-ink/15">
                {interests.map(({ key, icon: Icon }) => (
                  <div key={key} className="flex items-start gap-4 py-4">
                    <Icon size={20} className="mt-0.5 text-cobalt" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-ink">{t.about.interests[key].name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink/55">{t.about.interests[key].desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
