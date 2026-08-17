"use client"

import { useRef, useState } from "react"
import { CustomerInfo } from "@/app/page"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, MessageCircle, Phone, TriangleAlert, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/i18n/language-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  buildOwnerWhatsAppUrl,
  MIN_DRIVER_AGE,
  MIN_DRIVING_EXP_YEARS,
  OWNER_PHONE_DISPLAY,
  OWNER_PHONE_TEL,
} from "@/lib/portal-owner"

interface NewCustomerFormProps {
  initialData: CustomerInfo
  onSubmit: (data: CustomerInfo) => void
  onBack: () => void
  onSwitchToExisting: (email: string) => void
}

export function NewCustomerForm({
  initialData,
  onSubmit,
  onBack,
  onSwitchToExisting,
}: NewCustomerFormProps) {
  const { t, tf } = useLanguage()
  const [formData, setFormData] = useState<CustomerInfo>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eligibilityBlocked, setEligibilityBlocked] = useState(false)
  const [existingProfileOpen, setExistingProfileOpen] = useState(false)
  const eligibilityAlertRef = useRef<HTMLDivElement>(null)

  const clearEligibilityBlock = () => {
    if (eligibilityBlocked) setEligibilityBlocked(false)
  }

  const validateForm = (): { valid: boolean; ineligible: boolean } => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName?.trim()) newErrors.firstName = t.newCustomer.firstNameRequired
    if (!formData.lastName?.trim()) newErrors.lastName = t.newCustomer.lastNameRequired
    if (!formData.email) {
      newErrors.email = t.newCustomer.emailRequired
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.newCustomer.emailInvalid
    }
    if (!formData.phone?.trim()) newErrors.phone = t.newCustomer.phoneRequired
    if (!formData.nicLicence?.trim()) newErrors.nicLicence = t.newCustomer.nicRequired
    if (!formData.country?.trim()) newErrors.country = t.newCustomer.countryRequired
    if (!formData.city?.trim()) newErrors.city = t.newCustomer.cityRequired

    const ageRaw = formData.age?.trim()
    if (!ageRaw) {
      newErrors.age = t.newCustomer.ageRequired
    } else {
      const age = Number.parseInt(ageRaw, 10)
      if (Number.isNaN(age) || age < 18 || age > 120) {
        newErrors.age = t.newCustomer.ageInvalid
      }
    }

    const drivingExpRaw = formData.drivingExp?.trim()
    if (!drivingExpRaw) {
      newErrors.drivingExp = t.newCustomer.drivingExpRequired
    } else {
      const drivingExp = Number.parseInt(drivingExpRaw, 10)
      if (Number.isNaN(drivingExp) || drivingExp < 0 || drivingExp > 80) {
        newErrors.drivingExp = t.newCustomer.drivingExpInvalid
      }
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      setEligibilityBlocked(false)
      return { valid: false, ineligible: false }
    }

    if (!ageRaw || !drivingExpRaw) {
      return { valid: false, ineligible: false }
    }

    const age = Number.parseInt(ageRaw, 10)
    const drivingExp = Number.parseInt(drivingExpRaw, 10)
    const ineligible = age < MIN_DRIVER_AGE || drivingExp < MIN_DRIVING_EXP_YEARS
    setEligibilityBlocked(ineligible)
    return { valid: !ineligible, ineligible }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateForm()
    if (!validation.valid) {
      if (validation.ineligible) {
        toast({
          variant: "destructive",
          title: t.newCustomer.unableOnline,
          description: tf(t.newCustomer.contactOwner, { phone: OWNER_PHONE_DISPLAY }),
        })
        requestAnimationFrame(() => {
          eligibilityAlertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
        })
      }
      return
    }

    const existingId = (formData.customerId || initialData.customerId)?.trim()
    if (existingId) {
      toast({
        title: t.newCustomer.profileCreated,
        description: t.newCustomer.continueContract,
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
          age: formData.age,
          drivingLicenceNumber: formData.drivingLicenceNumber,
          drivingExp: formData.drivingExp,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          flightNumber: formData.flightNumber,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        hint?: string
        id?: string
        code?: string
      }
      if (res.status === 409 || data.code === "PROFILE_EXISTS") {
        setExistingProfileOpen(true)
        setErrors((prev) => ({
          ...prev,
          email: t.newCustomer.alreadyExistsTitle,
        }))
        return
      }
      if (!res.ok || !data.id) {
        if (process.env.NODE_ENV === "development") {
          console.error("Create customer API:", res.status, data)
        }
        toast({
          variant: "destructive",
          title: t.messages.somethingWentWrong,
          description: t.messages.profileSaveFailed,
        })
        return
      }

      toast({
        title: t.newCustomer.profileCreated,
        description: t.newCustomer.continueContract,
      })
      setTimeout(() => onSubmit({ ...formData, customerId: data.id }), 200)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="section-kicker">{tf(t.common.step, { n: 2 })}</span>
        <h2 className="text-3xl font-serif font-semibold sm:text-4xl">{t.newCustomer.title}</h2>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          {t.newCustomer.intro}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="text-xl">{t.newCustomer.personalTitle}</CardTitle>
            <CardDescription>{t.newCustomer.personalDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t.newCustomer.firstName}</Label>
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
                <Label htmlFor="lastName">{t.newCustomer.lastName}</Label>
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
              <Label htmlFor="email">{t.newCustomer.email}</Label>
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
              <Label htmlFor="phone">{t.newCustomer.phone}</Label>
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
              <Label htmlFor="age">{t.newCustomer.age}</Label>
              <Input
                id="age"
                type="number"
                inputMode="numeric"
                min={18}
                max={120}
                placeholder="e.g. 32"
                value={formData.age ?? ""}
                onChange={(e) => {
                  clearEligibilityBlock()
                  setFormData((prev) => ({ ...prev, age: e.target.value }))
                }}
                aria-invalid={!!errors.age}
                aria-describedby={errors.age ? "age-error" : "age-note"}
                className={cn("h-12 rounded-xl", errors.age && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.age && <p id="age-error" className="error-text">{errors.age}</p>}
              <p id="age-note" className="field-note">
                {tf(t.newCustomer.ageNote, { minAge: MIN_DRIVER_AGE })}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nicLicence">{t.newCustomer.nicLabel}</Label>
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
                {t.newCustomer.nicNote}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="text-xl">{t.newCustomer.drivingTitle}</CardTitle>
            <CardDescription>{t.newCustomer.drivingDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drivingLicenceNumber">{t.newCustomer.drivingLicenceNumber}</Label>
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
                aria-describedby="driving-licence-note"
                className="h-12 rounded-xl"
              />
              <p id="driving-licence-note" className="field-note">{t.common.optional}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drivingExp">{t.newCustomer.drivingExp}</Label>
              <Input
                id="drivingExp"
                type="number"
                inputMode="numeric"
                min={0}
                max={80}
                placeholder="e.g. 5"
                value={formData.drivingExp ?? ""}
                onChange={(e) => {
                  clearEligibilityBlock()
                  setFormData((prev) => ({
                    ...prev,
                    drivingExp: e.target.value,
                  }))
                }}
                aria-invalid={!!errors.drivingExp}
                aria-describedby={errors.drivingExp ? "driving-exp-error" : "driving-exp-note"}
                className={cn("h-12 rounded-xl", errors.drivingExp && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.drivingExp && <p id="driving-exp-error" className="error-text">{errors.drivingExp}</p>}
              <p id="driving-exp-note" className="field-note">
                {tf(t.newCustomer.drivingExpNote, { minYears: MIN_DRIVING_EXP_YEARS })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="text-xl">{t.newCustomer.locationTitle}</CardTitle>
            <CardDescription>{t.newCustomer.locationDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">{t.newCustomer.country}</Label>
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
                <Label htmlFor="city">{t.newCustomer.city}</Label>
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
              <Label htmlFor="flightNumber">{t.newCustomer.flightNumber}</Label>
              <Input
                id="flightNumber"
                type="text"
                placeholder={t.newCustomer.flightNumberPlaceholder}
                value={formData.flightNumber ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, flightNumber: e.target.value }))}
                aria-describedby="flight-number-note"
                className="h-12 rounded-xl"
              />
              <p id="flight-number-note" className="field-note">
                {t.newCustomer.flightNumberNote}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t.newCustomer.address}</Label>
              <Textarea
                id="address"
                placeholder={t.newCustomer.addressPlaceholder}
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="min-h-[110px] resize-none rounded-xl"
              />
              <p className="field-note">
                {t.newCustomer.addressNote}
              </p>
            </div>
          </CardContent>
        </Card>

        {eligibilityBlocked && (
          <div ref={eligibilityAlertRef}>
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
              <TriangleAlert className="h-5 w-5" />
              <AlertTitle>{t.newCustomer.unableOnline}</AlertTitle>
              <AlertDescription className="space-y-4 text-destructive/90">
                <p>{t.newCustomer.notEligible}</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="outline" className="h-11 border-destructive/30 bg-background">
                    <a href={OWNER_PHONE_TEL}>
                      <Phone className="mr-2 h-4 w-4" />
                      {tf(t.newCustomer.call, { phone: OWNER_PHONE_DISPLAY })}
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="h-11 border-destructive/30 bg-background">
                    <a
                      href={buildOwnerWhatsAppUrl(t.newCustomer.whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {t.newCustomer.whatsappOwner}
                    </a>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Button type="button" variant="outline" onClick={onBack} className="h-12 px-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.common.back}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-12 flex-1 px-8 sm:flex-none">
            {isSubmitting ? (
              t.common.processing
            ) : (
              <>
                {t.common.continue}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>

      <Dialog open={existingProfileOpen} onOpenChange={setExistingProfileOpen}>
        <DialogContent className="rounded-[1.75rem] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {t.newCustomer.alreadyExistsTitle}
            </DialogTitle>
            <DialogDescription className="text-base leading-7">
              {t.newCustomer.alreadyExistsBody}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={() => setExistingProfileOpen(false)}
            >
              {t.newCustomer.alreadyExistsClose}
            </Button>
            <Button
              type="button"
              onClick={() => {
                const email = formData.email.trim().toLowerCase()
                setExistingProfileOpen(false)
                onSwitchToExisting(email)
              }}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              {t.newCustomer.alreadyExistsAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
