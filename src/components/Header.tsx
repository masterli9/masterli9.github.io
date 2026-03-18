import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../i18n/useLanguage'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { t } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)
  const [showName, setShowName] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY
      setIsScrolled(scrollPos > 20)
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
      <div className="fixed w-full z-50 top-6 px-4 flex justify-center pointer-events-none">
        <motion.header
          layout
          className={`
            pointer-events-auto
            transition-colors duration-500 ease-in-out
            flex items-center justify-between
            px-8 py-4
            rounded-2xl
            shadow-2xl
            ${isScrolled
              ? 'bg-background-dark/80 backdrop-blur-xl border border-white/10'
              : 'bg-background-dark/30 backdrop-blur-md border border-white/5'
            }
            ${showName ? 'max-w-5xl w-full' : 'max-w-max'}
          `}
        >
          <div className="flex items-center">
            {showName && (
              <motion.div
                layoutId="shared-name"
                className="font-heading font-black text-lg tracking-tighter text-white whitespace-nowrap mr-8 cursor-pointer hover:text-brand-neonGreen transition-colors flex items-center gap-2"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <img src="Logo.png" alt="logo" className='w-5 h-5' />
                ANDREJ  ZDVOŘÁK
              </motion.div>
            )}
          </div>

          <nav className="hidden md:flex gap-6 md:gap-8 text-[11px] font-bold tracking-[0.2em] uppercase items-center">
            {(['about', 'projects', 'skills', 'experience', 'contact'] as const).map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-white/60 hover:text-brand-neonGreen transition-colors whitespace-nowrap"
              >
                {t.nav[id]}
              </a>
            ))}
            <LanguageSwitcher />
          </nav>

          <button
            className="cursor-pointer md:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
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
            className="fixed inset-0 z-[60] bg-background-dark/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 p-4 text-white hover:bg-white/10 rounded-full transition-colors"
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
                  className="text-2xl font-heading font-bold text-white hover:text-brand-neonGreen transition-colors tracking-widest uppercase"
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
