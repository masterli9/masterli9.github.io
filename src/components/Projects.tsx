import { useRef, useState } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import ProjectIcon from './ProjectIcon'
import ProjectModal from './ProjectModal'
import { projects, type ProjectRecord } from '../data/projects'
import { useLanguage } from '../i18n/useLanguage'

export default function Projects() {
  const { t } = useLanguage()
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)
  const lastTriggerRef = useRef<HTMLButtonElement>(null)
  const supportingProjects = projects.filter((project) => !project.featured)

  if (supportingProjects.length === 0) return null

  return (
    <div className="project-index mt-24 md:mt-32">
      <h3 className="mb-6 font-heading text-2xl font-medium tracking-[-0.03em] text-soft-white md:text-3xl">
        {t.projects.otherProjects}
      </h3>

      <div className="border-y border-white-line">
        {supportingProjects.map((project) => (
          <button
            key={project.id}
            type="button"
            data-project-row={project.id}
            aria-haspopup="dialog"
            onClick={(event) => {
              lastTriggerRef.current = event.currentTarget
              setSelectedProject(project)
            }}
            className="group grid w-full cursor-pointer items-center gap-5 border-b border-white-line py-6 text-left text-soft-white transition-colors last:border-b-0 hover:text-signal-pink focus-visible:text-signal-pink md:grid-cols-[minmax(13rem,1fr)_minmax(15rem,0.75fr)_auto] md:py-7"
          >
            <span className="min-w-0">
              <span className="block font-heading text-2xl font-medium tracking-[-0.03em] md:text-3xl">{project.title}</span>
              <span className="mt-2 flex items-center gap-2 text-sm font-semibold text-signal-pink">
                <ProjectIcon name={project.icon} size={18} />
                <span>{t.projects.types[project.type]}</span>
              </span>
            </span>
            <span className="text-sm text-soft-white md:text-base">
              {project.technologies.slice(0, 3).join(' · ')}
            </span>
            <span className="inline-flex items-center gap-3 border border-soft-white px-3 py-2 text-sm font-medium transition-colors group-hover:border-signal-pink group-hover:bg-signal-pink group-hover:text-ink group-focus-visible:border-signal-pink group-focus-visible:bg-signal-pink group-focus-visible:text-ink md:justify-self-end">
              {t.projects.openDetails}
              <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        returnFocusRef={lastTriggerRef}
      />
    </div>
  )
}
