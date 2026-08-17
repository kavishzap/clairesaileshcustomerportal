"use client"

import { Check, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/components/i18n/language-provider"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/i18n/types"

function UkFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 42" className={cn("overflow-hidden rounded-[3px]", className)} aria-hidden>
      <rect width="60" height="42" fill="#012169" />
      <path d="M0 0 L60 42 M60 0 L0 42" stroke="#fff" strokeWidth="8" />
      <path d="M0 0 L60 42 M60 0 L0 42" stroke="#C8102E" strokeWidth="4.5" />
      <path d="M30 0 V42 M0 21 H60" stroke="#fff" strokeWidth="14" />
      <path d="M30 0 V42 M0 21 H60" stroke="#C8102E" strokeWidth="8" />
    </svg>
  )
}

function FrFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 42" className={cn("overflow-hidden rounded-[3px]", className)} aria-hidden>
      <rect width="20" height="42" fill="#002654" />
      <rect x="20" width="20" height="42" fill="#fff" />
      <rect x="40" width="20" height="42" fill="#ED2939" />
    </svg>
  )
}

const OPTIONS: { value: Locale; Flag: typeof UkFlag }[] = [
  { value: "en", Flag: UkFlag },
  { value: "fr", Flag: FrFlag },
]

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage()
  const current = OPTIONS.find((option) => option.value === locale) ?? OPTIONS[0]
  const CurrentFlag = current.Flag
  const currentLabel = locale === "fr" ? t.language.french : t.language.english

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-semibold tracking-wide text-primary",
            "transition-colors hover:bg-primary/12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
          )}
          aria-label={t.language.label}
        >
          <CurrentFlag className="h-3.5 w-5 shrink-0 shadow-sm" />
          <span>{currentLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[80] min-w-[11.5rem] rounded-xl p-1">
        {OPTIONS.map(({ value, Flag }) => {
          const label = value === "fr" ? t.language.french : t.language.english
          const selected = value === locale
          return (
            <DropdownMenuItem
              key={value}
              onSelect={() => setLocale(value)}
              className="cursor-pointer gap-2 rounded-lg px-2.5 py-2"
            >
              <Flag className="h-4 w-6 shrink-0 shadow-sm" />
              <span className="flex-1 text-sm font-medium">{label}</span>
              {selected ? <Check className="h-4 w-4 text-primary" /> : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
