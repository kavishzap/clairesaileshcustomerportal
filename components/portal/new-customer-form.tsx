"use client"

import { useState } from "react"
import { CustomerInfo } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!formData.email) {
      newErrors.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required"
    }
    if (!formData.nicLicence?.trim()) {
      newErrors.nicLicence = "NIC / Passport number is required"
    }
    if (!formData.country?.trim()) {
      newErrors.country = "Country is required"
    }
    if (!formData.city?.trim()) {
      newErrors.city = "City is required"
    }

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
      setTimeout(
        () => onSubmit({ ...formData, customerId: existingId }),
        200
      )
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
      if (!res.ok) {
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
      if (!data.id) {
        if (process.env.NODE_ENV === "development") {
          console.error("Create customer: missing id in response", data)
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
      setTimeout(
        () =>
          onSubmit({
            ...formData,
            customerId: data.id,
          }),
        200
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-serif font-medium">Create Your Account</h2>
        <p className="text-muted-foreground">
          Fill in your details to register and create your first rental contract.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Enter your basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className={cn(
                    "h-12 rounded-xl",
                    errors.firstName && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className={cn(
                    "h-12 rounded-xl",
                    errors.lastName && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={cn(
                  "h-12 rounded-xl",
                  errors.email && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+971 50 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={cn(
                  "h-12 rounded-xl",
                  errors.phone && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nicLicence">NIC / Passport number</Label>
              <Input
                id="nicLicence"
                placeholder="784-1990-1234567-1"
                value={formData.nicLicence}
                onChange={(e) => setFormData(prev => ({ ...prev, nicLicence: e.target.value }))}
                className={cn(
                  "h-12 rounded-xl",
                  errors.nicLicence && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.nicLicence && (
                <p className="text-sm text-destructive">{errors.nicLicence}</p>
              )}
              <p className="text-xs text-muted-foreground">
                National ID Card or passport number (stored as NIC / passport).
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
              <p className="text-xs text-muted-foreground">Optional.</p>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
            <CardDescription>Where are you based?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="e.g. Mauritius"
                  value={formData.country ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, country: e.target.value }))
                  }
                  className={cn(
                    "h-12 rounded-xl",
                    errors.country && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="e.g. Mahébourg"
                  value={formData.city ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className={cn(
                    "h-12 rounded-xl",
                    errors.city && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                placeholder="Building name, Street name, Area..."
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="min-h-[100px] rounded-xl resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Provide your full address for delivery purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-12 rounded-xl px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 rounded-xl px-8 flex-1 sm:flex-none"
          >
            {isSubmitting ? (
              "Processing..."
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
