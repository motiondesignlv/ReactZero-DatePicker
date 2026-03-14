import { useState, useCallback } from 'react';
import { DatePicker, type DatePickerProps, type DpTheme, type DpDensity } from './DatePicker';
import { TimePicker } from './TimePicker';
import type { TimePickerOptions } from '../hooks';

export interface DateTimePickerProps
  extends Omit<DatePickerProps, 'onChange'>,
    Omit<TimePickerOptions, 'value' | 'defaultValue' | 'onChange'> {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  layout?: 'row' | 'column';
  className?: string;
  theme?: DpTheme;
  density?: DpDensity;
}

export function DateTimePicker({
  value,
  defaultValue,
  onChange,
  layout = 'column',
  className = '',
  theme,
  density,
  minuteStep,
  hourCycle,
  granularity,
  disabledHours,
  disabledMinutes,
  blockedTimes,
  minTime,
  maxTime,
  ...datePickerProps
}: DateTimePickerProps) {
  const isControlled = value !== undefined;
  const [internalDate, setInternalDate] = useState<Date | null>(defaultValue ?? null);
  const combined = isControlled ? value : internalDate;

  const handleDateChange = useCallback((newDate: Date | null) => {
    if (!newDate) {
      if (!isControlled) setInternalDate(null);
      onChange?.(null);
      return;
    }
    // Preserve existing time part when date changes
    const merged = new Date(newDate);
    if (combined) {
      merged.setHours(combined.getHours(), combined.getMinutes(), combined.getSeconds(), 0);
    }
    if (!isControlled) setInternalDate(merged);
    onChange?.(merged);
  }, [combined, isControlled, onChange]);

  const handleTimeChange = useCallback((newTime: Date | null) => {
    if (!newTime) return;
    // Preserve existing date part when time changes
    const merged = new Date(combined ?? newTime);
    merged.setHours(newTime.getHours(), newTime.getMinutes(), newTime.getSeconds(), 0);
    if (!isControlled) setInternalDate(merged);
    onChange?.(merged);
  }, [combined, isControlled, onChange]);

  // Expose only date part to DatePicker, only time part to TimePicker
  const datePart = combined ? new Date(combined.getFullYear(), combined.getMonth(), combined.getDate()) : null;

  return (
    <div className={`dp-datetime-picker dp-layout-${layout} ${className}`}>
      <DatePicker
        {...datePickerProps}
        value={datePart}
        onChange={handleDateChange}
        theme={theme}
        density={density}
      />
      <TimePicker
        value={combined}
        onChange={handleTimeChange}
        minuteStep={minuteStep}
        hourCycle={hourCycle}
        granularity={granularity}
        disabledHours={disabledHours}
        disabledMinutes={disabledMinutes}
        blockedTimes={blockedTimes}
        minTime={minTime}
        maxTime={maxTime}
        theme={theme}
        density={density}
        aria-label="Time"
      />
    </div>
  );
}
