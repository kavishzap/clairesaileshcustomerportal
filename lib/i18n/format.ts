import type { Locale } from "./types"

export function formatLongDate(dateString: string, locale: Locale): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatShortDate(dateString: string, locale: Locale): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatTime(timeString: string, locale: Locale): string {
  if (!timeString) return ""
  const [hours, minutes] = timeString.split(":")
  const date = new Date()
  date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10), 0, 0)
  return date.toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-GB", {
    hour: "numeric",
    minute: "2-digit",
  })
}
