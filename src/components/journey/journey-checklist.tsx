import { CheckIcon, SparklesIcon } from "@/components/icons";
import { toggleChecklistItem } from "@/app/inseminacao/actions";
import { JOURNEY_STAGES } from "@/lib/journey";

export type JourneyChecklistItem = {
  id: string;
  item_key: string;
  label: string;
  stage: string;
  completed: boolean;
};

export function JourneyChecklist({ items }: { items: JourneyChecklistItem[] }) {
  const completed = items.filter((item) => item.completed).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  return (
    <section className="checklist-screen">
      <div className="checklist-header-copy">
        <span className="stage-kicker">Checklist do ciclo</span>
        <h2>Marque o que já foi feito</h2>
        <p>Seu progresso fica salvo e acompanha a jornada.</p>
      </div>
      <div className="checklist-progress-card">
        <div className="checklist-progress-copy"><strong>{completed}/{items.length}</strong><span>itens concluídos</span></div>
        <div className="checklist-progress-track"><span style={{ width: `${progress}%` }} /></div>
        <b>{progress}%</b>
      </div>
      <div className="checklist-list">
        {items.map((item) => (
          <form action={toggleChecklistItem} key={item.id}>
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="completed" value={String(item.completed)} />
            <button className={`checklist-row ${item.completed ? "completed" : ""}`} type="submit">
              <span className="check-box">{item.completed && <CheckIcon />}</span>
              <span className="checklist-row-copy"><strong>{item.label}</strong><small>{JOURNEY_STAGES.find((stage) => stage.key === item.stage)?.title}</small></span>
            </button>
          </form>
        ))}
      </div>
      <aside className="journey-tip"><SparklesIcon /><span><strong>Dica</strong> Manter tudo em dia ajuda você a visualizar a jornada com mais tranquilidade.</span></aside>
    </section>
  );
}
