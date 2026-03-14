/**
 * src/__tests__/components/DateRangePicker.test.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Tests for the range selection state machine.
 *
 * Range selection has two phases:
 *   Phase 1: Start date set, end not yet selected
 *   Phase 2: Both start and end selected
 *
 * The hover preview shows a "prospective range" during Phase 1.
 * Clicking a date earlier than the start swaps start and end automatically.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import { render, setupUser, getGridCells, findCellByLabel, d, toISO } from '../../test-utils';
import { DateRangePicker } from '../../components/DateRangePicker';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function renderOpen(props: React.ComponentProps<typeof DateRangePicker> = {}) {
  const user = setupUser();
  const onChange = vi.fn();
  render(<DateRangePicker onChange={onChange} {...props} />);
  const startInput = screen.getByRole('textbox', { name: /start date/i });
  await user.click(startInput);
  const dialog = await screen.findByRole('dialog');
  return { user, onChange, dialog };
}

// ─── ARIA ─────────────────────────────────────────────────────────────────────

describe('DateRangePicker — ARIA', () => {
  it('has a role="group" around the two inputs', async () => {
    render(<DateRangePicker />);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('start input has aria-label="Start date"', () => {
    render(<DateRangePicker />);
    expect(screen.getByRole('textbox', { name: /start date/i })).toBeInTheDocument();
  });

  it('end input has aria-label="End date"', () => {
    render(<DateRangePicker />);
    expect(screen.getByRole('textbox', { name: /end date/i })).toBeInTheDocument();
  });

  it('dialog has aria-multiselectable="true"', async () => {
    const { dialog } = await renderOpen({ defaultValue: { start: d(2026, 3, 1), end: d(2026, 3, 10) } });
    const grid = within(dialog).getByRole('grid');
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('range-start cell aria-label includes "start of range"', async () => {
    await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: d(2026, 3, 15) },
    });
    const startCell = findCellByLabel('March 5');
    expect(startCell?.getAttribute('aria-label')).toContain('start of range');
  });

  it('range-end cell aria-label includes "end of range"', async () => {
    await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: d(2026, 3, 15) },
    });
    const endCell = findCellByLabel('March 15');
    expect(endCell?.getAttribute('aria-label')).toContain('end of range');
  });

  it('range-mid cells have aria-label including "in range"', async () => {
    await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: d(2026, 3, 15) },
    });
    const midCell = findCellByLabel('March 10');
    expect(midCell?.getAttribute('aria-label')).toContain('in range');
  });

  it('start and end cells have aria-selected="true"', async () => {
    await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: d(2026, 3, 15) },
    });
    const cells = getGridCells();
    const selected = cells.filter(c => c.getAttribute('aria-selected') === 'true');
    expect(selected.length).toBe(2);
  });

  it('mid-range cells do NOT have aria-selected (absence = unselected)', async () => {
    await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: d(2026, 3, 15) },
    });
    const midCell = findCellByLabel('March 10');
    expect(midCell?.getAttribute('aria-selected')).not.toBe('true');
  });
});

// ─── Selection state machine ──────────────────────────────────────────────────

describe('DateRangePicker — Selection phases', () => {
  it('Phase 1: clicking a date sets the start, clears the end', async () => {
    const { user, onChange } = await renderOpen({
      defaultValue: { start: null, end: null },
    });
    const cell = findCellByLabel('March 10');
    if (cell) await user.click(cell);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ start: expect.any(Date), end: null }),
    );
    const range = onChange.mock.calls[0][0];
    expect((range.start as Date).getDate()).toBe(10);
    expect(range.end).toBeNull();
  });

  it('Phase 2: clicking a second date sets the end', async () => {
    const { user, onChange } = await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: null },
    });
    const cell = findCellByLabel('March 15');
    if (cell) await user.click(cell);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        start: expect.any(Date),
        end: expect.any(Date),
      }),
    );
    const range = onChange.mock.calls[0][0];
    expect((range.end as Date).getDate()).toBe(15);
  });

  it('clicking a date earlier than start swaps start/end', async () => {
    const { user, onChange } = await renderOpen({
      defaultValue: { start: d(2026, 3, 15), end: null },
    });
    // Click March 5 — which is before the start (March 15)
    const cell = findCellByLabel('March 5');
    if (cell) await user.click(cell);

    const range = onChange.mock.calls[0][0];
    // After swap: start=March 5, end=March 15
    expect((range.start as Date).getDate()).toBe(5);
    expect((range.end as Date).getDate()).toBe(15);
  });

  it('clicking on an existing complete range resets to Phase 1', async () => {
    const { user, onChange } = await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: d(2026, 3, 15) },
    });
    // Clicking any cell when both start and end are set should reset
    const cell = findCellByLabel('March 20');
    if (cell) await user.click(cell);

    const range = onChange.mock.calls[0][0];
    expect((range.start as Date).getDate()).toBe(20);
    expect(range.end).toBeNull();
  });

  it('disabled cells cannot be clicked to start/end range', async () => {
    const isDateDisabled = (d: Date) => d.getDay() === 0; // Disable Sundays
    const { user, onChange } = await renderOpen({ isDateDisabled });
    const cells = getGridCells();
    const sundayCell = cells.find(c => c.getAttribute('aria-disabled') === 'true');
    if (sundayCell) await user.click(sundayCell);
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ─── Hover preview ────────────────────────────────────────────────────────────

describe('DateRangePicker — Hover preview', () => {
  it('hovering over a date during Phase 1 adds data-range-mid to cells', async () => {
    const { user } = await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: null },
    });

    const cell = findCellByLabel('March 15');
    if (cell) await user.hover(cell);

    await waitFor(() => {
      const midCells = getGridCells().filter(
        c => c.getAttribute('data-range-mid') !== null,
      );
      expect(midCells.length).toBeGreaterThan(0);
    });
  });

  it('hover preview clears when mouse leaves', async () => {
    const { user } = await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: null },
    });

    const hoverTarget = findCellByLabel('March 15');
    if (hoverTarget) {
      await user.hover(hoverTarget);
      await user.unhover(hoverTarget);
    }

    await waitFor(() => {
      const midCells = getGridCells().filter(
        c => c.getAttribute('data-range-mid') !== null,
      );
      expect(midCells.length).toBe(0);
    });
  });

  it('hover preview is NOT active in Phase 2 (range complete)', async () => {
    const { user } = await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: d(2026, 3, 15) },
    });

    // Hover over a date outside the current range
    const cell = findCellByLabel('March 25');
    if (cell) await user.hover(cell);

    // data-range-mid should only reflect the confirmed range, not the hover
    const midCells = getGridCells().filter(
      c => c.getAttribute('data-range-mid') !== null,
    );
    // Only confirmed range cells (March 6–14) should have data-range-mid
    midCells.forEach(c => {
      const label = c.getAttribute('aria-label') ?? '';
      const dayMatch = label.match(/March (\d+)/);
      if (dayMatch) {
        const day = parseInt(dayMatch[1]);
        expect(day).toBeGreaterThan(5);
        expect(day).toBeLessThan(15);
      }
    });
  });
});

// ─── Constraints ─────────────────────────────────────────────────────────────

describe('DateRangePicker — Constraints', () => {
  it('minLength disables dates that would create a too-short range', async () => {
    const { user } = await renderOpen({
      defaultValue: { start: d(2026, 3, 10), end: null },
      minLength: 5, // Must select at least 5 days
    });

    // March 11 would create a 2-day range — should be disabled
    const march11 = findCellByLabel('March 11');
    expect(march11?.getAttribute('aria-disabled')).toBe('true');
  });

  it('maxLength disables dates that would create a too-long range', async () => {
    const { user } = await renderOpen({
      defaultValue: { start: d(2026, 3, 1), end: null },
      maxLength: 7,
    });

    // March 9+ would create a range > 7 days — should be disabled
    const march10 = findCellByLabel('March 10');
    expect(march10?.getAttribute('aria-disabled')).toBe('true');
  });
});

// ─── Form integration ─────────────────────────────────────────────────────────

describe('DateRangePicker — Form integration', () => {
  it('renders hidden start input with startName prop', () => {
    render(
      <DateRangePicker
        startName="check_in"
        value={{ start: d(2026, 3, 10), end: d(2026, 3, 20) }}
      />,
    );
    const hidden = document.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="check_in"]',
    );
    expect(hidden?.value).toBe('2026-03-10');
  });

  it('renders hidden end input with endName prop', () => {
    render(
      <DateRangePicker
        endName="check_out"
        value={{ start: d(2026, 3, 10), end: d(2026, 3, 20) }}
      />,
    );
    const hidden = document.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="check_out"]',
    );
    expect(hidden?.value).toBe('2026-03-20');
  });

  it('hidden inputs are empty when no range selected', () => {
    render(
      <DateRangePicker
        startName="start"
        endName="end"
        value={{ start: null, end: null }}
      />,
    );
    const startHidden = document.querySelector<HTMLInputElement>('input[name="start"]');
    const endHidden = document.querySelector<HTMLInputElement>('input[name="end"]');
    expect(startHidden?.value).toBe('');
    expect(endHidden?.value).toBe('');
  });
});

// ─── Presets ──────────────────────────────────────────────────────────────────

describe('DateRangePicker — Presets', () => {
  it('renders preset buttons', async () => {
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
    ];
    const { user, onChange } = await renderOpen({ presets });
    const presetBtn = screen.getByRole('button', { name: 'Last 7 days' });
    expect(presetBtn).toBeInTheDocument();
    await user.click(presetBtn);
    expect(onChange).toHaveBeenCalled();
  });
});

// ─── Clear / Apply footer ─────────────────────────────────────────────────────

describe('DateRangePicker — Footer', () => {
  it('Clear button resets the range', async () => {
    const { user, onChange } = await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: d(2026, 3, 15) },
      showFooter: true,
    });
    const clearBtn = screen.getByRole('button', { name: /clear/i });
    await user.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith({ start: null, end: null });
  });

  it('Apply button closes the dialog', async () => {
    const { user } = await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: d(2026, 3, 15) },
      showFooter: true,
    });
    const applyBtn = screen.getByRole('button', { name: /apply/i });
    await user.click(applyBtn);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('Apply button is disabled when range is incomplete', async () => {
    await renderOpen({
      defaultValue: { start: d(2026, 3, 5), end: null },
      showFooter: true,
    });
    const applyBtn = screen.getByRole('button', { name: /apply/i });
    expect(applyBtn).toBeDisabled();
  });
});
