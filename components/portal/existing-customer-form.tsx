"use client"

import { useState } from "react"
import { CustomerInfo } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/i18n/language-provider"

interface ExistingCustomerFormProps {
  initialData: CustomerInfo
  onSubmit: (data: CustomerInfo) => void
  onBack: () => void
}

export function ExistingCustomerForm({ initialData, onSubmit, onBack }: ExistingCustomerFormProps) {
  const { t, tf } = useLanguage()
  const [formData, setFormData] = useState<CustomerInfo>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const normalizeNicOrPassport = (value: string) =>
    value.trim().replace(/\s+/g, "").toUpperCase()

  const verifyCustomer = async (email: string, nicOrPassport: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the dev server."
      )
    }

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
      newErrors.email = t.existing.emailRequired
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.existing.emailInvalid
    }

    const nicValue = (formData.nicPassportNumber || "").trim()
    if (!nicValue) {
      newErrors.nicPassportNumber = t.existing.nicRequired
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
        toast({ title: t.existing.validated })
        setTimeout(() => onSubmit({ ...payload, customerId: result.id }), 200)
      } else {
        setErrors((prev) => ({
          ...prev,
          nicPassportNumber: t.existing.nicMismatch,
        }))
        setFormMessage({
          type: "error",
          text: t.messages.customerNotFound,
        })
        toast({
          variant: "destructive",
          title: t.messages.detailsNotRecognised,
          description: t.messages.customerNotFound,
        })
      }
    } catch (err) {
      setIsSubmitting(false)
      if (process.env.NODE_ENV === "development") {
        console.error(err)
      }
      setFormMessage({ type: "error", text: t.messages.verifyFailed })
      toast({
        variant: "destructive",
        title: t.messages.somethingWentWrong,
        description: t.messages.verifyFailed,
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="section-kicker">{tf(t.common.step, { n: 2 })}</span>
        <h2 className="text-3xl font-serif font-semibold sm:text-4xl">{t.existing.title}</h2>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          {t.existing.intro}
        </p>
        {formMessage && (
          <p
            role="status"
            aria-live="polite"
            className={
              formMessage.type === "success"
                ? "text-sm font-medium text-success-foreground"
                : "text-sm font-medium text-destructive"
            }
          >
            {formMessage.text}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="text-xl">{t.existing.accountTitle}</CardTitle>
            <CardDescription>{t.existing.accountDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.existing.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "existing-email-error" : "existing-email-note"}
                className={cn(
                  "h-12 rounded-xl",
                  errors.email && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.email && <p id="existing-email-error" className="error-text">{errors.email}</p>}
              <p id="existing-email-note" className="field-note">
                {t.existing.emailNote}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="portal-card rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="text-xl">{t.existing.nicTitle}</CardTitle>
            <CardDescription>{t.existing.nicDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="nicPassportNumber">{t.existing.nicLabel}</Label>
              <Input
                id="nicPassportNumber"
                placeholder={t.existing.nicPlaceholder}
                value={formData.nicPassportNumber || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nicPassportNumber: e.target.value }))
                }
                aria-invalid={!!errors.nicPassportNumber}
                aria-describedby={errors.nicPassportNumber ? "existing-nic-error" : undefined}
                className={cn(
                  "h-12 rounded-xl",
                  errors.nicPassportNumber && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.nicPassportNumber && (
                <p id="existing-nic-error" className="error-text">
                  {errors.nicPassportNumber}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
    </div>
  )
}
