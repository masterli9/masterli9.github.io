import { useLanguage } from '../i18n/useLanguage'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'cs' ? 'en' : 'cs')
  }

  return (
    <button
      onClick={toggleLanguage}
      className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white text-xs font-bold uppercase tracking-wider"
      aria-label={language === 'cs' ? 'Switch to English' : 'Přepnout do češtiny'}
    >
      <Globe size={14} />
      <span>{language === 'cs' ? 'EN' : 'CZ'}</span>
    </button>
  )
}
