import { useState } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import ProjectIcon from './ProjectIcon'
import ProjectModal from './ProjectModal'
import { projects, type ProjectRecord } from '../data/projects'
import { useLanguage } from '../i18n/useLanguage'

export default function Projects() {
  const { t } = useLanguage()
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)
  const supportingProjects = projects.filter((project) => !project.featured)

  return (
    <div className="mt-24 border-t border-white-line pt-8 md:mt-32">
      <p className="mb-8 text-sm font-semibold text-soft-white">{t.projects.otherOutputs}</p>

      <div className="divide-y divide-white-line">
        {supportingProjects.map((project) => {
          const copy = t.projects.items[project.translationKey]
          return (
            <div key={project.id} className="grid gap-5 py-6 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.8fr)_auto] md:items-center md:gap-10">
              <div className="flex items-center gap-4">
                <ProjectIcon name={project.icon} size={20} className="text-cobalt" />
                <div>
                  <h3 className="font-heading text-2xl font-medium tracking-[-0.03em] text-soft-white">{project.title}</h3>
                   <p className="mt-1 text-sm text-soft-white">{t.projects.types[project.type]}</p>
                </div>
              </div>
               <p className="max-w-md text-sm leading-relaxed text-soft-white">{copy.desc}</p>
              <button
                type="button"
                onClick={() => setSelectedProject(project)}
                className="inline-flex items-center gap-3 justify-self-start text-sm font-semibold text-soft-white transition-colors hover:text-signal-pink md:justify-self-end"
              >
                {t.projects.openDetails}
                <ArrowRight size={17} weight="bold" aria-hidden="true" />
              </button>
            </div>
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
