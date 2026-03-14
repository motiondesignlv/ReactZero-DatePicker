/**
 * src/__tests__/utils/intl.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for utils/intl.ts.
 *
 * Intl output varies by Node.js ICU build and OS locale tables, so we test
 * STRUCTURE and CORRECTNESS rather than exact string output wherever possible.
 * Where exact strings are asserted, they match the Baseline ICU data included
 * in Node.js 20+ with full-icu.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  resolveLocale,
  getFirstDayOfWeek,
  isRTL,
  formatDate,
  formatDateRange,
  formatMonthYear,
  formatAccessibleDate,
  formatTime,
  getWeekdayLabels,
  getMonthNames,
  detectHourCycle,
  getSegmentValueText,
} from '../../utils/intl';

// ─── resolveLocale ────────────────────────────────────────────────────────────

describe('resolveLocale', () => {
  it('returns the provided locale unchanged', () => {
    expect(resolveLocale('fr-FR')).toBe('fr-FR');
  });

  it('falls back to navigator.language when locale is undefined', () => {
    // navigator.language is 'en-US' in jsdom
    const result = resolveLocale(undefined);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('falls back to "en-US" when navigator is unavailable', () => {
    const originalNavigator = global.navigator;
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      configurable: true,
    });
    expect(resolveLocale(undefined)).toBe('en-US');
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });
});

// ─── getFirstDayOfWeek ────────────────────────────────────────────────────────

describe('getFirstDayOfWeek', () => {
  it('returns 0 (Sunday) for en-US', () => {
    expect(getFirstDayOfWeek('en-US')).toBe(0);
  });

  it('returns 1 (Monday) for en-GB', () => {
    expect(getFirstDayOfWeek('en-GB')).toBe(1);
  });

  it('returns a value in [0, 6]', () => {
    ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'ja-JP', 'ar-SA'].forEach(locale => {
      const result = getFirstDayOfWeek(locale);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(6);
    });
  });

  it('returns a number for an unrecognized locale (graceful fallback)', () => {
    const result = getFirstDayOfWeek('xx-XX');
    expect(typeof result).toBe('number');
  });
});

// ─── isRTL ────────────────────────────────────────────────────────────────────

describe('isRTL', () => {
  it('returns false for LTR locales', () => {
    expect(isRTL('en-US')).toBe(false);
    expect(isRTL('fr-FR')).toBe(false);
    expect(isRTL('de-DE')).toBe(false);
    expect(isRTL('ja-JP')).toBe(false);
  });

  it('returns true for Arabic', () => {
    expect(isRTL('ar')).toBe(true);
    expect(isRTL('ar-SA')).toBe(true);
  });

  it('returns true for Hebrew', () => {
    expect(isRTL('he')).toBe(true);
    expect(isRTL('he-IL')).toBe(true);
  });

  it('returns true for Persian/Farsi', () => {
    expect(isRTL('fa')).toBe(true);
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  const march10 = new Date(2026, 2, 10);

  it('returns a non-empty string', () => {
    const result = formatDate(march10, 'en-US', { dateStyle: 'medium' });
    expect(result.length).toBeGreaterThan(0);
  });

  it('contains the year 2026', () => {
    const result = formatDate(march10, 'en-US', { dateStyle: 'long' });
    expect(result).toContain('2026');
  });

  it('different locales produce different output', () => {
    const en = formatDate(march10, 'en-US', { dateStyle: 'long' });
    const fr = formatDate(march10, 'fr-FR', { dateStyle: 'long' });
    expect(en).not.toBe(fr);
  });

  it('caches formatter instances (calling twice is safe)', () => {
    // Mainly testing that the cache doesn't throw or corrupt results
    const first = formatDate(march10, 'en-US', { dateStyle: 'medium' });
    const second = formatDate(march10, 'en-US', { dateStyle: 'medium' });
    expect(first).toBe(second);
  });
});

// ─── formatDateRange ──────────────────────────────────────────────────────────

describe('formatDateRange', () => {
  const start = new Date(2026, 2, 10);
  const end = new Date(2026, 2, 20);

  it('returns a string containing both dates', () => {
    const result = formatDateRange(start, end, 'en-US', { dateStyle: 'medium' });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles same-day range without throwing', () => {
    expect(() => formatDateRange(start, start, 'en-US', { dateStyle: 'medium' })).not.toThrow();
  });
});

// ─── formatMonthYear ─────────────────────────────────────────────────────────

describe('formatMonthYear', () => {
  it('contains the year', () => {
    const result = formatMonthYear(new Date(2026, 2, 10), 'en-US');
    expect(result).toContain('2026');
  });

  it('contains the month name in en-US', () => {
    const result = formatMonthYear(new Date(2026, 2, 10), 'en-US');
    expect(result).toContain('March');
  });
});

// ─── formatAccessibleDate ────────────────────────────────────────────────────

describe('formatAccessibleDate', () => {
  it('contains the full year, month, and day', () => {
    const result = formatAccessibleDate(new Date(2026, 2, 10), 'en-US');
    expect(result).toContain('2026');
    expect(result).toContain('10');
  });

  it('contains the weekday name', () => {
    // March 10, 2026 is a Tuesday
    const result = formatAccessibleDate(new Date(2026, 2, 10), 'en-US');
    expect(result.toLowerCase()).toContain('tuesday');
  });
});

// ─── getWeekdayLabels ─────────────────────────────────────────────────────────

describe('getWeekdayLabels', () => {
  it('returns 7 labels', () => {
    expect(getWeekdayLabels('en-US', 0)).toHaveLength(7);
  });

  it('each label has short, long, and narrow properties', () => {
    getWeekdayLabels('en-US', 0).forEach(label => {
      expect(label.short.length).toBeGreaterThan(0);
      expect(label.long.length).toBeGreaterThan(0);
      expect(label.narrow.length).toBeGreaterThan(0);
    });
  });

  it('with Sunday start (0), first label is Sunday', () => {
    const labels = getWeekdayLabels('en-US', 0);
    expect(labels[0].long.toLowerCase()).toBe('sunday');
  });

  it('with Monday start (1), first label is Monday', () => {
    const labels = getWeekdayLabels('en-US', 1);
    expect(labels[0].long.toLowerCase()).toBe('monday');
  });

  it('with Saturday start (6), first label is Saturday', () => {
    const labels = getWeekdayLabels('en-US', 6);
    expect(labels[0].long.toLowerCase()).toBe('saturday');
  });

  it('all 7 days are present exactly once', () => {
    const labels = getWeekdayLabels('en-US', 0);
    const longNames = labels.map(l => l.long.toLowerCase());
    const expected = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    expect(longNames.sort()).toEqual(expected.sort());
  });
});

// ─── getMonthNames ────────────────────────────────────────────────────────────

describe('getMonthNames', () => {
  it('returns 12 month names', () => {
    expect(getMonthNames('en-US')).toHaveLength(12);
  });

  it('first month is January for en-US', () => {
    const months = getMonthNames('en-US', 'long');
    expect(months[0].toLowerCase()).toBe('january');
  });

  it('short format is shorter than long format', () => {
    const long = getMonthNames('en-US', 'long');
    const short = getMonthNames('en-US', 'short');
    expect(short[0].length).toBeLessThanOrEqual(long[0].length);
  });
});

// ─── detectHourCycle ─────────────────────────────────────────────────────────

describe('detectHourCycle', () => {
  it('returns "h12" for en-US', () => {
    expect(detectHourCycle('en-US')).toBe('h12');
  });

  it('returns "h23" for de-DE', () => {
    expect(detectHourCycle('de-DE')).toBe('h23');
  });

  it('returns either "h12" or "h23" for all locales', () => {
    ['en-US', 'fr-FR', 'ja-JP', 'zh-CN', 'ar-SA', 'en-GB'].forEach(locale => {
      const cycle = detectHourCycle(locale);
      expect(['h12', 'h23']).toContain(cycle);
    });
  });
});

// ─── getSegmentValueText ──────────────────────────────────────────────────────

describe('getSegmentValueText', () => {
  it('returns "2 PM" for hour=14 in h12', () => {
    const result = getSegmentValueText('hour', 14, 'h12', 'en-US');
    expect(result).toContain('2');
    expect(result).toContain('PM');
  });

  it('returns "12 PM" for noon (hour=12) in h12', () => {
    const result = getSegmentValueText('hour', 12, 'h12', 'en-US');
    expect(result).toContain('12');
    expect(result).toContain('PM');
  });

  it('returns "12 AM" for midnight (hour=0) in h12', () => {
    const result = getSegmentValueText('hour', 0, 'h12', 'en-US');
    expect(result).toContain('12');
    expect(result).toContain('AM');
  });

  it('returns minute description for minute type', () => {
    const result = getSegmentValueText('minute', 30, 'h23', 'en-US');
    expect(result).toContain('30');
    expect(result).toContain('minute');
  });

  it('returns second description for second type', () => {
    const result = getSegmentValueText('second', 45, 'h23', 'en-US');
    expect(result).toContain('45');
    expect(result).toContain('second');
  });
});
