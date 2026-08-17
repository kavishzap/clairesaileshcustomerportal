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
  /** Stored as `flight_number` on public.customers. */
  flightNumber?: string
  /** Stored as `age` on public.customers. */
  age?: string
  /** Driving licence number — stored as `license` on public.customers. */
  drivingLicenceNumber?: string
  /** Years of driving experience — stored as `driving_exp` on public.customers. */
  drivingExp?: string
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

export async function restGet(
  url: string,
  key: string,
  pathAndQuery: string
): Promise<Response> {
  return fetch(`${url}/rest/v1/${pathAndQuery}`, {
    method: "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  })
}

function isUniqueViolation(data: unknown, text: string): boolean {
  const code =
    typeof data === "object" && data !== null && "code" in data
      ? String((data as { code: unknown }).code)
      : ""
  const haystack = `${code} ${text}`.toLowerCase()
  return code === "23505" || haystack.includes("duplicate key")
}

async function findCustomerIdByEmail(
  supabaseUrl: string,
  key: string,
  email: string
): Promise<string | null> {
  const query = `customers?select=id&email=ilike.${encodeURIComponent(email)}&limit=1`
  const res = await restGet(supabaseUrl, key, query)
  const text = await res.text()
  if (!res.ok) return null
  try {
    const data = text ? JSON.parse(text) : []
    if (!Array.isArray(data) || data.length === 0) return null
    const id = (data[0] as { id?: string }).id
    return id || null
  } catch {
    return null
  }
}

/**
 * Inserts into public.customers:
 * first_name, last_name, email, phone, nic_or_passport (NOT NULL);
 * address, city, country, flight_number, age, license, driving_exp (optional).
 */
export async function createCustomerRow(
  supabaseUrl: string,
  key: string,
  info: CustomerPayload
): Promise<{ id: string } | { error: string; code?: "PROFILE_EXISTS" }> {
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

  const existingId = await findCustomerIdByEmail(supabaseUrl, key, email)
  if (existingId) {
    return { error: "A customer profile already exists for this email.", code: "PROFILE_EXISTS" }
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
  const flightNumber = info.flightNumber?.trim()
  if (flightNumber) row.flight_number = flightNumber

  const license = info.drivingLicenceNumber?.trim()
  if (license) row.license = license

  const ageRaw = info.age?.trim()
  if (ageRaw) {
    const age = Number.parseInt(ageRaw, 10)
    if (!Number.isNaN(age)) row.age = age
  }

  const drivingExpRaw = info.drivingExp?.trim()
  if (drivingExpRaw) {
    const driving_exp = Number.parseInt(drivingExpRaw, 10)
    if (!Number.isNaN(driving_exp)) row.driving_exp = driving_exp
  }

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
    if (isUniqueViolation(data, text)) {
      return { error: "A customer profile already exists for this email.", code: "PROFILE_EXISTS" }
    }
    return { error: `Could not create customer (${res.status}): ${msg}` }
  }

  const arr = Array.isArray(data) ? data : [data]
  const first = arr[0] as { id?: string } | undefined
  if (!first?.id) {
    return { error: "Customer created but no id returned." }
  }
  return { id: first.id }
}
