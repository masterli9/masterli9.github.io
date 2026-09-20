import { ArrowSquareOut, Calendar, Medal } from '@phosphor-icons/react'
import PaintInspectionStation from '../factory/stations/PaintInspectionStation'
import { useLanguage } from '../i18n/useLanguage'

const certifications = [
  { title: 'Cisco CCNA (Switching, Routing, and Wireless Essentials)', link: 'https://www.credly.com/badges/ca43212c-c81b-454d-bdd9-c04d5ef7217c' },
  { title: 'Cisco CCNAv7 (Introduction to Networks)', link: 'https://www.credly.com/badges/36fdd309-48b6-4b06-9d4f-b75dd054bbf5' },
  { title: 'IT Essentials (PC Hardware and Software)', link: 'https://www.credly.com/badges/cb31e4e7-ecd6-46a3-8bbf-68529105bec0' },
]

export default function Experience() {
  const { t } = useLanguage()

  return (
    <section id="experience" className="foundry-page py-28 md:py-48">
      <div className="foundry-container">
        <h2 className="max-w-3xl font-heading text-[clamp(2.7rem,5vw,5rem)] font-medium leading-[0.94] tracking-[-0.06em] text-soft-white">
          {t.experience.sectionTitle}
        </h2>
        <div className="mt-20 grid gap-20 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,18rem)] lg:items-start lg:gap-24">
          <div className="grid gap-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(14rem,0.7fr)] lg:gap-24">
            <div className="relative border-l border-white-line pl-8 md:pl-12">
              {t.experience.items.map((experience) => (
                <article key={experience.title} className="relative pb-16 last:pb-0">
                  <span className="absolute -left-[calc(2rem+1px)] top-1 h-2.5 w-2.5 bg-signal-pink md:-left-[calc(3rem+1px)]" aria-hidden="true" />
                  <p className="flex items-center gap-2 text-sm text-soft-white"><Calendar size={15} aria-hidden="true" />{experience.date}</p>
                  <h3 className="mt-4 font-heading text-2xl font-medium leading-tight tracking-[-0.04em] text-soft-white md:text-3xl">{experience.title}</h3>
                  <p className="mt-2 text-base font-semibold text-cobalt">{experience.role}</p>
                  <p className="mt-5 max-w-[38rem] leading-[1.75] text-soft-white">{experience.desc}</p>
                </article>
              ))}
            </div>

            <div>
              <h3 className="text-base font-semibold text-signal-pink">{t.experience.certTitle}</h3>
              <div className="mt-7 divide-y divide-white-line border-y border-white-line">
                {certifications.map((cert) => (
                  <a key={cert.title} href={cert.link} target="_blank" rel="noreferrer" className="group flex items-start gap-4 py-7 text-soft-white transition-colors hover:text-cobalt">
                    <Medal size={19} className="mt-0.5 shrink-0 text-cobalt" aria-hidden="true" />
                    <span className="flex-1 text-sm font-semibold leading-relaxed">{cert.title}</span>
                    <ArrowSquareOut size={17} className="mt-0.5 shrink-0 text-soft-white transition-colors group-hover:text-cobalt" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <PaintInspectionStation />
        </div>
      </div>
    </section>
  )
}
