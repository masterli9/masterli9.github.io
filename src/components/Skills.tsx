import { Terminal, Users } from '@phosphor-icons/react'
import SectionLabel from './SectionLabel'
import { useLanguage } from '../i18n/useLanguage'

const tools = ['React', 'Next.js', 'React Native', 'TypeScript', 'Node.js', 'Firebase', 'TailwindCSS', 'PostgreSQL', 'Git', 'Figma']

export default function Skills() {
  const { t } = useLanguage()
  const categories = [
    { title: t.skills.categories.technical, icon: Terminal, skills: t.skills.technicalSkills },
    { title: t.skills.categories.soft, icon: Users, skills: t.skills.softSkills },
  ]

  return (
    <section id="skills" className="foundry-page py-20 md:py-28">
      <div className="foundry-container">
        <div className="grid gap-12 md:grid-cols-[minmax(10rem,0.4fr)_minmax(0,1.2fr)] md:gap-20">
          <SectionLabel index="03" tone="light">{t.skills.sectionTitle}</SectionLabel>

          <div>
            <div className="max-w-2xl">
              <h2 className="font-heading text-[clamp(2.7rem,5vw,5rem)] font-medium leading-[0.94] tracking-[-0.06em] text-soft-white">
                {t.skills.sectionTitle2}
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-soft-white">{t.skills.subtitle}</p>
            </div>

            <div className="mt-14 grid gap-12 border-t border-white-line pt-6 md:grid-cols-2 md:gap-16">
              {categories.map(({ title, icon: Icon, skills }) => (
                <div key={title}>
                  <div className="flex items-center gap-3 text-cobalt">
                    <Icon size={19} aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-soft-white">{title}</h3>
                  </div>
                  <ol className="mt-5 divide-y divide-white-line border-y border-white-line">
                    {skills.map((skill) => (
                      <li key={skill} className="flex items-center justify-between gap-4 py-3 text-base text-soft-white">
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            <div className="mt-16 border-t border-white-line pt-5">
              <p className="text-sm font-semibold text-signal-pink">{t.skills.toolsLabel}</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-lg text-soft-white">
                {tools.map((tool) => <span key={tool}>{tool}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
