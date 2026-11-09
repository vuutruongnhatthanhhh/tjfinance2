export interface DateRange {
  from: Date;
  to: Date;
}

export function monthRange(year: number, month: number): DateRange {
  const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const to = new Date(year, month, 1, 0, 0, 0, 0);
  return { from, to };
}

export function yearRange(year: number): DateRange {
  const from = new Date(year, 0, 1, 0, 0, 0, 0);
  const to = new Date(year + 1, 0, 1, 0, 0, 0, 0);
  return { from, to };
}

export function customRange(fromISO: string, toISO: string): DateRange {
  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  to.setDate(to.getDate() + 1);
  return { from, to };
}

export function toInputDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
