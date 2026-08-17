"use client"

import { CustomerType } from "@/app/page"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowRight, UserCheck, UserPlus } from "lucide-react"
import { useLanguage } from "@/components/i18n/language-provider"

interface CustomerTypeStepProps {
  onSelect: (type: CustomerType) => void
}

export function CustomerTypeStep({ onSelect }: CustomerTypeStepProps) {
  const { t, tf } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <span className="section-kicker">{tf(t.common.step, { n: 1 })}</span>
        <div className="max-w-3xl space-y-3">
          <h2 className="break-words text-2xl font-serif font-semibold leading-snug sm:text-3xl">
            {t.customerType.title}
          </h2>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            {t.customerType.intro}
          </p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-border/70 bg-secondary/25 p-4 sm:p-5">
        <h3 className="text-base font-semibold text-foreground">{t.customerType.question}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {t.customerType.questionHint}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectionCard
          icon={UserCheck}
          title={t.customerType.existingTitle}
          description={t.customerType.existingDesc}
          continueLabel={t.common.continue}
          onClick={() => onSelect("existing")}
        />
        <SelectionCard
          icon={UserPlus}
          title={t.customerType.newTitle}
          description={t.customerType.newDesc}
          continueLabel={t.common.continue}
          onClick={() => onSelect("new")}
        />
      </div>
    </div>
  )
}

function SelectionCard({
  icon: Icon,
  title,
  description,
  continueLabel,
  onClick,
}: {
  icon: typeof UserCheck
  title: string
  description: string
  continueLabel: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <Card
        className={cn(
          "group h-full cursor-pointer overflow-hidden border-border/70 transition-all duration-300",
          "hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_28px_60px_-36px_rgba(15,36,74,0.5)]",
          "focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-ring/25",
          "active:translate-y-0"
        )}
      >
        <CardContent className="p-6 sm:p-7">
          <div className="flex h-full flex-col">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(145deg,var(--accent),color-mix(in_oklch,var(--secondary)_72%,white))] shadow-inner">
              <Icon className="h-6 w-6 text-foreground" />
            </div>
            <h4 className="mb-2 text-lg font-semibold group-hover:text-primary">
              {title}
            </h4>
            <p className="flex-1 text-sm leading-7 text-muted-foreground">
              {description}
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
              <span>{continueLabel}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}
