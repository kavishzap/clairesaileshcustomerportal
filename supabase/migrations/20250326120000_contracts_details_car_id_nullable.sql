-- Portal contract requests do not send car_id until a vehicle is assigned.
-- Run this once in Supabase: SQL Editor → New query → paste → Run.
--
-- Makes public.contracts_details.car_id optional (NULL allowed).
-- The foreign key to public.cars still applies when car_id is non-null.

alter table public.contracts_details
  alter column car_id drop not null;
