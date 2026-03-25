"use client"

import { useState } from "react"
import { CustomerType, CustomerInfo, ContractDetails } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Check, User, MapPin, Calendar, Clock, Info } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { MSG_CONTRACT_SUBMIT_FAILED } from "@/lib/portal-messages"

interface ReviewStepProps {
  customerType: CustomerType
  customerInfo: CustomerInfo
  contractDetails: ContractDetails
  onConfirm: () => Promise<void>
  onBack: () => void
}

export function ReviewStep({ customerType, customerInfo, contractDetails, onConfirm, onBack }: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err)
      }
      const description =
        err instanceof Error ? err.message : MSG_CONTRACT_SUBMIT_FAILED
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
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-serif font-medium">Review Your Request</h2>
        <p className="text-muted-foreground">
          Please review all details before confirming your rental contract request.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer Information Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customerType === "new" ? (
              <>
                <ReviewRow
                  label="Full Name"
                  value={`${customerInfo.firstName} ${customerInfo.lastName}`}
                />
                <ReviewRow label="Email" value={customerInfo.email} />
                <ReviewRow label="Phone" value={customerInfo.phone || "—"} />
                <ReviewRow label="NIC / Passport" value={customerInfo.nicLicence || "—"} />
                {customerInfo.drivingLicenceNumber?.trim() ? (
                  <ReviewRow
                    label="Driving licence number"
                    value={customerInfo.drivingLicenceNumber.trim()}
                  />
                ) : null}
                <ReviewRow
                  label="Location"
                  value={`${customerInfo.city}, ${customerInfo.country}`}
                />
                {customerInfo.address && (
                  <ReviewRow label="Address" value={customerInfo.address} />
                )}
              </>
            ) : (
              <>
                <ReviewRow label="Email" value={customerInfo.email} />
                <ReviewRow label="Customer Type" value="Existing Customer" />
                {customerInfo.nicPassportNumber && (
                  <ReviewRow
                    label="NIC/Passport Number"
                    value={customerInfo.nicPassportNumber}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Contract Details Card */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              Contract Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ReviewRow 
              label="Rental Period" 
              value={`${formatDate(contractDetails.startDate)} – ${formatDate(contractDetails.endDate)}`} 
            />
            <ReviewRow 
              label="Duration" 
              value={`${contractDetails.numberOfDays} ${contractDetails.numberOfDays === 1 ? "Day" : "Days"}`} 
            />
            <ReviewRow 
              label="Delivery Time" 
              value={formatTime(contractDetails.deliveryTime)}
              icon={<Clock className="w-4 h-4" />}
            />
            <ReviewRow 
              label="Recovery Time" 
              value={formatTime(contractDetails.recoveryTime)}
              icon={<Clock className="w-4 h-4" />}
            />
            <ReviewRow
              label="Delivery Location"
              value={contractDetails.deliveryPlace}
              icon={<MapPin className="w-4 h-4" />}
            />
            <ReviewRow
              label="Recovery Location"
              value={contractDetails.recoveryPlace}
              icon={<MapPin className="w-4 h-4" />}
            />
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="rounded-xl border-blue-500/20 bg-blue-500/5">
        <Info className="w-5 h-5 text-blue-600" />
        <AlertDescription className="text-blue-800">
          This request will be saved and shared with the owner on WhatsApp, and proper car
          information will be shared with you as well.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-12 rounded-xl px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="h-12 rounded-xl px-8 flex-1 sm:flex-none"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
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
  icon 
}: { 
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex justify-between items-start gap-4 py-1">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-right">{value}</span>
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
