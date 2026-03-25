import { NextResponse } from "next/server"
import {
  createCustomerRow,
  getSupabaseConfig,
  type CustomerPayload,
} from "@/lib/portal-supabase"

export async function POST(request: Request) {
  const { url, key } = getSupabaseConfig()
  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase URL or API key is not configured on the server." },
      { status: 500 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const info = body as CustomerPayload
  if (!info || typeof info.email !== "string") {
    return NextResponse.json({ error: "Missing customer payload" }, { status: 400 })
  }

  const result = await createCustomerRow(url, key, info)
  if ("error" in result) {
    return NextResponse.json(
      {
        error: result.error,
        hint:
          "Ensure INSERT is allowed on public.customers (RLS policy or SUPABASE_SERVICE_ROLE_KEY). Columns: first_name, last_name, email, phone, nic_or_passport; optional address, city, country, license.",
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ id: result.id })
}
