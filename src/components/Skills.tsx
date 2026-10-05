import { Terminal, Users } from '@phosphor-icons/react'
import FormingPress from '../factory/stations/FormingPress'
import { AccentWords } from './AccentWords'
import { useLanguage } from '../i18n/useLanguage'

const tools = ['React', 'Next.js', 'React Native', 'TypeScript', 'Node.js', 'Firebase', 'TailwindCSS', 'PostgreSQL', 'Git', 'Figma']

export default function Skills() {
  const { t } = useLanguage()
  const categories = [
    { title: t.skills.categories.technical, icon: Terminal, skills: t.skills.technicalSkills },
    { title: t.skills.categories.soft, icon: Users, skills: t.skills.softSkills },
  ]

  return (
    <section id="skills" className="foundry-page py-28 md:py-40">
      <div className="foundry-container grid gap-20 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,18rem)] lg:items-start lg:gap-24">
        <div className="factory-reading-surface">
          <div className="max-w-[40rem]">
            <h2 className="font-heading text-[clamp(2.9rem,5vw,5.25rem)] font-medium leading-[0.92] tracking-[-0.065em] text-soft-white">
              <AccentWords parts={t.skills.headingParts} />
            </h2>
            <p className="mt-8 max-w-lg text-base leading-[1.75] text-soft-white md:text-lg">{t.skills.subtitle}</p>
          </div>

          <div className="mt-20 grid gap-14 md:grid-cols-2 md:gap-20">
            {categories.map(({ title, icon: Icon, skills }) => (
              <div key={title} className="border-t border-white-line pt-6">
                <div className="flex items-center gap-3 text-cobalt">
                  <Icon size={19} aria-hidden="true" />
                  <h3 className="text-xl font-medium tracking-[-0.02em] text-soft-white">{title}</h3>
                </div>
                <ul className="mt-7 grid gap-x-6 gap-y-4 text-base leading-snug text-soft-white">
                  {skills.map((skill) => (
                    <li key={skill} className="flex items-baseline gap-3">
                      <span className="h-1.5 w-1.5 shrink-0 bg-signal-pink" aria-hidden="true" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-20 border-t border-white-line pt-6">
            <h3 className="text-base font-semibold text-signal-pink">{t.skills.toolsLabel}</h3>
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3 text-base text-soft-white md:grid-cols-5 xl:flex xl:flex-nowrap xl:gap-x-4 xl:text-base">
              {tools.map((tool) => <span key={tool}>{tool}</span>)}
            </div>
          </div>
        </div>

        <FormingPress />
      </div>
    </section>
  )
}
