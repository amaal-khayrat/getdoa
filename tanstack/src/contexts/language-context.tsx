import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type Language = 'en' | 'my'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

// Translation keys
const translations = {
  en: {
    language: 'English',
    backToGetDoa: 'Back to GetDoa',
    login: 'Log In',
    signUp: 'Sign Up',
    searchPlaceholder: 'Search prayers, meanings, or references...',
    meaning: 'Meaning',
    noPrayersFound: 'No prayers found',
    tryAdjustingSearch: 'Try adjusting your search or filter criteria',
    showingPrayers: 'Showing {from}-{to} of {total} prayers',
    pageTitle: 'Doa Library - GetDoa',
    pageDescription:
      'Explore our comprehensive collection of authentic Islamic prayers and supplications with translations and references.',
  },
  my: {
    language: 'Bahasa Melayu',
    backToGetDoa: 'Kembali ke GetDoa',
    login: 'Log Masuk',
    signUp: 'Daftar',
    searchPlaceholder: 'Cari doa, maksud, atau rujukan...',
    meaning: 'Maksud',
    noPrayersFound: 'Tiada doa dijumpai',
    tryAdjustingSearch: 'Cuba laraskan carian atau kriteria penapis',
    showingPrayers: 'Menunjukkan {from}-{to} daripada {total} doa',
    pageTitle: 'Perpustakaan Doa - GetDoa',
    pageDescription:
      'Terokai koleksi komprehensif kami doa-doa Islam yang autentik dengan terjemahan dan rujukan.',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
