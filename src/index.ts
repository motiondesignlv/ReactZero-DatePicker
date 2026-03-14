// ── Styles (extracted by Vite as dist/style.css) ────────────────────────────
import './styles/datepicker.css';

// ── Components ──────────────────────────────────────────────────────────────
export { DatePicker } from './components/DatePicker';
export type { DatePickerProps, DpTheme, DpDensity, DpTriggerStyle } from './components/DatePicker';

export { TimePicker } from './components/TimePicker';
export type { TimePickerProps, TimePickerMode, TimePickerTriggerStyle } from './components/TimePicker';

export { DateRangePicker } from './components/DateRangePicker';
export type { DateRangePickerProps } from './components/DateRangePicker';

export { DateTimePicker } from './components/DateTimePicker';
export type { DateTimePickerProps } from './components/DateTimePicker';

export { CalendarGrid } from './components/CalendarGrid';
export type { CalendarGridProps } from './components/CalendarGrid';

export { FieldWrapper } from './components/FieldWrapper';
export type { FieldWrapperProps, FieldStatus } from './components/FieldWrapper';

export { TimeInput } from './components/TimeInput';
export type { TimeInputProps } from './components/TimeInput';

// ── Hooks ───────────────────────────────────────────────────────────────────
export { useDatePicker } from './hooks/useDatePicker';
export type { DatePickerOptions } from './hooks/useDatePicker';

export { useTimePicker } from './hooks/useTimePicker';
export type { TimePickerOptions, TimeGranularity, HourCycle, BlockedTimeSlot } from './hooks/useTimePicker';

export { useRangePicker } from './hooks/useRangePicker';
export type { RangePickerOptions, DateRange } from './hooks/useRangePicker';

export { useCalendarState, useControllableState } from './hooks/useCalendarState';
export type { CalendarStateOptions, CalendarView, SpecialDay } from './hooks/useCalendarState';

// ── Utilities ───────────────────────────────────────────────────────────────
export {
  cloneDate,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  isInRange,
  isToday,
  isOutOfRange,
  addDays,
  addMonths,
  addYears,
  buildCalendarGrid,
  toDate,
  toISODateString,
  toISODateTimeString,
  parseISODateString,
  setTime,
  combineDateAndTime,
} from './utils/date';

export {
  resolveLocale,
  getFirstDayOfWeek,
  isRTL,
  formatDate,
  formatDateRange,
  formatMonthYear,
  formatAccessibleDate,
  formatTime,
  formatWeekday,
  formatDay,
  getWeekdayNames,
  getWeekdayLabels,
  getMonthNames,
  detectHourCycle,
  clearFormatterCache,
} from './utils/intl';

export { mergeRefs } from './utils/mergeRefs';
