import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../i18n/useLanguage'

export default function CookieBanner() {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)

  const updateGtagConsent = (status: 'granted' | 'denied') => {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: status })
    }
  }

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (consent === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true)
    } else if (consent === 'granted') {
      updateGtagConsent('granted')
    }

    const handleOpenBanner = () => setIsVisible(true)
    window.addEventListener('open-cookie-banner', handleOpenBanner)
    return () => window.removeEventListener('open-cookie-banner', handleOpenBanner)
  }, [])

  const handleChoice = (consent: 'granted' | 'denied') => {
    localStorage.setItem('cookieConsent', consent)
    updateGtagConsent(consent)
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 bottom-0 z-[100] border-t border-ink/20 bg-soft-white p-4 text-ink md:p-6"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-10">
            <p className="max-w-3xl text-sm leading-relaxed md:text-base">{t.cookieBanner.text}</p>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
              <button type="button" onClick={() => handleChoice('denied')} className="border border-ink/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink/5">{t.cookieBanner.decline}</button>
              <button type="button" onClick={() => handleChoice('granted')} className="bg-signal-pink px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-soft-white">{t.cookieBanner.accept}</button>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-privacy-modal'))} className="px-2 py-3 text-left text-sm text-ink/60 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink sm:text-center">{t.cookieBanner.privacyLink}</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
