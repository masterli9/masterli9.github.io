import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../i18n/useLanguage';

export default function CookieBanner() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
      setIsVisible(true);
    } else if (consent === 'granted') {
      updateGtagConsent('granted');
    }

    const handleOpenBanner = () => setIsVisible(true);
    window.addEventListener('open-cookie-banner', handleOpenBanner);
    
    return () => {
      window.removeEventListener('open-cookie-banner', handleOpenBanner);
    };
  }, []);

  const updateGtagConsent = (status: 'granted' | 'denied') => {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'analytics_storage': status
      });
    }
  };

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'granted');
    updateGtagConsent('granted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'denied');
    updateGtagConsent('denied');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none flex justify-center"
        >
          <div className="bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-5 md:p-6 w-full max-w-4xl flex flex-col md:flex-row items-center gap-6 pointer-events-auto">
            
            <div className="flex-1 text-text-light/80 dark:text-text-dark/80 text-sm md:text-base leading-relaxed">
              <p>
                {t.cookieBanner.text}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={handleDecline}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-text-light/70 dark:text-text-dark/70 hover:bg-white/5 transition-colors text-sm font-medium w-full sm:w-auto cursor-pointer"
              >
                {t.cookieBanner.decline}
              </button>
              <button
                onClick={handleAccept}
                className="px-5 py-2.5 rounded-xl bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors text-sm font-medium w-full sm:w-auto shadow-lg shadow-accent-primary/20 cursor-pointer"
              >
                {t.cookieBanner.accept}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
