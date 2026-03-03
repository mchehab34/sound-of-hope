import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { en, ar, type Translations } from '../i18n'

type LangContextType = {
  t: Translations
  toggleLang: () => void
}

const LangContext = createContext<LangContextType | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const t = lang === 'en' ? en : ar

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = t.dir
  }, [lang, t.dir])

  const toggleLang = () => setLang(l => (l === 'en' ? 'ar' : 'en'))

  return (
    <LangContext.Provider value={{ t, toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
