alter table public.femmea_profiles
  add column if not exists journey_entry_point text
    check (journey_entry_point is null or journey_entry_point in ('learning','clinic_started','cycle_monitoring','procedure_scheduled','post_procedure','waiting_test')),
  add column if not exists hydration_enabled boolean not null default true;

create table if not exists public.femmea_treatments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Tratamento de inseminação',
  status text not null default 'active' check (status in ('active','paused','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists femmea_treatments_user_status_idx
  on public.femmea_treatments (user_id, status, created_at desc);

alter table public.femmea_treatments enable row level security;
revoke all on public.femmea_treatments from anon;
grant select, insert, update, delete on public.femmea_treatments to authenticated;

drop policy if exists femmea_treatments_select_own on public.femmea_treatments;
create policy femmea_treatments_select_own on public.femmea_treatments
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists femmea_treatments_insert_own on public.femmea_treatments;
create policy femmea_treatments_insert_own on public.femmea_treatments
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists femmea_treatments_update_own on public.femmea_treatments;
create policy femmea_treatments_update_own on public.femmea_treatments
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists femmea_treatments_delete_own on public.femmea_treatments;
create policy femmea_treatments_delete_own on public.femmea_treatments
  for delete to authenticated using (auth.uid() = user_id);

alter table public.femmea_insemination_journeys
  add column if not exists treatment_id uuid references public.femmea_treatments(id) on delete set null,
  add column if not exists attempt_number integer not null default 1 check (attempt_number > 0),
  add column if not exists current_state text not null default 'preparation'
    check (current_state in ('preparation','cycle_monitoring','procedure_scheduled','procedure_day','waiting_period','test_due','result')),
  add column if not exists status text not null default 'active'
    check (status in ('active','paused','postponed','cancelled','completed')),
  add column if not exists outcome text
    check (outcome is null or outcome in ('positive','negative','inconclusive')),
  add column if not exists outcome_recorded_at timestamptz,
  add column if not exists ended_at timestamptz;

insert into public.femmea_treatments (user_id, title, status)
select distinct j.user_id, 'Tratamento de inseminação', 'active'
from public.femmea_insemination_journeys j
where not exists (
  select 1 from public.femmea_treatments t
  where t.user_id = j.user_id and t.status = 'active'
);

update public.femmea_insemination_journeys j
set treatment_id = t.id
from lateral (
  select id
  from public.femmea_treatments
  where user_id = j.user_id
  order by (status = 'active') desc, created_at asc
  limit 1
) t
where j.treatment_id is null;

update public.femmea_insemination_journeys
set current_state = case current_stage
  when 'planning' then 'preparation'
  when 'cycle_monitoring' then 'cycle_monitoring'
  when 'insemination_day' then 'procedure_day'
  when 'post_procedure' then 'waiting_period'
  when 'pregnancy_test' then 'test_due'
  else current_state
end
where current_state = 'preparation';

create index if not exists femmea_journeys_treatment_attempt_idx
  on public.femmea_insemination_journeys (treatment_id, attempt_number desc);
create index if not exists femmea_journeys_user_status_idx
  on public.femmea_insemination_journeys (user_id, status, created_at desc);

create table if not exists public.femmea_journey_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  journey_id uuid references public.femmea_insemination_journeys(id) on delete cascade,
  event_type text not null check (event_type in ('appointment','exam','medication','procedure','pregnancy_test','task','note','custom')),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  is_all_day boolean not null default false,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  source text not null default 'user' check (source in ('user','journey','system')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists femmea_journey_events_user_start_idx
  on public.femmea_journey_events (user_id, starts_at);
create index if not exists femmea_journey_events_journey_start_idx
  on public.femmea_journey_events (journey_id, starts_at);

alter table public.femmea_journey_events enable row level security;
revoke all on public.femmea_journey_events from anon;
grant select, insert, update, delete on public.femmea_journey_events to authenticated;

drop policy if exists femmea_journey_events_select_own on public.femmea_journey_events;
create policy femmea_journey_events_select_own on public.femmea_journey_events
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists femmea_journey_events_insert_own on public.femmea_journey_events;
create policy femmea_journey_events_insert_own on public.femmea_journey_events
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and (journey_id is null or exists (
      select 1 from public.femmea_insemination_journeys j
      where j.id = journey_id and j.user_id = auth.uid()
    ))
  );

drop policy if exists femmea_journey_events_update_own on public.femmea_journey_events;
create policy femmea_journey_events_update_own on public.femmea_journey_events
  for update to authenticated using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (journey_id is null or exists (
      select 1 from public.femmea_insemination_journeys j
      where j.id = journey_id and j.user_id = auth.uid()
    ))
  );

drop policy if exists femmea_journey_events_delete_own on public.femmea_journey_events;
create policy femmea_journey_events_delete_own on public.femmea_journey_events
  for delete to authenticated using (auth.uid() = user_id);

alter table public.femmea_reminders
  add column if not exists journey_id uuid references public.femmea_insemination_journeys(id) on delete cascade,
  add column if not exists event_id uuid references public.femmea_journey_events(id) on delete set null;

create index if not exists femmea_reminders_journey_idx
  on public.femmea_reminders (journey_id, scheduled_for);
