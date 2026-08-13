-- Femmea API hardening
-- RLS remains the primary row-authorization layer. This migration also removes
-- anonymous table privileges so pre-authenticated clients cannot discover or
-- call the Femmea tables through PostgREST/GraphQL.

revoke all on table public.femmea_profiles from anon;
revoke all on table public.femmea_insemination_journeys from anon;
revoke all on table public.femmea_hydration_logs from anon;
revoke all on table public.femmea_symptom_logs from anon;
revoke all on table public.femmea_symptom_entries from anon;
revoke all on table public.femmea_reminders from anon;
revoke all on table public.femmea_journey_checklist_items from anon;

-- Authenticated clients still rely on RLS policies for per-user isolation.
grant select, insert, update, delete on table public.femmea_profiles to authenticated;
grant select, insert, update, delete on table public.femmea_insemination_journeys to authenticated;
grant select, insert, update, delete on table public.femmea_hydration_logs to authenticated;
grant select, insert, update, delete on table public.femmea_symptom_logs to authenticated;
grant select, insert, update, delete on table public.femmea_symptom_entries to authenticated;
grant select, insert, update, delete on table public.femmea_reminders to authenticated;
grant select, insert, update, delete on table public.femmea_journey_checklist_items to authenticated;
