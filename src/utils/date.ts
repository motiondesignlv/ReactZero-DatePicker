/**
 * Core date utilities replacing date-fns.
 * Provides zero-dependency, DST-safe date manipulation.
 */

export function cloneDate(date: Date | string | number): Date {
  const d = date instanceof Date ? date : new Date(date);
  return new Date(isNaN(d.getTime()) ? Date.now() : d.getTime());
}

export function startOfDay(date: Date): Date {
  const d = cloneDate(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isBefore(date: Date, compareDate: Date): boolean {
  return startOfDay(date).getTime() < startOfDay(compareDate).getTime();
}

export function isAfter(date: Date, compareDate: Date): boolean {
  return startOfDay(date).getTime() > startOfDay(compareDate).getTime();
}

export function isInRange(date: Date, start: Date, end: Date): boolean {
  const d = startOfDay(date).getTime();
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  const min = Math.min(s, e);
  const max = Math.max(s, e);
  return d >= min && d <= max;
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isOutOfRange(date: Date, min?: Date | null, max?: Date | null): boolean {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return false;
  const t = startOfDay(date).getTime();
  if (min && min instanceof Date && !isNaN(min.getTime()) && t < startOfDay(min).getTime()) return true;
  if (max && max instanceof Date && !isNaN(max.getTime()) && t > startOfDay(max).getTime()) return true;
  return false;
}

export function addDays(date: Date, n: number): Date {
  const d = cloneDate(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function addMonths(date: Date, n: number): Date {
  const d = cloneDate(date);
  const targetDay = d.getDate();
  d.setMonth(d.getMonth() + n);
  
  // Snap to last valid day if overflowed
  if (d.getDate() !== targetDay) {
    d.setDate(0); 
  }
  return d;
}

export function addYears(date: Date, n: number): Date {
  return addMonths(date, n * 12);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function firstDayOfWeekInMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function buildCalendarGrid(year: number, month: number, firstDayOfWeek: number = 0): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() - firstDayOfWeek + 7) % 7;
  
  const gridStart = addDays(firstDay, -startOffset);
  const weeks: Date[][] = [];
  
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(addDays(gridStart, w * 7 + d));
    }
    weeks.push(week);
  }
  
  return weeks;
}

export function buildMonthGrid(year: number): Date[] {
  const months: Date[] = [];
  for (let m = 0; m < 12; m++) {
    months.push(new Date(year, m, 1));
  }
  return months;
}

export function buildYearList(currentYear: number, count: number): number[] {
  const years: number[] = [];
  const start = currentYear - Math.floor(count / 2) + 1; // centering slightly biased to past by -1 from half
  for (let i = 0; i < count; i++) {
    years.push(start + i);
  }
  return years;
}

/**
 * Normalize any date-like value (Date, ISO string, timestamp) to a Date,
 * or return null if the value is empty / invalid.
 */
export function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function toISODateString(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toISODateTimeString(date: Date): string {
  const timeStr = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0')
  ].join(':');
  return `${toISODateString(date)}T${timeStr}`;
}

export function parseISODateString(str: string): Date | null {
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const date = new Date(y, m, d);
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) return null;
  return date;
}

export function setTime(date: Date, h: number, m: number, s: number = 0): Date {
  const d = cloneDate(date);
  d.setHours(h, m, s, 0);
  return d;
}

export function combineDateAndTime(datePart: Date, timePart: Date): Date {
  const d = cloneDate(datePart);
  d.setHours(timePart.getHours(), timePart.getMinutes(), timePart.getSeconds(), timePart.getMilliseconds());
  return d;
}

export function clampOrWrap(value: number, min: number, max: number, wrap: boolean = true): number {
  if (value >= min && value <= max) return value;
  if (!wrap) {
    return value < min ? min : max;
  }
  const range = max - min + 1;
  const normalized = ((value - min) % range + range) % range;
  return min + normalized;
}
