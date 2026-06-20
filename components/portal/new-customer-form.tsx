"use client"

import { useState } from "react"
import { CustomerInfo } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { MSG_PROFILE_SAVE_FAILED } from "@/lib/portal-messages"

interface NewCustomerFormProps {
  initialData: CustomerInfo
  onSubmit: (data: CustomerInfo) => void
  onBack: () => void
}

export function NewCustomerForm({ initialData, onSubmit, onBack }: NewCustomerFormProps) {
  const [formData, setFormData] = useState<CustomerInfo>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName?.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email) {
      newErrors.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.phone?.trim()) newErrors.phone = "Phone number is required"
    if (!formData.nicLicence?.trim()) newErrors.nicLicence = "NIC / Passport number is required"
    if (!formData.country?.trim()) newErrors.country = "Country is required"
    if (!formData.city?.trim()) newErrors.city = "City is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const existingId = (formData.customerId || initialData.customerId)?.trim()
    if (existingId) {
      toast({
        title: "New customer profile has been created",
        description: "Please continue with your contract details.",
      })
      setTimeout(() => onSubmit({ ...formData, customerId: existingId }), 200)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/portal/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          nicLicence: formData.nicLicence,
          drivingLicenceNumber: formData.drivingLicenceNumber,
          address: formData.address,
          city: formData.city,
          country: formData.country,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        hint?: string
        id?: string
      }
      if (!res.ok || !data.id) {
        if (process.env.NODE_ENV === "development") {
          console.error("Create customer API:", res.status, data)
        }
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: MSG_PROFILE_SAVE_FAILED,
        })
        return
      }

      toast({
        title: "New customer profile has been created",
        description: "Please continue with your contract details.",
      })
      setTimeout(() => onSubmit({ ...formData, customerId: data.id }), 200)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="section-kicker">Step 2</span>
        <h2 className="text-3xl font-serif font-semibold sm:text-4xl">Create your account</h2>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Fill in your details to register and create your first rental contract.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="text-xl">Personal information</CardTitle>
            <CardDescription>Enter your basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "first-name-error" : undefined}
                  className={cn("h-12 rounded-xl", errors.firstName && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.firstName && <p id="first-name-error" className="error-text">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? "last-name-error" : undefined}
                  className={cn("h-12 rounded-xl", errors.lastName && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.lastName && <p id="last-name-error" className="error-text">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "new-email-error" : undefined}
                className={cn("h-12 rounded-xl", errors.email && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.email && <p id="new-email-error" className="error-text">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+230 5798 5913"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className={cn("h-12 rounded-xl", errors.phone && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.phone && <p id="phone-error" className="error-text">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nicLicence">NIC / Passport number</Label>
              <Input
                id="nicLicence"
                placeholder="784-1990-1234567-1"
                value={formData.nicLicence}
                onChange={(e) => setFormData((prev) => ({ ...prev, nicLicence: e.target.value }))}
                aria-invalid={!!errors.nicLicence}
                aria-describedby={errors.nicLicence ? "nic-licence-error" : "nic-licence-note"}
                className={cn("h-12 rounded-xl", errors.nicLicence && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.nicLicence && <p id="nic-licence-error" className="error-text">{errors.nicLicence}</p>}
              <p id="nic-licence-note" className="field-note">
                National ID card or passport number stored with the customer profile.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drivingLicenceNumber">Driving licence number</Label>
              <Input
                id="drivingLicenceNumber"
                placeholder="e.g. D12345678"
                value={formData.drivingLicenceNumber ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    drivingLicenceNumber: e.target.value,
                  }))
                }
                className="h-12 rounded-xl"
              />
              <p className="field-note">Optional.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="text-xl">Location details</CardTitle>
            <CardDescription>Where are you based?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="e.g. Mauritius"
                  value={formData.country ?? ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                  aria-invalid={!!errors.country}
                  aria-describedby={errors.country ? "country-error" : undefined}
                  className={cn("h-12 rounded-xl", errors.country && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.country && <p id="country-error" className="error-text">{errors.country}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="e.g. Mahebourg"
                  value={formData.city ?? ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? "city-error" : undefined}
                  className={cn("h-12 rounded-xl", errors.city && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.city && <p id="city-error" className="error-text">{errors.city}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                placeholder="Building name, street name, area..."
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="min-h-[110px] resize-none rounded-xl"
              />
              <p className="field-note">
                Optional: Provide your full address for delivery purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Button type="button" variant="outline" onClick={onBack} className="h-12 px-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-12 flex-1 px-8 sm:flex-none">
            {isSubmitting ? (
              "Processing..."
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
