import { useRef, useState } from 'react'
import { ArrowUpRight, Plus } from '@phosphor-icons/react'
import ProjectIcon from './ProjectIcon'
import ProjectMedia from './ProjectMedia'
import ProjectModal from './ProjectModal'
import Projects from './Projects'
import { projects } from '../data/projects'
import { useLanguage } from '../i18n/useLanguage'

const featuredActionClass = 'inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap border border-soft-white px-3 py-3 text-sm font-medium transition-colors transition-transform hover:border-signal-pink hover:bg-signal-pink hover:text-ink active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-pink'
const featuredPrimaryActionClass = `${featuredActionClass} bg-soft-white text-ink`
const featuredSecondaryActionClass = `${featuredActionClass} text-soft-white`

export default function SelectedWork() {
  const { t } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const featuredTriggerRef = useRef<HTMLButtonElement>(null)
  const featuredProject = projects.find((project) => project.featured) ?? projects[0]
  const copy = t.projects.items[featuredProject.translationKey]

  return (
    <section id="projects" className="foundry-page py-28 md:py-40">
      <div className="foundry-container">
        <div className="mb-16 md:mb-24">
          <h2 className="max-w-2xl font-heading text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.06em] text-soft-white">
            {t.projects.sectionTitle}
          </h2>
        </div>

        <article className="project-featured">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
            <h3 className="font-heading text-3xl font-medium tracking-[-0.04em] text-soft-white md:text-5xl">
              {featuredProject.title}
            </h3>
            <div className="flex items-center gap-3 text-signal-pink">
              <ProjectIcon name={featuredProject.icon} size={21} />
              <span className="text-xs font-medium tracking-[0.08em]">{t.projects.types[featuredProject.type]}</span>
            </div>
          </div>

          <div className="mt-2 grid items-start gap-10 md:grid-cols-[minmax(20rem,0.6fr)_minmax(0,1fr)] md:gap-10">
            <div className="md:order-2 md:justify-self-end">
              <ProjectMedia project={featuredProject} variant="featured" />
            </div>

            <div className="md:order-1 md:flex md:self-stretch md:flex-col md:text-left">
              <p className="max-w-xl text-base leading-[1.7] text-soft-white md:text-lg">{copy.desc}</p>

              <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-white-line pt-4 text-sm text-soft-white md:justify-start">
                {featuredProject.technologies.map((technology) => <span key={technology}>{technology}</span>)}
              </div>

              <div className="mt-10 grid w-full max-w-[24rem] grid-cols-1 gap-3 sm:grid-cols-2 md:mt-auto md:justify-start">
                <a
                  href={featuredProject.href}
                  target="_blank"
                  rel="noreferrer"
                  className={featuredPrimaryActionClass}
                >
                  {t.projectModal.visitProject}
                  <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                </a>
                <button
                  ref={featuredTriggerRef}
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className={featuredSecondaryActionClass}
                >
                  {t.projects.openPreview}
                  <Plus size={18} aria-hidden="true" />
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
