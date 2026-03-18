import { createContext, useState, type ReactNode, useMemo } from 'react'
import { translations, type Language } from './translations'

type TranslationType = typeof translations.cs | typeof translations.en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationType
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getInitialLanguage(): Language {
  // Check localStorage first (only runs on client)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('portfolio-language') as Language | null
    if (stored && (stored === 'cs' || stored === 'en')) {
      return stored
    }

    // Check browser language
    const browserLang = navigator.language.toLowerCase()
    
    // Czech or Slovak users get Czech version
    if (browserLang.startsWith('cs') || browserLang.startsWith('sk')) {
      return 'cs'
    }
    
    // Everyone else gets English
    return 'en'
  }
  
  return 'cs'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('portfolio-language', lang)
  }

  const t = useMemo(() => translations[language], [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
