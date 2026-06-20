"use client"

import { useState } from "react"
import {
  MSG_CONTRACT_SUBMIT_FAILED,
} from "@/lib/portal-messages"
import { ProgressStepper } from "@/components/portal/progress-stepper"
import { CustomerTypeStep } from "@/components/portal/customer-type-step"
import { ExistingCustomerForm } from "@/components/portal/existing-customer-form"
import { NewCustomerForm } from "@/components/portal/new-customer-form"
import { ContractDetailsForm } from "@/components/portal/contract-details-form"
import { ReviewStep } from "@/components/portal/review-step"
import { SuccessStep } from "@/components/portal/success-step"

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
  nicPassportNumber?: string
  /** Maps to `customers.license` (driving licence number). */
  drivingLicenceNumber?: string
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
}

export default function CustomerPortal() {
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
    nicPassportNumber: "",
    drivingLicenceNumber: "",
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
  })

  const steps = ["Customer Type", "Customer Info", "Contract Details", "Review", "Success"]

  const emptyCustomerInfo = (): CustomerInfo => ({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    nicLicence: "",
    city: "",
    country: "",
    address: "",
    nicPassportNumber: "",
    drivingLicenceNumber: "",
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
          ? "Customer id is missing. Go back to Customer Info and complete registration (Continue) before confirming."
          : "Customer id is missing. Go back and verify your email and NIC/Passport again."
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
      throw new Error(MSG_CONTRACT_SUBMIT_FAILED)
    }
    if (data.contract_number) {
      setContractDetails((prev) => ({ ...prev, contractNumber: String(data.contract_number) }))
    }
    setCurrentStep(5)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CustomerTypeStep onSelect={handleCustomerTypeSelect} />
      case 2:
        return customerType === "existing" ? (
          <ExistingCustomerForm
            initialData={customerInfo}
            onSubmit={handleCustomerInfoSubmit}
            onBack={handleBack}
          />
        ) : (
          <NewCustomerForm
            initialData={customerInfo}
            onSubmit={handleCustomerInfoSubmit}
            onBack={handleBack}
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
      <main id="main-content" className="portal-shell">
        <section className="mx-auto max-w-5xl space-y-5">
          <div className="portal-panel overflow-hidden">
            <div className="sticky top-3 z-10 border-b border-border/70 bg-background/65 px-4 py-4 backdrop-blur-sm sm:px-5 lg:px-6">
              <div className="mb-3">
                <p className="section-kicker">Rental request</p>
                <h1 className="mt-3 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                  Customer portal
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
