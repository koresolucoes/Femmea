import { CheckIcon, SparklesIcon } from "@/components/icons";
import { toggleChecklistItem } from "@/app/inseminacao/actions";
import { JOURNEY_STAGES } from "@/lib/journey";

export type JourneyChecklistItem = { id:string; item_key:string; label:string; stage:string; completed:boolean };

export function JourneyChecklist({ items }: { items: JourneyChecklistItem[] }) {
  const completed = items.filter((item) => item.completed).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  return <section className="checklist-screen">
    <div className="checklist-header-copy"><span className="stage-kicker">Checklist contextual</span><h2>Uma etapa de cada vez</h2><p>As tarefas ficam agrupadas pelo momento da jornada, em vez de virar uma lista sem contexto.</p></div>
    <div className="checklist-progress-card"><div className="checklist-progress-copy"><strong>{completed}/{items.length}</strong><span>itens concluídos</span></div><div className="checklist-progress-track"><span style={{ width:`${progress}%` }} /></div><b>{progress}%</b></div>
    <div className="context-checklist-groups">{JOURNEY_STAGES.map((stage) => {
      const stageItems = items.filter((item) => item.stage === stage.key);
      if (!stageItems.length) return null;
      const stageDone = stageItems.filter((item) => item.completed).length;
      return <section className="context-checklist-group" key={stage.key}><div className="context-checklist-heading"><span>{stage.eyebrow}</span><small>{stageDone}/{stageItems.length}</small></div><div className="checklist-list">{stageItems.map((item) => <form action={toggleChecklistItem} key={item.id}><input type="hidden" name="itemId" value={item.id} /><input type="hidden" name="completed" value={String(item.completed)} /><button className={`checklist-row ${item.completed ? "completed" : ""}`} type="submit"><span className="check-box">{item.completed && <CheckIcon />}</span><span className="checklist-row-copy"><strong>{item.label}</strong><small>{item.completed ? "Concluído" : "Pendente"}</small></span></button></form>)}</div></section>;
    })}</div>
    <aside className="journey-tip"><SparklesIcon /><span><strong>Sem pressão</strong> Este checklist organiza o que você decidiu acompanhar; ele não determina preparo ou prontidão clínica.</span></aside>
  </section>;
}
