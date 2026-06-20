"use client"

import { useEffect, useState } from "react"
import { ContractDetails } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContractDetailsFormProps {
  initialData: ContractDetails
  onSubmit: (data: ContractDetails) => void
  onBack: () => void
}

export function ContractDetailsForm({ initialData, onSubmit, onBack }: ContractDetailsFormProps) {
  const [formData, setFormData] = useState<ContractDetails>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = end.getTime() - start.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setFormData((prev) => ({ ...prev, numberOfDays: diffDays > 0 ? diffDays : 0 }))
    }
  }, [formData.startDate, formData.endDate])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date"
    }
    if (!formData.deliveryTime) newErrors.deliveryTime = "Delivery time is required"
    if (!formData.recoveryTime) newErrors.recoveryTime = "Recovery time is required"
    if (!(formData.deliveryPlace || "").trim()) newErrors.deliveryPlace = "Delivery location is required"
    if (!(formData.recoveryPlace || "").trim()) newErrors.recoveryPlace = "Recovery location is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsSubmitting(false)
    onSubmit({
      ...formData,
      deliveryPlace: formData.deliveryPlace.trim(),
      recoveryPlace: formData.recoveryPlace.trim(),
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="section-kicker">Step 3</span>
        <h2 className="text-3xl font-serif font-semibold sm:text-4xl">Contract details</h2>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Configure the specifics of your rental contract.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5" />
              Rental period
            </CardTitle>
            <CardDescription>Select the start and end dates for your rental</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.25rem] border border-border/60 bg-white/45 p-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold text-foreground">Rental period mode</Label>
                  <p className="field-note mt-1">
                    Choose whether the end date is counted as inclusive or exclusive.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-[1rem] border border-border/60 bg-background/70 p-3">
                    <Checkbox
                      checked={formData.rentalPeriodMode === "inclusive"}
                      onCheckedChange={() =>
                        setFormData((prev) => ({ ...prev, rentalPeriodMode: "inclusive" }))
                      }
                      aria-label="Inclusive rental period"
                    />
                    <div>
                      <span className="text-sm font-semibold text-foreground">Inclusive</span>
                      <p className="field-note">Counts both the start and end date.</p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-[1rem] border border-border/60 bg-background/70 p-3">
                    <Checkbox
                      checked={formData.rentalPeriodMode === "exclusive"}
                      onCheckedChange={() =>
                        setFormData((prev) => ({ ...prev, rentalPeriodMode: "exclusive" }))
                      }
                      aria-label="Exclusive rental period"
                    />
                    <div>
                      <span className="text-sm font-semibold text-foreground">Exclusive</span>
                      <p className="field-note">Counts up to, but not including, the end date.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  aria-invalid={!!errors.startDate}
                  aria-describedby={errors.startDate ? "start-date-error" : undefined}
                  className={cn("h-12 rounded-xl", errors.startDate && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.startDate && <p id="start-date-error" className="error-text">{errors.startDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  aria-invalid={!!errors.endDate}
                  aria-describedby={errors.endDate ? "end-date-error" : undefined}
                  className={cn("h-12 rounded-xl", errors.endDate && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.endDate && <p id="end-date-error" className="error-text">{errors.endDate}</p>}
              </div>
            </div>

            {formData.numberOfDays > 0 && (
              <div className="rounded-[1.4rem] border border-primary/10 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--secondary)_55%,white),color-mix(in_oklch,var(--accent)_35%,white))] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total duration</span>
                  <span className="text-lg font-semibold">
                    {formData.numberOfDays} {formData.numberOfDays === 1 ? "Day" : "Days"}
                  </span>
                </div>
                <p className="field-note mt-2 capitalize">
                  {formData.rentalPeriodMode} calculation
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deliveryTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Delivery Time
                </Label>
                <Input
                  id="deliveryTime"
                  type="time"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deliveryTime: e.target.value }))}
                  aria-invalid={!!errors.deliveryTime}
                  aria-describedby={errors.deliveryTime ? "delivery-time-error" : "delivery-time-note"}
                  className={cn("h-12 rounded-xl", errors.deliveryTime && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.deliveryTime && <p id="delivery-time-error" className="error-text">{errors.deliveryTime}</p>}
                <p id="delivery-time-note" className="field-note">When should we deliver the vehicle?</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recoveryTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Recovery Time
                </Label>
                <Input
                  id="recoveryTime"
                  type="time"
                  value={formData.recoveryTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, recoveryTime: e.target.value }))}
                  aria-invalid={!!errors.recoveryTime}
                  aria-describedby={errors.recoveryTime ? "recovery-time-error" : "recovery-time-note"}
                  className={cn("h-12 rounded-xl", errors.recoveryTime && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.recoveryTime && <p id="recovery-time-error" className="error-text">{errors.recoveryTime}</p>}
                <p id="recovery-time-note" className="field-note">When should we collect the vehicle?</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deliveryPlace" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Delivery Location
                </Label>
                <Input
                  id="deliveryPlace"
                  type="text"
                  placeholder="e.g. Mahebourg"
                  value={formData.deliveryPlace}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deliveryPlace: e.target.value }))}
                  aria-invalid={!!errors.deliveryPlace}
                  aria-describedby={errors.deliveryPlace ? "delivery-place-error" : undefined}
                  className={cn("h-12 rounded-xl", errors.deliveryPlace && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.deliveryPlace && <p id="delivery-place-error" className="error-text">{errors.deliveryPlace}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="recoveryPlace" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Recovery Location
                </Label>
                <Input
                  id="recoveryPlace"
                  type="text"
                  placeholder="e.g. Mahebourg"
                  value={formData.recoveryPlace}
                  onChange={(e) => setFormData((prev) => ({ ...prev, recoveryPlace: e.target.value }))}
                  aria-invalid={!!errors.recoveryPlace}
                  aria-describedby={errors.recoveryPlace ? "recovery-place-error" : undefined}
                  className={cn("h-12 rounded-xl", errors.recoveryPlace && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.recoveryPlace && <p id="recovery-place-error" className="error-text">{errors.recoveryPlace}</p>}
              </div>
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
                Continue to Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
