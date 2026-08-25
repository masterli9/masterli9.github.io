import { useState, useEffect } from 'react'
import { List as Menu, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../i18n/useLanguage'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { t } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

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
              className="flex items-center transition-opacity hover:opacity-80"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img src="/Logo.png" alt="Andrej Zdvořák logo" className="h-8 w-8 object-contain" />
            </a>
          </div>

          <nav className="hidden items-center gap-7 text-base font-medium leading-none md:flex md:gap-10">
            {(['about', 'projects', 'skills', 'experience', 'contact'] as const).map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex items-center whitespace-nowrap text-muted transition-colors hover:text-signal-pink"
              >
                {t.nav[id]}
              </a>
            ))}
            <LanguageSwitcher />
          </nav>

          <button
            type="button"
            className="cursor-pointer shrink-0 p-2 text-soft-white transition-colors hover:text-signal-pink md:hidden"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            <Menu size={20} />
          </button>
        </motion.header>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink p-4"
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
              className="absolute right-6 top-6 border border-transparent p-4 text-soft-white transition-colors hover:border-white-line hover:text-signal-pink"
            >
              <X size={32} />
            </button>

            <nav className="flex flex-col items-center gap-8">
              {(['about', 'projects', 'skills', 'experience', 'contact'] as const).map((id, index) => (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-heading text-3xl font-normal text-soft-white transition-colors hover:text-signal-pink"
                >
                  {t.nav[id]}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <LanguageSwitcher />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
