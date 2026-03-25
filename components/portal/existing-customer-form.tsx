"use client"

import { useState } from "react"
import { CustomerInfo } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import {
  MSG_CUSTOMER_NOT_FOUND,
  MSG_VERIFY_FAILED,
} from "@/lib/portal-messages"

interface ExistingCustomerFormProps {
  initialData: CustomerInfo
  onSubmit: (data: CustomerInfo) => void
  onBack: () => void
}

export function ExistingCustomerForm({ initialData, onSubmit, onBack }: ExistingCustomerFormProps) {
  const [formData, setFormData] = useState<CustomerInfo>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  /** Compare NIC/passport ignoring spaces and case (DB may store "12 345 6789" vs "123456789"). */
  const normalizeNicOrPassport = (value: string) =>
    value.trim().replace(/\s+/g, "").toUpperCase()

  const verifyCustomer = async (email: string, nicOrPassport: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the dev server."
      )
    }

    // Email: use ilike so it matches DB casing (eq is case-sensitive; we were lowercasing input only).
    // Unique on email → at most one row; fetch nic_or_passport and compare in JS for formatting flexibility.
    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/customers?select=id,nic_or_passport&email=ilike.${encodeURIComponent(
      email
    )}&limit=1`

    const res = await fetch(url, {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    const bodyText = await res.text()
    let data: unknown
    try {
      data = bodyText ? JSON.parse(bodyText) : []
    } catch {
      throw new Error(`Supabase returned invalid JSON (${res.status}).`)
    }

    if (!res.ok) {
      const hint =
        res.status === 401 || res.status === 403
          ? " Check Supabase RLS policies allow SELECT on public.customers for the anon role."
          : ""
      throw new Error(
        `Supabase verification failed (${res.status}).${hint} ${bodyText.slice(0, 200)}`
      )
    }

    if (!Array.isArray(data) || data.length === 0) {
      return { ok: false as const }
    }

    const row = data[0] as { id?: string; nic_or_passport?: string }
    const dbNic = row.nic_or_passport ?? ""
    const inputNic = normalizeNicOrPassport(nicOrPassport)
    const storedNic = normalizeNicOrPassport(dbNic)
    const match = storedNic === inputNic && inputNic.length > 0
    if (!match || !row.id) {
      return { ok: false as const }
    }
    return { ok: true as const, id: row.id }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    const nicValue = (formData.nicPassportNumber || "").trim()
    if (!nicValue) {
      newErrors.nicPassportNumber = "NIC/Passport number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    setFormMessage(null)

    const email = formData.email.trim().toLowerCase()
    const nicOrPassport = (formData.nicPassportNumber || "").trim()
    const payload: CustomerInfo = { ...formData, email, nicPassportNumber: nicOrPassport }

    setIsSubmitting(true)
    try {
      const result = await verifyCustomer(email, nicOrPassport)
      setIsSubmitting(false)

      if (result.ok) {
        toast({ title: "Customer validated please proceed" })
        // Keep a small delay so the toast can be seen before changing steps.
        setTimeout(
          () => onSubmit({ ...payload, customerId: result.id }),
          200
        )
      } else {
        setErrors((prev) => ({
          ...prev,
          nicPassportNumber:
            "These details don't match our records. Check your email and NIC/Passport.",
        }))
        setFormMessage({
          type: "error",
          text: MSG_CUSTOMER_NOT_FOUND,
        })
        toast({
          variant: "destructive",
          title: "Details not recognised",
          description: MSG_CUSTOMER_NOT_FOUND,
        })
      }
    } catch (err) {
      setIsSubmitting(false)
      if (process.env.NODE_ENV === "development") {
        console.error(err)
      }
      setFormMessage({ type: "error", text: MSG_VERIFY_FAILED })
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: MSG_VERIFY_FAILED,
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-serif font-medium">Welcome Back</h2>
        <p className="text-muted-foreground">
          Please provide your email and enter your NIC/Passport number to continue.
        </p>
        {formMessage && (
          <p
            className={
              formMessage.type === "success"
                ? "text-sm text-green-600"
                : "text-sm text-destructive"
            }
          >
            {formMessage.text}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Enter your registered email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <p className="text-xs text-muted-foreground">
                Use the email address associated with your account.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>NIC/Passport Number</CardTitle>
            <CardDescription>Enter your NIC or Passport number used at registration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="nicPassportNumber">NIC/Passport Number</Label>
              <Input
                id="nicPassportNumber"
                placeholder="Enter your NIC or Passport number"
                value={formData.nicPassportNumber || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nicPassportNumber: e.target.value }))
                }
                className={cn(
                  "h-12 rounded-xl",
                  errors.nicPassportNumber && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.nicPassportNumber && (
                <p className="text-sm text-destructive">{errors.nicPassportNumber}</p>
              )}
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
