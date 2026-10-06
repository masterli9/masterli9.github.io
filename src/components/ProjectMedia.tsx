import type { ProjectRecord } from '../data/projects'
import { getProjectPreviewMode } from './projectLayoutModel'

interface ProjectMediaProps {
  project: ProjectRecord
  variant?: 'featured' | 'default'
}

export default function ProjectMedia({ project, variant = 'default' }: ProjectMediaProps) {
  const previewMode = getProjectPreviewMode(project.type)
  const preview = project.id === 'gt-series' ? {
    src: '/projects-photos/gt-series/preview-640.webp',
    srcSet: '/projects-photos/gt-series/preview-640.webp 640w, /projects-photos/gt-series/preview-960.webp 960w, /projects-photos/gt-series/preview-1280.webp 1280w',
    sizes: variant === 'featured' ? '(min-width: 1024px) 55vw, calc(100vw - 4rem)' : '(min-width: 1024px) 40vw, calc(100vw - 4rem)',
  } : { src: project.images[0] }

  if (variant === 'featured' && previewMode === 'compact-portrait-pair') {
    return (
      <div className="grid w-full grid-cols-2 gap-3 border border-white-line bg-ink-soft p-3 sm:gap-5 sm:p-5 md:gap-8 md:p-8">
        {project.images.slice(0, 2).map((image, index) => (
          <figure key={image} className="border border-white-line bg-ink p-2 sm:p-3">
            <img
              src={image}
              loading="lazy" decoding="async"
              alt={`${project.title} preview ${index + 1}`}
              className="block h-auto w-full object-contain"
            />
          </figure>
        ))}
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <figure className="ml-auto w-full max-w-4xl overflow-hidden border border-white-line bg-ink-soft p-3 sm:p-4 md:p-5">
        <img
          {...preview}
          loading="lazy" decoding="async"
          alt={`${project.title} preview`}
          className="block aspect-video w-full object-cover object-top"
        />
      </figure>
    )
  }

  if (previewMode === 'compact-portrait-pair') {
    return (
      <div className="grid w-full max-w-[28rem] grid-cols-2 items-start gap-3 justify-self-start sm:gap-4 lg:justify-self-end">
        {project.images.slice(0, 2).map((image, index) => (
          <figure key={image} className="border border-white-line bg-ink-soft p-2">
            <img
              src={image}
              loading="lazy" decoding="async"
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
        {...preview}
        loading="lazy" decoding="async"
        alt={`${project.title} preview`}
        className="block aspect-video w-full object-cover object-top"
      />
    </figure>
  )
}
