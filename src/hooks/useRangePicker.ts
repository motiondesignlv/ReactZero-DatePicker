import { useState, useCallback, type CSSProperties } from 'react';
import { useCalendarState, type CalendarStateOptions } from './useCalendarState';
import { isSameDay, isBefore, isAfter, toISODateString, formatAccessibleDate, startOfDay } from '../utils';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface RangePickerOptions extends Omit<CalendarStateOptions, 'value' | 'defaultValue' | 'onChange'> {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  id?: string;
  closeOnSelect?: boolean;
  /** Minimum number of days in the range (inclusive) */
  minLength?: number;
  /** Maximum number of days in the range (inclusive) */
  maxLength?: number;
}

export function useRangePicker(options: RangePickerOptions = {}) {
  const {
    value,
    defaultValue,
    onChange,
    id = 'rangepicker',
    closeOnSelect = true,
    minLength,
    maxLength,
    ...calendarOptions
  } = options;

  const isControlled = value !== undefined;
  const [internalRange, setInternalRange] = useState<DateRange>(defaultValue || { start: null, end: null });
  const range = isControlled ? value : internalRange;

  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const state = useCalendarState({
    ...calendarOptions,
    value: range?.start || new Date(),
  });

  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const setRange = useCallback((newRange: DateRange) => {
    if (!isControlled) {
      setInternalRange(newRange);
    }
    onChange?.(newRange);
  }, [isControlled, onChange]);

  const clearRange = useCallback(() => {
    setRange({ start: null, end: null });
  }, [setRange]);

  const handleCellSelect = useCallback(
    (date: Date) => {
      let newRange = { start: range?.start || null, end: range?.end || null };

      if (newRange.start && newRange.end) {
        newRange = { start: date, end: null };
      } else if (newRange.start && !newRange.end) {
        if (isBefore(date, newRange.start)) {
          newRange = { start: date, end: newRange.start }; // swap
        } else {
          newRange = { start: newRange.start, end: date };
          if (closeOnSelect) close();
        }
      } else {
        newRange = { start: date, end: null };
      }

      setRange(newRange);
    },
    [range, setRange, closeOnSelect, close]
  );

  /** Calculate the number of days between two dates (inclusive) */
  const daysBetween = (a: Date, b: Date): number => {
    const msPerDay = 86400000;
    return Math.abs(Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / msPerDay)) + 1;
  };

  const getCellProps = (date: Date) => {
    const isStart = range?.start ? isSameDay(date, range.start) : false;
    const isEnd = range?.end ? isSameDay(date, range.end) : false;
    const isSelected = isStart || isEnd;

    let isWithinRange = false;
    if (range?.start && range?.end) {
      isWithinRange = (isAfter(date, range.start) && isBefore(date, range.end)) || isSelected;
    }

    let isHoveringRange = false;
    if (range?.start && !range?.end && hoverDate) {
      if (isAfter(hoverDate, range.start)) {
        isHoveringRange = (isAfter(date, range.start) && isBefore(date, hoverDate)) || isSameDay(date, hoverDate) || isStart;
      }
    }

    // Check base disabled state
    let isDisabled = state.isDisabled(date);

    // Phase 1 constraints: minLength / maxLength
    if (!isDisabled && range?.start && !range?.end && !isSameDay(date, range.start)) {
      const days = daysBetween(date, range.start);
      if (minLength && days < minLength) isDisabled = true;
      if (maxLength && days > maxLength) isDisabled = true;
    }

    const special = state.getSpecialDay(date);
    const isOutsideMonth = date.getMonth() !== state.viewDate.getMonth();

    // Build accessible label with range context
    const baseLabel = formatAccessibleDate(date, options.locale);
    let rangePrefix = '';
    if (isStart) rangePrefix = 'start of range, ';
    else if (isEnd) rangePrefix = 'end of range, ';
    else if (isWithinRange && !isSelected) rangePrefix = 'in range, ';

    return {
      role: 'gridcell' as const,
      tabIndex: -1,
      'aria-selected': isSelected ? true : undefined,
      'aria-disabled': isDisabled ? true : undefined,
      'aria-label': `${rangePrefix}${baseLabel}`,
      'data-date': toISODateString(date),
      'data-outside-month': isOutsideMonth || undefined,
      'data-start': isStart || undefined,
      'data-end': isEnd || undefined,
      'data-in-range': isWithinRange || undefined,
      'data-range-mid': (isWithinRange && !isSelected) ? true : (isHoveringRange && !isSelected) ? true : undefined,
      'data-hover-range': isHoveringRange || undefined,
      ...(special?.className ? { 'data-special-class': special.className } : {}),
      ...(special?.label ? { 'data-special-label': special.label } : {}),
      ...(special?.dotColor ? { 'data-special-dot': special.dotColor } : {}),
      onClick: () => {
        if (!isDisabled) handleCellSelect(date);
      },
      onPointerEnter: () => {
        if (!isDisabled && range?.start && !range?.end) {
          setHoverDate(date);
        }
      },
      onPointerLeave: () => {
        setHoverDate(null);
      }
    };
  };

  const getContainerProps = () => ({});
  const getGroupProps = () => ({ role: 'group' as const });

  const getStartInputProps = () => ({
    'aria-label': 'Start date',
    readOnly: true,
    onClick: toggle,
    style: { cursor: 'pointer' } as CSSProperties,
  });

  const getEndInputProps = () => ({
    'aria-label': 'End date',
    readOnly: true,
    onClick: toggle,
    style: { cursor: 'pointer' } as CSSProperties,
  });

  const getDialogProps = () => ({ role: 'dialog' as const, 'aria-label': 'Select date range' });
  const getGridProps = () => ({ role: 'grid' as const, 'aria-multiselectable': true });

  const getPrevMonthProps = () => ({
    onClick: state.navigatePrevious,
    'aria-label': 'Previous month',
    type: 'button' as const,
  });

  const getNextMonthProps = () => ({
    onClick: state.navigateNext,
    'aria-label': 'Next month',
    type: 'button' as const,
  });

  return {
    state,
    range,
    setRange,
    clearRange,
    isOpen,
    setIsOpen,
    toggle,
    close,
    getCellProps,
    getContainerProps,
    getGroupProps,
    getStartInputProps,
    getEndInputProps,
    getDialogProps,
    getGridProps,
    getPrevMonthProps,
    getNextMonthProps,
  };
}
