alter table public.femmea_profiles
  add column if not exists cycle_length_days integer not null default 28
  check (cycle_length_days between 21 and 40);

create table if not exists public.femmea_cycle_observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  observation_date date not null default current_date,
  basal_temperature_c numeric(4,2) check (basal_temperature_c is null or basal_temperature_c between 34 and 43),
  ovulation_test_result text check (ovulation_test_result is null or ovulation_test_result in ('negative','positive','peak')),
  cervical_mucus text check (cervical_mucus is null or cervical_mucus in ('dry','sticky','creamy','watery','egg_white','other')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, observation_date)
);

create index if not exists femmea_cycle_observations_user_date_idx
  on public.femmea_cycle_observations (user_id, observation_date desc);

alter table public.femmea_cycle_observations enable row level security;
revoke all on public.femmea_cycle_observations from anon;
grant select, insert, update, delete on public.femmea_cycle_observations to authenticated;

drop policy if exists femmea_cycle_observations_select_own on public.femmea_cycle_observations;
create policy femmea_cycle_observations_select_own
  on public.femmea_cycle_observations for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists femmea_cycle_observations_insert_own on public.femmea_cycle_observations;
create policy femmea_cycle_observations_insert_own
  on public.femmea_cycle_observations for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists femmea_cycle_observations_update_own on public.femmea_cycle_observations;
create policy femmea_cycle_observations_update_own
  on public.femmea_cycle_observations for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists femmea_cycle_observations_delete_own on public.femmea_cycle_observations;
create policy femmea_cycle_observations_delete_own
  on public.femmea_cycle_observations for delete to authenticated
  using (auth.uid() = user_id);


update public.femmea_journey_checklist_items set label = 'Consulta inicial realizada' where item_key = 'initial_consultation';
update public.femmea_journey_checklist_items set label = 'Exames solicitados' where item_key = 'requested_exams';
update public.femmea_journey_checklist_items set label = 'Início da medicação' where item_key = 'medication_plan';
update public.femmea_journey_checklist_items set label = 'Monitoramento agendado' where item_key = 'monitoring_scheduled';
update public.femmea_journey_checklist_items set label = 'Dia da inseminação' where item_key = 'procedure_day';
update public.femmea_journey_checklist_items set label = 'Repouso e cuidados' where item_key = 'post_care';
update public.femmea_journey_checklist_items set label = 'Teste de gravidez' where item_key = 'pregnancy_test';
