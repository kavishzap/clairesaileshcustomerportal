"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { ContractDetails, CustomerInfo, CustomerType } from "@/app/page"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { MSG_CONTRACT_SUBMIT_FAILED } from "@/lib/portal-messages"
import { ArrowLeft, Calendar, Check, Clock, Info, MapPin, User } from "lucide-react"

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err)
      }
      const description = err instanceof Error ? err.message : MSG_CONTRACT_SUBMIT_FAILED
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="section-kicker">Step 4</span>
        <h2 className="text-3xl font-serif font-semibold sm:text-4xl">Review your request</h2>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Review the customer and contract details before you confirm the request.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Customer information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customerType === "new" ? (
              <>
                <ReviewRow label="Full Name" value={`${customerInfo.firstName} ${customerInfo.lastName}`} />
                <ReviewRow label="Email" value={customerInfo.email} />
                <ReviewRow label="Phone" value={customerInfo.phone || "Not provided"} />
                <ReviewRow label="NIC / Passport" value={customerInfo.nicLicence || "Not provided"} />
                {customerInfo.drivingLicenceNumber?.trim() ? (
                  <ReviewRow label="Driving licence number" value={customerInfo.drivingLicenceNumber.trim()} />
                ) : null}
                <ReviewRow label="Location" value={`${customerInfo.city}, ${customerInfo.country}`} />
                {customerInfo.address ? <ReviewRow label="Address" value={customerInfo.address} /> : null}
              </>
            ) : (
              <>
                <ReviewRow label="Email" value={customerInfo.email} />
                <ReviewRow label="Customer Type" value="Existing customer" />
                {customerInfo.nicPassportNumber ? (
                  <ReviewRow label="NIC/Passport Number" value={customerInfo.nicPassportNumber} />
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Contract details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ReviewRow label="Rental Period" value={`${formatDate(contractDetails.startDate)} to ${formatDate(contractDetails.endDate)}`} />
            <ReviewRow
              label="Period mode"
              value={contractDetails.rentalPeriodMode === "inclusive" ? "Inclusive" : "Exclusive"}
            />
            <ReviewRow label="Duration" value={`${contractDetails.numberOfDays} ${contractDetails.numberOfDays === 1 ? "Day" : "Days"}`} />
            <ReviewRow label="Delivery Time" value={formatTime(contractDetails.deliveryTime)} icon={<Clock className="h-4 w-4" />} />
            <ReviewRow label="Recovery Time" value={formatTime(contractDetails.recoveryTime)} icon={<Clock className="h-4 w-4" />} />
            <ReviewRow label="Delivery Location" value={contractDetails.deliveryPlace} icon={<MapPin className="h-4 w-4" />} />
            <ReviewRow label="Recovery Location" value={contractDetails.recoveryPlace} icon={<MapPin className="h-4 w-4" />} />
          </CardContent>
        </Card>
      </div>

      <Alert className="border-primary/15 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--secondary)_25%,white),color-mix(in_oklch,var(--accent)_18%,white))] text-foreground">
        <Info className="h-5 w-5 text-primary" />
        <AlertDescription className="text-foreground/88">
          This request will be saved and shared with the owner on WhatsApp, and proper car
          information will be shared with you as well.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-12 px-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleConfirm} disabled={isSubmitting} className="h-12 flex-1 px-8 sm:flex-none">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Submitting...
            </span>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Confirm Request
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

function formatDate(dateString: string): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatTime(timeString: string): string {
  if (!timeString) return ""
  const [hours, minutes] = timeString.split(":")
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}
