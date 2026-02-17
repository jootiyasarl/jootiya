-- Add missing columns to cities table
alter table public.cities add column if not exists created_at timestamptz default now() not null;
alter table public.cities add column if not exists popularity int default 0;
