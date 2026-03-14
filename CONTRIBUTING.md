# Contributing Guide

## Test strategy

This project uses a four-layer testing approach. Understanding which layer to
use for each type of change will save you time.

---

### Layer 1 — Unit tests (pure functions)
**Location:** `src/__tests__/utils/`, `src/__tests__/hooks/`
**Tool:** Vitest, zero DOM

Use for: date arithmetic, Intl formatting helpers, hook state transitions via
`renderHook`. These run in under 50ms because there's no React rendering.

**When to add a unit test:** Any new function in `utils/date.ts` or
`utils/intl.ts`. Any state transition in a hook that can be exercised without
a rendered component.

```bash
npm run test:unit
```

---

### Layer 2 — Component / integration tests
**Location:** `src/__tests__/components/`
**Tool:** Vitest + @testing-library/react + @testing-library/user-event

Use for: keyboard interactions, ARIA attribute presence, focus management,
selection behavior, form integration. Every test renders a real component in
jsdom.

**Rule:** Always use `userEvent` instead of `fireEvent`. userEvent simulates
the full browser event chain (pointerdown → mousedown → focus → click), which
is how real users interact. `fireEvent.click` only fires the `click` event
and misses focus-dependent behavior.

**Rule:** Never assert on CSS class names. Assert on ARIA attributes and
accessible roles. Class names are implementation details; ARIA is the contract.

```bash
npm run test:components
```

---

### Layer 3 — Accessibility audits
**Location:** `src/__tests__/a11y/`
**Tool:** jest-axe (axe-core)

Use for: automated WCAG rule checking. axe-core catches ~30–40% of WCAG
failures automatically including missing labels, invalid ARIA relationships,
and contrast failures.

**Important:** axe-core passes are necessary but not sufficient. Automated
tools cannot test keyboard operability or screen reader announcement quality.
Those require manual testing.

**When to add an axe test:** Every significant component state (open/closed,
with value, disabled, with constraints) should have an axe audit.

```bash
npm run test:a11y
```

---

### Layer 4 — Manual testing checklist

Before any PR that changes interaction behavior, test manually with:

**Keyboard:**
- [ ] Tab order makes sense, calendar opens on Enter/Space
- [ ] All 11 keyboard shortcuts in the calendar work (see README)
- [ ] Time picker spinbutton: Up/Down, PageUp/Down, Home/End, digit entry
- [ ] Escape closes and returns focus to trigger
- [ ] Tab/Shift+Tab stays within the dialog (focus trap)

**Screen readers (test at least one):**
- [ ] VoiceOver + Safari (macOS) — most common for Mac/iOS users
- [ ] NVDA + Chrome (Windows) — most common globally
- [ ] Verify month/year heading is announced when navigating months
- [ ] Verify selected date is announced as "selected" on selection
- [ ] Verify disabled dates are announced as "dimmed" or "unavailable"
- [ ] Verify range start/end/mid cells are described correctly

**Touch / mobile:**
- [ ] Touch targets are at least 44×44 px
- [ ] Range picker is usable on mobile (single-month mode)

---

## Running the full CI suite locally

```bash
npm run ci
# Runs: typecheck → lint → test:all
```

---

## Coverage requirements

The CI enforces these minimums:

| Metric | Threshold |
|--------|-----------|
| Lines | 80% |
| Functions | 80% |
| Branches | 75% |
| Statements | 80% |

View the coverage report:
```bash
npm run test:coverage
open coverage/index.html
```

---

## Adding a new date locale

1. Add a test in `src/__tests__/utils/intl.test.ts` verifying
   `getFirstDayOfWeek` and `isRTL` return the correct values.
2. Add an axe audit test with the new locale in `src/__tests__/a11y/axe.test.tsx`.
3. Verify the calendar renders the correct first day of week visually.

## Adding a new picker variant

1. Create the hook in `src/hooks/`
2. Create the component in `src/components/`
3. Add unit tests for the hook state machine in `src/__tests__/hooks/`
4. Add comprehensive component tests in `src/__tests__/components/`
5. Add axe audit tests in `src/__tests__/a11y/`
6. Export from `src/index.ts`
7. Document in README.md
