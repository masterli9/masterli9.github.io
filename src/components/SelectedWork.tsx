import { useState } from 'react'
import { ArrowUpRight, Plus } from '@phosphor-icons/react'
import ProjectIcon from './ProjectIcon'
import ProjectMedia from './ProjectMedia'
import ProjectModal from './ProjectModal'
import Projects from './Projects'
import { projects } from '../data/projects'
import { useLanguage } from '../i18n/useLanguage'

export default function SelectedWork() {
  const { t } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const featuredProject = projects.find((project) => project.featured) ?? projects[0]
  const copy = t.projects.items[featuredProject.translationKey]

  return (
    <section id="projects" className="foundry-page py-28 md:py-40">
      <div className="foundry-container">
        <div className="mx-auto max-w-[60rem]">
          <div className="mb-20 md:mb-28">
            <h2 className="max-w-2xl font-heading text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.06em] text-soft-white">
              {t.projects.sectionTitle}
            </h2>
          </div>

          <article className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)] lg:gap-16">
            <div>
              <h3 className="font-heading text-4xl font-medium tracking-[-0.04em] text-soft-white md:text-5xl">
                {featuredProject.title}
              </h3>
              <div className="mt-5 flex items-center gap-3 text-signal-pink">
                <ProjectIcon name={featuredProject.icon} size={21} />
                <span className="text-sm font-semibold">{t.projects.types[featuredProject.type]}</span>
              </div>

              <p className="mt-7 text-lg leading-relaxed text-soft-white">{copy.desc}</p>

              <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-sm text-soft-white">
                {featuredProject.technologies.map((technology) => <span key={technology}>{technology}</span>)}
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-5">
                <a
                  href={featuredProject.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex cursor-pointer items-center gap-3 font-semibold text-soft-white transition-colors hover:text-signal-pink"
                >
                  {t.projectModal.visitProject}
                  <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-soft-white transition-colors hover:text-signal-pink"
                >
                  <Plus size={16} aria-hidden="true" />
                  {t.projects.openPreview}
                </button>
              </div>
            </div>

            <ProjectMedia project={featuredProject} />
          </article>

          <Projects />
        </div>
      </div>

      <ProjectModal
        project={isModalOpen ? featuredProject : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  )
}
