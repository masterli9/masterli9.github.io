import { useLanguage } from '../i18n/useLanguage'
import FoundryTrace from './FoundryTrace'
import SectionLabel from './SectionLabel'

export default function Goals() {
  const { t } = useLanguage()

  return (
    <section id="goals" className="foundry-page py-28 md:py-40">
      <div className="foundry-container grid gap-12 md:grid-cols-[minmax(10rem,0.4fr)_minmax(0,1.2fr)] md:gap-20">
        <div>
          <SectionLabel index="05" tone="light">{t.goals.sectionTitle}</SectionLabel>
          <FoundryTrace variant="rail" className="mt-16 h-6 w-20 text-line-gray" />
        </div>

        <div>
          <div className="flex items-end justify-between gap-6 border-b border-white-line pb-5">
            <h2 className="font-heading text-[clamp(2.6rem,5vw,5rem)] font-medium leading-[0.94] tracking-[-0.06em] text-soft-white">{t.goals.queueTitle}</h2>
            <span className="font-mono text-xs text-line-gray">03 / 03</span>
          </div>
          <div className="divide-y divide-white-line">
            {t.goals.items.map((goal, index) => (
              <article key={goal.title} className="grid gap-5 py-7 md:grid-cols-[3rem_minmax(11rem,0.55fr)_minmax(0,1fr)] md:gap-8">
                <span className="font-mono text-sm text-signal-pink">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p className="text-sm text-line-gray">{goal.period}</p>
                  <h3 className="mt-2 font-heading text-2xl font-medium tracking-[-0.035em] text-soft-white">{goal.title}</h3>
                </div>
                <p className="max-w-xl leading-relaxed text-muted">{goal.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
