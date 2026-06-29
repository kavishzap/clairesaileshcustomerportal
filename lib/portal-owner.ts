/** Minimum requirements for self-service online bookings. */
export const MIN_DRIVER_AGE = 25
export const MIN_DRIVING_EXP_YEARS = 2

export const OWNER_PHONE_E164 = "23057985913"
export const OWNER_PHONE_DISPLAY = "+230 5798 5913"
export const OWNER_PHONE_TEL = `tel:+${OWNER_PHONE_E164}`

export function buildOwnerWhatsAppUrl(text?: string): string {
  const base = `https://wa.me/${OWNER_PHONE_E164}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}
