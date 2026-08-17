"use client"

import { useEffect, useRef, useState } from "react"
import { ProgressStepper } from "@/components/portal/progress-stepper"
import { LanguageSwitcher } from "@/components/portal/language-switcher"
import { StepTransitionOverlay } from "@/components/portal/step-transition"
import { useLanguage } from "@/components/i18n/language-provider"
import { CustomerTypeStep } from "@/components/portal/customer-type-step"
import { ExistingCustomerForm } from "@/components/portal/existing-customer-form"
import { NewCustomerForm } from "@/components/portal/new-customer-form"
import { ContractDetailsForm } from "@/components/portal/contract-details-form"
import { ReviewStep } from "@/components/portal/review-step"
import { SuccessStep } from "@/components/portal/success-step"
import type { PaymentOption } from "@/lib/portal-payment-options"

export type CustomerType = "existing" | "new" | null

export interface CustomerInfo {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  nicLicence?: string
  city?: string
  country?: string
  address?: string
  /** Maps to `customers.flight_number`. */
  flightNumber?: string
  nicPassportNumber?: string
  /** Maps to `customers.age`. */
  age?: string
  /** Maps to `customers.license` (driving licence number). */
  drivingLicenceNumber?: string
  /** Maps to `customers.driving_exp` (years of driving experience). */
  drivingExp?: string
  /** Supabase `customers.id` — set after existing-customer verification or new-customer POST on step 2. */
  customerId?: string
}

export interface ContractDetails {
  customerStatus: string
  draftStatus: string
  rentalPeriodMode: "inclusive" | "exclusive"
  startDate: string
  endDate: string
  deliveryTime: string
  recoveryTime: string
  deliveryPlace: string
  recoveryPlace: string
  numberOfDays: number
  contractNumber: string
  /** Maps to `contracts_details.payment_mode`. */
  paymentMode: PaymentOption | ""
}

export default function CustomerPortal() {
  const { t } = useLanguage()
  const [currentStep, setCurrentStep] = useState(1)
  const [customerType, setCustomerType] = useState<CustomerType>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(() => ({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    nicLicence: "",
    city: "",
    country: "",
    address: "",
    flightNumber: "",
    nicPassportNumber: "",
    age: "",
    drivingLicenceNumber: "",
    drivingExp: "",
    customerId: undefined,
  }))
  const [contractDetails, setContractDetails] = useState<ContractDetails>({
    customerStatus: "",
    draftStatus: "",
    rentalPeriodMode: "inclusive",
    startDate: "",
    endDate: "",
    deliveryTime: "",
    recoveryTime: "",
    deliveryPlace: "",
    recoveryPlace: "",
    numberOfDays: 0,
    contractNumber: `CS-2026-${String(Math.floor(Math.random() * 900000) + 100000).slice(0, 6)}`,
    paymentMode: "",
  })
  const previousStepRef = useRef(currentStep)
  const [transitionOpen, setTransitionOpen] = useState(false)

  const steps = [
    t.stepper.customerType,
    t.stepper.customerInfo,
    t.stepper.contractDetails,
    t.stepper.review,
    t.stepper.success,
  ]

  const emptyCustomerInfo = (): CustomerInfo => ({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    nicLicence: "",
    city: "",
    country: "",
    address: "",
    flightNumber: "",
    nicPassportNumber: "",
    age: "",
    drivingLicenceNumber: "",
    drivingExp: "",
    customerId: undefined,
  })

  const handleCustomerTypeSelect = (type: CustomerType) => {
    setCustomerType(type)
    setCustomerInfo(emptyCustomerInfo())
    setCurrentStep(2)
  }

  const handleCustomerInfoSubmit = (info: CustomerInfo) => {
    setCustomerInfo(info)
    setCurrentStep(3)
  }

  const handleContractDetailsSubmit = (details: ContractDetails) => {
    setContractDetails(details)
    setCurrentStep(4)
  }

  const handleConfirmRequest = async () => {
    const id = customerInfo.customerId?.trim()
    if (!id) {
      throw new Error(
        customerType === "new"
          ? t.messages.customerIdMissingNew
          : t.messages.customerIdMissingExisting
      )
    }
    const res = await fetch("/api/portal/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerType,
        customerInfo,
        contractDetails,
      }),
    })
    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      hint?: string
      contract_number?: string
    }
    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error("Contract API error:", res.status, data)
      }
      throw new Error(t.messages.contractSubmitFailed)
    }
    if (data.contract_number) {
      setContractDetails((prev) => ({ ...prev, contractNumber: String(data.contract_number) }))
    }
    setCurrentStep(5)
  }

  const scrollToPageTop = () => {
    const html = document.documentElement
    const previousBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = "auto"
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    html.scrollTop = 0
    document.body.scrollTop = 0
    html.style.scrollBehavior = previousBehavior
  }

  useEffect(() => {
    const previousStep = previousStepRef.current
    previousStepRef.current = currentStep
    scrollToPageTop()
    const frame = window.requestAnimationFrame(scrollToPageTop)
    const timeout = window.setTimeout(scrollToPageTop, 50)
    if (currentStep > previousStep) {
      setTransitionOpen(true)
    }
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
    }
  }, [currentStep])

  useEffect(() => {
    if (!transitionOpen) return
    const timer = window.setTimeout(() => setTransitionOpen(false), 1700)
    return () => window.clearTimeout(timer)
  }, [transitionOpen, currentStep])

  const handleBack = () => {
    if (currentStep <= 1) return
    const profileCreated = Boolean(customerInfo.customerId?.trim())
    if (profileCreated && currentStep >= 3) {
      setCustomerType(null)
      setCurrentStep(1)
      return
    }
    setCurrentStep(currentStep - 1)
  }

  const handleSwitchToExisting = (email: string) => {
    setCustomerType("existing")
    setCustomerInfo({
      ...emptyCustomerInfo(),
      email: email.trim().toLowerCase(),
    })
    setCurrentStep(2)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CustomerTypeStep onSelect={handleCustomerTypeSelect} />
      case 2:
        return customerType === "existing" ? (
          <ExistingCustomerForm
            key={`existing-${customerInfo.email || "blank"}`}
            initialData={customerInfo}
            onSubmit={handleCustomerInfoSubmit}
            onBack={handleBack}
          />
        ) : (
          <NewCustomerForm
            initialData={customerInfo}
            onSubmit={handleCustomerInfoSubmit}
            onBack={handleBack}
            onSwitchToExisting={handleSwitchToExisting}
          />
        )
      case 3:
        return (
          <ContractDetailsForm
            initialData={contractDetails}
            onSubmit={handleContractDetailsSubmit}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <ReviewStep
            customerType={customerType}
            customerInfo={customerInfo}
            contractDetails={contractDetails}
            onConfirm={handleConfirmRequest}
            onBack={handleBack}
          />
        )
      case 5:
        return (
          <SuccessStep contractDetails={contractDetails} />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <StepTransitionOverlay
        open={transitionOpen}
        stepName={steps[currentStep - 1] ?? ""}
        onDismiss={() => setTransitionOpen(false)}
      />
      <main id="main-content" className="portal-shell">
        <section className="mx-auto max-w-5xl space-y-5">
          <div className="portal-panel overflow-hidden">
            <div className="sticky top-3 z-10 border-b border-border/70 bg-background/65 px-4 py-4 backdrop-blur-sm sm:px-5 lg:px-6">
              <div className="mb-3">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="section-kicker">{t.header.rentalRequest}</p>
                  <LanguageSwitcher />
                </div>
                <h1 className="mt-3 break-words font-serif text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
                  {t.header.welcome}
                </h1>
              </div>
              <ProgressStepper steps={steps} currentStep={currentStep} />
            </div>

            <div className="px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-7">
              {renderStep()}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
