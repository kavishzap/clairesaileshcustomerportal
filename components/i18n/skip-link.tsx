"use client"

import { useLanguage } from "@/components/i18n/language-provider"

export function SkipLink() {
  const { t } = useLanguage()
  return (
    <a href="#main-content" className="skip-link">
      {t.skipLink}
    </a>
  )
}
