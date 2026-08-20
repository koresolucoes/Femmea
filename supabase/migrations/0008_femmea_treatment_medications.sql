-- FEM-TREAT-001 · Jornada de Tratamento v1
-- Medicação é registrada conforme prescrição externa; o Femmea não prescreve nem altera conduta.

create table if not exists public.femmea_treatment_medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  treatment_id uuid references public.femmea_treatments(id) on delete cascade,
  journey_id uuid references public.femmea_insemination_journeys(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  category text not null default 'other' check (category in ('ovarian_stimulation','ovulation_induction','progesterone_support','other')),
  dose_label text not null check (char_length(dose_label) between 1 and 60),
  administration_route text not null default 'other' check (administration_route in ('injection','oral','vaginal','other')),
  start_date date not null,
  end_date date not null,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint femmea_treatment_medications_date_range check (end_date >= start_date)
);

create table if not exists public.femmea_medication_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null references public.femmea_treatment_medications(id) on delete cascade,
  local_time time not null,
  created_at timestamptz not null default now(),
  unique (medication_id, local_time)
);

create table if not exists public.femmea_medication_dose_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null references public.femmea_treatment_medications(id) on delete cascade,
  schedule_id uuid not null references public.femmea_medication_schedules(id) on delete cascade,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending','completed','skipped','cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (schedule_id, scheduled_for)
);

create index if not exists femmea_treatment_medications_user_journey_idx
  on public.femmea_treatment_medications (user_id, journey_id, active, start_date);
create index if not exists femmea_medication_schedules_user_medication_idx
  on public.femmea_medication_schedules (user_id, medication_id, local_time);
create index if not exists femmea_medication_doses_user_scheduled_idx
  on public.femmea_medication_dose_occurrences (user_id, scheduled_for, status);
create index if not exists femmea_medication_doses_medication_scheduled_idx
  on public.femmea_medication_dose_occurrences (medication_id, scheduled_for);

alter table public.femmea_treatment_medications enable row level security;
alter table public.femmea_medication_schedules enable row level security;
alter table public.femmea_medication_dose_occurrences enable row level security;

revoke all on public.femmea_treatment_medications from anon;
revoke all on public.femmea_medication_schedules from anon;
revoke all on public.femmea_medication_dose_occurrences from anon;

grant select, insert, update, delete on public.femmea_treatment_medications to authenticated;
grant select, insert, update, delete on public.femmea_medication_schedules to authenticated;
grant select, insert, update, delete on public.femmea_medication_dose_occurrences to authenticated;

drop policy if exists femmea_treatment_medications_select_own on public.femmea_treatment_medications;
create policy femmea_treatment_medications_select_own
  on public.femmea_treatment_medications for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists femmea_treatment_medications_insert_own on public.femmea_treatment_medications;
create policy femmea_treatment_medications_insert_own
  on public.femmea_treatment_medications for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (treatment_id is null or exists (
      select 1 from public.femmea_treatments t
      where t.id = treatment_id and t.user_id = (select auth.uid())
    ))
    and (journey_id is null or exists (
      select 1 from public.femmea_insemination_journeys j
      where j.id = journey_id and j.user_id = (select auth.uid())
    ))
  );

drop policy if exists femmea_treatment_medications_update_own on public.femmea_treatment_medications;
create policy femmea_treatment_medications_update_own
  on public.femmea_treatment_medications for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (treatment_id is null or exists (
      select 1 from public.femmea_treatments t
      where t.id = treatment_id and t.user_id = (select auth.uid())
    ))
    and (journey_id is null or exists (
      select 1 from public.femmea_insemination_journeys j
      where j.id = journey_id and j.user_id = (select auth.uid())
    ))
  );

drop policy if exists femmea_treatment_medications_delete_own on public.femmea_treatment_medications;
create policy femmea_treatment_medications_delete_own
  on public.femmea_treatment_medications for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists femmea_medication_schedules_select_own on public.femmea_medication_schedules;
create policy femmea_medication_schedules_select_own
  on public.femmea_medication_schedules for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists femmea_medication_schedules_insert_own on public.femmea_medication_schedules;
create policy femmea_medication_schedules_insert_own
  on public.femmea_medication_schedules for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.femmea_treatment_medications m
      where m.id = medication_id and m.user_id = (select auth.uid())
    )
  );

drop policy if exists femmea_medication_schedules_update_own on public.femmea_medication_schedules;
create policy femmea_medication_schedules_update_own
  on public.femmea_medication_schedules for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.femmea_treatment_medications m
      where m.id = medication_id and m.user_id = (select auth.uid())
    )
  );

drop policy if exists femmea_medication_schedules_delete_own on public.femmea_medication_schedules;
create policy femmea_medication_schedules_delete_own
  on public.femmea_medication_schedules for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists femmea_medication_doses_select_own on public.femmea_medication_dose_occurrences;
create policy femmea_medication_doses_select_own
  on public.femmea_medication_dose_occurrences for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists femmea_medication_doses_insert_own on public.femmea_medication_dose_occurrences;
create policy femmea_medication_doses_insert_own
  on public.femmea_medication_dose_occurrences for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.femmea_treatment_medications m
      where m.id = medication_id and m.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.femmea_medication_schedules s
      where s.id = schedule_id and s.medication_id = medication_id and s.user_id = (select auth.uid())
    )
  );

drop policy if exists femmea_medication_doses_update_own on public.femmea_medication_dose_occurrences;
create policy femmea_medication_doses_update_own
  on public.femmea_medication_dose_occurrences for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.femmea_treatment_medications m
      where m.id = medication_id and m.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.femmea_medication_schedules s
      where s.id = schedule_id and s.medication_id = medication_id and s.user_id = (select auth.uid())
    )
  );

drop policy if exists femmea_medication_doses_delete_own on public.femmea_medication_dose_occurrences;
create policy femmea_medication_doses_delete_own
  on public.femmea_medication_dose_occurrences for delete to authenticated
  using ((select auth.uid()) = user_id);
