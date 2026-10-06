import { useLanguage } from '../i18n/useLanguage'
import { Globe } from '@phosphor-icons/react'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'cs' ? 'en' : 'cs')
  }

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      aria-pressed="true"
      className="inline-flex cursor-pointer min-h-11 min-w-11 items-center gap-2 py-1 text-base font-medium leading-none text-soft-white transition-colors hover:text-signal-pink"
      aria-label={language === 'cs' ? 'Switch to English' : 'Přepnout do češtiny'}
    >
      <Globe size={14} aria-hidden="true" />
      <span>{language === 'cs' ? 'EN' : 'CZ'}</span>
    </button>
  )
}
