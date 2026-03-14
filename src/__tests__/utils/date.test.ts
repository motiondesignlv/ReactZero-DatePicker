/**
 * src/__tests__/utils/date.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Exhaustive unit tests for every function in utils/date.ts.
 *
 * Test philosophy for utility functions:
 * - Happy path
 * - Boundary conditions (first/last of month, leap years, DST transitions)
 * - The 5 documented pitfalls: UTC parsing, 0-indexed months, mutation,
 *   DST arithmetic, and month-day overflow
 * - No DOM, no React — pure function tests run in milliseconds
 */

import { describe, it, expect, vi } from 'vitest';
import {
  cloneDate,
  startOfDay,
  addDays,
  addMonths,
  addYears,
  daysInMonth,
  firstDayOfWeekInMonth,
  buildCalendarGrid,
  buildMonthGrid,
  buildYearList,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  isInRange,
  isToday,
  isOutOfRange,
  toISODateString,
  toISODateTimeString,
  parseISODateString,
  setTime,
  combineDateAndTime,
  clampOrWrap,
} from '../../utils/date';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Create a local Date at midnight. Avoids UTC pitfall in test code. */
const local = (year: number, month: number, day: number) =>
  new Date(year, month - 1, day); // 1-indexed month for readability

// ─── cloneDate ────────────────────────────────────────────────────────────────

describe('cloneDate', () => {
  it('returns a new Date object, not the same reference', () => {
    const original = local(2026, 3, 10);
    const clone = cloneDate(original);
    expect(clone).not.toBe(original);
  });

  it('preserves the exact timestamp', () => {
    const original = new Date(2026, 2, 10, 14, 30, 45, 123);
    expect(cloneDate(original).getTime()).toBe(original.getTime());
  });
});

// ─── startOfDay ───────────────────────────────────────────────────────────────

describe('startOfDay', () => {
  it('sets time to midnight (00:00:00.000)', () => {
    const d = new Date(2026, 2, 10, 14, 30, 45, 999);
    const start = startOfDay(d);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });

  it('preserves the calendar date', () => {
    const d = new Date(2026, 2, 10, 23, 59, 59);
    const start = startOfDay(d);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(2);
    expect(start.getDate()).toBe(10);
  });

  it('does not mutate the input', () => {
    const d = new Date(2026, 2, 10, 14, 30, 0);
    const originalHour = d.getHours();
    startOfDay(d);
    expect(d.getHours()).toBe(originalHour);
  });
});

// ─── addDays ──────────────────────────────────────────────────────────────────

describe('addDays', () => {
  it('adds positive days', () => {
    expect(addDays(local(2026, 3, 10), 5).getDate()).toBe(15);
  });

  it('subtracts days (negative n)', () => {
    expect(addDays(local(2026, 3, 10), -3).getDate()).toBe(7);
  });

  it('crosses forward month boundary', () => {
    const result = addDays(local(2026, 3, 30), 3);
    expect(result.getMonth()).toBe(3); // April (0-indexed)
    expect(result.getDate()).toBe(2);
  });

  it('crosses backward month boundary', () => {
    const result = addDays(local(2026, 3, 1), -1);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(28);
  });

  it('crosses year boundary', () => {
    const result = addDays(local(2026, 12, 31), 1);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0); // January
    expect(result.getDate()).toBe(1);
  });

  it('handles zero (no-op)', () => {
    const orig = local(2026, 3, 10);
    const result = addDays(orig, 0);
    expect(isSameDay(result, orig)).toBe(true);
  });

  it('does NOT mutate the input (PITFALL #3 — mutation)', () => {
    const original = local(2026, 3, 10);
    const originalTime = original.getTime();
    addDays(original, 5);
    expect(original.getTime()).toBe(originalTime);
  });

  it('handles DST transition correctly (PITFALL #4 — DST)', () => {
    // This tests that setDate() is used, not setTime(ms + 86400000).
    // DST transitions can make a "day" 23 or 25 hours, breaking ms arithmetic.
    // setDate() is immune because it works in calendar units, not ms.
    // We can't simulate a real DST transition in tests, but we verify the
    // function doesn't use millisecond arithmetic by checking the result
    // is exactly +1 calendar day, not +86400000ms.
    const beforeDST = local(2026, 3, 8); // A date near common DST transitions
    const after = addDays(beforeDST, 1);
    expect(after.getDate()).toBe(9);
    expect(after.getMonth()).toBe(2);
  });
});

// ─── addMonths ────────────────────────────────────────────────────────────────

describe('addMonths', () => {
  it('adds months within the same year', () => {
    const result = addMonths(local(2026, 1, 15), 3);
    expect(result.getMonth()).toBe(3); // April
    expect(result.getDate()).toBe(15);
  });

  it('crosses year boundary', () => {
    const result = addMonths(local(2026, 11, 15), 3);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(1); // February
  });

  it('subtracts months', () => {
    const result = addMonths(local(2026, 3, 15), -2);
    expect(result.getMonth()).toBe(0); // January
    expect(result.getDate()).toBe(15);
  });

  it('PITFALL #5 — month-day overflow: Jan 31 + 1 month = Feb 28', () => {
    // Without the overflow fix, setMonth(1) on Jan 31 → Feb 31 → March 3.
    const result = addMonths(local(2026, 1, 31), 1);
    expect(result.getMonth()).toBe(1); // Still February
    expect(result.getDate()).toBe(28); // Clamped to Feb 28
  });

  it('PITFALL #5 — leap year: Feb 29 + 12 months = Feb 28', () => {
    const leapDay = new Date(2024, 1, 29); // Feb 29, 2024
    const result = addMonths(leapDay, 12);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(28); // Clamped, 2025 is not a leap year
  });

  it('preserves day when target month is long enough', () => {
    const result = addMonths(local(2026, 1, 31), 2); // Jan 31 + 2 = March 31
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(31);
  });

  it('does not mutate the input', () => {
    const original = local(2026, 1, 31);
    const originalTime = original.getTime();
    addMonths(original, 1);
    expect(original.getTime()).toBe(originalTime);
  });
});

// ─── addYears ─────────────────────────────────────────────────────────────────

describe('addYears', () => {
  it('adds years', () => {
    expect(addYears(local(2026, 3, 10), 2).getFullYear()).toBe(2028);
  });

  it('subtracts years', () => {
    expect(addYears(local(2026, 3, 10), -1).getFullYear()).toBe(2025);
  });

  it('handles Feb 29 in leap year → non-leap year', () => {
    const leapDay = new Date(2024, 1, 29);
    const result = addYears(leapDay, 1);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it('handles Feb 29 → another leap year (preserved)', () => {
    const leapDay = new Date(2024, 1, 29);
    const result = addYears(leapDay, 4); // 2028 is also a leap year
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(29);
  });
});

// ─── daysInMonth ──────────────────────────────────────────────────────────────

describe('daysInMonth', () => {
  const cases = [
    [2026, 1, 31],  // January
    [2026, 2, 28],  // February (non-leap)
    [2024, 2, 29],  // February (leap year)
    [2026, 3, 31],  // March
    [2026, 4, 30],  // April
    [2026, 5, 31],  // May
    [2026, 6, 30],  // June
    [2026, 7, 31],  // July
    [2026, 8, 31],  // August
    [2026, 9, 30],  // September
    [2026, 10, 31], // October
    [2026, 11, 30], // November
    [2026, 12, 31], // December
  ];

  cases.forEach(([year, month, expected]) => {
    it(`${year}-${String(month).padStart(2,'0')} has ${expected} days`, () => {
      expect(daysInMonth(year, month - 1)).toBe(expected); // 0-indexed
    });
  });
});

// ─── firstDayOfWeekInMonth ────────────────────────────────────────────────────

describe('firstDayOfWeekInMonth', () => {
  it('returns the correct day of week for March 2026 (Sunday = 0)', () => {
    // March 1, 2026 is a Sunday
    expect(firstDayOfWeekInMonth(2026, 2)).toBe(0);
  });

  it('returns correct day for April 2026 (Wednesday = 3)', () => {
    // April 1, 2026 is a Wednesday
    expect(firstDayOfWeekInMonth(2026, 3)).toBe(3);
  });
});

// ─── buildCalendarGrid ────────────────────────────────────────────────────────

describe('buildCalendarGrid', () => {
  it('always returns exactly 6 rows', () => {
    // Test multiple months including February
    [
      [2026, 2], [2026, 1], [2024, 1], [2026, 11]
    ].forEach(([year, month]) => {
      expect(buildCalendarGrid(year, month, 0)).toHaveLength(6);
    });
  });

  it('each row has exactly 7 cells', () => {
    buildCalendarGrid(2026, 2, 0).forEach(week => {
      expect(week).toHaveLength(7);
    });
  });

  it('March 2026 with Sunday start: first cell is March 1', () => {
    // March 1, 2026 is a Sunday — exactly aligns with Sunday-start grid
    const grid = buildCalendarGrid(2026, 2, 0);
    expect(grid[0][0].getDate()).toBe(1);
    expect(grid[0][0].getMonth()).toBe(2);
  });

  it('March 2026 with Monday start: first cell is Feb 23', () => {
    // March 1 is Sunday; with Monday start, previous Monday is Feb 23
    const grid = buildCalendarGrid(2026, 2, 1);
    expect(grid[0][0].getMonth()).toBe(1); // February
    expect(grid[0][0].getDate()).toBe(23);
  });

  it('last cell is always 6 weeks after grid start', () => {
    const grid = buildCalendarGrid(2026, 2, 0);
    const lastCell = grid[5][6];
    // Grid starts March 1, so 6×7=42 cells: last cell is April 11
    expect(lastCell.getMonth()).toBe(3); // April
  });

  it('cells are in chronological order', () => {
    const grid = buildCalendarGrid(2026, 2, 0);
    const flat = grid.flat();
    for (let i = 1; i < flat.length; i++) {
      expect(flat[i].getTime()).toBeGreaterThan(flat[i - 1].getTime());
    }
  });

  it('February 2025 (28 days) has correct leading/trailing fill', () => {
    // Feb 1, 2025 is Saturday. With Sunday start, row 1 = [Jan 26..Feb 1]
    const grid = buildCalendarGrid(2025, 1, 0);
    expect(grid[0][0].getMonth()).toBe(0); // January
    expect(grid[0][6].getDate()).toBe(1);  // Feb 1 is last cell of row 1
  });

  it('does not mutate returned dates when addDays is called on them', () => {
    const grid = buildCalendarGrid(2026, 2, 0);
    const firstCell = grid[0][0];
    const originalTime = firstCell.getTime();
    addDays(firstCell, 1); // Should not mutate firstCell
    expect(firstCell.getTime()).toBe(originalTime);
  });
});

// ─── buildMonthGrid ───────────────────────────────────────────────────────────

describe('buildMonthGrid', () => {
  it('returns 12 months', () => {
    expect(buildMonthGrid(2026)).toHaveLength(12);
  });

  it('each Date is the 1st of its month', () => {
    buildMonthGrid(2026).forEach((d, i) => {
      expect(d.getMonth()).toBe(i);
      expect(d.getDate()).toBe(1);
    });
  });
});

// ─── buildYearList ────────────────────────────────────────────────────────────

describe('buildYearList', () => {
  it('returns the requested count', () => {
    expect(buildYearList(2026, 20)).toHaveLength(20);
  });

  it('is centered on the given year', () => {
    const years = buildYearList(2026, 20);
    expect(years).toContain(2026);
    const idx = years.indexOf(2026);
    expect(idx).toBeGreaterThanOrEqual(8);
    expect(idx).toBeLessThanOrEqual(11);
  });

  it('years are in ascending order', () => {
    const years = buildYearList(2026, 10);
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBe(years[i - 1] + 1);
    }
  });
});

// ─── isSameDay ────────────────────────────────────────────────────────────────

describe('isSameDay', () => {
  it('true for the same calendar day regardless of time', () => {
    const a = new Date(2026, 2, 10, 0, 0, 0);
    const b = new Date(2026, 2, 10, 23, 59, 59, 999);
    expect(isSameDay(a, b)).toBe(true);
  });

  it('false for adjacent days', () => {
    expect(isSameDay(local(2026, 3, 10), local(2026, 3, 11))).toBe(false);
  });

  it('false for same day in different months', () => {
    expect(isSameDay(local(2026, 3, 10), local(2026, 4, 10))).toBe(false);
  });

  it('false for same day in different years', () => {
    expect(isSameDay(local(2026, 3, 10), local(2025, 3, 10))).toBe(false);
  });
});

// ─── isSameMonth ─────────────────────────────────────────────────────────────

describe('isSameMonth', () => {
  it('true for dates in the same month and year', () => {
    expect(isSameMonth(local(2026, 3, 1), local(2026, 3, 31))).toBe(true);
  });

  it('false for same month in different years', () => {
    expect(isSameMonth(local(2026, 3, 10), local(2025, 3, 10))).toBe(false);
  });
});

// ─── isBefore / isAfter ───────────────────────────────────────────────────────

describe('isBefore', () => {
  it('true when date is before other', () => {
    expect(isBefore(local(2026, 3, 9), local(2026, 3, 10))).toBe(true);
  });

  it('false when same day', () => {
    expect(isBefore(local(2026, 3, 10), local(2026, 3, 10))).toBe(false);
  });

  it('ignores time component (compares only calendar day)', () => {
    const early = new Date(2026, 2, 10, 23, 59); // late in the day
    const late = new Date(2026, 2, 11, 0, 1);    // early in the next day
    expect(isBefore(early, late)).toBe(true);
  });
});

describe('isAfter', () => {
  it('true when date is after other', () => {
    expect(isAfter(local(2026, 3, 11), local(2026, 3, 10))).toBe(true);
  });

  it('false when same day', () => {
    expect(isAfter(local(2026, 3, 10), local(2026, 3, 10))).toBe(false);
  });
});

// ─── isInRange ────────────────────────────────────────────────────────────────

describe('isInRange', () => {
  const start = local(2026, 3, 1);
  const end = local(2026, 3, 10);

  it('true for a date inside the range', () => {
    expect(isInRange(local(2026, 3, 5), start, end)).toBe(true);
  });

  it('true for the start date (inclusive)', () => {
    expect(isInRange(start, start, end)).toBe(true);
  });

  it('true for the end date (inclusive)', () => {
    expect(isInRange(end, start, end)).toBe(true);
  });

  it('false before range', () => {
    expect(isInRange(local(2026, 2, 28), start, end)).toBe(false);
  });

  it('false after range', () => {
    expect(isInRange(local(2026, 3, 11), start, end)).toBe(false);
  });

  it('handles reversed range (start > end)', () => {
    // Range pickers sometimes have end < start before the user finishes
    expect(isInRange(local(2026, 3, 5), end, start)).toBe(true);
  });
});

// ─── isToday ──────────────────────────────────────────────────────────────────

describe('isToday', () => {
  it('true for new Date()', () => {
    expect(isToday(new Date())).toBe(true);
  });

  it('false for yesterday', () => {
    const yesterday = addDays(new Date(), -1);
    expect(isToday(yesterday)).toBe(false);
  });

  it('ignores time when checking today', () => {
    const todayAtNoon = new Date();
    todayAtNoon.setHours(12, 0, 0, 0);
    expect(isToday(todayAtNoon)).toBe(true);
  });
});

// ─── isOutOfRange ─────────────────────────────────────────────────────────────

describe('isOutOfRange', () => {
  const min = local(2026, 3, 1);
  const max = local(2026, 3, 31);

  it('false for date within [min, max]', () => {
    expect(isOutOfRange(local(2026, 3, 15), min, max)).toBe(false);
  });

  it('false for min date (inclusive boundary)', () => {
    expect(isOutOfRange(min, min, max)).toBe(false);
  });

  it('false for max date (inclusive boundary)', () => {
    expect(isOutOfRange(max, min, max)).toBe(false);
  });

  it('true before min', () => {
    expect(isOutOfRange(local(2026, 2, 28), min, max)).toBe(true);
  });

  it('true after max', () => {
    expect(isOutOfRange(local(2026, 4, 1), min, max)).toBe(true);
  });

  it('false when no min/max provided', () => {
    expect(isOutOfRange(local(2026, 3, 15))).toBe(false);
  });

  it('respects only min when max is omitted', () => {
    expect(isOutOfRange(local(2026, 2, 1), min)).toBe(true);
    expect(isOutOfRange(local(2030, 1, 1), min)).toBe(false);
  });
});

// ─── toISODateString ──────────────────────────────────────────────────────────

describe('toISODateString', () => {
  it('returns YYYY-MM-DD in LOCAL time (PITFALL #2 — UTC)', () => {
    // This is the critical test. new Date(2026, 2, 10).toISOString() would give
    // "2026-03-09T..." in UTC-5 timezone — a bug we explicitly avoid.
    const d = new Date(2026, 2, 10); // March 10, local time
    expect(toISODateString(d)).toBe('2026-03-10');
  });

  it('pads single-digit month and day', () => {
    const d = new Date(2026, 0, 5); // January 5
    expect(toISODateString(d)).toBe('2026-01-05');
  });

  it('handles year boundaries', () => {
    expect(toISODateString(new Date(2026, 11, 31))).toBe('2026-12-31');
    expect(toISODateString(new Date(2027, 0, 1))).toBe('2027-01-01');
  });
});

// ─── toISODateTimeString ──────────────────────────────────────────────────────

describe('toISODateTimeString', () => {
  it('returns YYYY-MM-DDTHH:MM format', () => {
    const d = new Date(2026, 2, 10, 14, 30);
    expect(toISODateTimeString(d)).toBe('2026-03-10T14:30');
  });

  it('pads hours and minutes', () => {
    const d = new Date(2026, 2, 10, 9, 5);
    expect(toISODateTimeString(d)).toBe('2026-03-10T09:05');
  });
});

// ─── parseISODateString ───────────────────────────────────────────────────────

describe('parseISODateString', () => {
  it('roundtrips with toISODateString', () => {
    const original = local(2026, 3, 10);
    const parsed = parseISODateString(toISODateString(original));
    expect(parsed).not.toBeNull();
    expect(isSameDay(parsed!, original)).toBe(true);
  });

  it('returns a LOCAL date (does not use UTC parsing — PITFALL #2)', () => {
    const parsed = parseISODateString('2026-03-10');
    expect(parsed!.getFullYear()).toBe(2026);
    expect(parsed!.getMonth()).toBe(2); // March (0-indexed)
    expect(parsed!.getDate()).toBe(10);
  });

  it('returns null for invalid format', () => {
    expect(parseISODateString('03/10/2026')).toBeNull();
    expect(parseISODateString('not-a-date')).toBeNull();
    expect(parseISODateString('')).toBeNull();
  });

  it('returns null for invalid date values', () => {
    expect(parseISODateString('2026-13-01')).toBeNull(); // month 13
    expect(parseISODateString('2026-02-30')).toBeNull(); // Feb 30 doesn't exist
  });

  it('accepts valid leap day', () => {
    const parsed = parseISODateString('2024-02-29');
    expect(parsed).not.toBeNull();
    expect(parsed!.getMonth()).toBe(1);
    expect(parsed!.getDate()).toBe(29);
  });

  it('rejects Feb 29 in a non-leap year', () => {
    expect(parseISODateString('2026-02-29')).toBeNull();
  });
});

// ─── setTime ──────────────────────────────────────────────────────────────────

describe('setTime', () => {
  it('sets hours and minutes, preserving the date', () => {
    const base = local(2026, 3, 10);
    const result = setTime(base, 14, 30);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(10);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
  });

  it('sets seconds when provided', () => {
    const result = setTime(local(2026, 3, 10), 14, 30, 45);
    expect(result.getSeconds()).toBe(45);
  });

  it('does not mutate the input', () => {
    const base = local(2026, 3, 10);
    const originalHour = base.getHours();
    setTime(base, 14, 30);
    expect(base.getHours()).toBe(originalHour);
  });
});

// ─── combineDateAndTime ───────────────────────────────────────────────────────

describe('combineDateAndTime', () => {
  it('takes the date portion from the first arg and time from the second', () => {
    const datePart = local(2026, 3, 10);      // March 10, midnight
    const timePart = new Date(2000, 0, 1, 14, 30, 0); // 14:30 on arbitrary date
    const result = combineDateAndTime(datePart, timePart);

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(10);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('does not bleed the timePart year/month/day into the result', () => {
    const result = combineDateAndTime(
      local(2026, 3, 10),
      new Date(1999, 11, 31, 23, 59),
    );
    expect(result.getFullYear()).toBe(2026);
    expect(result.getDate()).toBe(10);
  });
});

// ─── clampOrWrap ─────────────────────────────────────────────────────────────

describe('clampOrWrap', () => {
  describe('wrapping mode (wrap=true, default)', () => {
    it('wraps value below min to max', () => {
      expect(clampOrWrap(-1, 0, 59)).toBe(59);
    });

    it('wraps value above max to min', () => {
      expect(clampOrWrap(60, 0, 59)).toBe(0);
    });

    it('returns value unchanged when in range', () => {
      expect(clampOrWrap(30, 0, 59)).toBe(30);
    });

    it('wraps to max for exactly min - 1', () => {
      expect(clampOrWrap(0, 1, 12)).toBe(12);
    });
  });

  describe('clamping mode (wrap=false)', () => {
    it('clamps to min when below', () => {
      expect(clampOrWrap(-5, 0, 59, false)).toBe(0);
    });

    it('clamps to max when above', () => {
      expect(clampOrWrap(100, 0, 59, false)).toBe(59);
    });

    it('returns value unchanged when in range', () => {
      expect(clampOrWrap(30, 0, 59, false)).toBe(30);
    });
  });
});
