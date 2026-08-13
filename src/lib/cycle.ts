import { isoDateInTimeZone } from "@/lib/date";

export type CyclePhase = "menstruation" | "follicular" | "ovulation" | "luteal";

export const CYCLE_PHASES: Record<CyclePhase, { label: string; className: string }> = {
  menstruation: { label: "Menstruação", className: "phase-menstruation" },
  follicular: { label: "Fase Folicular", className: "phase-follicular" },
  ovulation: { label: "Ovulação", className: "phase-ovulation" },
  luteal: { label: "Fase Lútea", className: "phase-luteal" },
};

function utcDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function getCycleDay(cycleStartDate: string | null | undefined, timeZone: string, now = new Date()) {
  if (!cycleStartDate) return null;
  const today = isoDateInTimeZone(now, timeZone);
  const diff = Math.floor((utcDate(today) - utcDate(cycleStartDate)) / 86_400_000) + 1;
  return diff > 0 ? diff : null;
}

export function normalizeCycleDay(day: number | null, cycleLength = 28) {
  if (!day || day < 1) return null;
  return ((day - 1) % cycleLength) + 1;
}

export function getEstimatedCyclePhase(day: number | null, cycleLength = 28): CyclePhase {
  const normalized = normalizeCycleDay(day, cycleLength) ?? 1;
  const estimatedOvulation = Math.max(10, cycleLength - 14);
  if (normalized <= 5) return "menstruation";
  if (normalized < estimatedOvulation) return "follicular";
  if (normalized <= estimatedOvulation + 1) return "ovulation";
  return "luteal";
}

export function cycleWeekWindow(cycleStartDate: string | null | undefined, timeZone: string, cycleLength = 28) {
  const today = isoDateInTimeZone(new Date(), timeZone);
  const center = getCycleDay(cycleStartDate, timeZone);
  const current = normalizeCycleDay(center, cycleLength);
  const base = new Date(`${today}T12:00:00Z`);
  const labels = ["D", "S", "T", "Q", "Q", "S", "S"];
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base);
    date.setUTCDate(base.getUTCDate() + index - 3);
    const iso = date.toISOString().slice(0, 10);
    const absoluteDay = cycleStartDate ? Math.floor((utcDate(iso) - utcDate(cycleStartDate)) / 86_400_000) + 1 : null;
    const normalized = normalizeCycleDay(absoluteDay, cycleLength);
    const phase = getEstimatedCyclePhase(normalized, cycleLength);
    return { iso, label: labels[date.getUTCDay()], dayOfMonth: date.getUTCDate(), cycleDay: normalized, phase, isToday: iso === today, isCurrentCycleDay: normalized !== null && normalized === current };
  });
}

export function formatTemperature(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return `${parsed.toFixed(2).replace(".", ",")} °C`;
}

export const OVULATION_RESULTS = [
  { value: "negative", label: "Negativo", description: "Sem pico detectado" },
  { value: "positive", label: "Positivo", description: "LH detectado" },
  { value: "peak", label: "Pico", description: "Pico de LH registrado" },
] as const;

export const CERVICAL_MUCUS_OPTIONS = [
  { value: "dry", label: "Seco", description: "Pouca ou nenhuma secreção" },
  { value: "sticky", label: "Pegajoso", description: "Textura mais espessa" },
  { value: "creamy", label: "Cremoso", description: "Consistência cremosa" },
  { value: "watery", label: "Aquoso", description: "Mais fluido e transparente" },
  { value: "egg_white", label: "Clara de ovo", description: "Elástico e transparente" },
  { value: "other", label: "Outro", description: "Registrar nas observações" },
] as const;
