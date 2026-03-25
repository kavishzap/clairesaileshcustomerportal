-- Portal API uses PostgREST with the anon key unless SUPABASE_SERVICE_ROLE_KEY is set server-side.
-- If you see: "new row violates row-level security policy for table customers"
-- choose ONE approach:
--
-- A) Recommended: add SUPABASE_SERVICE_ROLE_KEY to your Next.js server env (never expose to the browser).
--    The API route already prefers it over the anon key — no DB change needed.
--
-- B) Allow anonymous inserts on customers (only if you must use the anon key for this route).
--    This lets anyone with your anon key insert rows — use only if you accept that risk.

alter table public.customers enable row level security;

drop policy if exists "customers_insert_anon_portal" on public.customers;

create policy "customers_insert_anon_portal"
  on public.customers
  for insert
  to anon
  with check (true);
