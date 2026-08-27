import GoalSorter from '../factory/stations/GoalSorter'
import { AccentWords } from './AccentWords'
import { useLanguage } from '../i18n/useLanguage'

export default function Goals() {
  const { t } = useLanguage()

  return (
    <section id="goals" className="foundry-page py-28 md:py-40">
      <div className="foundry-container grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,18rem)] lg:items-start lg:gap-20">
        <div>
          <h2 className="max-w-2xl font-heading text-[clamp(2.6rem,5vw,5rem)] font-medium leading-[0.94] tracking-[-0.06em] text-soft-white">
            <AccentWords parts={t.goals.headingParts} />
          </h2>
          <div className="mt-12 divide-y divide-white-line">
            {t.goals.items.map((goal) => (
              <article key={goal.title} className="grid gap-4 border-l-2 border-signal-pink py-7 pl-6 md:grid-cols-[minmax(11rem,0.45fr)_minmax(0,1fr)] md:gap-8">
                <div>
                  <p className="text-base text-soft-white">{goal.period}</p>
                  <h3 className="mt-2 font-heading text-2xl font-medium tracking-[-0.035em] text-soft-white">{goal.title}</h3>
                </div>
                <p className="max-w-xl leading-relaxed text-soft-white">{goal.desc}</p>
              </article>
            ))}
          </div>
        </div>

        <GoalSorter />
      </div>
    </section>
  )
}
