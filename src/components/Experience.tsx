import { ArrowSquareOut, Calendar, Medal } from '@phosphor-icons/react'
import SectionLabel from './SectionLabel'
import FoundryTrace from './FoundryTrace'
import { useLanguage } from '../i18n/useLanguage'

const certifications = [
  { title: 'Cisco CCNA (Switching, Routing, and Wireless Essentials)', link: 'https://www.credly.com/badges/ca43212c-c81b-454d-bdd9-c04d5ef7217c' },
  { title: 'Cisco CCNAv7 (Introduction to Networks)', link: 'https://www.credly.com/badges/36fdd309-48b6-4b06-9d4f-b75dd054bbf5' },
  { title: 'IT Essentials (PC Hardware and Software)', link: 'https://www.credly.com/badges/cb31e4e7-ecd6-46a3-8bbf-68529105bec0' },
]

export default function Experience() {
  const { t } = useLanguage()

  return (
    <section id="experience" className="foundry-light py-20 md:py-32">
      <div className="foundry-container">
        <div className="grid gap-12 md:grid-cols-[minmax(10rem,0.4fr)_minmax(0,1.2fr)] md:gap-20">
          <div>
            <SectionLabel index="04">{t.experience.sectionTitle}</SectionLabel>
            <FoundryTrace variant="inspection" className="mt-16 h-6 w-6 text-cobalt" />
          </div>

          <div className="grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(14rem,0.7fr)] lg:gap-20">
            <div className="relative border-l border-ink/25 pl-7 md:pl-10">
              {t.experience.items.map((experience) => (
                <article key={experience.title} className="relative pb-12 last:pb-0">
                  <span className="absolute -left-[calc(1.75rem+1px)] top-1 h-2.5 w-2.5 bg-signal-pink md:-left-[calc(2.5rem+1px)]" aria-hidden="true" />
                  <p className="flex items-center gap-2 text-sm text-ink/55"><Calendar size={15} aria-hidden="true" />{experience.date}</p>
                  <h2 className="mt-3 font-heading text-3xl font-medium leading-tight tracking-[-0.04em] text-ink">{experience.title}</h2>
                  <p className="mt-2 text-base font-semibold text-cobalt">{experience.role}</p>
                  <p className="mt-4 max-w-xl leading-relaxed text-ink/65">{experience.desc}</p>
                </article>
              ))}
            </div>

            <div>
              <h2 className="text-sm font-semibold text-signal-pink">{t.experience.certTitle}</h2>
              <div className="mt-5 divide-y divide-ink/15 border-y border-ink/15">
                {certifications.map((cert) => (
                  <a key={cert.title} href={cert.link} target="_blank" rel="noreferrer" className="group flex items-start gap-4 py-5 text-ink transition-colors hover:text-cobalt">
                    <Medal size={19} className="mt-0.5 shrink-0 text-cobalt" aria-hidden="true" />
                    <span className="flex-1 text-sm font-semibold leading-relaxed">{cert.title}</span>
                    <ArrowSquareOut size={17} className="mt-0.5 shrink-0 text-ink/40 transition-colors group-hover:text-cobalt" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
