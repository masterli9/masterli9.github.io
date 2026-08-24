import { useState, useEffect } from 'react'
import { List as Menu, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../i18n/useLanguage'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { t } = useLanguage()
  const [showName, setShowName] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY
      setShowName(scrollPos > 300)
    }
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
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pointer-events-none">
        <motion.header
          layout
          className={`
            pointer-events-auto
            flex items-center justify-between
            w-full max-w-6xl border-b border-white-line bg-ink px-2 py-4
          `}
        >
          <div className="flex items-center">
            {showName && (
              <motion.div
                layoutId="shared-name"
                className="mr-8 flex cursor-pointer items-center gap-2 whitespace-nowrap font-heading text-lg font-semibold tracking-[-0.04em] text-soft-white transition-colors hover:text-signal-pink"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Andrej Zdvořák
              </motion.div>
            )}
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex md:gap-8">
            {(['about', 'projects', 'skills', 'experience', 'contact'] as const).map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="whitespace-nowrap text-muted transition-colors hover:text-signal-pink"
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
                  className="font-heading text-3xl font-medium text-soft-white transition-colors hover:text-signal-pink"
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
