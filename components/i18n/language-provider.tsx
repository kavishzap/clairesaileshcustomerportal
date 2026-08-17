"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { en } from "@/lib/i18n/en"
import { fr } from "@/lib/i18n/fr"
import {
  interpolate,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
  type Messages,
} from "@/lib/i18n/types"

const dictionaries: Record<Locale, Messages> = { en, fr }

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Messages
  tf: (template: string, vars: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en"
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored && isLocale(stored)) return stored
  const browser = window.navigator.language.toLowerCase()
  return browser.startsWith("fr") ? "fr" : "en"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    setLocaleState(detectLocale())
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = dictionaries[locale].header.documentTitle
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next)
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
      tf: interpolate,
    }),
    [locale, setLocale]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
