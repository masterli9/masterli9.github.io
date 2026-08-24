import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowSquareOut, CaretLeft, CaretRight, Globe, Stack, X } from '@phosphor-icons/react'
import { useLanguage } from '../i18n/useLanguage'
import type { ProjectRecord } from '../data/projects'

interface ProjectModalProps {
  project: ProjectRecord | null
  isOpen: boolean
  onClose: () => void
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { t } = useLanguage()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentImageIndex(0)
  }, [project])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!project) return null
  const copy = t.projects.items[project.translationKey]

  const nextImage = () => setCurrentImageIndex((index) => (index + 1) % project.images.length)
  const previousImage = () => setCurrentImageIndex((index) => (index - 1 + project.images.length) % project.images.length)

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <motion.button
            type="button"
            aria-label={t.projectModal.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-ink/90"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-white-line bg-soft-white text-ink"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 z-10 border border-transparent p-2 text-ink transition-colors hover:border-ink hover:text-signal-pink"
            >
              <X size={22} aria-hidden="true" />
            </button>

            <div className="relative flex min-h-[18rem] items-center justify-center border-b border-ink/15 bg-ink-soft p-6 md:min-h-[28rem] md:p-10">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={project.images[currentImageIndex]}
                  alt={`${project.title} — ${currentImageIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-full w-full object-contain"
                />
              </AnimatePresence>

              {project.images.length > 1 && (
                <>
                  <button type="button" onClick={previousImage} aria-label="Previous image" className="absolute left-4 border border-soft-white/30 p-2 text-soft-white transition-colors hover:border-signal-pink hover:text-signal-pink">
                    <CaretLeft size={20} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={nextImage} aria-label="Next image" className="absolute right-4 border border-soft-white/30 p-2 text-soft-white transition-colors hover:border-signal-pink hover:text-signal-pink">
                    <CaretRight size={20} aria-hidden="true" />
                  </button>
                  <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2" aria-label="Image selector">
                    {project.images.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        aria-label={`Show image ${index + 1}`}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 w-2 border border-soft-white ${index === currentImageIndex ? 'bg-signal-pink' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-1 flex-col p-7 md:p-12">
              <div className="flex items-center gap-3 text-cobalt">
                <Globe size={18} aria-hidden="true" />
                <span className="text-sm font-semibold">{t.projects.types[project.type]}</span>
              </div>
              <h2 id="project-modal-title" className="mt-5 font-heading text-4xl font-medium tracking-[-0.05em] md:text-5xl">{project.title}</h2>
              <p className="mt-7 text-lg leading-relaxed text-ink/70">{copy.longDesc}</p>

              <div className="mt-10 border-t border-ink/15 pt-6">
                <h3 className="flex items-center gap-3 text-sm font-semibold text-ink"><Stack size={17} aria-hidden="true" />{t.projectModal.techStack}</h3>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink/60">
                  {project.technologies.map((technology) => <span key={technology}>{technology}</span>)}
                </div>
              </div>

              {project.href !== '#' && (
                <a href={project.href} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center justify-center gap-3 border border-ink bg-ink px-6 py-4 font-semibold text-soft-white transition-colors hover:border-signal-pink hover:bg-signal-pink">
                  {t.projectModal.visitProject}
                  <ArrowSquareOut size={18} aria-hidden="true" />
                </a>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
