# @reactzero/datepicker AI Reference

> Complete reference for AI coding assistants. Copy this file into your project context or feed it to your AI tool for accurate @reactzero/datepicker code generation.

**Package:** `@reactzero/datepicker` | **License:** MIT | **Peer Dep:** React 18+ | **Bundle:** ~12 kB gzip JS + ~4 kB CSS | **Zero runtime dependencies**

---

## Installation

```bash
npm install @reactzero/datepicker
```

```tsx
// Import components
import { DatePicker, TimePicker, DateRangePicker } from '@reactzero/datepicker';
// Import styles (required for styled components, skip for headless)
import '@reactzero/datepicker/styles';
```

---

## Components

### DatePicker

Full date picker with popover calendar or inline mode.

```tsx
import { DatePicker } from '@reactzero/datepicker';
import '@reactzero/datepicker/styles';

function App() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <DatePicker
      id="my-date"
      value={date ?? undefined}
      onChange={setDate}
      placeholder="Select date"
      theme="ocean"
      density="default"
      triggerStyle="default"
    />
  );
}
```

#### DatePickerProps

Extends `DatePickerOptions` (see hooks section).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `'Select date'` | Placeholder text in trigger |
| `className` | `string` | `''` | Extra CSS class on container |
| `required` | `boolean` | — | Mark hidden input as required |
| `disabled` | `boolean` | — | Disable the trigger |
| `inline` | `boolean` | — | Render calendar inline (no popover) |
| `theme` | `DpTheme` | `'light'` | Built-in theme preset |
| `density` | `DpDensity` | `'default'` | Size/density mode |
| `triggerStyle` | `DpTriggerStyle` | `'default'` | Trigger visual variant |
| `renderTrigger` | `(props) => ReactNode` | — | Replace the trigger entirely |
| `icon` | `ReactNode \| null` | calendar icon | Custom icon; `null` hides it |
| `renderPrevButton` | `(onClick) => ReactNode` | — | Custom prev-month button |
| `renderNextButton` | `(onClick) => ReactNode` | — | Custom next-month button |
| `renderFooter` | `(date, close) => ReactNode` | — | Custom footer content |
| `formatValue` | `(date: Date) => string` | ISO string | Format selected date display |

**renderTrigger callback props:**
```tsx
{
  onClick: () => void;
  selectedDate: Date | null;
  isOpen: boolean;
  placeholder: string;
  id?: string;
}
```

#### Types

```tsx
type DpTheme = 'light' | 'dark' | 'minimal' | 'ocean' | 'rose';
type DpDensity = 'compact' | 'default' | 'comfortable';
type DpTriggerStyle = 'default' | 'icon' | 'minimal' | 'pill' | 'ghost';
```

> Note: Extra themes `'purple' | 'amber' | 'slate' | 'glass' | 'hc'` work via the `data-dp-theme` attribute in CSS but are not in the `DpTheme` union. Cast with `as DpTheme` or use `theme={themeName as any}`.

#### Examples

```tsx
// Inline calendar (no popover)
<DatePicker id="cal" inline theme="minimal" onChange={setDate} />

// Icon-only trigger
<DatePicker id="icon" triggerStyle="icon" theme="dark" />

// Pill trigger
<DatePicker id="pill" triggerStyle="pill" placeholder="Choose" />

// Custom trigger
<DatePicker
  id="custom"
  renderTrigger={({ onClick, selectedDate, placeholder }) => (
    <button onClick={onClick}>
      {selectedDate ? selectedDate.toLocaleDateString() : placeholder}
    </button>
  )}
/>

// Custom footer
<DatePicker
  id="footer"
  renderFooter={(date, close) => (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={close}>Cancel</button>
      <button onClick={close}>Apply</button>
    </div>
  )}
/>

// Min/max date constraints
<DatePicker
  id="constrained"
  min={new Date(2024, 0, 1)}
  max={new Date(2024, 11, 31)}
/>

// Special days (holidays, events)
<DatePicker
  id="special"
  specialDays={[
    { date: new Date(2024, 11, 25), label: 'Christmas', className: 'holiday', dotColor: '#ef4444' },
    { date: new Date(2024, 0, 1), label: 'New Year', dotColor: '#22c55e' },
  ]}
/>

// Disabled dates
<DatePicker
  id="no-weekends"
  isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}
/>

// With form field wrapper
<FieldWrapper label="Birth Date" required hint="MM/DD/YYYY" error={errors.birthDate}>
  <DatePicker id="birth" value={birthDate} onChange={setBirthDate} />
</FieldWrapper>
```

---

### TimePicker

Time selection with spinbuttons. Supports inline and popover modes.

```tsx
import { TimePicker } from '@reactzero/datepicker';
import '@reactzero/datepicker/styles';

function App() {
  return <TimePicker id="time" granularity="minute" hourCycle="h12" theme="ocean" />;
}
```

#### TimePickerProps

Extends `TimePickerOptions` (see hooks section).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Extra CSS class |
| `disabled` | `boolean` | — | Disable all controls |
| `theme` | `DpTheme \| string` | `'light'` | Theme preset |
| `density` | `DpDensity` | `'default'` | Size mode |
| `mode` | `'inline' \| 'popover'` | `'inline'` | Render mode |
| `triggerStyle` | `TimePickerTriggerStyle` | `'default'` | Trigger style (popover mode) |
| `icon` | `ReactNode \| null` | clock icon | Custom icon |
| `renderContainer` | `(children) => ReactNode` | — | Wrapper (inline mode) |
| `segmentLabels` | `{ hour?, minute?, second?, period? }` | — | Custom ARIA labels |
| `renderPopoverFooter` | `(time, close) => ReactNode` | — | Footer (popover mode) |
| `placement` | `'bottom-start' \| 'bottom-end' \| 'top-start' \| 'top-end'` | `'bottom-start'` | Popover position |
| `placeholder` | `string` | — | Trigger placeholder (popover mode) |

#### Examples

```tsx
// 12-hour with AM/PM
<TimePicker id="t1" hourCycle="h12" granularity="minute" />

// 24-hour with seconds
<TimePicker id="t2" hourCycle="h24" granularity="second" />

// Popover mode
<TimePicker id="t3" mode="popover" placeholder="Set time" />

// With constraints
<TimePicker
  id="t4"
  minTime={new Date(0, 0, 0, 9, 0)}   // 9:00 AM
  maxTime={new Date(0, 0, 0, 17, 0)}  // 5:00 PM
  minuteStep={15}
/>

// Blocked time slots
<TimePicker
  id="t5"
  blockedTimes={[
    { start: '12:00', end: '13:00', label: 'Lunch break' },
    { start: '15:00', end: '15:30', label: 'Meeting' },
  ]}
/>
```

---

### DateRangePicker

Two-calendar range picker with presets.

```tsx
import { DateRangePicker, type DateRange } from '@reactzero/datepicker';
import '@reactzero/datepicker/styles';

function App() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  return (
    <DateRangePicker
      id="range"
      value={range}
      onChange={setRange}
      theme="rose"
    />
  );
}
```

#### DateRangePickerProps

Extends `RangePickerOptions` (see hooks section).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Extra CSS class |
| `startName` | `string` | — | Hidden input name for start date |
| `endName` | `string` | — | Hidden input name for end date |
| `showFooter` | `boolean` | — | Show Clear/Apply footer |
| `presets` | `Preset[]` | — | Quick-select preset ranges |
| `theme` | `DpTheme` | `'light'` | Theme preset |
| `density` | `DpDensity` | `'default'` | Size mode |

**DateRange type:**
```tsx
interface DateRange {
  start: Date | null;
  end: Date | null;
}
```

**Preset type:**
```tsx
{ label: string; getValue: () => { start: Date; end: Date } }
```

#### Examples

```tsx
// With presets
<DateRangePicker
  id="booking"
  value={range}
  onChange={setRange}
  presets={[
    { label: 'Last 7 days', getValue: () => ({
      start: new Date(Date.now() - 7 * 86400000),
      end: new Date(),
    })},
    { label: 'This month', getValue: () => ({
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(),
    })},
  ]}
/>

// With min/max length
<DateRangePicker id="trip" minLength={2} maxLength={14} />
```

---

### DateTimePicker

Combined date + time picker.

```tsx
import { DateTimePicker } from '@reactzero/datepicker';
import '@reactzero/datepicker/styles';

function App() {
  const [dt, setDt] = useState<Date | null>(null);
  return <DateTimePicker id="dt" value={dt} onChange={setDt} layout="row" />;
}
```

#### DateTimePickerProps

Combines `DatePickerProps` and `TimePickerOptions`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| null` | — | Controlled date+time value |
| `defaultValue` | `Date \| null` | — | Uncontrolled initial value |
| `onChange` | `(date: Date \| null) => void` | — | Change handler |
| `layout` | `'row' \| 'column'` | `'column'` | Layout direction |
| `theme` | `DpTheme` | `'light'` | Theme preset |
| `density` | `DpDensity` | `'default'` | Size mode |

Plus all DatePicker and TimePicker props (except their individual `value`/`onChange`).

---

### CalendarGrid

Presentational calendar grid. Used internally by DatePicker but can be used standalone with headless hooks.

```tsx
import { CalendarGrid } from '@reactzero/datepicker';

<CalendarGrid
  gridProps={getGridProps()}
  cellProps={getCellProps}
  grid={state.grid}
  firstDayOfWeek={state.firstDayOfWeek}
  locale="en-US"
/>
```

#### CalendarGridProps

| Prop | Type | Description |
|------|------|-------------|
| `gridProps` | `HTMLAttributes<HTMLTableElement>` | Spread onto `<table>` |
| `cellProps` | `(date: Date) => HTMLAttributes<HTMLTableCellElement>` | Props factory per cell |
| `grid` | `Date[][]` | 2D array of dates (weeks x days) |
| `firstDayOfWeek` | `number` | 0=Sunday, 1=Monday, etc. |
| `locale` | `string` | Locale for weekday headers |
| `className` | `string` | Extra CSS class |

---

### FieldWrapper

Accessible form field wrapper with label, hint, error state.

```tsx
import { FieldWrapper } from '@reactzero/datepicker';

<FieldWrapper
  label="Departure Date"
  required
  hint="Select your travel date"
  error={errors.departure}
  status={errors.departure ? 'error' : 'idle'}
>
  <DatePicker id="departure" />
</FieldWrapper>
```

#### FieldWrapperProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text |
| `hint` | `string` | — | Hint below field |
| `error` | `string` | — | Error message (sets aria-invalid) |
| `message` | `string` | — | Success/warning message |
| `status` | `FieldStatus` | `'idle'` | Drives icon + color |
| `required` | `boolean` | — | Visual required indicator |
| `id` | `string` | — | ID prefix for label htmlFor |
| `className` | `string` | — | Extra CSS class |
| `children` | `ReactNode` | — | The picker component |
| `labelAction` | `ReactNode` | — | Extra content beside label |

```tsx
type FieldStatus = 'idle' | 'error' | 'success' | 'warning';
```

---

### TimeInput

Compact inline time entry with spinbuttons. Lighter alternative to TimePicker.

```tsx
import { TimeInput } from '@reactzero/datepicker';

<TimeInput id="alarm" hourCycle="h12" granularity="minute" />
```

#### TimeInputProps

Extends `TimePickerOptions`. Additional prop:

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Extra CSS class |

---

## Headless Hooks

Use hooks for full control over rendering — no CSS import needed.

### useDatePicker

```tsx
import { useDatePicker } from '@reactzero/datepicker';

const {
  state,           // CalendarState (viewDate, selectedDate, grid, navigation)
  isOpen,          // boolean — popover open state
  toggle,          // () => void
  close,           // () => void
  getContainerProps,  // () => container div props
  getTriggerProps,    // () => trigger button props
  getDialogProps,     // () => dialog div props
  getGridProps,       // () => grid table props
  getCellProps,       // (date: Date) => cell td props
} = useDatePicker(options);
```

#### DatePickerOptions

Extends `CalendarStateOptions`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `string` | auto | Component ID prefix |
| `name` | `string` | — | Hidden input name for forms |
| `closeOnSelect` | `boolean` | `true` | Close popover after selecting |
| `aria-label` | `string` | — | ARIA label for dialog |

---

### useTimePicker

```tsx
import { useTimePicker } from '@reactzero/datepicker';

const {
  selectedTime,      // Date | null
  activeTime,        // Date (always defined, defaults to now)
  format12,          // boolean — whether using 12-hour format
  incrementHour,     // () => void
  decrementHour,     // () => void
  incrementMinute,   // () => void
  decrementMinute,   // () => void
  incrementSecond,   // () => void
  decrementSecond,   // () => void
  toggleAmPm,        // () => void
  getHourProps,      // () => spinbutton props
  getMinuteProps,    // () => spinbutton props
  getSecondProps,    // () => spinbutton props
  getPeriodProps,    // () => AM/PM toggle props
  hourDisplay,       // string (formatted)
  minuteDisplay,     // string (formatted)
  secondDisplay,     // string (formatted)
  periodDisplay,     // string ('AM' | 'PM')
  isHourDisabled,    // (h: number) => boolean
  isMinuteDisabled,  // (m: number, h: number) => boolean
  isTimeBlocked,     // (date: Date) => { blocked: boolean; label?: string }
} = useTimePicker(options);
```

#### TimePickerOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | `Date \| null` | — | Controlled value |
| `defaultValue` | `Date \| null` | — | Uncontrolled initial value |
| `onChange` | `(date: Date \| null) => void` | — | Change handler |
| `minTime` | `Date` | — | Earliest selectable time |
| `maxTime` | `Date` | — | Latest selectable time |
| `minuteStep` | `number` | `1` | Minute increment step |
| `hourCycle` | `HourCycle` | auto-detect | `'h12' \| 'h24' \| 'h23' \| 'h11'` |
| `granularity` | `TimeGranularity` | `'minute'` | `'hour' \| 'minute' \| 'second'` |
| `disabled` | `boolean` | — | Disable all controls |
| `disabledHours` | `number[]` | — | Hours (0-23) that are blocked |
| `disabledMinutes` | `number[] \| (hour) => number[]` | — | Minutes blocked |
| `blockedTimes` | `BlockedTimeSlot[]` | — | Time ranges blocked |

```tsx
interface BlockedTimeSlot {
  start: string;  // "HH:MM" 24-hour
  end: string;    // "HH:MM" 24-hour
  label?: string;
}
```

---

### useRangePicker

```tsx
import { useRangePicker, type DateRange } from '@reactzero/datepicker';

const {
  state,             // CalendarState
  range,             // DateRange | undefined
  setRange,          // (range: DateRange) => void
  clearRange,        // () => void
  isOpen,            // boolean
  toggle,            // () => void
  close,             // () => void
  getCellProps,      // (date: Date) => cell props with range data attrs
  getContainerProps, // () => container props
  getGroupProps,     // () => group props
  getStartInputProps, // () => start input props
  getEndInputProps,  // () => end input props
  getDialogProps,    // () => dialog props
  getGridProps,      // () => grid props
  getPrevMonthProps, // () => prev button props
  getNextMonthProps, // () => next button props
} = useRangePicker(options);
```

#### RangePickerOptions

Extends `CalendarStateOptions` (minus `value`/`onChange`).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | `DateRange` | — | Controlled range |
| `defaultValue` | `DateRange` | — | Uncontrolled initial range |
| `onChange` | `(range: DateRange) => void` | — | Change handler |
| `id` | `string` | — | Component ID prefix |
| `closeOnSelect` | `boolean` | `true` | Close after both dates selected |
| `minLength` | `number` | — | Minimum days in range |
| `maxLength` | `number` | — | Maximum days in range |

---

### useCalendarState

Low-level calendar grid state machine. Used by `useDatePicker` and `useRangePicker`.

```tsx
import { useCalendarState } from '@reactzero/datepicker';

const state = useCalendarState({
  locale: 'en-US',
  weekStartsOn: 1,  // Monday
});

// state.grid: Date[][] — 2D array of weeks
// state.viewDate: Date — currently viewed month
// state.selectedDate: Date | null
// state.goToPreviousMonth(): void
// state.goToNextMonth(): void
// state.setSelectedDate(date): void
// state.isDisabled(date): boolean
// state.isOutsideMonth(date): boolean
// state.getSpecialDay(date): SpecialDay | undefined
```

#### CalendarStateOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | `Date \| null` | — | Controlled selected date |
| `defaultValue` | `Date \| null` | — | Initial selected date |
| `onChange` | `(date: Date \| null) => void` | — | Selection change handler |
| `min` / `minDate` | `Date` | — | Earliest selectable date |
| `max` / `maxDate` | `Date` | — | Latest selectable date |
| `locale` | `string` | browser default | BCP 47 locale tag |
| `weekStartsOn` / `firstDayOfWeek` | `number` | locale-based | 0=Sun, 1=Mon, ... 6=Sat |
| `isDateDisabled` | `(date: Date) => boolean` | — | Custom disable logic |
| `specialDays` | `SpecialDay[] \| (date) => SpecialDay` | — | Marked/highlighted dates |
| `defaultViewDate` | `Date` | today | Initial month to display |

```tsx
interface SpecialDay {
  label?: string;      // Tooltip / aria description
  className?: string;  // CSS class on cell
  dotColor?: string;   // Dot indicator color, e.g. '#ef4444'
}

// When using as array, each item also has a `date` field:
specialDays={[
  { date: new Date(2024, 11, 25), label: 'Christmas', dotColor: '#ef4444' },
]}

// When using as function:
specialDays={(date) =>
  date.getDay() === 0 ? { label: 'Weekend', className: 'weekend' } : undefined
}
```

---

## Theming

### Using Theme Prop

```tsx
<DatePicker theme="dark" />
<DatePicker theme="ocean" />
<DatePicker theme="rose" />
```

### Available Themes

| Theme | Background | Accent | Style |
|-------|-----------|--------|-------|
| `light` | #ffffff (white) | #2563eb (blue) | Default clean |
| `dark` | #1e293b (dark slate) | #60a5fa (light blue) | Dark mode |
| `minimal` | #ffffff | #18181b (near-black) | Flat, sharp corners |
| `ocean` | #f0fdff (cyan tint) | #0891b2 (cyan) | Cool tones |
| `rose` | #fff8f8 (pink tint) | #e11d48 (pink) | Warm tones |
| `purple` | #faf5ff (purple tint) | #7c3aed (purple) | Purple tones |
| `amber` | #fffbeb (amber tint) | #d97706 (amber) | Warm amber |
| `slate` | #f8fafc (slate tint) | #475569 (slate) | Corporate/neutral |
| `glass` | rgba(255,255,255,0.7) | #6366f1 (indigo) | Frosted glass + blur |
| `hc` | #ffffff | #0000ee (blue) | High contrast (a11y) |

### Density Modes

```tsx
<DatePicker density="compact" />      // Smaller: 1.875rem cells
<DatePicker density="default" />      // Normal: 2.5rem cells
<DatePicker density="comfortable" />  // Larger: 3rem cells
```

### CSS Custom Properties

Override any `--dp-*` variable to customize:

```css
/* Global override */
:root {
  --dp-accent: #8b5cf6;
  --dp-accent-hover: #7c3aed;
  --dp-accent-fg: #ffffff;
  --dp-bg: #ffffff;
  --dp-text: #1e293b;
  --dp-border: #e2e8f0;
  --dp-cell-size: 2.5rem;
  --dp-radius-md: 0.5rem;
}

/* Scoped to a container */
.my-form .dp-container {
  --dp-accent: #059669;
  --dp-bg: #f0fdf4;
}
```

#### All CSS Variables

**Colors:**
| Variable | Default | Description |
|----------|---------|-------------|
| `--dp-accent` | #2563eb | Primary accent |
| `--dp-accent-hover` | #1d4ed8 | Hover state |
| `--dp-accent-fg` | #ffffff | Text on accent |
| `--dp-accent-subtle` | #dbeafe | Light accent tint |
| `--dp-accent-ring` | rgba(37,99,235,0.3) | Focus ring |
| `--dp-bg` | #ffffff | Calendar background |
| `--dp-surface` | #f8fafc | Subtle surface |
| `--dp-surface-hover` | #f1f5f9 | Surface hover |
| `--dp-border` | #e2e8f0 | Border color |
| `--dp-border-strong` | #cbd5e1 | Emphasized border |
| `--dp-text` | #0f172a | Primary text |
| `--dp-text-muted` | #64748b | Secondary text |
| `--dp-text-disabled` | #cbd5e1 | Disabled text |
| `--dp-today-ring` | var(--dp-accent) | Today indicator |

**Range:**
| Variable | Default | Description |
|----------|---------|-------------|
| `--dp-range-bg` | var(--dp-accent-subtle) | Range highlight bg |
| `--dp-range-edge-bg` | var(--dp-accent) | Start/end cell bg |
| `--dp-range-edge-fg` | var(--dp-accent-fg) | Start/end cell text |

**Sizing:**
| Variable | Default | Description |
|----------|---------|-------------|
| `--dp-cell-size` | 2.5rem | Day cell width/height |
| `--dp-cell-radius` | 9999px | Cell border radius |
| `--dp-cell-font` | 0.875rem | Cell font size |
| `--dp-header-font` | 0.875rem | Month/year header size |
| `--dp-weekday-font` | 0.75rem | Weekday label size |
| `--dp-trigger-px` | 1rem | Trigger horizontal padding |
| `--dp-trigger-py` | 0.5rem | Trigger vertical padding |
| `--dp-trigger-font` | 0.875rem | Trigger font size |
| `--dp-popover-padding` | 1rem | Popover padding |
| `--dp-spin-size` | 2.25rem | Spinbutton size |
| `--dp-spin-font` | 1rem | Spinbutton font |
| `--dp-spin-btn-size` | 1.5rem | Spin arrow button size |
| `--dp-special-dot-size` | 0.375rem | Special day dot size |

**Shape:**
| Variable | Default | Description |
|----------|---------|-------------|
| `--dp-radius-xs` | 0.25rem | Extra small radius |
| `--dp-radius-sm` | 0.375rem | Small radius |
| `--dp-radius-md` | 0.5rem | Medium radius |
| `--dp-radius-lg` | 0.75rem | Large radius |
| `--dp-radius-xl` | 1rem | Extra large radius |
| `--dp-radius-full` | 9999px | Full/circle radius |

**Shadows:**
| Variable | Default | Description |
|----------|---------|-------------|
| `--dp-shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) | Small shadow |
| `--dp-shadow` | 0 4px 16px ... | Default shadow |
| `--dp-shadow-lg` | 0 8px 32px ... | Large shadow |

**Other:**
| Variable | Default | Description |
|----------|---------|-------------|
| `--dp-transition` | 150ms ease | Animation timing |
| `--dp-disabled-opacity` | 0.35 | Disabled state opacity |

### Inline Style Overrides (React)

```tsx
<div style={{
  '--dp-accent': '#e11d48',
  '--dp-accent-hover': '#be123c',
} as React.CSSProperties}>
  <DatePicker id="brand" />
</div>
```

---

## Trigger Styles

The `triggerStyle` prop controls the trigger appearance:

```tsx
<DatePicker triggerStyle="default" />   // Full input + icon (default)
<DatePicker triggerStyle="icon" />      // Circular icon-only button
<DatePicker triggerStyle="minimal" />   // Underline only, no box
<DatePicker triggerStyle="pill" />      // Rounded, accent-filled
<DatePicker triggerStyle="ghost" />     // Transparent, border on hover
```

---

## CSS Class Reference

All component classes use the `dp-` prefix.

**Layout:** `dp-container`, `dp-input-group`, `dp-datetime-picker`

**Trigger:** `dp-trigger`, `dp-trigger--icon`, `dp-trigger--minimal`, `dp-trigger--pill`, `dp-trigger--ghost`, `dp-trigger-placeholder`, `dp-trigger-icon`, `dp-trigger-icon-btn`, `dp-trigger-chevron`

**Input:** `dp-input`, `dp-input--minimal`, `dp-input--pill`, `dp-input--ghost`

**Popover:** `dp-popover`

**Calendar:** `dp-header`, `dp-title`, `dp-nav-btn`, `dp-calendar-grid`, `dp-calendar-header-cell`, `dp-calendar-cell`, `dp-calendar-cell-inner`

**Cell States:** `dp-today`, `dp-selected`, `dp-outside-month`, `dp-disabled`, `dp-in-range`, `dp-start-range`, `dp-end-range`, `dp-hover-range`, `dp-special-dot`

**Range Input:** `dp-range-input-group`, `dp-range-input`, `dp-range-sep`

**Time:** `dp-time-picker`, `dp-spin-group`, `dp-spin-btn`, `dp-spin-value`, `dp-spin-sep`, `dp-period-btn`, `dp-time-icon`

**Time Input:** `dp-time-input`, `dp-time-input-segment`, `dp-time-input-sep`, `dp-time-input-divider`, `dp-time-input-period`

**Time Popover:** `dp-time-popover-container`, `dp-time-popover`, `dp-time-popover-header`, `dp-time-popover-body`, `dp-time-popover-footer`

**Footer:** `dp-footer`, `dp-footer-btn`, `dp-footer-clear`, `dp-footer-apply`, `dp-custom-footer`

**Presets:** `dp-presets`, `dp-preset-btn`

**Field Wrapper:** `dp-field`, `dp-field-label-row`, `dp-field-label`, `dp-field-required`, `dp-field-label-action`, `dp-field-control`, `dp-field-hint`, `dp-field-msg`, `dp-field-msg-icon`, `dp-field-msg--error`, `dp-field-msg--success`, `dp-field-msg--warning`

**Data Attributes:** `data-dp-theme`, `data-dp-density`, `data-dp-trigger`, `data-dp-open`

---

## Utility Exports

### Date Utilities

```tsx
import {
  cloneDate,          // (date: Date) => Date
  isSameDay,          // (a: Date, b: Date) => boolean
  isSameMonth,        // (a: Date, b: Date) => boolean
  isBefore,           // (a: Date, b: Date) => boolean
  isAfter,            // (a: Date, b: Date) => boolean
  isInRange,          // (date: Date, start: Date, end: Date) => boolean
  isToday,            // (date: Date) => boolean
  isOutOfRange,       // (date: Date, min?: Date, max?: Date) => boolean
  addDays,            // (date: Date, n: number) => Date
  addMonths,          // (date: Date, n: number) => Date
  addYears,           // (date: Date, n: number) => Date
  buildCalendarGrid,  // (viewDate: Date, firstDay: number) => Date[][]
  toDate,             // (value: unknown) => Date
  toISODateString,    // (date: Date) => string  "YYYY-MM-DD"
  toISODateTimeString,// (date: Date) => string  "YYYY-MM-DDTHH:mm:ss"
  parseISODateString, // (str: string) => Date
  setTime,            // (date: Date, h, m, s?) => Date
  combineDateAndTime, // (date: Date, time: Date) => Date
} from '@reactzero/datepicker';
```

### Intl Utilities

```tsx
import {
  resolveLocale,       // (locale?: string) => string
  getFirstDayOfWeek,   // (locale: string) => number
  isRTL,               // (locale: string) => boolean
  formatDate,          // (date: Date, locale?: string) => string
  formatDateRange,     // (start: Date, end: Date, locale?: string) => string
  formatMonthYear,     // (date: Date, locale?: string) => string  "March 2024"
  formatAccessibleDate,// (date: Date, locale?: string) => string
  formatTime,          // (date: Date, locale?: string) => string
  formatWeekday,       // (date: Date, locale?: string, style?) => string
  formatDay,           // (date: Date, locale?: string) => string
  getWeekdayNames,     // (locale?: string, style?) => string[]
  getWeekdayLabels,    // (locale?: string) => string[]
  getMonthNames,       // (locale?: string, style?) => string[]
  detectHourCycle,     // (locale?: string) => 'h12' | 'h24'
  clearFormatterCache, // () => void  — for SSR / testing
} from '@reactzero/datepicker';
```

### Other

```tsx
import { mergeRefs } from '@reactzero/datepicker';
// mergeRefs(...refs) — combine multiple refs into one
```

---

## Common Patterns

### Controlled vs Uncontrolled

```tsx
// Controlled — you manage state
const [date, setDate] = useState<Date | null>(null);
<DatePicker value={date ?? undefined} onChange={setDate} />

// Uncontrolled — component manages state internally
<DatePicker defaultValue={new Date()} />
```

### Form Integration

```tsx
// With hidden input for native form submission
<DatePicker id="checkout" name="checkout_date" required />

// With FieldWrapper for labels/errors
<FieldWrapper label="Check-in" error={errors.checkin} required>
  <DatePicker id="checkin" name="checkin_date" />
</FieldWrapper>
```

### i18n / Locale

```tsx
// Spanish locale, week starts Monday
<DatePicker locale="es-ES" weekStartsOn={1} />

// Japanese locale
<DatePicker locale="ja-JP" />

// RTL (Arabic) — automatically detected
<DatePicker locale="ar-SA" />
```

### Combined Date + Time

```tsx
// Using DateTimePicker
<DateTimePicker id="event" layout="row" hourCycle="h12" />

// Manual composition
<div style={{ display: 'flex', gap: '1rem' }}>
  <DatePicker id="event-date" value={date} onChange={setDate} />
  <TimePicker id="event-time" value={time} onChange={setTime} />
</div>
```

### Headless Example (Full)

```tsx
import { useDatePicker } from '@reactzero/datepicker';

function CustomDatePicker() {
  const {
    state,
    isOpen,
    toggle,
    close,
    getContainerProps,
    getTriggerProps,
    getDialogProps,
    getGridProps,
    getCellProps,
  } = useDatePicker({
    closeOnSelect: true,
    locale: 'en-US',
  });

  return (
    <div {...getContainerProps()}>
      <button {...getTriggerProps()} onClick={toggle}>
        {state.selectedDate?.toLocaleDateString() ?? 'Pick a date'}
      </button>

      {isOpen && (
        <div {...getDialogProps()} style={{ position: 'absolute', background: '#fff', border: '1px solid #ccc', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <button onClick={state.goToPreviousMonth}>Prev</button>
            <span>{state.viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <button onClick={state.goToNextMonth}>Next</button>
          </div>

          <table {...getGridProps()}>
            <tbody>
              {state.grid.map((week, i) => (
                <tr key={i}>
                  {week.map((date) => {
                    const props = getCellProps(date);
                    return (
                      <td key={date.toISOString()} {...props}
                        style={{
                          padding: 4,
                          textAlign: 'center',
                          cursor: props['aria-disabled'] ? 'not-allowed' : 'pointer',
                          opacity: state.isOutsideMonth(date) ? 0.3 : 1,
                          background: state.isSelected(date) ? '#2563eb' : 'transparent',
                          color: state.isSelected(date) ? '#fff' : 'inherit',
                          borderRadius: '50%',
                        }}
                      >
                        {date.getDate()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## Browser Support

ES2020 target. All browsers supporting React 18:
- Chrome/Edge 80+
- Firefox 80+
- Safari 14.1+

## Accessibility

- WCAG 2.1 AA compliant
- ARIA grid pattern for calendar
- ARIA spinbutton pattern for time
- Full keyboard navigation (Arrow keys, Enter, Escape, Tab)
- Screen reader tested
- Focus management (trap in dialog, restore on close)
- `aria-live` announcements for month changes

---

*Generated for @reactzero/datepicker v0.1.0 — https://github.com/motiondesignlv/ReactZero-DatePicker*
