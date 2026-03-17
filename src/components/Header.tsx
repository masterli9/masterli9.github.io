import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showName, setShowName] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY
      setIsScrolled(scrollPos > 20)
      setShowName(scrollPos > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
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
                    className="font-heading font-black text-lg tracking-tighter text-white whitespace-nowrap mr-8 cursor-pointer hover:text-brand-neonGreen transition-colors"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    ANDREJ ZDVOŘÁK
                </motion.div>
            )}
        </div>

        <nav className="flex gap-6 md:gap-8 text-[11px] font-bold tracking-[0.2em] uppercase items-center">
          {['about', 'projects', 'skills', 'experience', 'contact'].map((id) => (
            <a 
              key={id} 
              href={`#${id}`} 
              className="text-white/60 hover:text-brand-neonGreen transition-colors whitespace-nowrap"
            >
              {id === 'about' ? 'O mně' : id === 'skills' ? 'Dovednosti' : id === 'projects' ? 'Projekty' : id === 'experience' ? 'Zkušenosti' : 'Kontakt'}
            </a>
          ))}
        </nav>

        {showName && (
          <button 
            className="md:hidden text-white ml-6 p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        )}
      </motion.header>
    </div>
  )
}
