import { useRef, useState } from 'react'
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
  const featuredTriggerRef = useRef<HTMLButtonElement>(null)
  const featuredProject = projects.find((project) => project.featured) ?? projects[0]
  const copy = t.projects.items[featuredProject.translationKey]

  return (
    <section id="projects" className="foundry-page py-28 md:py-40">
      <div className="foundry-container">
        <div className="mb-20 md:mb-28">
          <h2 className="max-w-2xl font-heading text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.06em] text-soft-white">
            {t.projects.sectionTitle}
          </h2>
        </div>

        <article className="project-featured">
          <div className="flex flex-wrap items-center justify-between gap-5 pb-6">
            <h3 className="font-heading text-4xl font-medium tracking-[-0.04em] text-soft-white md:text-6xl">
              {featuredProject.title}
            </h3>
            <div className="flex items-center gap-3 text-signal-pink">
              <ProjectIcon name={featuredProject.icon} size={21} />
              <span className="text-sm font-semibold">{t.projects.types[featuredProject.type]}</span>
            </div>
          </div>

          <div className="mt-6 grid items-start gap-8 md:grid-cols-[minmax(18rem,0.32fr)_minmax(0,1fr)] md:gap-8">
            <div className="md:order-2 md:justify-self-end">
              <ProjectMedia project={featuredProject} variant="featured" />
            </div>

            <div className="md:order-1 md:flex md:self-stretch md:flex-col md:text-left">
              <p className="max-w-3xl text-lg leading-relaxed text-soft-white">{copy.desc}</p>

              <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-soft-white md:justify-start">
                {featuredProject.technologies.map((technology) => <span key={technology}>{technology}</span>)}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5 md:mt-auto md:gap-4 md:justify-start">
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
                  ref={featuredTriggerRef}
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-soft-white transition-colors hover:text-signal-pink"
                >
                  <Plus size={16} aria-hidden="true" />
                  {t.projects.openPreview}
                </button>
              </div>
            </div>
          </div>

        </article>

        <Projects />
      </div>

      <ProjectModal
        project={isModalOpen ? featuredProject : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        returnFocusRef={featuredTriggerRef}
      />
    </section>
  )
}
