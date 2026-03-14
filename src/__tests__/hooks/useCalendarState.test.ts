/**
 * src/__tests__/hooks/useCalendarState.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Tests for the calendar state machine hook.
 *
 * We use @testing-library/react's `renderHook` to test hooks in isolation
 * without rendering any visual components. This tests the state transitions
 * directly and runs much faster than component-level tests.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalendarState, useControllableState } from '../../hooks/useCalendarState';

// ─── useControllableState ─────────────────────────────────────────────────────

describe('useControllableState', () => {
  it('uses defaultValue as initial state in uncontrolled mode', () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 'hello' }),
    );
    expect(result.current[0]).toBe('hello');
  });

  it('updates internal state in uncontrolled mode', () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 'hello' }),
    );
    act(() => result.current[1]('world'));
    expect(result.current[0]).toBe('world');
  });

  it('uses external value in controlled mode', () => {
    const { result } = renderHook(() =>
      useControllableState({ value: 'controlled' }),
    );
    expect(result.current[0]).toBe('controlled');
  });

  it('calls onChange in controlled mode without updating internal state', () => {
    let called = false;
    const { result } = renderHook(() =>
      useControllableState({
        value: 'controlled',
        onChange: () => { called = true; },
      }),
    );
    act(() => result.current[1]('new'));
    expect(called).toBe(true);
    // Value stays as the controlled prop, not 'new'
    expect(result.current[0]).toBe('controlled');
  });
});

// ─── useCalendarState ─────────────────────────────────────────────────────────

describe('useCalendarState', () => {

  it('initializes viewDate to today when no seed date provided', () => {
    const { result } = renderHook(() => useCalendarState());
    const today = new Date();
    expect(result.current.viewDate.getMonth()).toBe(today.getMonth());
    expect(result.current.viewDate.getFullYear()).toBe(today.getFullYear());
  });

  it('initializes viewDate to selectedDate when provided', () => {
    const seed = new Date(2026, 2, 10); // March 2026
    const { result } = renderHook(() =>
      useCalendarState({ selectedDate: seed }),
    );
    expect(result.current.viewDate.getMonth()).toBe(2);
    expect(result.current.viewDate.getFullYear()).toBe(2026);
  });

  it('navigatePrevious moves back one month', () => {
    const { result } = renderHook(() =>
      useCalendarState({ defaultViewDate: new Date(2026, 2, 1) }),
    );
    act(() => result.current.navigatePrevious());
    expect(result.current.viewDate.getMonth()).toBe(1); // February
    expect(result.current.viewDate.getFullYear()).toBe(2026);
  });

  it('navigatePrevious crosses year boundary', () => {
    const { result } = renderHook(() =>
      useCalendarState({ defaultViewDate: new Date(2026, 0, 1) }),
    );
    act(() => result.current.navigatePrevious());
    expect(result.current.viewDate.getMonth()).toBe(11); // December
    expect(result.current.viewDate.getFullYear()).toBe(2025);
  });

  it('navigateNext moves forward one month', () => {
    const { result } = renderHook(() =>
      useCalendarState({ defaultViewDate: new Date(2026, 2, 1) }),
    );
    act(() => result.current.navigateNext());
    expect(result.current.viewDate.getMonth()).toBe(3); // April
  });

  it('navigateNext crosses year boundary', () => {
    const { result } = renderHook(() =>
      useCalendarState({ defaultViewDate: new Date(2026, 11, 1) }),
    );
    act(() => result.current.navigateNext());
    expect(result.current.viewDate.getFullYear()).toBe(2027);
    expect(result.current.viewDate.getMonth()).toBe(0);
  });

  it('navigateToDate changes view and sets view to "days"', () => {
    const { result } = renderHook(() =>
      useCalendarState({ defaultViewDate: new Date(2026, 2, 1) }),
    );
    act(() => result.current.setView('months'));
    act(() => result.current.navigateToDate(new Date(2025, 5, 15)));
    expect(result.current.viewDate.getMonth()).toBe(5); // June
    expect(result.current.viewDate.getFullYear()).toBe(2025);
    expect(result.current.view).toBe('days');
  });

  it('weeks grid contains 6 rows of 7 cells', () => {
    const { result } = renderHook(() =>
      useCalendarState({ defaultViewDate: new Date(2026, 2, 1) }),
    );
    expect(result.current.weeks).toHaveLength(6);
    result.current.weeks.forEach(week => expect(week).toHaveLength(7));
  });

  it('weekdayLabels are re-ordered by firstDayOfWeek', () => {
    const { result: sun } = renderHook(() =>
      useCalendarState({ weekStartsOn: 0, locale: 'en-US' }),
    );
    const { result: mon } = renderHook(() =>
      useCalendarState({ weekStartsOn: 1, locale: 'en-US' }),
    );
    // Sunday-start: first label is Sunday
    expect(sun.current.weekdayLabels[0].long.toLowerCase()).toBe('sunday');
    // Monday-start: first label is Monday
    expect(mon.current.weekdayLabels[0].long.toLowerCase()).toBe('monday');
  });

  it('isSelected returns true for the provided selectedDate', () => {
    const date = new Date(2026, 2, 10);
    const { result } = renderHook(() =>
      useCalendarState({ selectedDate: date }),
    );
    expect(result.current.isSelected(date)).toBe(true);
    expect(result.current.isSelected(new Date(2026, 2, 11))).toBe(false);
  });

  it('isDisabled returns true for dates before min', () => {
    const min = new Date(2026, 2, 10);
    const { result } = renderHook(() =>
      useCalendarState({ min }),
    );
    expect(result.current.isDisabled(new Date(2026, 2, 9))).toBe(true);
    expect(result.current.isDisabled(new Date(2026, 2, 10))).toBe(false);
  });

  it('isDisabled returns true for dates after max', () => {
    const max = new Date(2026, 2, 10);
    const { result } = renderHook(() =>
      useCalendarState({ max }),
    );
    expect(result.current.isDisabled(new Date(2026, 2, 11))).toBe(true);
    expect(result.current.isDisabled(new Date(2026, 2, 10))).toBe(false);
  });

  it('isDisabled respects the isDateDisabled callback', () => {
    const { result } = renderHook(() =>
      useCalendarState({ isDateDisabled: (d) => d.getDay() === 0 }),
    );
    const sunday = new Date(2026, 2, 8); // March 8, 2026 is a Sunday
    const monday = new Date(2026, 2, 9);
    expect(result.current.isDisabled(sunday)).toBe(true);
    expect(result.current.isDisabled(monday)).toBe(false);
  });

  it('isOutsideMonth is true for dates not in the current view month', () => {
    const { result } = renderHook(() =>
      useCalendarState({ defaultViewDate: new Date(2026, 2, 1) }),
    );
    expect(result.current.isOutsideMonth(new Date(2026, 1, 28))).toBe(true); // Feb
    expect(result.current.isOutsideMonth(new Date(2026, 2, 15))).toBe(false); // March
  });

  it('setFocusedDate updates focused date', () => {
    const { result } = renderHook(() => useCalendarState());
    const target = new Date(2026, 2, 15);
    act(() => result.current.setFocusedDate(target));
    expect(result.current.isFocused(target)).toBe(true);
  });

  it('view transitions: days → months → years', () => {
    const { result } = renderHook(() => useCalendarState());
    expect(result.current.view).toBe('days');
    act(() => result.current.setView('months'));
    expect(result.current.view).toBe('months');
    act(() => result.current.setView('years'));
    expect(result.current.view).toBe('years');
  });

  it('navigatePrevious in months view moves back one year', () => {
    const { result } = renderHook(() =>
      useCalendarState({ defaultViewDate: new Date(2026, 2, 1) }),
    );
    act(() => result.current.setView('months'));
    act(() => result.current.navigatePrevious());
    expect(result.current.viewDate.getFullYear()).toBe(2025);
  });

  it('navigatePrevious in years view moves back 20 years', () => {
    const { result } = renderHook(() =>
      useCalendarState({ defaultViewDate: new Date(2026, 2, 1) }),
    );
    act(() => result.current.setView('years'));
    act(() => result.current.navigatePrevious());
    expect(result.current.viewDate.getFullYear()).toBe(2006);
  });
});
