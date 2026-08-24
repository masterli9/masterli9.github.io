import { useState } from 'react'
import { ArrowUpRight, Plus } from '@phosphor-icons/react'
import AssemblyCell from './AssemblyCell'
import ProjectIcon from './ProjectIcon'
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
        <div className="mb-16 flex flex-col gap-5 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="foundry-label mb-5">{t.projects.featuredLabel}</p>
            <h2 className="max-w-2xl font-heading text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.06em] text-soft-white">
              {t.projects.sectionTitle}
            </h2>
          </div>
          <p className="max-w-xs text-base leading-relaxed text-muted md:text-right">{t.projects.subtitle}</p>
        </div>

        <div className="grid items-start gap-12 md:grid-cols-[minmax(15rem,0.75fr)_minmax(0,1.25fr)] md:gap-20">
          <div className="max-w-md">
            <div className="flex items-center gap-4 text-signal-pink">
              <ProjectIcon name={featuredProject.icon} size={22} />
              <span className="text-sm font-semibold">{t.projects.types[featuredProject.type]}</span>
            </div>
            <h3 className="mt-7 font-heading text-4xl font-medium tracking-[-0.045em] text-soft-white md:text-5xl">
              {featuredProject.title}
            </h3>
            <p className="mt-6 text-lg leading-relaxed text-muted">{copy.desc}</p>

            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-line-gray">
              {featuredProject.technologies.map((technology) => <span key={technology}>{technology}</span>)}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href={featuredProject.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 font-semibold text-soft-white transition-colors hover:text-signal-pink"
              >
                {t.projectModal.visitProject}
                <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 text-sm text-line-gray transition-colors hover:text-soft-white"
              >
                <Plus size={16} aria-hidden="true" />
                {t.projects.openPreview}
              </button>
            </div>
          </div>

          <div className="relative border border-white-line p-4 md:p-6">
            <div className="absolute -right-3 -top-3 text-signal-pink" aria-hidden="true">
              <AssemblyCell mode="selected-work" />
            </div>
            <figure className="border border-white-line bg-ink-soft p-3 md:p-5">
              <img
                src={featuredProject.images[0]}
                alt={`${featuredProject.title} preview`}
                className="block aspect-video w-full object-cover object-top"
              />
              <figcaption className="mt-4 flex items-center justify-between gap-4 text-xs text-line-gray">
                <span>{t.projects.previewLabel}</span>
                <span>01 / 02</span>
              </figcaption>
            </figure>
          </div>
        </div>

        <Projects />
      </div>

      <ProjectModal
        project={isModalOpen ? featuredProject : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  )
}
