import { useState, useEffect, useRef } from 'react'
import { List as Menu, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../i18n/useLanguage'
import LanguageSwitcher from './LanguageSwitcher'
import DialogPanel from './DialogPanel'
import { useMotionPreference } from '../hooks/useMotionPreference'

export default function Header() {
  const { t } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = useMotionPreference()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)')
    const closeOnDesktop = () => { if (media.matches) setIsMenuOpen(false) }
    media.addEventListener('change', closeOnDesktop)
    return () => media.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <>
      <div className={`pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center transition-[padding] duration-500 ${isScrolled ? 'px-4' : 'px-0'}`}>
        <motion.header
          layout
          className={`
            pointer-events-auto
            flex items-center justify-between
            bg-ink px-6 py-4 transition-[max-width] duration-500
            ${isScrolled ? 'w-full max-w-6xl' : 'w-full max-w-none'}
          `}
        >
          <div className="flex items-center">
            <a
              href="#hero"
              aria-label="Andrej Zdvořák — back to top"
              className="flex min-h-11 min-w-11 items-center transition-opacity hover:opacity-80"
              onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' })}
            >
              <img src="/branding/logo-64.png" srcSet="/branding/logo-64.png 1x, /branding/logo-128.png 2x" width={32} height={32} alt="Andrej Zdvořák logo" className="h-8 w-8 object-contain" />
            </a>
          </div>

          <nav className="hidden items-center gap-7 text-base font-medium leading-none md:flex md:gap-10">
            {(['about', 'projects', 'skills', 'experience', 'contact'] as const).map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex items-center whitespace-nowrap text-soft-white transition-colors hover:text-signal-pink"
              >
                {t.nav[id]}
              </a>
            ))}
            <LanguageSwitcher />
          </nav>

          <button
            ref={menuRef}
            type="button"
            className="min-h-11 min-w-11 cursor-pointer shrink-0 p-2 text-soft-white transition-colors hover:text-signal-pink md:hidden"
            onClick={() => setIsMenuOpen(true)}
            aria-label={t.nav.openMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            <Menu size={20} />
          </button>
        </motion.header>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <DialogPanel
            initialFocusRef={closeRef}
            returnFocusRef={menuRef}
            onClose={() => setIsMenuOpen(false)}
            aria-label={t.footer.navigation}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
            className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink px-4 py-24"
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
          >
            <button
              ref={closeRef}
              type="button"
              aria-label={t.nav.closeMenu}
              onClick={() => setIsMenuOpen(false)}
              className="absolute right-6 top-6 border border-transparent p-4 text-soft-white transition-colors hover:border-white-line hover:text-signal-pink"
            >
              <X size={32} />
            </button>

            <nav className="my-auto flex flex-col items-center gap-8">
              {(['about', 'projects', 'skills', 'experience', 'contact'] as const).map((id, index) => (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.12, delay: reducedMotion ? 0 : index * 0.025 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-heading text-3xl font-normal text-soft-white transition-colors hover:text-signal-pink"
                >
                  {t.nav[id]}
                </motion.a>
              ))}
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.12, delay: reducedMotion ? 0 : 0.125 }}
              >
                <LanguageSwitcher />
              </motion.div>
            </nav>
          </DialogPanel>
        )}
      </AnimatePresence>
    </>
  )
}
