create policy "femmea_profiles_select_own" on public.femmea_profiles for select to authenticated using (auth.uid() = id);
create policy "femmea_profiles_insert_own" on public.femmea_profiles for insert to authenticated with check (auth.uid() = id);
create policy "femmea_profiles_update_own" on public.femmea_profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "femmea_journeys_select_own" on public.femmea_insemination_journeys for select to authenticated using (auth.uid() = user_id);
create policy "femmea_journeys_insert_own" on public.femmea_insemination_journeys for insert to authenticated with check (auth.uid() = user_id);
create policy "femmea_journeys_update_own" on public.femmea_insemination_journeys for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "femmea_journeys_delete_own" on public.femmea_insemination_journeys for delete to authenticated using (auth.uid() = user_id);

create policy "femmea_hydration_select_own" on public.femmea_hydration_logs for select to authenticated using (auth.uid() = user_id);
create policy "femmea_hydration_insert_own" on public.femmea_hydration_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "femmea_hydration_delete_own" on public.femmea_hydration_logs for delete to authenticated using (auth.uid() = user_id);

create policy "femmea_symptom_logs_select_own" on public.femmea_symptom_logs for select to authenticated using (auth.uid() = user_id);
create policy "femmea_symptom_logs_insert_own" on public.femmea_symptom_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "femmea_symptom_logs_update_own" on public.femmea_symptom_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "femmea_symptom_logs_delete_own" on public.femmea_symptom_logs for delete to authenticated using (auth.uid() = user_id);

create policy "femmea_symptom_entries_select_own" on public.femmea_symptom_entries for select to authenticated using (exists (select 1 from public.femmea_symptom_logs sl where sl.id = symptom_log_id and sl.user_id = auth.uid()));
create policy "femmea_symptom_entries_insert_own" on public.femmea_symptom_entries for insert to authenticated with check (exists (select 1 from public.femmea_symptom_logs sl where sl.id = symptom_log_id and sl.user_id = auth.uid()));
create policy "femmea_symptom_entries_update_own" on public.femmea_symptom_entries for update to authenticated using (exists (select 1 from public.femmea_symptom_logs sl where sl.id = symptom_log_id and sl.user_id = auth.uid())) with check (exists (select 1 from public.femmea_symptom_logs sl where sl.id = symptom_log_id and sl.user_id = auth.uid()));
create policy "femmea_symptom_entries_delete_own" on public.femmea_symptom_entries for delete to authenticated using (exists (select 1 from public.femmea_symptom_logs sl where sl.id = symptom_log_id and sl.user_id = auth.uid()));

create policy "femmea_reminders_select_own" on public.femmea_reminders for select to authenticated using (auth.uid() = user_id);
create policy "femmea_reminders_insert_own" on public.femmea_reminders for insert to authenticated with check (auth.uid() = user_id);
create policy "femmea_reminders_update_own" on public.femmea_reminders for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "femmea_reminders_delete_own" on public.femmea_reminders for delete to authenticated using (auth.uid() = user_id);

create policy "femmea_checklist_select_own" on public.femmea_journey_checklist_items for select to authenticated using (auth.uid() = user_id);
create policy "femmea_checklist_insert_own" on public.femmea_journey_checklist_items for insert to authenticated with check (auth.uid() = user_id and exists (select 1 from public.femmea_insemination_journeys j where j.id = journey_id and j.user_id = auth.uid()));
create policy "femmea_checklist_update_own" on public.femmea_journey_checklist_items for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.femmea_insemination_journeys j where j.id = journey_id and j.user_id = auth.uid()));
create policy "femmea_checklist_delete_own" on public.femmea_journey_checklist_items for delete to authenticated using (auth.uid() = user_id);
