"use client"

import { useState, useEffect } from "react"
import { ContractDetails } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
      setFormData(prev => ({ ...prev, numberOfDays: diffDays > 0 ? diffDays : 0 }))
    }
  }, [formData.startDate, formData.endDate])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required"
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required"
    }
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date"
    }
    if (!formData.deliveryTime) {
      newErrors.deliveryTime = "Delivery time is required"
    }
    if (!formData.recoveryTime) {
      newErrors.recoveryTime = "Recovery time is required"
    }
    if (!(formData.deliveryPlace || "").trim()) {
      newErrors.deliveryPlace = "Delivery location is required"
    }
    if (!(formData.recoveryPlace || "").trim()) {
      newErrors.recoveryPlace = "Recovery location is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSubmitting(false)
    onSubmit({
      ...formData,
      deliveryPlace: formData.deliveryPlace.trim(),
      recoveryPlace: formData.recoveryPlace.trim(),
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-serif font-medium">Contract Details</h2>
        <p className="text-muted-foreground">
          Configure the specifics of your rental contract.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Rental Period
              </CardTitle>
              <CardDescription>Select the start and end dates for your rental</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className={cn(
                      "h-12 rounded-xl",
                      errors.startDate && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive">{errors.startDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className={cn(
                      "h-12 rounded-xl",
                      errors.endDate && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-destructive">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {formData.numberOfDays > 0 && (
                <div className="p-4 rounded-xl bg-secondary border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Duration</span>
                    <span className="text-lg font-semibold">
                      {formData.numberOfDays} {formData.numberOfDays === 1 ? "Day" : "Days"}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Delivery Time
                  </Label>
                  <Input
                    id="deliveryTime"
                    type="time"
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                    className={cn(
                      "h-12 rounded-xl",
                      errors.deliveryTime && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.deliveryTime && (
                    <p className="text-sm text-destructive">{errors.deliveryTime}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    When should we deliver the vehicle?
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recoveryTime" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Recovery Time
                  </Label>
                  <Input
                    id="recoveryTime"
                    type="time"
                    value={formData.recoveryTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, recoveryTime: e.target.value }))}
                    className={cn(
                      "h-12 rounded-xl",
                      errors.recoveryTime && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.recoveryTime && (
                    <p className="text-sm text-destructive">{errors.recoveryTime}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    When should we collect the vehicle?
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryPlace" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Delivery Location
                  </Label>
                  <Input
                    id="deliveryPlace"
                    type="text"
                    placeholder="e.g. Mahbourg"
                    value={formData.deliveryPlace}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, deliveryPlace: e.target.value }))
                    }
                    className={cn(
                      "h-12 rounded-xl",
                      errors.deliveryPlace && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.deliveryPlace && (
                    <p className="text-sm text-destructive">{errors.deliveryPlace}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recoveryPlace" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Recovery Location
                  </Label>
                  <Input
                    id="recoveryPlace"
                    type="text"
                    placeholder="e.g. Mahbourg"
                    value={formData.recoveryPlace}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, recoveryPlace: e.target.value }))
                    }
                    className={cn(
                      "h-12 rounded-xl",
                      errors.recoveryPlace && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.recoveryPlace && (
                    <p className="text-sm text-destructive">{errors.recoveryPlace}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
                  Continue to Review
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
}
