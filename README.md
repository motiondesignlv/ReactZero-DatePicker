<!-- Logo placeholder — replace with your logo -->
<!-- <p align="center"><img src="./docs/logo.svg" width="200" alt="@reactzero/datepicker" /></p> -->

<h1 align="center">@reactzero/datepicker</h1>

<p align="center">
  Zero-dependency, accessible React date &amp; time picker.<br/>
  WCAG 2.1 AA &bull; 7 components &bull; 4 headless hooks &bull; ~12 kB gzipped.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@reactzero/datepicker"><img src="https://img.shields.io/npm/v/@reactzero/datepicker" alt="npm version" /></a>
  <a href="https://bundlephobia.com/package/@reactzero/datepicker"><img src="https://img.shields.io/bundlephobia/minzip/@reactzero/datepicker" alt="bundle size" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/@reactzero/datepicker" alt="license" /></a>
  <img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/a11y-WCAG_2.1_AA-green" alt="WCAG 2.1 AA" />
</p>

---

## Why?

Every React datepicker I tried either pulled in a heavy date library (date-fns, moment, dayjs), made styling painful, or both. I wanted something that:

- Has **zero runtime dependencies** — just native `Intl` and `Date` APIs
- Is **easy to customize** — override a few CSS variables and you're done
- Ships **accessible out of the box** — WCAG 2.1 AA, keyboard nav, screen readers
- Stays **small** — under 12 kB gzipped

I couldn't find it, so I built it. `@reactzero/datepicker` is the first package in the `@reactzero` family — a collection of zero-dependency React UI primitives that are tiny, accessible, and effortless to style.

## Features

- **Zero Dependencies** — Uses native `Intl` and `Date` APIs. No date-fns, moment, or dayjs.
- **Micro Bundle** — ~12 kB gzipped JS + ~4 kB CSS. Tree-shakeable named exports.
- **Accessible (WCAG 2.1 AA)** — ARIA grid dialogs, spinbuttons, keyboard navigation, focus management.
- **Headless + Styled** — Use the styled components or go fully headless with hooks.
- **Themeable** — 10 built-in themes + 3 density modes via CSS custom properties.
- **i18n** — Locale-aware formatting, RTL support, configurable first day of week.

## Bundle Size

| Import | Gzipped |
|--------|---------|
| Full bundle (all components) | ~8 kB |
| Single component (`DatePicker`) | ~6 kB |
| Headless hook (`useDatePicker`) | ~3 kB |
| CSS (`styles`) | ~4 kB |

> Sizes are approximate and measured with [size-limit](https://github.com/ai/size-limit).

## Installation

```bash
npm install @reactzero/datepicker
```

## Quick Start

```tsx
import { DatePicker } from '@reactzero/datepicker';
import '@reactzero/datepicker/styles';

export default function App() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="Select date..."
    />
  );
}
```

## Headless API

For total control over the UI, use the headless hooks — no CSS required:

```tsx
import { useDatePicker } from '@reactzero/datepicker';

function CustomDatePicker() {
  const {
    state,
    isOpen,
    toggle,
    getContainerProps,
    getTriggerProps,
    getDialogProps,
    getGridProps,
    getCellProps,
  } = useDatePicker({ locale: 'en-US' });

  // Build your own UI with full ARIA compliance...
}
```

Available hooks:
- **`useDatePicker`** — Calendar state, open/close, ARIA prop getters
- **`useTimePicker`** — Hour/minute/second spinbuttons, AM/PM toggle
- **`useRangePicker`** — Start/end date selection with hover preview
- **`useCalendarState`** — Low-level calendar grid state machine

## Components

| Component | Description |
|-----------|-------------|
| `DatePicker` | Full date picker with popover calendar |
| `TimePicker` | Time selection (inline or popover mode) |
| `DateRangePicker` | Two-month range picker with presets |
| `DateTimePicker` | Combined date + time picker |
| `CalendarGrid` | Presentational calendar grid |
| `FieldWrapper` | Accessible form field with label, hint, error |
| `TimeInput` | Compact inline time entry with spinbuttons |

## Styling & Theming

Import the stylesheet and override CSS custom properties:

```tsx
import '@reactzero/datepicker/styles';
```

```css
:root {
  --dp-accent: #3b82f6;
  --dp-bg: #ffffff;
  --dp-text: #0f172a;
  --dp-cell-size: 2.5rem;
}
```

### Built-in Themes

Apply a theme via the `theme` prop or the `data-dp-theme` attribute:

```tsx
<DatePicker theme="dark" />
<DatePicker theme="ocean" />
<DatePicker theme="rose" />
```

Available: `light` (default), `dark`, `minimal`, `ocean`, `rose`, `purple`, `amber`, `slate`, `glass`, `hc` (high contrast).

### Density Modes

```tsx
<DatePicker density="compact" />
<DatePicker density="comfortable" />
```

### Trigger Styles

Control the trigger appearance with the `triggerStyle` prop:

```tsx
<DatePicker triggerStyle="default" />   // Full input + icon (default)
<DatePicker triggerStyle="icon" />      // Circular icon-only button
<DatePicker triggerStyle="minimal" />   // Underline only, no box
<DatePicker triggerStyle="pill" />      // Rounded, accent-filled
<DatePicker triggerStyle="ghost" />     // Transparent, border on hover
```

## AI Reference

Building with AI? Download the [ai-reference.md](https://motiondesignlv.github.io/reactzero-datepicker/ai-reference.md) — a comprehensive single-file reference covering every component, hook, prop, CSS variable, and usage pattern. Feed it to your AI coding tool for accurate `@reactzero/datepicker` code generation.

## Browser Support

Targets ES2020. Supports all browsers that support React 18:
- Chrome/Edge 80+
- Firefox 80+
- Safari 14.1+

## Documentation

- [Live Demo & Docs](https://motiondesignlv.github.io/reactzero-datepicker)
- [Interactive Storybook](https://motiondesignlv.github.io/reactzero-datepicker/storybook)
- [AI Reference](./ai-reference.md) — complete API reference for AI-assisted development
- Run `npm run storybook` for local component demos

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start Storybook dev server
npm run build        # Build library (ESM + CJS + types + CSS)
npm run test         # Run unit tests
npm run test:a11y    # Run accessibility tests
npm run size         # Check bundle size
npm run ci           # Full CI pipeline (typecheck + lint + test)
```

## Publishing

Publishing is automated via GitHub Actions. To release a new version:

```bash
npm version patch    # or minor / major
git push --tags
```

The CI workflow runs tests, builds the package, and publishes to npm on version tags. Requires an `NPM_TOKEN` secret in your GitHub repository settings.

## License

[MIT](./LICENSE) - see the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  <!-- Logo placeholder — replace with your logo -->
  <!-- <img src="./docs/logo-small.svg" width="40" alt="" /> -->
  <br/>
  Built by <strong><a href="https://github.com/motiondesignlv">motiondesignlv</a></strong>
  <br/>
  <sub>
    <a href="https://github.com/motiondesignlv">GitHub</a>
  </sub>
</p>
