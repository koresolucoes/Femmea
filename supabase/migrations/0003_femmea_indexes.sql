create index if not exists femmea_hydration_user_date_idx on public.femmea_hydration_logs(user_id, consumed_at desc);
create index if not exists femmea_hydration_user_consumed_on_idx on public.femmea_hydration_logs(user_id, consumed_on);
create index if not exists femmea_reminders_user_schedule_idx on public.femmea_reminders(user_id, scheduled_for);
create index if not exists femmea_journeys_user_idx on public.femmea_insemination_journeys(user_id, created_at desc);
create index if not exists femmea_checklist_user_journey_idx on public.femmea_journey_checklist_items(user_id, journey_id, sort_order);
