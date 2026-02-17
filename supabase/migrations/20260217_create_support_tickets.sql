-- Create support_tickets table if it doesn't exist
create table if not exists public.support_tickets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    subject text not null,
    message text not null,
    status text not null default 'pending' check (status in ('pending', 'in_progress', 'resolved', 'closed')),
    priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
    category text not null default 'general',
    contact_email text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.support_tickets enable row level security;

-- Create policies
create policy "Users can view their own tickets"
    on public.support_tickets for select
    using (auth.uid() = user_id);

create policy "Users can create their own tickets"
    on public.support_tickets for insert
    with check (auth.uid() = user_id);

create policy "Admins can view all tickets"
    on public.support_tickets for all
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and (role = 'admin' or role = 'super_admin')
        )
    );

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_support_tickets_updated_at
    before update on public.support_tickets
    for each row
    execute function public.handle_updated_at();
