/** Combine YYYY-MM-DD + HH:mm in local time to ISO UTC for timestamptz columns. */
export function combineLocalDateTimeToIso(dateStr: string, timeStr: string): string {
  const [y, mo, da] = dateStr.split("-").map((s) => parseInt(s, 10))
  if (!y || !mo || !da) {
    throw new Error("Invalid date")
  }
  const parts = (timeStr || "00:00").split(":")
  const hH = parseInt(parts[0] ?? "0", 10)
  const mM = parseInt(parts[1] ?? "0", 10)
  const d = new Date(y, mo - 1, da, hH || 0, mM || 0, 0, 0)
  return d.toISOString()
}
