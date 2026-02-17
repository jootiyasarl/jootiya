-- Add created_at column to categories table if it's missing
alter table public.categories add column if not exists created_at timestamptz default now() not null;

-- Ensure popularity column also exists
alter table public.categories add column if not exists popularity int default 0;
