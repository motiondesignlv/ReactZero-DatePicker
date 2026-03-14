import { useState, useCallback, useMemo } from 'react';
import { 
  addMonths, 
  addYears, 
  buildCalendarGrid, 
  getFirstDayOfWeek, 
  isSameDay, 
  isSameMonth, 
  isOutOfRange,
  getWeekdayLabels,
  toDate,
} from '../utils';

export function useControllableState<T>({ value, defaultValue, onChange }: { value?: T, defaultValue?: T, onChange?: (val: T) => void }): [T, (val: T) => void] {
  const [internalState, setInternalState] = useState<T>(defaultValue as T);
  const isControlled = value !== undefined;
  
  const state = isControlled ? value : internalState;
  
  const setState = useCallback((newState: T) => {
    if (!isControlled) {
      setInternalState(newState);
    }
    onChange?.(newState);
  }, [isControlled, onChange]);
  
  return [state, setState];
}

export type CalendarView = 'days' | 'months' | 'years';

export interface SpecialDay {
  /** Label shown as a tooltip / aria description on the cell */
  label?: string;
  /** Extra CSS class applied to the cell */
  className?: string;
  /** Optional dot/badge colour, e.g. '#ef4444' */
  dotColor?: string;
}

export interface CalendarStateOptions {
  value?: Date | null;
  defaultValue?: Date | null;
  selectedDate?: Date | null; 
  defaultViewDate?: Date;
  onChange?: (date: Date | null) => void;
  min?: Date;
  max?: Date;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
  weekStartsOn?: number;
  firstDayOfWeek?: number;
  isDateDisabled?: (date: Date) => boolean;
  /**
   * Mark specific dates with custom styling / labels.
   * Can be a static array (each item has a `date` field) or a function called per cell.
   */
  specialDays?: (SpecialDay & { date: Date })[] | ((date: Date) => SpecialDay | undefined);
}

export function useCalendarState(options: CalendarStateOptions = {}) {
  const minLimit = toDate(options.min || options.minDate);
  const maxLimit = toDate(options.max || options.maxDate);
  const firstDay = options.weekStartsOn ?? options.firstDayOfWeek ?? getFirstDayOfWeek(options.locale);

  // Normalize raw values — Storybook controls (and some consumers) may pass strings/timestamps
  const normalizedValue = toDate(options.value !== undefined ? options.value : options.selectedDate);
  const normalizedDefault = toDate(options.defaultValue || options.selectedDate);

  const [selectedDate, setSelectedDate] = useControllableState<Date | null>({
    value: options.value !== undefined ? normalizedValue : undefined,
    defaultValue: normalizedDefault,
    onChange: options.onChange,
  });

  const [viewDate, setViewDateState] = useState<Date>(() => {
    if (options.defaultViewDate) return options.defaultViewDate;
    if (selectedDate) return new Date(selectedDate);
    return new Date();
  });

  const [focusedDate, setFocusedDate] = useState<Date>(() => viewDate);
  const [view, setView] = useState<CalendarView>('days');

  const weeks = useMemo(() => {
    return buildCalendarGrid(viewDate.getFullYear(), viewDate.getMonth(), firstDay);
  }, [viewDate, firstDay]);

  const weekdayLabels = useMemo(() => {
    return getWeekdayLabels(options.locale || 'en-US', firstDay);
  }, [options.locale, firstDay]);

  const navigatePrevious = useCallback(() => {
    setViewDateState(d => {
      if (view === 'days') return addMonths(d, -1);
      if (view === 'months') return addYears(d, -1);
      return addYears(d, -20);
    });
  }, [view]);

  const navigateNext = useCallback(() => {
    setViewDateState(d => {
      if (view === 'days') return addMonths(d, 1);
      if (view === 'months') return addYears(d, 1);
      return addYears(d, 20);
    });
  }, [view]);

  const navigateToDate = useCallback((date: Date) => {
    setViewDateState(date);
    setView('days');
    setFocusedDate(date);
  }, []);

  const setViewDate = useCallback((date: Date) => {
    setViewDateState(date);
  }, []);

  const isSelected = useCallback((date: Date) => {
    return selectedDate ? isSameDay(date, selectedDate) : false;
  }, [selectedDate]);

  const isFocused = useCallback((date: Date) => {
    return isSameDay(date, focusedDate);
  }, [focusedDate]);

  const isDisabled = useCallback((date: Date) => {
    if (isOutOfRange(date, minLimit, maxLimit)) return true;
    if (options.isDateDisabled?.(date)) return true;
    return false;
  }, [minLimit, maxLimit, options]);

  const isOutsideMonth = useCallback((date: Date) => {
    return !isSameMonth(date, viewDate);
  }, [viewDate]);

  const getSpecialDay = useCallback((date: Date): SpecialDay | undefined => {
    const { specialDays } = options;
    if (!specialDays) return undefined;
    if (typeof specialDays === 'function') return specialDays(date);
    return specialDays.find(s => isSameDay(s.date, date));
  }, [options]);

  // Backward-compatibility aliases for wrapper DatePicker components that used old terminology:
  const grid = weeks;
  const goToPreviousMonth = navigatePrevious;
  const goToNextMonth = navigateNext;
  const goToPreviousYear = () => setViewDateState(d => addYears(d, -1));
  const goToNextYear = () => setViewDateState(d => addYears(d, 1));

  return {
    view,
    setView,
    viewDate,
    setViewDate,
    selectedDate,
    setSelectedDate,
    focusedDate,
    setFocusedDate,
    weeks,
    grid, /* alias */
    weekdayLabels,
    navigatePrevious,
    navigateNext,
    navigateToDate,
    goToPreviousMonth, /* alias */
    goToNextMonth, /* alias */
    goToPreviousYear, /* alias */
    goToNextYear, /* alias */
    isSelected,
    isFocused,
    isDisabled,
    isOutsideMonth,
    getSpecialDay,
    firstDayOfWeek: firstDay /* alias */
  };
}
