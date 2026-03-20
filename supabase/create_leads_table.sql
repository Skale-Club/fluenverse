create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('chat', 'survey')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  session_id text,
  name text,
  email text,
  phone text,
  locale text check (locale in ('pt', 'en', 'auto')),
  location text,
  objective text[],
  objective_other text,
  level text,
  difficulty text,
  best_day text[],
  transcript jsonb,
  model text,
  completed boolean not null default false,
  answers jsonb
);

create unique index if not exists leads_source_session_id_uidx
  on public.leads (source, session_id)
  where session_id is not null;

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

create index if not exists leads_source_idx
  on public.leads (source);

create index if not exists leads_completed_idx
  on public.leads (completed);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

