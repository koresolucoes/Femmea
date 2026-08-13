function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function dateInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
  };
}

export function isoDateInTimeZone(date: Date, timeZone: string) {
  const { year, month, day } = dateInTimeZone(date, timeZone);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function currentWeekDates(timeZone: string, now = new Date()) {
  const local = dateInTimeZone(now, timeZone);
  const anchor = new Date(Date.UTC(local.year, local.month - 1, local.day, 12));
  const sunday = new Date(anchor);
  sunday.setUTCDate(anchor.getUTCDate() - anchor.getUTCDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setUTCDate(sunday.getUTCDate() + index);
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  });
}

export function parseMonthParam(value: string | undefined, timeZone: string) {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12) return { year, month };
  }
  const local = dateInTimeZone(new Date(), timeZone);
  return { year: local.year, month: local.month };
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1, 12));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

export function monthMatrix(timeZone: string, target?: { year: number; month: number }) {
  const local = dateInTimeZone(new Date(), timeZone);
  const year = target?.year ?? local.year;
  const month = target?.month ?? local.month;
  const first = new Date(Date.UTC(year, month - 1, 1, 12));
  const last = new Date(Date.UTC(year, month, 0, 12));
  const leading = first.getUTCDay();
  const cells: Array<number | null> = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= last.getUTCDate(); day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(first);

  const isCurrentMonth = year === local.year && month === local.month;
  return { cells, monthLabel, year, month, today: isCurrentMonth ? local.day : null };
}
