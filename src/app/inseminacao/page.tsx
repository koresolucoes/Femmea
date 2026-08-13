import { redirect } from "next/navigation";
import { JourneyChecklist } from "@/components/journey/journey-checklist";
import { JourneyContent } from "@/components/journey/journey-content";
import { JourneyTimeline } from "@/components/journey/journey-timeline";
import { FemmeaJourneyHeader, JourneyTabs } from "@/components/journey-navigation";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { isJourneyStage } from "@/lib/journey-story";
import { JOURNEY_STAGES, formatJourneyDate, resolveJourneyStage, stageIndex } from "@/lib/journey";
import { createClient } from "@/lib/supabase/server";
import type { Journey } from "@/types/journey";
import { updateJourneyDates } from "./actions";

type Tab = "timeline" | "checklist" | "conteudos";
type Props = { searchParams: Promise<{ tab?: string; stage?: string }> };

const MAIN_CHECKLIST_KEYS = new Set([
  "initial_consultation",
  "requested_exams",
  "medication_plan",
  "monitoring_scheduled",
  "procedure_day",
  "post_care",
  "pregnancy_test",
]);

export default async function InseminacaoPage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createClient();
  const params = await searchParams;
  const tab: Tab = params.tab === "checklist" || params.tab === "conteudos" ? params.tab : "timeline";

  const { data: journeyData } = await supabase
    .from("femmea_insemination_journeys")
    .select("id,user_id,current_stage,cycle_start_date,procedure_date,pregnancy_test_date,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!journeyData) redirect("/onboarding");
  const journey = journeyData as Journey;
  const computedStage = resolveJourneyStage(journey);
  const currentIndex = stageIndex(computedStage);
  const initialStage = isJourneyStage(params.stage) ? params.stage : computedStage;

  const { data: checklistData } = await supabase
    .from("femmea_journey_checklist_items")
    .select("id,item_key,label,stage,completed")
    .eq("journey_id", journey.id)
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  const visibleChecklist = (checklistData ?? []).filter((item) => MAIN_CHECKLIST_KEYS.has(item.item_key));
  const procedureInput = journey.procedure_date?.slice(0, 10) ?? "";

  return (
    <MobileShell>
      <FemmeaJourneyHeader />
      <JourneyTabs active={tab} />

      {tab === "timeline" && (
        <>
          <section className="timeline-intro journey-status-intro story-opening">
            <span className="stage-kicker">Sua história, etapa por etapa</span>
            <h2>{JOURNEY_STAGES[currentIndex].title}</h2>
            <p>Toque em cada capítulo para abrir os detalhes sem perder o contexto da sua jornada.</p>
          </section>

          <JourneyTimeline
            initialStage={initialStage}
            currentStage={computedStage}
            procedureDate={formatJourneyDate(journey.procedure_date)}
            pregnancyTestDate={formatJourneyDate(journey.pregnancy_test_date)}
          />

          <details className="journey-settings-card story-settings-card">
            <summary>Ajustar datas da jornada</summary>
            <form action={updateJourneyDates} className="journey-date-form">
              <input type="hidden" name="journeyId" value={journey.id} />
              <label><span>Data do procedimento</span><input name="procedureDate" type="date" defaultValue={procedureInput} /></label>
              <label><span>Data prevista do teste</span><input name="pregnancyTestDate" type="date" defaultValue={journey.pregnancy_test_date ?? ""} /></label>
              <p>Se a data do teste ficar vazia, o app cria uma sugestão organizacional. Confirme sempre a data clínica com a equipe responsável.</p>
              <button type="submit">Salvar datas</button>
            </form>
          </details>
        </>
      )}

      {tab === "checklist" && <JourneyChecklist items={visibleChecklist} />}
      {tab === "conteudos" && <JourneyContent />}
    </MobileShell>
  );
}
