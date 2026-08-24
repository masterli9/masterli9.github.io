import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, X } from '@phosphor-icons/react'
import { useLanguage } from '../i18n/useLanguage'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const { t } = useLanguage()

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const sections = Object.values(t.privacy.sections)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <motion.button
            type="button"
            aria-label={t.privacy.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/90"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto border border-ink/20 bg-soft-white text-ink"
          >
            <button type="button" onClick={onClose} aria-label={t.privacy.close} className="absolute right-5 top-5 p-2 text-ink transition-colors hover:text-signal-pink">
              <X size={22} aria-hidden="true" />
            </button>
            <div className="border-b border-ink/15 p-7 md:p-10">
              <div className="flex items-center gap-4 text-cobalt">
                <ShieldCheck size={24} aria-hidden="true" />
                <p className="text-sm font-semibold">Privacy / 01</p>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
