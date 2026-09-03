import { useState } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import ProjectIcon from './ProjectIcon'
import ProjectMedia from './ProjectMedia'
import ProjectModal from './ProjectModal'
import { projects, type ProjectRecord } from '../data/projects'
import { useLanguage } from '../i18n/useLanguage'

export default function Projects() {
  const { t } = useLanguage()
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)
  const supportingProjects = projects.filter((project) => !project.featured)

  return (
    <div className="mx-auto mt-28 max-w-[60rem] md:mt-36">
      <div className="space-y-28 md:space-y-36">
        {supportingProjects.map((project) => {
          const copy = t.projects.items[project.translationKey]
          return (
            <article key={project.id} className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)] lg:gap-16">
              <div>
                <h3 className="font-heading text-4xl font-medium tracking-[-0.04em] text-soft-white md:text-5xl">{project.title}</h3>
                <div className="mt-5 flex items-center gap-3 text-signal-pink">
                  <ProjectIcon name={project.icon} size={21} />
                  <span className="text-sm font-semibold">{t.projects.types[project.type]}</span>
                </div>

                <p className="mt-7 text-lg leading-relaxed text-soft-white">{copy.desc}</p>
                <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-sm text-soft-white">
                  {project.technologies.map((technology) => <span key={technology}>{technology}</span>)}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="mt-9 inline-flex cursor-pointer items-center gap-3 text-sm font-semibold text-soft-white transition-colors hover:text-signal-pink"
                >
                  {t.projects.openDetails}
                  <ArrowRight size={17} weight="bold" aria-hidden="true" />
                </button>
              </div>

              <ProjectMedia project={project} />
            </article>
          )
        })}
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  )
}
