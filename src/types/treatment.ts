export type MedicationCategory =
  | "ovarian_stimulation"
  | "ovulation_induction"
  | "progesterone_support"
  | "other";

export type MedicationRoute = "injection" | "oral" | "vaginal" | "other";
export type MedicationDoseStatus = "pending" | "completed" | "skipped" | "cancelled";

export type TreatmentMedication = {
  id: string;
  user_id: string;
  treatment_id: string | null;
  journey_id: string | null;
  name: string;
  category: MedicationCategory;
  dose_label: string;
  administration_route: MedicationRoute;
  start_date: string;
  end_date: string;
  notes?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type MedicationSchedule = {
  id: string;
  user_id: string;
  medication_id: string;
  local_time: string;
  created_at?: string;
};

export type MedicationDoseOccurrence = {
  id: string;
  user_id: string;
  medication_id: string;
  schedule_id: string;
  scheduled_for: string;
  status: MedicationDoseStatus;
  completed_at: string | null;
  created_at?: string;
  updated_at?: string;
};
