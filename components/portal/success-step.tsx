"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { ContractDetails } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Check, CheckCircle2, Copy, CreditCard, Home, MapPin, MessageCircle } from "lucide-react"
import { buildOwnerWhatsAppUrl } from "@/lib/portal-owner"
import { getPaymentOptionLabel } from "@/lib/portal-payment-options"
import { useLanguage } from "@/components/i18n/language-provider"
import { formatShortDate } from "@/lib/i18n/format"

interface SuccessStepProps {
  contractDetails: ContractDetails
}

export function SuccessStep({ contractDetails }: SuccessStepProps) {
  const { locale, t, tf } = useLanguage()
  const [copied, setCopied] = useState(false)

  const copyContractNumber = () => {
    navigator.clipboard.writeText(contractDetails.contractNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappUrl = buildOwnerWhatsAppUrl(
    tf(t.success.whatsappMessage, { contractNumber: contractDetails.contractNumber })
  )

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(145deg,color-mix(in_oklch,var(--success)_45%,white),color-mix(in_oklch,var(--accent)_36%,white))] shadow-[0_26px_52px_-28px_rgba(26,128,76,0.55)] animate-in zoom-in duration-500">
            <CheckCircle2 className="h-14 w-14 text-success-foreground" />
          </div>
          <div className="absolute inset-0 h-24 w-24 rounded-full bg-success/15 animate-ping" />
        </div>

        <div className="mt-5 space-y-2">
          <span className="section-kicker">{tf(t.common.step, { n: 5 })}</span>
          <h2 className="mt-4 text-3xl font-serif font-semibold sm:text-4xl">
            {t.success.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground">
            {t.success.intro}
          </p>
        </div>
      </div>

      <Card className="portal-card rounded-[1.9rem] border-accent/35 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--accent)_24%,white),white)]">
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t.success.contractNumber}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <p className="break-all text-3xl font-bold tracking-[0.18em] text-foreground sm:text-4xl">
                {contractDetails.contractNumber}
              </p>
              <Button
                variant="outline"
                size="icon"
                onClick={copyContractNumber}
                aria-label={t.success.copyAria}
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="field-note">{t.success.keepNumber}</p>

            <div className="mt-6 rounded-[1.6rem] border border-success/25 bg-white/68 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-success-foreground">
                {t.success.notifyTitle}
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-foreground/88">
                {t.success.notifyBody}
              </p>
              <Button asChild className="mt-5 h-12 w-full bg-[linear-gradient(145deg,#1f9a5c,#147444)] text-white hover:brightness-105">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t.success.sendWhatsapp}
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="portal-card rounded-[1.75rem]">
        <CardHeader>
          <CardTitle className="text-lg">{t.success.summary}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SummaryItem
            icon={<Calendar className="h-4 w-4 text-foreground" />}
            title={t.success.rentalPeriod}
            detail={`${formatShortDate(contractDetails.startDate, locale)} ${t.common.to} ${formatShortDate(contractDetails.endDate, locale)}`}
            caption={`${contractDetails.numberOfDays} ${contractDetails.numberOfDays === 1 ? t.common.day : t.common.days}`}
          />
          <SummaryItem
            icon={<MapPin className="h-4 w-4 text-foreground" />}
            title={t.success.locations}
            detail={tf(t.success.delivery, { place: contractDetails.deliveryPlace })}
            caption={tf(t.success.recovery, { place: contractDetails.recoveryPlace })}
          />
          {contractDetails.paymentMode ? (
            <SummaryItem
              icon={<CreditCard className="h-4 w-4 text-foreground" />}
              title={t.success.paymentOption}
              detail={getPaymentOptionLabel(contractDetails.paymentMode, t.payment)}
              caption={t.success.selectedPayment}
            />
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={() => (window.location.href = "/")} className="h-12 w-full max-w-md px-6">
          <Home className="mr-2 h-4 w-4" />
          {t.success.backToPortal}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          {t.success.questions}{" "}
          <a href="mailto:support@clairesailesh.com" className="font-semibold text-primary hover:underline">
            support@clairesailesh.com
          </a>
        </p>
      </div>
    </div>
  )
}

function SummaryItem({
  icon,
  title,
  detail,
  caption,
}: {
  icon: ReactNode
  title: string
  detail: string
  caption: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-[1.25rem] border border-border/55 bg-white/45 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,var(--accent),color-mix(in_oklch,var(--secondary)_72%,white))]">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
      </div>
    </div>
  )
}
