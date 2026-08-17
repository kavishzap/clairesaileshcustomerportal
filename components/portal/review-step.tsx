"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { ContractDetails, CustomerInfo, CustomerType } from "@/app/page"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { getPaymentOptionLabel } from "@/lib/portal-payment-options"
import { ArrowLeft, Calendar, Check, Clock, CreditCard, Info, MapPin, User } from "lucide-react"
import { useLanguage } from "@/components/i18n/language-provider"
import { formatLongDate, formatTime } from "@/lib/i18n/format"

interface ReviewStepProps {
  customerType: CustomerType
  customerInfo: CustomerInfo
  contractDetails: ContractDetails
  onConfirm: () => Promise<void>
  onBack: () => void
}

export function ReviewStep({
  customerType,
  customerInfo,
  contractDetails,
  onConfirm,
  onBack,
}: ReviewStepProps) {
  const { locale, t, tf } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err)
      }
      const description = err instanceof Error ? err.message : t.messages.contractSubmitFailed
      toast({
        variant: "destructive",
        title: t.messages.somethingWentWrong,
        description,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="section-kicker">{tf(t.common.step, { n: 4 })}</span>
        <h2 className="text-3xl font-serif font-semibold sm:text-4xl">{t.review.title}</h2>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          {t.review.intro}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              {t.review.customerInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customerType === "new" ? (
              <>
                <ReviewRow label={t.review.fullName} value={`${customerInfo.firstName} ${customerInfo.lastName}`} />
                <ReviewRow label={t.review.email} value={customerInfo.email} />
                <ReviewRow label={t.review.phone} value={customerInfo.phone || t.common.notProvided} />
                <ReviewRow label={t.review.nic} value={customerInfo.nicLicence || t.common.notProvided} />
                {customerInfo.age?.trim() ? (
                  <ReviewRow label={t.review.age} value={customerInfo.age.trim()} />
                ) : null}
                {customerInfo.drivingLicenceNumber?.trim() ? (
                  <ReviewRow label={t.review.drivingLicenceNumber} value={customerInfo.drivingLicenceNumber.trim()} />
                ) : null}
                {customerInfo.drivingExp?.trim() ? (
                  <ReviewRow
                    label={t.review.drivingExp}
                    value={`${customerInfo.drivingExp.trim()} ${Number(customerInfo.drivingExp) === 1 ? t.common.year : t.common.years}`}
                  />
                ) : null}
                <ReviewRow label={t.review.location} value={`${customerInfo.city}, ${customerInfo.country}`} />
                {customerInfo.flightNumber?.trim() ? (
                  <ReviewRow label={t.review.flightNumber} value={customerInfo.flightNumber.trim()} />
                ) : null}
                {customerInfo.address ? <ReviewRow label={t.review.address} value={customerInfo.address} /> : null}
              </>
            ) : (
              <>
                <ReviewRow label={t.review.email} value={customerInfo.email} />
                <ReviewRow label={t.review.customerType} value={t.review.existingCustomer} />
                {customerInfo.nicPassportNumber ? (
                  <ReviewRow label={t.review.nicNumber} value={customerInfo.nicPassportNumber} />
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              {t.review.contractDetails}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ReviewRow
              label={t.review.rentalPeriod}
              value={`${formatLongDate(contractDetails.startDate, locale)} ${t.common.to} ${formatLongDate(contractDetails.endDate, locale)}`}
            />
            <ReviewRow
              label={t.review.periodMode}
              value={contractDetails.rentalPeriodMode === "inclusive" ? t.contract.inclusive : t.contract.exclusive}
            />
            <ReviewRow
              label={t.review.duration}
              value={`${contractDetails.numberOfDays} ${contractDetails.numberOfDays === 1 ? t.common.day : t.common.days}`}
            />
            <ReviewRow label={t.review.deliveryTime} value={formatTime(contractDetails.deliveryTime, locale)} icon={<Clock className="h-4 w-4" />} />
            <ReviewRow label={t.review.recoveryTime} value={formatTime(contractDetails.recoveryTime, locale)} icon={<Clock className="h-4 w-4" />} />
            <ReviewRow label={t.review.deliveryLocation} value={contractDetails.deliveryPlace} icon={<MapPin className="h-4 w-4" />} />
            <ReviewRow label={t.review.recoveryLocation} value={contractDetails.recoveryPlace} icon={<MapPin className="h-4 w-4" />} />
            <ReviewRow
              label={t.review.paymentOption}
              value={
                contractDetails.paymentMode
                  ? getPaymentOptionLabel(contractDetails.paymentMode, t.payment)
                  : t.common.notSelected
              }
              icon={<CreditCard className="h-4 w-4" />}
            />
          </CardContent>
        </Card>
      </div>

      <Alert className="border-primary/15 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--secondary)_25%,white),color-mix(in_oklch,var(--accent)_18%,white))] text-foreground">
        <Info className="h-5 w-5 text-primary" />
        <AlertDescription className="text-foreground/88">
          {t.review.notice}
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-12 px-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.common.back}
        </Button>
        <Button onClick={handleConfirm} disabled={isSubmitting} className="h-12 flex-1 px-8 sm:flex-none">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              {t.common.submitting}
            </span>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t.review.confirm}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 rounded-[1.15rem] border border-border/55 bg-white/45 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground sm:max-w-[52%] sm:text-right">{value}</span>
    </div>
  )
}
