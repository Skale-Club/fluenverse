-- RLS Policies for all public tables
--
-- Architecture note: all server-side operations use the service_role key,
-- which bypasses RLS entirely. These policies only close direct access via
-- the anon key (PostgREST / client-side supabase.ts).
--
-- Run this script once against the Fluenverse Supabase project.

-- ─── leads ────────────────────────────────────────────────────────────────────
-- Public visitors submit leads via chat and survey flows.
-- Reads/updates are admin-only and go through service_role API routes.

alter table public.leads enable row level security;

-- Anonymous users may insert a lead (chat / survey submission).
create policy "leads_insert_anon"
  on public.leads
  for insert
  to anon
  with check (true);

-- No SELECT / UPDATE / DELETE policy for anon → blocked.
-- Service_role API routes still have full access.


-- ─── students ─────────────────────────────────────────────────────────────────
-- Managed exclusively by admins through server-side API routes.
-- No anon access required.

alter table public.students enable row level security;

-- No policies → anon key has no access.


-- ─── users ────────────────────────────────────────────────────────────────────
-- Contains password_hash and role data. Must be fully locked down.
-- All auth logic runs server-side with service_role.

alter table public.users enable row level security;

-- No policies → anon key has no access.


-- ─── survey_questions ─────────────────────────────────────────────────────────
-- Already handled in enable_rls_survey_questions.sql.
-- Keeping this section as documentation only — skip if already applied.

-- alter table public.survey_questions enable row level security;
-- create policy "survey_questions_select_all"
--   on public.survey_questions for select using (true);


-- ─── app_config ───────────────────────────────────────────────────────────────
-- Stores integration secrets (GHL, Twilio, Telegram, Facebook, etc.).
-- Must never be exposed via the anon key.

alter table public.app_config enable row level security;

-- No policies → anon key has no access.


-- ─── landing_page ─────────────────────────────────────────────────────────────
-- Stores public content overrides rendered on the site.
-- Reads are safe to expose; writes go through admin API routes.

alter table public.landing_page enable row level security;

-- Anyone may read landing page content (it is served publicly).
create policy "landing_page_select_anon"
  on public.landing_page
  for select
  to anon
  using (true);

-- No INSERT / UPDATE / DELETE policy for anon → blocked.