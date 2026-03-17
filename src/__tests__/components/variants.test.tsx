/**
 * src/__tests__/components/variants.test.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Tests for the two-flavor variant system (inline vs popover mode).
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils';
import { DatePicker } from '../../components/DatePicker';
import { DateRangePicker } from '../../components/DateRangePicker';
import { DateTimePicker } from '../../components/DateTimePicker';
import {
  DatePickerInline,
  DatePickerPopover,
  DateRangePickerInline,
  DateRangePickerPopover,
  DateTimePickerInline,
  DateTimePickerPopover,
  TimePickerInline,
  TimePickerPopover,
} from '../../components/variants';

// ─── DatePicker mode prop ────────────────────────────────────────────────────

describe('DatePicker — mode prop', () => {
  it('mode="inline" renders calendar directly (no trigger input)', () => {
    const { container } = render(
      <DatePicker mode="inline" defaultValue={new Date(2026, 2, 15)} aria-label="Test" />,
    );
    expect(container.querySelector('.dp-inline')).toBeTruthy();
    expect(container.querySelector('input[type="text"]')).toBeFalsy();
    expect(container.querySelector('[role="grid"]')).toBeTruthy();
  });

  it('mode="popover" renders trigger input (calendar hidden until click)', () => {
    const { container } = render(
      <DatePicker mode="popover" aria-label="Test" />,
    );
    expect(container.querySelector('.dp-inline')).toBeFalsy();
    expect(container.querySelector('input[type="text"]')).toBeTruthy();
    expect(container.querySelector('[role="grid"]')).toBeFalsy();
  });

  it('mode takes precedence over deprecated inline prop', () => {
    const { container } = render(
      <DatePicker mode="popover" inline aria-label="Test" />,
    );
    // mode="popover" should win over inline=true
    expect(container.querySelector('.dp-inline')).toBeFalsy();
    expect(container.querySelector('input[type="text"]')).toBeTruthy();
  });

  it('deprecated inline prop still works when mode is not set', () => {
    const { container } = render(
      <DatePicker inline defaultValue={new Date(2026, 2, 15)} aria-label="Test" />,
    );
    expect(container.querySelector('.dp-inline')).toBeTruthy();
    expect(container.querySelector('[role="grid"]')).toBeTruthy();
  });
});

// ─── DateRangePicker mode prop ───────────────────────────────────────────────

describe('DateRangePicker — mode prop', () => {
  it('mode="inline" renders calendar and summary bar (no input group)', () => {
    const { container } = render(
      <DateRangePicker
        mode="inline"
        defaultValue={{ start: new Date(2026, 2, 5), end: new Date(2026, 2, 15) }}
        aria-label="Test"
      />,
    );
    expect(container.querySelector('.dp-inline')).toBeTruthy();
    expect(container.querySelector('.dp-range-summary')).toBeTruthy();
    expect(container.querySelector('.dp-range-input-group')).toBeFalsy();
    expect(container.querySelector('[role="grid"]')).toBeTruthy();
  });

  it('mode="inline" summary bar shows selected dates', () => {
    render(
      <DateRangePicker
        mode="inline"
        defaultValue={{ start: new Date(2026, 2, 5), end: new Date(2026, 2, 15) }}
        aria-label="Test"
      />,
    );
    const summary = screen.getByRole('status');
    expect(summary.textContent).toContain('5');
    expect(summary.textContent).toContain('15');
  });

  it('mode="inline" summary bar shows placeholders when no range selected', () => {
    render(
      <DateRangePicker mode="inline" aria-label="Test" />,
    );
    const summary = screen.getByRole('status');
    expect(summary.textContent).toContain('Start date');
    expect(summary.textContent).toContain('End date');
  });

  it('mode="popover" renders input group (default behavior)', () => {
    const { container } = render(
      <DateRangePicker mode="popover" aria-label="Test" />,
    );
    expect(container.querySelector('.dp-range-input-group')).toBeTruthy();
    expect(container.querySelector('.dp-range-summary')).toBeFalsy();
  });
});

// ─── DateTimePicker mode prop ────────────────────────────────────────────────

describe('DateTimePicker — mode prop', () => {
  it('mode="inline" renders inline calendar + time controls', () => {
    const { container } = render(
      <DateTimePicker
        mode="inline"
        defaultValue={new Date(2026, 2, 15, 14, 30)}
        hourCycle="h12"
        aria-label="Test"
      />,
    );
    expect(container.querySelector('.dp-inline')).toBeTruthy();
    expect(container.querySelector('[role="grid"]')).toBeTruthy();
    expect(container.querySelector('.dp-time-picker')).toBeTruthy();
  });
});

// ─── Convenience exports ─────────────────────────────────────────────────────

describe('Convenience variant exports', () => {
  it('DatePickerInline renders inline mode', () => {
    const { container } = render(
      <DatePickerInline defaultValue={new Date(2026, 2, 15)} aria-label="Test" />,
    );
    expect(container.querySelector('.dp-inline')).toBeTruthy();
  });

  it('DatePickerPopover renders popover mode', () => {
    const { container } = render(
      <DatePickerPopover aria-label="Test" />,
    );
    expect(container.querySelector('input[type="text"]')).toBeTruthy();
    expect(container.querySelector('.dp-inline')).toBeFalsy();
  });

  it('DateRangePickerInline renders inline mode', () => {
    const { container } = render(
      <DateRangePickerInline aria-label="Test" />,
    );
    expect(container.querySelector('.dp-inline')).toBeTruthy();
    expect(container.querySelector('.dp-range-summary')).toBeTruthy();
  });

  it('DateRangePickerPopover renders popover mode', () => {
    const { container } = render(
      <DateRangePickerPopover aria-label="Test" />,
    );
    expect(container.querySelector('.dp-range-input-group')).toBeTruthy();
  });

  it('DateTimePickerInline renders inline mode', () => {
    const { container } = render(
      <DateTimePickerInline defaultValue={new Date(2026, 2, 15, 14, 30)} hourCycle="h12" aria-label="Test" />,
    );
    expect(container.querySelector('.dp-inline')).toBeTruthy();
  });

  it('DateTimePickerPopover renders popover mode', () => {
    const { container } = render(
      <DateTimePickerPopover hourCycle="h12" aria-label="Test" />,
    );
    expect(container.querySelector('input[type="text"]')).toBeTruthy();
  });

  it('TimePickerInline renders inline mode', () => {
    const { container } = render(
      <TimePickerInline hourCycle="h12" aria-label="Test" />,
    );
    expect(container.querySelector('.dp-time-picker')).toBeTruthy();
  });

  it('TimePickerPopover renders popover mode', () => {
    const { container } = render(
      <TimePickerPopover hourCycle="h12" aria-label="Test" />,
    );
    expect(container.querySelector('.dp-time-popover-container')).toBeTruthy();
  });
});
