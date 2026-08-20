"use client";

import { useState } from "react";
import { createMedication } from "@/app/medicamentos/actions";

export function MedicationForm() {
  const [times, setTimes] = useState(["08:00"]);

  function addTime() {
    if (times.length >= 4) return;
    setTimes((current) => [...current, "20:00"]);
  }

  function updateTime(index: number, value: string) {
    setTimes((current) => current.map((time, itemIndex) => itemIndex === index ? value : time));
  }

  function removeTime(index: number) {
    setTimes((current) => current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <form action={createMedication} className="treatment-form">
      <label>
        <span>Nome do medicamento</span>
        <input name="name" maxLength={100} placeholder="Conforme sua prescrição" autoComplete="off" required />
      </label>

      <label>
        <span>Para que ele foi indicado?</span>
        <select name="category" defaultValue="ovarian_stimulation">
          <option value="ovarian_stimulation">Estimulação ovariana</option>
          <option value="ovulation_induction">Indução da ovulação</option>
          <option value="progesterone_support">Progesterona / suporte</option>
          <option value="other">Outro</option>
        </select>
      </label>

      <div className="treatment-form-grid">
        <label>
          <span>Dose prescrita</span>
          <input name="doseLabel" maxLength={60} placeholder="Ex.: 75 UI" autoComplete="off" required />
        </label>
        <label>
          <span>Via</span>
          <select name="administrationRoute" defaultValue="injection">
            <option value="injection">Injeção</option>
            <option value="oral">Oral</option>
            <option value="vaginal">Vaginal</option>
            <option value="other">Outra</option>
          </select>
        </label>
      </div>

      <fieldset className="treatment-times">
        <legend>Horários prescritos</legend>
        {times.map((time, index) => (
          <div className="treatment-time-row" key={`${index}-${time}`}>
            <input
              name="times"
              type="time"
              value={time}
              onChange={(event) => updateTime(index, event.target.value)}
              required
            />
            {times.length > 1 && (
              <button type="button" className="treatment-time-remove" onClick={() => removeTime(index)} aria-label={`Remover horário ${index + 1}`}>
                Remover
              </button>
            )}
          </div>
        ))}
        {times.length < 4 && <button type="button" className="treatment-time-add" onClick={addTime}>+ Adicionar outro horário</button>}
      </fieldset>

      <div className="treatment-form-grid">
        <label>
          <span>Data de início</span>
          <input name="startDate" type="date" required />
        </label>
        <label>
          <span>Data de término</span>
          <input name="endDate" type="date" required />
        </label>
      </div>

      <label>
        <span>Observação opcional</span>
        <textarea name="notes" maxLength={500} rows={3} placeholder="Anote apenas orientações que você recebeu e queira consultar depois." />
      </label>

      <div className="treatment-calendar-note">
        <span aria-hidden="true">📅</span>
        <p>As doses serão adicionadas automaticamente ao seu calendário conforme as datas e horários que você cadastrou.</p>
      </div>

      <button type="submit" className="treatment-submit">Salvar medicamento</button>
      <small className="treatment-form-footnote">O Femmea organiza o que foi prescrito. Ele não recomenda medicamentos, doses ou mudanças no tratamento.</small>
    </form>
  );
}
