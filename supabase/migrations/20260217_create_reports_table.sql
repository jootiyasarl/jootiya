-- Create reports table if it doesn't exist
create table if not exists public.reports (
    id uuid default gen_random_uuid() primary key,
    reporter_id uuid references auth.users(id) on delete set null,
    reporter_email text,
    reporter_name text,
    ad_id uuid references public.ads(id) on delete cascade,
    reported_user_id uuid references auth.users(id) on delete cascade,
    target_type text not null check (target_type in ('ad', 'user', 'review')),
    reason text not null,
    description text,
    status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'dismissed')),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.reports enable row level security;

-- Create policies (drop if exist first to avoid errors)
drop policy if exists "Users can create reports" on public.reports;
create policy "Users can create reports"
    on public.reports for insert
    with check (auth.uid() = reporter_id);

drop policy if exists "Admins can view and manage all reports" on public.reports;
create policy "Admins can view and manage all reports"
    on public.reports for all
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and (role = 'admin' or role = 'super_admin')
        )
    );

-- Create updated_at trigger
create trigger set_reports_updated_at
    before update on public.reports
    for each row
    execute function public.handle_updated_at();
