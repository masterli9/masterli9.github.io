import { Terminal, Users } from '@phosphor-icons/react'
import FormingPress from '../factory/stations/FormingPress'
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
      <div className="foundry-container grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,18rem)] lg:items-start lg:gap-20">
        <div>
          <div className="max-w-2xl">
            <h2 className="font-heading text-[clamp(2.7rem,5vw,5rem)] font-medium leading-[0.94] tracking-[-0.06em] text-soft-white">
              {t.skills.sectionTitle} {t.skills.sectionTitle2}
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-soft-white">{t.skills.subtitle}</p>
          </div>

          <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-16">
            {categories.map(({ title, icon: Icon, skills }) => (
              <div key={title}>
                <div className="flex items-center gap-3 text-cobalt">
                  <Icon size={19} aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-soft-white">{title}</h3>
                </div>
                <ul className="mt-5 space-y-3 text-base text-soft-white">
                  {skills.map((skill) => <li key={skill}>{skill}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <h3 className="text-lg font-semibold text-signal-pink">{t.skills.toolsLabel}</h3>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-lg text-soft-white">
              {tools.map((tool) => <span key={tool}>{tool}</span>)}
            </div>
          </div>
        </div>

        <FormingPress />
      </div>
    </section>
  )
}
