/**
 * Intl formatters replacing date-fns localization.
 * Uses native browser Intl.DateTimeFormat and Locale APIs.
 */

const CACHE_MAX = 50;
const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(locale: string | undefined, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const l = resolveLocale(locale);
  const key = `${l}-${JSON.stringify(options)}`;

  const cached = formatters.get(key);
  if (cached) {
    // Move to most-recently-used position (Map preserves insertion order)
    formatters.delete(key);
    formatters.set(key, cached);
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(l, options);
  formatters.set(key, formatter);

  // Evict oldest entry when cache exceeds limit
  if (formatters.size > CACHE_MAX) {
    const oldest = formatters.keys().next().value;
    if (oldest !== undefined) {
      formatters.delete(oldest);
    }
  }

  return formatter;
}

/** Clear the internal DateTimeFormat cache. Useful for SSR or testing. */
export function clearFormatterCache(): void {
  formatters.clear();
}

export function resolveLocale(locale?: string): string {
  if (locale) return locale;
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
  return 'en-US';
}

export function getFirstDayOfWeek(locale?: string): number {
  try {
    const l = new Intl.Locale(resolveLocale(locale));
    const weekInfo = (l as any).getWeekInfo?.() || (l as any).weekInfo;
    if (weekInfo && typeof weekInfo.firstDay === 'number') {
      return weekInfo.firstDay === 7 ? 0 : weekInfo.firstDay;
    }
  } catch (e) {
    //
  }
  return 0; // Fallback to Sunday
}

export function isRTL(locale?: string): boolean {
  try {
    const l = new Intl.Locale(resolveLocale(locale));
    const textInfo = (l as any).getTextInfo?.() || (l as any).textInfo;
    if (textInfo && textInfo.direction) {
      return textInfo.direction === 'rtl';
    }
    // Fallback detection
    const ltr = resolveLocale(locale).toLowerCase().split('-')[0];
    return ['ar', 'he', 'fa', 'ur', 'ps', 'ks', 'sd', 'dv'].includes(ltr);
  } catch {
    return false;
  }
}

export function formatDate(date: Date, locale?: string, options: Intl.DateTimeFormatOptions = {}): string {
  return getFormatter(locale, options).format(date);
}

export function formatDateRange(start: Date, end: Date, locale?: string, options: Intl.DateTimeFormatOptions = {}): string {
  if (start.getTime() === end.getTime()) {
    return formatDate(start, locale, options);
  }
  const formatter = getFormatter(locale, options);
  if (typeof (formatter as any).formatRange === 'function') {
    return (formatter as any).formatRange(start, end);
  }
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function formatMonthYear(date: Date, locale?: string): string {
  return getFormatter(locale, { month: 'long', year: 'numeric' }).format(date);
}

export function formatAccessibleDate(date: Date, locale?: string): string {
  return getFormatter(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatTime(date: Date, locale?: string, options: Intl.DateTimeFormatOptions = {}): string {
  return getFormatter(locale, { timeStyle: 'short', ...options }).format(date);
}

export function formatWeekday(date: Date, length: 'long' | 'short' | 'narrow', locale?: string): string {
  return getFormatter(locale, { weekday: length }).format(date);
}

export function formatDay(date: Date, locale?: string): string {
  return getFormatter(locale, { day: 'numeric' }).format(date);
}

// Kept for backward compat with CalendarGrid
export function getWeekdayNames(firstDayOfWeek: number, length: 'long' | 'short' | 'narrow', locale?: string): string[] {
  const baseDate = new Date(2024, 0, 1); // Jan 1, 2024 is Monday (1 in Date.getDay)
  const offset = firstDayOfWeek - 1; 
  const names: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + offset + i);
    names.push(formatWeekday(d, length, locale));
  }
  return names;
}

export function getWeekdayLabels(locale: string, firstDayOfWeek: number) {
  const baseDate = new Date(2024, 0, 1); // Monday
  const offset = firstDayOfWeek - 1;
  const labels: { short: string; long: string; narrow: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + offset + i);
    labels.push({
      short: formatWeekday(d, 'short', locale),
      long: formatWeekday(d, 'long', locale),
      narrow: formatWeekday(d, 'narrow', locale),
    });
  }
  return labels;
}

export function getMonthNames(locale: string, style: 'long' | 'short' | 'narrow' = 'long'): string[] {
  const names: string[] = [];
  for (let i = 0; i < 12; i++) {
    names.push(getFormatter(locale, { month: style }).format(new Date(2026, i, 1)));
  }
  return names;
}

export function detectHourCycle(locale: string): 'h12' | 'h23' {
  const formatter = getFormatter(locale, { timeStyle: 'short' });
  // resolvedOptions().hourCycle is not in the lib.dom.d.ts typings; cast through any
  const options = formatter.resolvedOptions() as any;
  const hc = options.hourCycle as string | undefined;
  if (hc) {
    if (hc === 'h12' || hc === 'h11') return 'h12';
    return 'h23';
  }
  // Fallback: Check if formatted time for 14:00 contains 'PM' or 'AM'
  const timeStr = formatter.format(new Date(2026, 0, 1, 14, 0));
  return timeStr.match(/am|pm/i) ? 'h12' : 'h23';
}

export function getSegmentValueText(type: 'hour' | 'minute' | 'second', value: number, hourCycle: 'h12' | 'h23', locale?: string): string {
  const date = new Date(2026, 0, 1, 0, 0, 0);
  if (type === 'hour') {
    date.setHours(value);
  } else if (type === 'minute') {
    date.setMinutes(value);
  } else if (type === 'second') {
    date.setSeconds(value);
  }

  if (type === 'hour') {
    const parts = getFormatter(locale, { hour: 'numeric', hourCycle }).formatToParts(date);
    const textParts = parts.filter(p => p.type === 'hour' || p.type === 'dayPeriod').map(p => p.value);
    return textParts.join(' ').trim();
  }

  // Fallbacks for minute/second representation
  return `${value} ${type}`;
}
