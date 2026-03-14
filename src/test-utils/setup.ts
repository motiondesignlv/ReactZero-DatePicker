/**
 * src/test-utils/setup.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Global test setup that runs before every test file.
 *
 * Responsibilities:
 * 1. Extend Vitest's `expect` with @testing-library/jest-dom matchers
 *    (toBeInTheDocument, toHaveAttribute, toBeVisible, etc.)
 * 2. Configure axe-core for accessibility audits
 * 3. Mock CSS imports (Vitest can't process .css in jsdom)
 * 4. Polyfill Intl.Locale.getWeekInfo() for the Node.js test environment
 *    (Node 18+ has Intl.Locale but may lack getWeekInfo depending on ICU build)
 * 5. Mock ResizeObserver / IntersectionObserver (not in jsdom)
 */

import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// ─── Auto-cleanup after each test ────────────────────────────────────────────
// @testing-library/react does NOT auto-cleanup in Vitest — must be explicit.
afterEach(() => {
  cleanup();
});

// ─── CSS import mock ──────────────────────────────────────────────────────────
// Vitest / jsdom cannot process CSS files. Mock them to empty objects.
// This is configured globally in vitest.config.ts via moduleNameMapper, but
// we also handle it here for safety.
vi.mock('*.css', () => ({}));

// ─── Intl.Locale.getWeekInfo polyfill ────────────────────────────────────────
// Node.js ships with ICU "small" data by default in some CI environments,
// which may lack getWeekInfo(). We polyfill the method here so tests
// that rely on locale-aware week start don't silently use the hardcoded fallback.
// In production browsers this is natively available (Baseline Jan 2025+).
if (typeof Intl !== 'undefined' && Intl.Locale) {
  const proto = Intl.Locale.prototype as any;
  if (!('getWeekInfo' in proto) && !('weekInfo' in proto)) {
    // Minimal polyfill: Sunday-start locales vs everything else
    proto.getWeekInfo = function () {
      const sundayLocales = /^(en-US|en-CA|zh|ja|ko|ar|fa)/;
      return {
        firstDay: sundayLocales.test(this.toString()) ? 7 : 1, // ISO: 7=Sun, 1=Mon
        weekend: [6, 7],
        minimalDays: 1,
      };
    };
  }
}

// ─── ResizeObserver mock ──────────────────────────────────────────────────────
// jsdom does not implement ResizeObserver. Some popover logic may use it.
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ─── IntersectionObserver mock ────────────────────────────────────────────────
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// ─── window.CSS.supports mock ────────────────────────────────────────────────
// CSS Anchor Positioning detection in usePopover calls CSS.supports().
// jsdom doesn't implement it — return false so JS fallback path is taken.
Object.defineProperty(window, 'CSS', {
  value: {
    supports: vi.fn().mockReturnValue(false),
  },
  writable: true,
});

// ─── createPortal passthrough ─────────────────────────────────────────────────
// ReactDOM.createPortal renders into document.body by default in tests.
// No mock needed — jsdom has a full document.body, so portals work correctly.
// This comment exists to document the intentional non-mock decision.

// ─── Console noise suppression ────────────────────────────────────────────────
// Suppress React's act() warnings in tests that don't need them.
// Remove this if you want to debug async state update warnings.
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  if (
    message.includes('Warning: An update to') ||
    message.includes('Warning: act(')
  ) {
    return;
  }
  originalConsoleError(...args);
};
