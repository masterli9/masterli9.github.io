import { BookOpen, MusicNotes, RocketLaunch, Trophy } from '@phosphor-icons/react'
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
    <section id="about" className="foundry-reading-break py-36 md:py-56">
      <div className="foundry-container">
        <div className="grid gap-20 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.6fr)] lg:gap-32">
          <div className="max-w-[38rem]">
            <h2 className="font-heading text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.96] tracking-[-0.06em] text-ink">
              {t.about.headline}
            </h2>
            <div className="mt-12 space-y-7 text-base leading-[1.75] text-ink md:mt-14 md:text-lg">
              <p>{t.about.p1} <span className="font-semibold">{t.about.school}</span>{t.about.p1End}</p>
              <p>{t.about.p2Start} <span className="font-semibold text-signal-pink">{t.about.p2Highlight}</span> {t.about.p2End}</p>
            </div>

            <div className="mt-16 grid gap-x-4 gap-y-8 border-t border-ink pt-8 sm:grid-cols-2 md:mt-20">
              <div>
                <p className="whitespace-nowrap font-heading text-4xl font-medium text-ink">{t.about.czechLevel}</p>
                <p className="mt-2 text-sm tracking-[0.04em] text-ink">{t.about.czech}</p>
              </div>
              <div>
                <p className="whitespace-nowrap font-heading text-4xl font-medium text-ink">{t.about.englishLevel}</p>
                <p className="mt-2 text-sm tracking-[0.04em] text-ink">{t.about.english}</p>
              </div>
            </div>
          </div>

          <div className="lg:pt-32">
            <h3 className="text-base font-semibold text-signal-pink">{t.about.outsideCode}</h3>
            <div className="mt-7 divide-y divide-ink border-y border-ink">
              {interests.map(({ key, icon: Icon }) => (
                <div key={key} className="flex items-start gap-4 py-5">
                  <Icon size={20} className="mt-0.5 text-cobalt" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-ink">{t.about.interests[key].name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink">{t.about.interests[key].desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
