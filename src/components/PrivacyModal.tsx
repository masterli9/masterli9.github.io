import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield } from 'lucide-react'
import { useLanguage } from '../i18n/useLanguage'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const { t } = useLanguage()
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background-dark/95 backdrop-blur-xl z-[60] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto relative"
            >
              <button 
                onClick={onClose}
                className="cursor-pointer absolute top-6 right-6 z-30 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors flex items-center justify-center"
              >
                <X size={24} className="text-text-onLight" />
              </button>

              {/* Content */}
              <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                    <Shield size={28} className="text-brand-blue" />
                  </div>
                  <div>
                    <h2 className="font-heading font-black text-3xl text-text-onLight tracking-tighter">
                      {t.privacy.title}
                    </h2>
                  </div>
                </div>

                <div className="w-12 h-1 bg-brand-blue mb-8"></div>

                <div className="space-y-8 text-text-mutedOnLight leading-relaxed">
                  <section>
                    <h3 className="font-heading font-bold text-lg text-text-onLight mb-3">
                      {t.privacy.sections.intro.title}
                    </h3>
                    <p>{t.privacy.sections.intro.content}</p>
                  </section>

                  <section>
                    <h3 className="font-heading font-bold text-lg text-text-onLight mb-3">
                      {t.privacy.sections.collect.title}
                    </h3>
                    <p>{t.privacy.sections.collect.content}</p>
                  </section>

                  <section>
                    <h3 className="font-heading font-bold text-lg text-text-onLight mb-3">
                      {t.privacy.sections.cookies.title}
                    </h3>
                    <p>{t.privacy.sections.cookies.content}</p>
                  </section>

                  <section>
                    <h3 className="font-heading font-bold text-lg text-text-onLight mb-3">
                      {t.privacy.sections.thirdParty.title}
                    </h3>
                    <p>{t.privacy.sections.thirdParty.content}</p>
                  </section>

                  <section>
                    <h3 className="font-heading font-bold text-lg text-text-onLight mb-3">
                      {t.privacy.sections.contact.title}
                    </h3>
                    <p>{t.privacy.sections.contact.content}</p>
                  </section>
                </div>

                <div className="mt-10 pt-8 border-t border-black/5">
                  <button
                    onClick={onClose}
                    className="cursor-pointer w-full px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-brand-blue transition-all"
                  >
                    {t.privacy.close}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
