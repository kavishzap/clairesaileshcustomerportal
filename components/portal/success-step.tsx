"use client"

import { ContractDetails } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Home, MessageCircle, Calendar, MapPin, Copy, Check } from "lucide-react"
import { useState } from "react"

const OWNER_WHATSAPP_E164 = "23057985913"

function buildOwnerWhatsAppUrl(contractNumber: string): string {
  const text = `Hey — a rental contract request was submitted with all details filled in. Contract: ${contractNumber}. Please confirm and share vehicle / car information with the customer.`
  return `https://wa.me/${OWNER_WHATSAPP_E164}?text=${encodeURIComponent(text)}`
}

interface SuccessStepProps {
  contractDetails: ContractDetails
}

export function SuccessStep({ contractDetails }: SuccessStepProps) {
  const [copied, setCopied] = useState(false)

  const copyContractNumber = () => {
    navigator.clipboard.writeText(contractDetails.contractNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Success Animation */}
      <div className="text-center space-y-4">
        <div className="relative inline-flex">
          <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-500">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-green-500/20 animate-ping" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-balance">
            Request Submitted Successfully
          </h2>
          <p className="text-muted-foreground">
            Your rental contract request has been received. We&apos;ll be in touch shortly.
          </p>
        </div>
      </div>

      {/* Contract Number Card */}
      <Card className="rounded-2xl border-accent/30 bg-accent/5">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Your Contract Number</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl font-bold font-mono tracking-wider">
                {contractDetails.contractNumber}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyContractNumber}
                className="h-9 w-9 rounded-lg"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep this number for your records
            </p>

            <div className="mt-6 pt-6 border-t border-green-500/25 -mx-6 px-6 pb-6 rounded-b-2xl bg-green-500/5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-2">
                Important — notify the owner
              </p>
              <p className="text-sm text-foreground/90 mb-4 max-w-md mx-auto">
                Send a WhatsApp so the owner knows you submitted this request with complete
                details. They can then assign a vehicle and share car information with you.
              </p>
              <Button
                asChild
                className="w-full h-12 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-900/10"
              >
                <a
                  href={buildOwnerWhatsAppUrl(contractDetails.contractNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send WhatsApp to owner
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Summary Card */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Rental Period</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(contractDetails.startDate)} – {formatDate(contractDetails.endDate)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {contractDetails.numberOfDays} {contractDetails.numberOfDays === 1 ? "Day" : "Days"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Locations</p>
              <p className="text-sm text-muted-foreground">
                Delivery: {contractDetails.deliveryPlace}
              </p>
              <p className="text-sm text-muted-foreground">
                Recovery: {contractDetails.recoveryPlace}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="h-12 rounded-xl px-6 w-full sm:max-w-md mx-auto"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Portal
        </Button>
      </div>

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Questions? Contact us at{" "}
          <a href="mailto:support@clairesailesh.com" className="text-primary hover:underline">
            support@clairesailesh.com
          </a>
        </p>
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
