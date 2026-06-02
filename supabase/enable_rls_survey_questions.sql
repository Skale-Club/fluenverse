-- Enable RLS on survey_questions.
-- All API routes use the service_role key (bypasses RLS), so this only
-- closes direct anon-key access to the PostgREST endpoint.
alter table public.survey_questions enable row level security;

-- Allow anyone to read survey questions (they are public configuration data).
create policy "survey_questions_select_all"
  on public.survey_questions
  for select
  using (true);
