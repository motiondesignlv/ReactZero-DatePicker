import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useCalendarState, type CalendarStateOptions } from './useCalendarState';
import { addDays, isSameDay, toISODateString, formatAccessibleDate } from '../utils';

export interface DatePickerOptions extends CalendarStateOptions {
  id?: string;
  name?: string;
  closeOnSelect?: boolean;
  'aria-label'?: string;
}

export function useDatePicker(options: DatePickerOptions = {}) {
  const { id = 'dp', name, closeOnSelect = true, ...calendarOptions } = options;
  const state = useCalendarState(calendarOptions);

  const [isOpen, setIsOpen] = useState(false);
  const [focusedDate, setFocusedDate] = useState<Date>(
    state.selectedDate ? new Date(state.selectedDate) : new Date()
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  // Sync focused date when opening
  useEffect(() => {
    if (isOpen) {
      setFocusedDate(state.selectedDate ? new Date(state.selectedDate) : new Date());
    }
  }, [isOpen, state.selectedDate]);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  // Close on Escape (document-level so it works regardless of focus location)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  const handleCellSelect = useCallback(
    (date: Date) => {
      state.setSelectedDate(date);
      if (closeOnSelect) close();
    },
    [state, closeOnSelect, close]
  );

  const getContainerProps = () => ({
    ref: containerRef,
    id: `${id}-container`,
    'data-datepicker': true,
  });

  const getTriggerProps = () => ({
    ref: triggerRef,
    id: `${id}-trigger`,
    type: 'button' as const,
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': isOpen,
    onClick: toggle,
  });

  const getDialogProps = () => ({
    id: `${id}-dialog`,
    role: 'dialog' as const,
    'aria-modal': true,
    'aria-label': 'Choose date',
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    },
  });

  const getGridProps = () => ({
    role: 'grid' as const,
    'aria-labelledby': `${id}-heading`,
    onKeyDown: (e: React.KeyboardEvent) => {
      let nextDate: Date | null = null;
      switch (e.key) {
        case 'ArrowLeft':
          nextDate = addDays(focusedDate, -1);
          break;
        case 'ArrowRight':
          nextDate = addDays(focusedDate, 1);
          break;
        case 'ArrowUp':
          nextDate = addDays(focusedDate, -7);
          break;
        case 'ArrowDown':
          nextDate = addDays(focusedDate, 7);
          break;
        case 'PageUp':
          if (e.shiftKey) {
            nextDate = new Date(focusedDate.getFullYear() - 1, focusedDate.getMonth(), focusedDate.getDate());
          } else {
            nextDate = new Date(focusedDate.getFullYear(), focusedDate.getMonth() - 1, focusedDate.getDate());
          }
          break;
        case 'PageDown':
          if (e.shiftKey) {
            nextDate = new Date(focusedDate.getFullYear() + 1, focusedDate.getMonth(), focusedDate.getDate());
          } else {
            nextDate = new Date(focusedDate.getFullYear(), focusedDate.getMonth() + 1, focusedDate.getDate());
          }
          break;
        case 'Home':
          nextDate = addDays(focusedDate, -focusedDate.getDay());
          break;
        case 'End':
          nextDate = addDays(focusedDate, 6 - focusedDate.getDay());
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!state.isDisabled(focusedDate)) {
            handleCellSelect(focusedDate);
          }
          return;
      }

      if (nextDate) {
        e.preventDefault();
        setFocusedDate(nextDate);
        if (nextDate.getMonth() !== state.viewDate.getMonth() || nextDate.getFullYear() !== state.viewDate.getFullYear()) {
          state.setViewDate(nextDate);
        }
        // Focus the newly active cell
        requestAnimationFrame(() => {
          const cell = containerRef.current?.querySelector(
            `[data-date="${toISODateString(nextDate as Date)}"]`
          ) as HTMLElement | null;
          cell?.focus();
        });
      }
    },
  });

  const getCellProps = (date: Date) => {
    const isSelected = state.selectedDate ? isSameDay(date, state.selectedDate) : false;
    const isToday = isSameDay(date, new Date());
    const isFocused = isSameDay(date, focusedDate);
    const isDisabled = state.isDisabled(date);
    const isOutsideMonth = date.getMonth() !== state.viewDate.getMonth();
    const special = state.getSpecialDay(date);

    return {
      role: 'gridcell' as const,
      tabIndex: isFocused ? 0 : -1,
      'aria-selected': isSelected ? true : undefined,
      'aria-current': isToday ? 'date' as const : undefined,
      'aria-disabled': isDisabled ? true : undefined,
      'aria-label': formatAccessibleDate(date, options.locale),
      'data-date': toISODateString(date),
      'data-outside-month': isOutsideMonth,
      ...(special?.className ? { 'data-special-class': special.className } : {}),
      ...(special?.label ? { 'data-special-label': special.label } : {}),
      ...(special?.dotColor ? { 'data-special-dot': special.dotColor } : {}),
      onClick: () => {
        if (!isDisabled) {
          setFocusedDate(date);
          handleCellSelect(date);
        }
      },
    };
  };

  return {
    state,
    isOpen,
    setIsOpen,
    close,
    toggle,
    focusedDate,
    setFocusedDate,
    getContainerProps,
    getTriggerProps,
    getDialogProps,
    getGridProps,
    getCellProps,
    handleCellSelect,
  };
}
