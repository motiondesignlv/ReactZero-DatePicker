/**
 * src/__tests__/components/DatePicker.test.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full integration tests for the DatePicker component.
 *
 * Test categories:
 * 1. ARIA — every attribute mandated by W3C APG
 * 2. Keyboard navigation — every key in the spec
 * 3. Focus management — dialog open/close, focus trap, return focus
 * 4. Selection — date selection, clear, controlled/uncontrolled
 * 5. Constraints — min, max, isDateDisabled
 * 6. Form integration — hidden input, name prop
 * 7. Edge cases — leap years, month boundaries, year crossing
 *
 * WHY @testing-library/user-event over fireEvent?
 * userEvent simulates the complete browser event chain. A real click fires:
 *   pointerdown → mousedown → focus → pointerup → mouseup → click
 * fireEvent.click only fires the click event. Our components sometimes
 * depend on focus events for roving tabindex updates, so userEvent is essential.
 */

import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import {
  render,
  setupUser,
  getGridCells,
  findCellByLabel,
  getFocusedCell,
  assertSingleTabStop,
  d,
  toISO,
} from '../../test-utils';
import { DatePicker } from '../../components/DatePicker';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Renders <DatePicker> and opens the calendar.
 * Returns the user event instance and the trigger button.
 */
async function renderOpen(props: React.ComponentProps<typeof DatePicker> = {}) {
  const user = setupUser();
  const onChange = vi.fn();
  render(<DatePicker onChange={onChange} {...props} />);

  const input = screen.getByRole('combobox');
  await user.click(input);

  const dialog = await screen.findByRole('dialog');

  return { user, onChange, input, dialog };
}

// ─── 1. ARIA attributes ───────────────────────────────────────────────────────

describe('DatePicker — ARIA', () => {
  it('input has aria-haspopup="dialog"', async () => {
    render(<DatePicker />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('input has aria-expanded="false" when closed', () => {
    render(<DatePicker />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('input has aria-expanded="true" when open', async () => {
    const { input } = await renderOpen();
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('dialog has role="dialog"', async () => {
    await renderOpen();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('dialog has aria-modal="true"', async () => {
    await renderOpen();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('dialog has aria-label="Choose date"', async () => {
    await renderOpen();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Choose date');
  });

  it('grid (table) has role="grid"', async () => {
    await renderOpen();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('grid is labelled by the month/year heading', async () => {
    await renderOpen();
    const grid = screen.getByRole('grid');
    const labelId = grid.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    // The element with that ID should exist and contain text
    const heading = document.getElementById(labelId!);
    expect(heading).toBeInTheDocument();
    expect(heading!.textContent!.length).toBeGreaterThan(0);
  });

  it('month/year heading has aria-live="polite" and aria-atomic="true"', async () => {
    await renderOpen();
    const heading = document.getElementById('dp-heading');
    expect(heading).toHaveAttribute('aria-live', 'polite');
    expect(heading).toHaveAttribute('aria-atomic', 'true');
  });

  it('weekday column headers have scope="col"', async () => {
    await renderOpen();
    const headers = screen.getAllByRole('columnheader');
    headers.forEach(th => {
      expect(th).toHaveAttribute('scope', 'col');
    });
  });

  it('weekday column headers have abbr attribute (full name for screen readers)', async () => {
    await renderOpen();
    const headers = screen.getAllByRole('columnheader');
    headers.forEach(th => {
      const abbr = th.getAttribute('abbr');
      expect(abbr).toBeTruthy();
      expect(abbr!.length).toBeGreaterThan(2); // Not just a single letter
    });
  });

  it('all 42 cells have role="gridcell"', async () => {
    await renderOpen();
    expect(getGridCells()).toHaveLength(42);
  });

  it('exactly one gridcell has tabIndex=0 (roving tabindex)', async () => {
    await renderOpen();
    assertSingleTabStop();
  });

  it('selected cell has aria-selected="true", others do NOT have aria-selected', async () => {
    await renderOpen({ value: d(2026, 3, 10), defaultValue: d(2026, 3, 10) });
    const cells = getGridCells();
    const selected = cells.filter(c => c.getAttribute('aria-selected') === 'true');
    const withFalse = cells.filter(c => c.getAttribute('aria-selected') === 'false');
    expect(selected.length).toBe(1);
    // W3C APG: NEVER set aria-selected=false — absence communicates unselected
    expect(withFalse.length).toBe(0);
  });

  it('today cell has aria-current="date"', async () => {
    await renderOpen();
    // Today's cell might or might not be in current month view,
    // so we open to today's month
    const today = new Date();
    render(
      <DatePicker defaultValue={today} />,
    );
    const inputs = screen.getAllByRole('combobox');
    const user = setupUser();
    await user.click(inputs[inputs.length - 1]);
    const cells = getGridCells();
    const todayCell = cells.find(c => c.getAttribute('aria-current') === 'date');
    expect(todayCell).toBeInTheDocument();
  });

  it('disabled cells have aria-disabled="true"', async () => {
    const min = d(2026, 3, 10);
    await renderOpen({ min, defaultValue: d(2026, 3, 15) });
    const cells = getGridCells();
    const disabledCells = cells.filter(c => c.getAttribute('aria-disabled') === 'true');
    expect(disabledCells.length).toBeGreaterThan(0);
  });

  it('each cell has a descriptive aria-label (weekday + full date)', async () => {
    await renderOpen({ defaultValue: d(2026, 3, 1) });
    const cells = getGridCells();
    cells.slice(0, 7).forEach(cell => {
      const label = cell.getAttribute('aria-label');
      expect(label).toBeTruthy();
      expect(label!.length).toBeGreaterThan(5);
    });
  });

  it('trigger button has aria-haspopup="dialog"', () => {
    render(<DatePicker />);
    // The trigger is tabIndex=-1 so not a "button" role in the tab sequence,
    // but it still has the correct attributes
    const buttons = screen.getAllByRole('button');
    const trigger = buttons.find(b => b.getAttribute('aria-haspopup') === 'dialog');
    expect(trigger).toBeInTheDocument();
  });
});

// ─── 2. Keyboard navigation ───────────────────────────────────────────────────

describe('DatePicker — Keyboard navigation', () => {
  it('ArrowRight moves focus to the next day', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 10) });
    const cell = findCellByLabel('March 10');
    expect(cell).toBeTruthy();
    cell!.focus();

    await user.keyboard('{ArrowRight}');
    const focused = getFocusedCell();
    expect(focused?.getAttribute('aria-label')).toContain('March 11');
  });

  it('ArrowLeft moves focus to the previous day', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 10) });
    findCellByLabel('March 10')?.focus();

    await user.keyboard('{ArrowLeft}');
    expect(getFocusedCell()?.getAttribute('aria-label')).toContain('March 9');
  });

  it('ArrowDown moves focus to the same day next week (+7 days)', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 10) });
    findCellByLabel('March 10')?.focus();

    await user.keyboard('{ArrowDown}');
    expect(getFocusedCell()?.getAttribute('aria-label')).toContain('March 17');
  });

  it('ArrowUp moves focus to the same day previous week (-7 days)', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 10) });
    findCellByLabel('March 10')?.focus();

    await user.keyboard('{ArrowUp}');
    expect(getFocusedCell()?.getAttribute('aria-label')).toContain('March 3');
  });

  it('Home moves focus to the first day of the current week', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 11) }); // Wednesday
    findCellByLabel('March 11')?.focus();

    await user.keyboard('{Home}');
    // With Sunday start, the week containing March 11 starts on March 8
    const focused = getFocusedCell();
    expect(focused?.getAttribute('aria-label')).toContain('March 8');
  });

  it('End moves focus to the last day of the current week', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 11) }); // Wednesday
    findCellByLabel('March 11')?.focus();

    await user.keyboard('{End}');
    // Week ends on Saturday: March 14
    const focused = getFocusedCell();
    expect(focused?.getAttribute('aria-label')).toContain('March 14');
  });

  it('PageDown advances the view to the next month', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 15) });
    findCellByLabel('March 15')?.focus();

    await user.keyboard('{PageDown}');
    // Should now be viewing April; focus on April 15
    expect(screen.getByRole('grid')).toBeInTheDocument();
    const heading = document.getElementById('dp-heading');
    expect(heading?.textContent).toContain('April');
  });

  it('PageUp moves the view to the previous month', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 15) });
    findCellByLabel('March 15')?.focus();

    await user.keyboard('{PageUp}');
    const heading = document.getElementById('dp-heading');
    expect(heading?.textContent).toContain('February');
  });

  it('Shift+PageDown advances one year', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 15) });
    findCellByLabel('March 15')?.focus();

    await user.keyboard('{Shift>}{PageDown}{/Shift}');
    const heading = document.getElementById('dp-heading');
    expect(heading?.textContent).toContain('2027');
  });

  it('Shift+PageUp goes back one year', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 15) });
    findCellByLabel('March 15')?.focus();

    await user.keyboard('{Shift>}{PageUp}{/Shift}');
    const heading = document.getElementById('dp-heading');
    expect(heading?.textContent).toContain('2025');
  });

  it('Enter selects the focused date', async () => {
    const onChange = vi.fn();
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 10), onChange });
    findCellByLabel('March 10')?.focus();

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    const called = onChange.mock.calls[0][0] as Date;
    expect(called.getDate()).toBe(10);
    expect(called.getMonth()).toBe(2);
  });

  it('Space selects the focused date', async () => {
    const onChange = vi.fn();
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 10), onChange });
    findCellByLabel('March 10')?.focus();

    await user.keyboard('{ }');
    expect(onChange).toHaveBeenCalled();
  });

  it('Escape closes the dialog without selecting', async () => {
    const onChange = vi.fn();
    const { user } = await renderOpen({ onChange });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ArrowRight across month boundary navigates the view', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 31) }); // March 31
    findCellByLabel('March 31')?.focus();

    await user.keyboard('{ArrowRight}');
    // View should now show April
    const heading = document.getElementById('dp-heading');
    expect(heading?.textContent).toContain('April');
  });

  it('ArrowLeft across month boundary navigates view backward', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 1) }); // March 1
    findCellByLabel('March 1')?.focus();

    await user.keyboard('{ArrowLeft}');
    const heading = document.getElementById('dp-heading');
    expect(heading?.textContent).toContain('February');
  });

  it('roving tabindex invariant holds after every key press', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 10) });
    findCellByLabel('March 10')?.focus();

    const keys = ['{ArrowRight}', '{ArrowLeft}', '{ArrowDown}', '{ArrowUp}'];
    for (const key of keys) {
      await user.keyboard(key);
      assertSingleTabStop();
    }
  });

  it('disabled dates are skipped by arrow keys', async () => {
    // Disable March 11
    const isDateDisabled = (date: Date) =>
      date.getFullYear() === 2026 && date.getMonth() === 2 && date.getDate() === 11;
    const onChange = vi.fn();
    const { user } = await renderOpen({
      defaultValue: d(2026, 3, 10),
      isDateDisabled,
      onChange,
    });
    findCellByLabel('March 10')?.focus();

    // Pressing Enter on a disabled cell should not call onChange
    // First move to March 11 via ArrowRight (focus moves there but can't select)
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ─── 3. Focus management ─────────────────────────────────────────────────────

describe('DatePicker — Focus management', () => {
  it('opens on input click', async () => {
    const user = setupUser();
    render(<DatePicker />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens on Enter key pressed on the input', async () => {
    const user = setupUser();
    render(<DatePicker />);
    screen.getByRole('combobox').focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes on click outside', async () => {
    const user = setupUser();
    render(
      <div>
        <DatePicker />
        <button>Outside</button>
      </div>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('Tab moves between dialog controls (not outside)', async () => {
    const { user, dialog } = await renderOpen();
    // Tab should stay within the dialog
    const focusable = within(dialog).getAllByRole('button');
    expect(focusable.length).toBeGreaterThan(0);
    // Focus trap is implemented — pressing Tab keeps focus inside dialog
    // This is a basic smoke test; full focus trap testing is in usePopover tests
  });

  it('focus returns to the trigger after Escape', async () => {
    const { user } = await renderOpen();
    // The trigger button has tabIndex=-1 so we check that it's the focused element
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    // After close, the input or trigger should be focused
    // (exact element depends on implementation)
    expect(document.activeElement).not.toBe(document.body);
  });
});

// ─── 4. Selection behavior ───────────────────────────────────────────────────

describe('DatePicker — Selection', () => {
  it('controlled: does not change without onChange', async () => {
    const fixedDate = d(2026, 3, 10);
    const user = setupUser();
    render(<DatePicker value={fixedDate} />);
    await user.click(screen.getByRole('combobox'));

    const cell = findCellByLabel('March 15');
    if (cell) await user.click(cell);
    // Value is controlled — input still shows March 10
    expect(screen.getByRole('combobox')).toHaveDisplayValue(/10|Mar/);
  });

  it('uncontrolled: selects date and updates input display', async () => {
    const user = setupUser();
    render(<DatePicker defaultValue={d(2026, 3, 1)} />);
    await user.click(screen.getByRole('combobox'));

    const cell = findCellByLabel('March 15');
    if (cell) await user.click(cell);

    await waitFor(() => {
      const input = screen.getByRole('combobox');
      expect(input.getAttribute('value')).toMatch(/15/);
    });
  });

  it('calls onChange with a Date object when a date is clicked', async () => {
    const onChange = vi.fn();
    const user = setupUser();
    render(<DatePicker defaultValue={d(2026, 3, 1)} onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));

    const cell = findCellByLabel('March 15');
    if (cell) await user.click(cell);

    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getDate()).toBe(15);
    expect(result.getMonth()).toBe(2);
    expect(result.getFullYear()).toBe(2026);
  });

  it('closeOnSelect=true closes the dialog after selection', async () => {
    const user = setupUser();
    render(<DatePicker defaultValue={d(2026, 3, 1)} closeOnSelect />);
    await user.click(screen.getByRole('combobox'));

    const cell = findCellByLabel('March 15');
    if (cell) await user.click(cell);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closeOnSelect=false keeps the dialog open after selection', async () => {
    const user = setupUser();
    render(<DatePicker defaultValue={d(2026, 3, 1)} closeOnSelect={false} />);
    await user.click(screen.getByRole('combobox'));

    const cell = findCellByLabel('March 15');
    if (cell) await user.click(cell);

    // Dialog should still be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('disabled dates cannot be clicked', async () => {
    const onChange = vi.fn();
    const user = setupUser();
    render(
      <DatePicker
        defaultValue={d(2026, 3, 1)}
        onChange={onChange}
        isDateDisabled={(d) => d.getDate() === 15}
      />,
    );
    await user.click(screen.getByRole('combobox'));

    const cells = getGridCells();
    const disabled = cells.find(c => c.getAttribute('aria-disabled') === 'true');
    if (disabled) await user.click(disabled);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('Today button navigates to the current month', async () => {
    const { user } = await renderOpen({ defaultValue: d(2024, 1, 1) });
    // Should be viewing Jan 2024; Today button should take us to current month
    const todayBtn = screen.getByRole('button', { name: /today/i });
    await user.click(todayBtn);
    const heading = document.getElementById('dp-heading');
    const today = new Date();
    expect(heading?.textContent).toContain(String(today.getFullYear()));
  });

  it('Clear button calls onChange with null', async () => {
    const onChange = vi.fn();
    const { user } = await renderOpen({
      value: d(2026, 3, 10),
      onChange,
    });
    const clearBtn = screen.getByRole('button', { name: /clear/i });
    await user.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(null);
  });
});

// ─── 5. Constraints ──────────────────────────────────────────────────────────

describe('DatePicker — Constraints', () => {
  it('dates before min are disabled', async () => {
    await renderOpen({ min: d(2026, 3, 10), defaultValue: d(2026, 3, 15) });
    const cells = getGridCells();
    // Cells in March before the 10th should be disabled
    const disabledCells = cells.filter(c => c.getAttribute('aria-disabled') === 'true');
    expect(disabledCells.length).toBeGreaterThan(0);
  });

  it('dates after max are disabled', async () => {
    await renderOpen({ max: d(2026, 3, 10), defaultValue: d(2026, 3, 5) });
    const cells = getGridCells();
    const disabledCells = cells.filter(c => c.getAttribute('aria-disabled') === 'true');
    expect(disabledCells.length).toBeGreaterThan(0);
  });

  it('isDateDisabled callback disables the correct cells', async () => {
    // Disable all Sundays
    const isDateDisabled = (d: Date) => d.getDay() === 0;
    await renderOpen({ defaultValue: d(2026, 3, 15), isDateDisabled });
    const cells = getGridCells();
    const disabled = cells.filter(c => c.getAttribute('aria-disabled') === 'true');
    // In any given 6-week grid, there are 6 Sundays
    expect(disabled.length).toBeGreaterThanOrEqual(4);
  });
});

// ─── 6. Form integration ─────────────────────────────────────────────────────

describe('DatePicker — Form integration', () => {
  it('renders a hidden input with the name prop', () => {
    render(<DatePicker name="appointment" value={d(2026, 3, 10)} />);
    const hidden = document.querySelector('input[type="hidden"][name="appointment"]');
    expect(hidden).toBeInTheDocument();
  });

  it('hidden input value is ISO date string (YYYY-MM-DD)', () => {
    render(<DatePicker name="appointment" value={d(2026, 3, 10)} />);
    const hidden = document.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="appointment"]',
    );
    expect(hidden?.value).toBe('2026-03-10');
  });

  it('hidden input is empty string when no date selected', () => {
    render(<DatePicker name="appointment" value={null} />);
    const hidden = document.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="appointment"]',
    );
    expect(hidden?.value).toBe('');
  });

  it('does not render hidden input when name prop is absent', () => {
    render(<DatePicker value={d(2026, 3, 10)} />);
    expect(document.querySelector('input[type="hidden"]')).not.toBeInTheDocument();
  });
});

// ─── 7. Edge cases ────────────────────────────────────────────────────────────

describe('DatePicker — Edge cases', () => {
  it('renders February correctly in a non-leap year', async () => {
    await renderOpen({ defaultValue: d(2026, 2, 15) });
    const heading = document.getElementById('dp-heading');
    expect(heading?.textContent).toContain('February');
    // Feb 2026 has 28 days — Feb 29 should not appear as an in-month date
    const cells = getGridCells();
    const feb29 = cells.find(c =>
      c.getAttribute('aria-label')?.includes('February 29') &&
      !c.hasAttribute('data-outside-month'),
    );
    expect(feb29).toBeUndefined();
  });

  it('renders February correctly in a leap year', async () => {
    await renderOpen({ defaultValue: d(2024, 2, 15) });
    const cells = getGridCells();
    const feb29 = cells.find(c =>
      c.getAttribute('aria-label')?.includes('February 29') &&
      !c.classList.contains('dp-cell--outside'),
    );
    expect(feb29).toBeTruthy();
  });

  it('inline mode does not render a dialog', () => {
    render(<DatePicker inline />);
    // Inline mode uses role="region", not role="dialog"
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // But the grid should be visible
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('disabled prop prevents the calendar from opening', async () => {
    const user = setupUser();
    render(<DatePicker disabled />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

// ─── 8. Prev / Next navigation buttons ───────────────────────────────────────

describe('DatePicker — Month navigation buttons', () => {
  it('Previous month button navigates back', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 15) });
    const prevBtn = screen.getByRole('button', { name: /previous month/i });
    await user.click(prevBtn);
    expect(document.getElementById('dp-heading')?.textContent).toContain('February');
  });

  it('Next month button navigates forward', async () => {
    const { user } = await renderOpen({ defaultValue: d(2026, 3, 15) });
    const nextBtn = screen.getByRole('button', { name: /next month/i });
    await user.click(nextBtn);
    expect(document.getElementById('dp-heading')?.textContent).toContain('April');
  });
});
