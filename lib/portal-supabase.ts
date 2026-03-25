/** Shared Supabase REST helpers for portal API routes. */

export interface CustomerPayload {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  nicLicence?: string
  nicPassportNumber?: string
  city?: string
  country?: string
  address?: string
  /** Driving licence number — stored as `license` on public.customers. */
  drivingLicenceNumber?: string
  customerId?: string
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const key = serviceKey || anonKey
  return { url, key }
}

export async function restPost(
  url: string,
  key: string,
  path: string,
  body: Record<string, unknown>
): Promise<Response> {
  return fetch(`${url}/rest/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  })
}

/**
 * Inserts into public.customers:
 * first_name, last_name, email, phone, nic_or_passport (NOT NULL);
 * address, city, country, license (optional driving licence number).
 */
export async function createCustomerRow(
  supabaseUrl: string,
  key: string,
  info: CustomerPayload
): Promise<{ id: string } | { error: string }> {
  const first_name = info.firstName?.trim() ?? ""
  const last_name = info.lastName?.trim() ?? ""
  const email = info.email?.trim().toLowerCase() ?? ""
  const phone = info.phone?.trim() ?? ""
  const nic_or_passport = info.nicLicence?.trim() ?? ""

  if (!first_name || !last_name || !email || !phone || !nic_or_passport) {
    return {
      error:
        "Missing required customer fields: first name, last name, email, phone, and NIC/Passport are required.",
    }
  }

  const row: Record<string, unknown> = {
    first_name,
    last_name,
    email,
    phone,
    nic_or_passport,
  }

  const addr = info.address?.trim()
  if (addr) row.address = addr
  const city = info.city?.trim()
  if (city) row.city = city
  const country = info.country?.trim()
  if (country) row.country = country

  const license = info.drivingLicenceNumber?.trim()
  if (license) row.license = license

  const res = await restPost(supabaseUrl, key, "customers", row)
  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    return { error: `Invalid response from customers insert (${res.status})` }
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : text.slice(0, 400)
    return { error: `Could not create customer (${res.status}): ${msg}` }
  }

  const arr = Array.isArray(data) ? data : [data]
  const first = arr[0] as { id?: string } | undefined
  if (!first?.id) {
    return { error: "Customer created but no id returned." }
  }
  return { id: first.id }
}
