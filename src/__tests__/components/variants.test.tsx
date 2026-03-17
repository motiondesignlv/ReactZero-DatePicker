/**
 * src/__tests__/components/variants.test.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Tests for the two-flavor variant system (inline vs popover mode).
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '../../test-utils';
import { DatePicker } from '../../components/DatePicker';
import { DateTimePicker } from '../../components/DateTimePicker';
import {
  DatePickerInline,
  DatePickerPopover,
  DateTimePickerInline,
  DateTimePickerPopover,
  TimePickerInline,
  TimePickerPopover,
} from '../../components/variants';

// ─── DatePicker inline prop ─────────────────────────────────────────────────

describe('DatePicker — inline prop', () => {
  it('inline renders calendar directly (no trigger input)', () => {
    const { container } = render(
      <DatePicker inline defaultValue={new Date(2026, 2, 15)} aria-label="Test" />,
    );
    expect(container.querySelector('.dp-inline')).toBeTruthy();
    expect(container.querySelector('input[type="text"]')).toBeFalsy();
    expect(container.querySelector('[role="grid"]')).toBeTruthy();
  });

  it('default (popover) renders trigger input (calendar hidden until click)', () => {
    const { container } = render(
      <DatePicker aria-label="Test" />,
    );
    expect(container.querySelector('.dp-inline')).toBeFalsy();
    expect(container.querySelector('input[type="text"]')).toBeTruthy();
    expect(container.querySelector('[role="grid"]')).toBeFalsy();
  });
});

// ─── DateTimePicker inline prop ─────────────────────────────────────────────

describe('DateTimePicker — inline prop', () => {
  it('inline renders inline calendar + time controls', () => {
    const { container } = render(
      <DateTimePicker
        inline
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

// ─── Convenience exports ────────────────────────────────────────────────────

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
