create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  city text,
  service_area text,
  website text,
  target_audience text,
  priority_services text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  content text not null,
  rationale text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists businesses_user_created_idx
  on public.businesses (user_id, created_at desc);
create index if not exists suggestions_business_created_idx
  on public.suggestions (business_id, created_at desc);
create index if not exists suggestions_user_idx
  on public.suggestions (user_id);

alter table public.businesses enable row level security;
alter table public.suggestions enable row level security;

drop policy if exists "Users can read their businesses" on public.businesses;
create policy "Users can read their businesses"
  on public.businesses for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their businesses" on public.businesses;
create policy "Users can create their businesses"
  on public.businesses for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their businesses" on public.businesses;
create policy "Users can update their businesses"
  on public.businesses for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their businesses" on public.businesses;
create policy "Users can delete their businesses"
  on public.businesses for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their suggestions" on public.suggestions;
create policy "Users can read their suggestions"
  on public.suggestions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their suggestions" on public.suggestions;
create policy "Users can create their suggestions"
  on public.suggestions for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.businesses
      where businesses.id = suggestions.business_id
        and businesses.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can update their suggestions" on public.suggestions;
create policy "Users can update their suggestions"
  on public.suggestions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their suggestions" on public.suggestions;
create policy "Users can delete their suggestions"
  on public.suggestions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.businesses to authenticated;
grant select, insert, update, delete on public.suggestions to authenticated;
