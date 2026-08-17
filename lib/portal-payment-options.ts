export const PAYMENT_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "other", label: "Other" },
] as const

export type PaymentOption = (typeof PAYMENT_OPTIONS)[number]["value"]

export function getPaymentOptionLabel(
  value: PaymentOption | string,
  labels?: Record<PaymentOption, string>
): string {
  if (labels && isPaymentOption(value)) return labels[value]
  return PAYMENT_OPTIONS.find((option) => option.value === value)?.label ?? value
}

export function isPaymentOption(value: string): value is PaymentOption {
  return PAYMENT_OPTIONS.some((option) => option.value === value)
}
