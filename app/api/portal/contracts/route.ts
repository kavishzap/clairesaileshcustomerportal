import { NextResponse } from "next/server"
import { combineLocalDateTimeToIso } from "@/lib/portal-contract-map"
import {
  getSupabaseConfig,
  restPost,
  type CustomerPayload,
} from "@/lib/portal-supabase"

type CustomerType = "existing" | "new"

interface ContractPayload {
  startDate: string
  endDate: string
  deliveryTime: string
  recoveryTime: string
  deliveryPlace: string
  recoveryPlace: string
  numberOfDays: number
}

interface Body {
  customerType: CustomerType
  customerInfo: CustomerPayload
  contractDetails: ContractPayload
}

/** Supabase `uuid` primary keys from `customers.id`. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  const { url, key } = getSupabaseConfig()
  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase URL or API key is not configured on the server." },
      { status: 500 }
    )
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { customerType, customerInfo, contractDetails } = body
  if (!customerType || !customerInfo || !contractDetails) {
    return NextResponse.json({ error: "Missing customerType, customerInfo, or contractDetails" }, { status: 400 })
  }

  const {
    startDate,
    endDate,
    deliveryTime,
    recoveryTime,
    deliveryPlace,
    recoveryPlace,
    numberOfDays,
  } = contractDetails

  if (!startDate || !endDate || !deliveryTime || !recoveryTime) {
    return NextResponse.json({ error: "Missing rental dates or times" }, { status: 400 })
  }
  if (!(deliveryPlace || "").trim() || !(recoveryPlace || "").trim()) {
    return NextResponse.json({ error: "Delivery and recovery locations are required" }, { status: 400 })
  }

  const customerId = customerInfo.customerId?.trim()
  if (!customerId) {
    return NextResponse.json(
      {
        error:
          customerType === "new"
            ? "Missing customer id. Complete the customer step again so your profile can be linked."
            : "Missing customer id. Please re-verify your account on the previous step.",
      },
      { status: 400 }
    )
  }
  if (!UUID_RE.test(customerId)) {
    return NextResponse.json(
      { error: "Invalid customer id. Expected a UUID from public.customers." },
      { status: 400 }
    )
  }

  let startIso: string
  let endIso: string
  try {
    startIso = combineLocalDateTimeToIso(startDate, deliveryTime)
    endIso = combineLocalDateTimeToIso(endDate, recoveryTime)
  } catch {
    return NextResponse.json({ error: "Invalid date or time format" }, { status: 400 })
  }

  const days = Math.max(0, Math.floor(Number(numberOfDays)) || 0)

  const customerData = JSON.stringify({
    source: "customer_portal",
    customerType,
    customerId,
    email: customerInfo.email,
    ...(customerType === "new"
      ? {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          phone: customerInfo.phone,
          drivingLicenceNumber: customerInfo.drivingLicenceNumber,
        }
      : { nicPassportNumber: customerInfo.nicPassportNumber }),
  })

  const insertRow: Record<string, unknown> = {
    customer_id: customerId,
    start_date: startIso,
    end_date: endIso,
    daily_rate: 0,
    days,
    subtotal: 0,
    tax_rate: 0,
    total: 0,
    status: "draft",
    delivery_date: startIso,
    delivery_time: deliveryTime,
    delivery_place: deliveryPlace.trim(),
    pickup_date: endIso,
    pickup_time: recoveryTime,
    pickup_place: recoveryPlace.trim(),
    customer_data: customerData,
  }

  const res = await restPost(url, key, "contracts_details", insertRow)
  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    return NextResponse.json(
      { error: `Supabase returned invalid JSON (${res.status})`, raw: text.slice(0, 300) },
      { status: 502 }
    )
  }

  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : text.slice(0, 400)
    return NextResponse.json(
      {
        error: msg,
        hint:
          res.status === 401 || res.status === 403
            ? "Add SUPABASE_SERVICE_ROLE_KEY to the server env or create RLS policies allowing INSERT on public.contracts_details."
            : undefined,
      },
      { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
    )
  }

  const rows = Array.isArray(data) ? data : data ? [data] : []
  const row = rows[0] as { id?: string; contract_number?: string } | undefined

  return NextResponse.json({
    id: row?.id,
    contract_number: row?.contract_number,
  })
}
