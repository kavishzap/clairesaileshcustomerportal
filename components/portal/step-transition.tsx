"use client"

import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/components/i18n/language-provider"

interface StepTransitionOverlayProps {
  open: boolean
  stepName: string
  onDismiss: () => void
}

export function StepTransitionOverlay({
  open,
  stepName,
  onDismiss,
}: StepTransitionOverlayProps) {
  const { t, tf } = useLanguage()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/35 px-4 backdrop-blur-[2px] animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-md rounded-[1.75rem] border border-white/50 bg-white/92 p-7 text-center shadow-[0_28px_80px_-28px_rgba(15,36,74,0.55)] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(145deg,var(--accent),color-mix(in_oklch,var(--secondary)_72%,white))]">
          <ArrowRight className="h-6 w-6 text-foreground" />
        </div>
        <p className="font-serif text-xl font-semibold leading-snug text-foreground sm:text-2xl">
          {t.transition.proceeded}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {tf(t.transition.nowOn, { step: stepName })}
        </p>
      </div>
    </div>
  )
}
