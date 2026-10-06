import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, X } from '@phosphor-icons/react'
import { useLanguage } from '../i18n/useLanguage'
import DialogPanel from './DialogPanel'
import { useMotionPreference } from '../hooks/useMotionPreference'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const { t } = useLanguage()

  const closeRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = useMotionPreference()

  const sections = Object.values(t.privacy.sections)

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <motion.button
            data-dialog-backdrop
            tabIndex={-1}
            aria-hidden="true"
            type="button"
            aria-label={t.privacy.close}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/90"
          />
          <DialogPanel
            initialFocusRef={closeRef}
            onClose={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto border border-ink/20 bg-soft-white text-ink"
          >
            <div className="sticky top-0 z-20 flex shrink-0 justify-end border-b border-ink/20 bg-soft-white p-3">
            <button ref={closeRef} type="button" onClick={onClose} aria-label={t.privacy.close} className="flex h-12 w-12 items-center justify-center border border-ink text-ink transition-colors hover:text-pink-on-light">
              <X size={22} aria-hidden="true" />
            </button>
            </div>
            <div className="border-b border-ink/15 p-7 md:p-10">
              <div className="flex items-center gap-4 text-cobalt">
                <ShieldCheck size={24} aria-hidden="true" />
              </div>
              <h2 id="privacy-modal-title" className="mt-6 max-w-lg font-heading text-4xl font-medium leading-tight tracking-[-0.05em]">{t.privacy.title}</h2>
            </div>
            <div className="space-y-8 p-7 md:p-10">
              {sections.map((section) => (
                <section key={section.title}>
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink/65">{section.content}</p>
                </section>
              ))}
              <button type="button" onClick={onClose} className="w-full bg-ink px-6 py-4 font-semibold text-soft-white transition-colors hover:bg-signal-pink hover:text-ink">{t.privacy.close}</button>
            </div>
          </DialogPanel>
        </div>
      )}
    </AnimatePresence>, document.body,
  )
}
