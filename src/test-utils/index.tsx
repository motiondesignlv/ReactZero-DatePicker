/**
 * src/test-utils/index.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared test utilities re-exported from a single location.
 *
 * Pattern: always import from '@/test-utils' in test files, never directly
 * from @testing-library/react. This means any global wrapper (e.g., a future
 * ThemeProvider or i18n context) can be added in ONE place.
 */

import React, { type ReactElement } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Re-exports ───────────────────────────────────────────────────────────────
// Re-export everything from testing-library so tests only need one import
export * from '@testing-library/react';
export { userEvent };

// ─── Custom render ────────────────────────────────────────────────────────────
/**
 * Wraps @testing-library/react's render() with any global providers.
 * Currently a passthrough — add providers here as the project grows
 * (ThemeProvider, RTL direction wrapper, etc.)
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult {
  return render(ui, { ...options });
}

export { customRender as render };

// ─── userEvent setup ──────────────────────────────────────────────────────────
/**
 * Creates a pre-configured userEvent instance with pointer events enabled.
 *
 * WHY NOT fireEvent?
 * userEvent simulates the full browser event sequence (pointerdown →
 * mousedown → mouseup → click) which is how real users interact. This
 * catches bugs where components listen to specific events in the chain.
 *
 * Usage:
 *   const user = setupUser();
 *   await user.click(element);
 *   await user.keyboard('{ArrowDown}');
 */
export function setupUser() {
  return userEvent.setup({
    // Simulate pointer events (for mouseenter/leave used in range hover)
    pointerEventsCheck: 0,
  });
}

// ─── Date helpers for tests ───────────────────────────────────────────────────

/**
 * Create a Date at a specific calendar day (local time, midnight).
 * Avoids the "new Date(string)" UTC pitfall in test code.
 *
 * @example
 *   const march10 = d(2026, 3, 10); // March 10, 2026
 */
export function d(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day); // month is 1-indexed for readability
}

/**
 * Format a Date as "YYYY-MM-DD" for use in assertions.
 * Same logic as our toISODateString utility — duplicated here so tests
 * don't create a circular dependency on the code under test.
 */
export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── ARIA query helpers ───────────────────────────────────────────────────────

/**
 * Get all gridcells from the currently rendered calendar.
 * Returns cells as an array with their date string accessible via dataset.
 */
export function getGridCells(container: HTMLElement = document.body): HTMLElement[] {
  return Array.from(container.querySelectorAll('[role="gridcell"]'));
}

/**
 * Get the gridcell whose aria-label starts with the given date pattern.
 * E.g., findCellByLabel('Tuesday, March 10') finds the March 10 cell.
 */
export function findCellByLabel(
  labelPattern: string,
  container: HTMLElement = document.body,
): HTMLElement | undefined {
  return (getGridCells(container) as HTMLElement[]).find((cell) =>
    cell.getAttribute('aria-label')?.includes(labelPattern),
  );
}

/**
 * Get the cell with tabIndex=0 (the currently keyboard-focused cell).
 */
export function getFocusedCell(container: HTMLElement = document.body): HTMLElement | undefined {
  return getGridCells(container).find(
    (cell) => cell.tabIndex === 0,
  ) as HTMLElement | undefined;
}

/**
 * Assert that exactly one gridcell has tabIndex=0 (roving tabindex invariant).
 * Call after any keyboard navigation to verify the invariant holds.
 */
export function assertSingleTabStop(container: HTMLElement = document.body): void {
  const cells = getGridCells(container);
  const tabStops = cells.filter((c) => c.tabIndex === 0);
  if (tabStops.length !== 1) {
    throw new Error(
      `Expected exactly 1 cell with tabIndex=0 (roving tabindex), found ${tabStops.length}.\n` +
        `Cells with tabIndex=0: ${tabStops.map((c) => c.getAttribute('aria-label')).join(', ')}`,
    );
  }
}
