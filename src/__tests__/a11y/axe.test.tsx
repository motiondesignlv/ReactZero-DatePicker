/**
 * src/__tests__/a11y/axe.test.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated accessibility audit using axe-core via jest-axe.
 *
 * axe-core catches ~30–40% of WCAG 2.1 failures automatically, including:
 * - Missing ARIA labels and relationships
 * - Invalid ARIA attribute values
 * - Color contrast violations (in supported environments)
 * - Focus management issues
 * - Interactive elements missing accessible names
 * - Invalid role/attribute combinations
 *
 * HOW TO READ AXE VIOLATIONS:
 * Each violation has:
 *   - id: the axe rule that failed (e.g., "aria-required-attr")
 *   - description: what the rule checks
 *   - nodes: the DOM elements that failed
 *
 * Use `expect(results).toHaveNoViolations()` as the assertion.
 * If you need to suppress a false positive, use axe options:
 *   axe(container, { rules: { 'color-contrast': { enabled: false } } })
 *
 * We test every component in all its significant states:
 * - Default (closed)
 * - Open/interactive
 * - With a selected value
 * - Disabled
 * - With a range selected
 *
 * We also test multiple locales and the inline variant.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, act, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '../../components/DatePicker';
import { TimePicker } from '../../components/TimePicker';
import { DateTimePicker } from '../../components/DateTimePicker';
import { DateRangePicker } from '../../components/DateRangePicker';

// Extend expect with jest-axe matcher
expect.extend(toHaveNoViolations);

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Run axe on a rendered component.
 * We pass `axe` the container element to scope it to just the component,
 * avoiding false positives from the testing framework's own DOM.
 */
async function auditComponent(ui: React.ReactElement) {
  const { container } = render(ui);
  const results = await axe(container);
  return results;
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

describe('DatePicker — Accessibility audit', () => {
  it('passes axe with no value (closed, default state)', async () => {
    const results = await auditComponent(
      <DatePicker aria-label="Appointment date" />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe with a selected date', async () => {
    const results = await auditComponent(
      <DatePicker
        value={new Date(2026, 2, 10)}
        aria-label="Appointment date"
      />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe when the calendar dialog is open', async () => {
    const { container } = render(
      <DatePicker
        defaultValue={new Date(2026, 2, 10)}
        aria-label="Appointment date"
      />,
    );
    // Open the calendar
    const user = userEvent.setup();
    await user.click(container.querySelector('input[type="text"]')!);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe in disabled state', async () => {
    const results = await auditComponent(
      <DatePicker aria-label="Appointment date" disabled />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe in inline mode (calendar always visible)', async () => {
    const results = await auditComponent(
      <DatePicker
        inline
        defaultValue={new Date(2026, 2, 10)}
        aria-label="Select a date"
      />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe with min/max constraints (some cells disabled)', async () => {
    const { container } = render(
      <DatePicker
        defaultValue={new Date(2026, 2, 15)}
        min={new Date(2026, 2, 10)}
        max={new Date(2026, 2, 20)}
        aria-label="Available dates"
      />,
    );
    const user = userEvent.setup();
    await user.click(container.querySelector('input[type="text"]')!);
    await waitFor(() => {
      expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe with isDateDisabled callback active', async () => {
    const { container } = render(
      <DatePicker
        defaultValue={new Date(2026, 2, 10)}
        isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
        aria-label="Weekday appointment"
      />,
    );
    const user = userEvent.setup();
    await user.click(container.querySelector('input[type="text"]')!);
    await waitFor(() => {
      expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe with French locale (different month/weekday names)', async () => {
    const { container } = render(
      <DatePicker
        locale="fr-FR"
        defaultValue={new Date(2026, 2, 10)}
        aria-label="Choisir une date"
      />,
    );
    const user = userEvent.setup();
    await user.click(container.querySelector('input[type="text"]')!);
    await waitFor(() => {
      expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe with Arabic locale (RTL)', async () => {
    const { container } = render(
      <DatePicker
        locale="ar-SA"
        defaultValue={new Date(2026, 2, 10)}
        aria-label="اختر تاريخاً"
      />,
    );
    const user = userEvent.setup();
    await user.click(container.querySelector('input[type="text"]')!);
    await waitFor(() => {
      expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── TimePicker ───────────────────────────────────────────────────────────────

describe('TimePicker — Accessibility audit', () => {
  it('passes axe with h12 mode (AM/PM)', async () => {
    const results = await auditComponent(
      <TimePicker
        hourCycle="h12"
        granularity="minute"
        aria-label="Meeting time"
      />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe with h23 mode', async () => {
    const results = await auditComponent(
      <TimePicker
        hourCycle="h23"
        granularity="minute"
        aria-label="Meeting time"
      />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe with a value set', async () => {
    const results = await auditComponent(
      <TimePicker
        hourCycle="h12"
        granularity="minute"
        value={new Date(2026, 0, 1, 14, 30)}
        aria-label="Meeting time"
      />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe with granularity="second"', async () => {
    const results = await auditComponent(
      <TimePicker
        hourCycle="h23"
        granularity="second"
        value={new Date(2026, 0, 1, 10, 30, 45)}
        aria-label="Precise time"
      />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe in disabled state', async () => {
    const results = await auditComponent(
      <TimePicker
        hourCycle="h23"
        disabled
        aria-label="Meeting time"
      />,
    );
    expect(results).toHaveNoViolations();
  });
});

// ─── DateTimePicker ───────────────────────────────────────────────────────────

describe('DateTimePicker — Accessibility audit', () => {
  it('passes axe in closed state', async () => {
    const results = await auditComponent(
      <DateTimePicker aria-label="Schedule date and time" />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe with a value set', async () => {
    const results = await auditComponent(
      <DateTimePicker
        value={new Date(2026, 2, 10, 14, 30)}
        aria-label="Schedule date and time"
      />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe when the picker is open', async () => {
    const { container } = render(
      <DateTimePicker
        defaultValue={new Date(2026, 2, 10, 14, 30)}
        aria-label="Schedule date and time"
      />,
    );
    const user = userEvent.setup();
    await user.click(container.querySelector('input[type="text"]')!);
    await waitFor(() => {
      expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── DateRangePicker ─────────────────────────────────────────────────────────

describe('DateRangePicker — Accessibility audit', () => {
  it('passes axe with no range selected (closed)', async () => {
    const results = await auditComponent(
      <DateRangePicker aria-label="Date range" />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe with a complete range', async () => {
    const results = await auditComponent(
      <DateRangePicker
        value={{
          start: new Date(2026, 2, 5),
          end: new Date(2026, 2, 15),
        }}
        aria-label="Travel dates"
      />,
    );
    expect(results).toHaveNoViolations();
  });

  it('passes axe when the range picker dialog is open', async () => {
    const { container } = render(
      <DateRangePicker
        defaultValue={{
          start: new Date(2026, 2, 5),
          end: new Date(2026, 2, 15),
        }}
        aria-label="Travel dates"
      />,
    );
    const user = userEvent.setup();
    const startInput = container.querySelector('[aria-label="Start date"]')!;
    await user.click(startInput);
    await waitFor(() => {
      expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe in Phase 1 (start selected, no end yet)', async () => {
    const { container } = render(
      <DateRangePicker
        defaultValue={{ start: new Date(2026, 2, 5), end: null }}
        aria-label="Trip dates"
      />,
    );
    const user = userEvent.setup();
    await user.click(container.querySelector('[aria-label="Start date"]')!);
    await waitFor(() => {
      expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe with presets rendered', async () => {
    const presets = [
      {
        label: 'Last 7 days',
        getValue: () => {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - 7);
          return { start, end };
        },
      },
      {
        label: 'This month',
        getValue: () => {
          const now = new Date();
          return {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          };
        },
      },
    ];

    const { container } = render(
      <DateRangePicker
        presets={presets}
        aria-label="Report date range"
      />,
    );
    const user = userEvent.setup();
    await user.click(container.querySelector('[aria-label="Start date"]')!);
    await waitFor(() => {
      expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
