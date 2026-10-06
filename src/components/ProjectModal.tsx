import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowSquareOut, CaretLeft, CaretRight, Globe, Stack, X } from '@phosphor-icons/react'
import { useLanguage } from '../i18n/useLanguage'
import type { ProjectRecord } from '../data/projects'
import DialogPanel from './DialogPanel'
import { useMotionPreference } from '../hooks/useMotionPreference'

interface ProjectModalProps {
  project: ProjectRecord | null
  isOpen: boolean
  onClose: () => void
  returnFocusRef?: RefObject<HTMLElement | null>
}

export default function ProjectModal({ project, isOpen, onClose, returnFocusRef }: ProjectModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { t } = useLanguage()
  const closeRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = useMotionPreference()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentImageIndex(0)
  }, [project])

  if (!project) return null
  const copy = t.projects.items[project.translationKey]

  const nextImage = () => setCurrentImageIndex((index) => (index + 1) % project.images.length)
  const previousImage = () => setCurrentImageIndex((index) => (index - 1 + project.images.length) % project.images.length)

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <motion.button
            data-dialog-backdrop
            tabIndex={-1}
            aria-hidden="true"
            type="button"
            aria-label={t.projectModal.close}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.35 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer bg-ink/90"
          />

          <DialogPanel
            onClose={onClose}
            initialFocusRef={closeRef}
            returnFocusRef={returnFocusRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={reducedMotion ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: reducedMotion ? 0.1 : 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-white-line bg-soft-white text-ink"
          >
            <div className="sticky top-0 z-20 flex h-0 shrink-0 justify-end px-5">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t.projectModal.close}
              className="mt-[max(1rem,env(safe-area-inset-top))] flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center border border-soft-white bg-ink text-soft-white transition-colors hover:text-signal-pink focus-visible:outline-soft-white"
            >
              <X size={22} aria-hidden="true" />
            </button>
            </div>

            <div className="relative flex h-[22rem] shrink-0 items-center justify-center border-b border-ink/15 bg-ink-soft px-6 pb-16 pt-20 md:h-[28rem] md:px-10">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={project.images[currentImageIndex]}
                  alt={`${project.title} — ${currentImageIndex + 1}`}
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
                  className="h-full max-h-full w-full object-contain"
                />
              </AnimatePresence>

              {project.images.length > 1 && (
                <>
                  <button type="button" onClick={previousImage} aria-label={t.projectModal.previousImage} className="absolute left-4 flex h-12 w-12 items-center justify-center bg-ink cursor-pointer border border-soft-white p-2 text-soft-white transition-colors hover:border-signal-pink hover:text-signal-pink">
                    <CaretLeft size={20} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={nextImage} aria-label={t.projectModal.nextImage} className="absolute right-4 flex h-12 w-12 items-center justify-center bg-ink cursor-pointer border border-soft-white p-2 text-soft-white transition-colors hover:border-signal-pink hover:text-signal-pink">
                    <CaretRight size={20} aria-hidden="true" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2" role="group" aria-label={t.projectModal.imageSelector}>
                    {project.images.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        aria-label={`${t.projectModal.showImage} ${index + 1}`}
                        aria-current={index === currentImageIndex ? 'true' : undefined}
                        onClick={() => setCurrentImageIndex(index)}
                        className="flex h-11 w-11 cursor-pointer items-center justify-center bg-ink"
                      ><span aria-hidden="true" className={`h-2 w-2 border border-soft-white ${index === currentImageIndex ? 'bg-signal-pink' : 'bg-transparent'}`} /></button>
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

              <div className="mb-10 mt-10 border-t border-ink/15 pt-6">
                <h3 className="flex items-center gap-3 text-sm font-semibold text-ink"><Stack size={17} aria-hidden="true" />{t.projectModal.techStack}</h3>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink/60">
                  {project.technologies.map((technology) => <span key={technology}>{technology}</span>)}
                </div>
              </div>

              {project.href !== '#' && (
                <a href={project.href} target="_blank" rel="noreferrer" className="mt-auto inline-flex cursor-pointer items-center justify-center gap-3 border border-ink bg-ink px-6 py-4 font-semibold text-soft-white transition-colors hover:border-signal-pink hover:bg-pink-on-light">
                  {t.projectModal.visitProject}
                  <ArrowSquareOut size={18} aria-hidden="true" />
                </a>
              )}
            </div>
          </DialogPanel>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
