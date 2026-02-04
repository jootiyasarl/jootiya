-- Create favorites table
create table if not exists public.favorites (
  user_id uuid references auth.users not null,
  ad_id uuid references public.ads not null,
  created_at timestamptz default now(),
  primary key (user_id, ad_id)
);

-- Enable RLS
alter table public.favorites enable row level security;

-- Policies
create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);
