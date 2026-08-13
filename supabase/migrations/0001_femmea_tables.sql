create table if not exists public.femmea_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'America/Sao_Paulo',
  onboarding_completed boolean not null default false,
  daily_water_goal_ml integer not null default 2000 check (daily_water_goal_ml between 500 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.femmea_insemination_journeys (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  current_stage text not null default 'planning' check (current_stage in ('planning','cycle_monitoring','insemination_day','post_procedure','pregnancy_test')),
  cycle_start_date date, procedure_date timestamptz, pregnancy_test_date date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.femmea_hydration_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  amount_ml integer not null check (amount_ml > 0 and amount_ml <= 5000), consumed_at timestamptz not null default now(), consumed_on date not null default current_date
);
create table if not exists public.femmea_symptom_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date, emotional_state smallint check (emotional_state between 1 and 5), notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, log_date)
);
create table if not exists public.femmea_symptom_entries (
  id uuid primary key default gen_random_uuid(), symptom_log_id uuid not null references public.femmea_symptom_logs(id) on delete cascade,
  symptom_type text not null, intensity smallint check (intensity between 1 and 5), created_at timestamptz not null default now()
);
create table if not exists public.femmea_reminders (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null,
  reminder_type text not null check (reminder_type in ('medication','supplement','appointment','cycle','pregnancy_test','custom')),
  scheduled_for timestamptz not null, enabled boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.femmea_journey_checklist_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  journey_id uuid not null references public.femmea_insemination_journeys(id) on delete cascade, item_key text not null, label text not null,
  stage text not null check (stage in ('planning','cycle_monitoring','insemination_day','post_procedure','pregnancy_test')),
  sort_order integer not null default 0, completed boolean not null default false, completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (journey_id, item_key)
);
