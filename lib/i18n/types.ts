import { en } from "./en"

type DeepStringify<T> = T extends string
  ? string
  : { [K in keyof T]: DeepStringify<T[K]> }

export type Locale = "en" | "fr"
export type Messages = DeepStringify<typeof en>

export const LOCALES: { value: Locale; labelKey: "english" | "french" }[] = [
  { value: "en", labelKey: "english" },
  { value: "fr", labelKey: "french" },
]

export const LOCALE_STORAGE_KEY = "portal-locale"

export function interpolate(
  template: string,
  vars: Record<string, string | number>
): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template
  )
}

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "fr"
}
