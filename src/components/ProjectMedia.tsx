import type { ProjectRecord } from '../data/projects'
import { getProjectPreviewMode } from './projectLayoutModel'

export default function ProjectMedia({ project }: { project: ProjectRecord }) {
  const previewMode = getProjectPreviewMode(project.type)

  if (previewMode === 'compact-portrait-pair') {
    return (
      <div className="grid w-full max-w-[28rem] grid-cols-2 items-start gap-3 justify-self-start sm:gap-4 lg:justify-self-end">
        {project.images.slice(0, 2).map((image, index) => (
          <figure key={image} className="border border-white-line bg-ink-soft p-2">
            <img
              src={image}
              alt={`${project.title} preview ${index + 1}`}
              className="block h-auto w-full object-contain"
            />
          </figure>
        ))}
      </div>
    )
  }

  return (
    <figure className="w-full border border-white-line bg-ink-soft p-3 md:p-4">
      <img
        src={project.images[0]}
        alt={`${project.title} preview`}
        className="block aspect-video w-full object-cover object-top"
      />
    </figure>
  )
}
