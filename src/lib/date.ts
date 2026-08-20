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

export function addDaysToIsoDate(value: string, days: number) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + days, 12));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function dateTimePartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

export function zonedDateTimeToIso(dateValue: string, timeValue: string, timeZone: string) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeValue);
  if (!dateMatch || !timeMatch) return null;

  const target = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  };
  if (target.month < 1 || target.month > 12 || target.day < 1 || target.day > 31 || target.hour > 23 || target.minute > 59) return null;

  const desiredAsUtc = Date.UTC(target.year, target.month - 1, target.day, target.hour, target.minute, 0);
  let timestamp = desiredAsUtc;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const observed = dateTimePartsInTimeZone(new Date(timestamp), timeZone);
    const observedAsUtc = Date.UTC(observed.year, observed.month - 1, observed.day, observed.hour, observed.minute, observed.second);
    const delta = desiredAsUtc - observedAsUtc;
    timestamp += delta;
    if (Math.abs(delta) < 1000) break;
  }

  const result = new Date(timestamp);
  return Number.isNaN(result.getTime()) ? null : result.toISOString();
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
