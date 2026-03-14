import React, { useState, useCallback, useRef } from 'react';

export type TimeGranularity = 'hour' | 'minute' | 'second';
export type HourCycle = 'h12' | 'h24' | 'h23' | 'h11';

export interface BlockedTimeSlot {
  /** 24-hour "HH:MM" format */
  start: string;
  end: string;
  label?: string;
}

export interface TimePickerOptions {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  minTime?: Date;
  maxTime?: Date;
  minuteStep?: number;
  hourCycle?: HourCycle;
  id?: string;
  granularity?: TimeGranularity;
  disabled?: boolean;
  'aria-label'?: string;
  /** Discrete list of hours (0-23) that are not selectable */
  disabledHours?: number[];
  /** Discrete list of minutes (0-59), or a per-hour function, that are not selectable */
  disabledMinutes?: number[] | ((hour: number) => number[]);
  /** Specific time ranges that are blocked (e.g. booked slots) */
  blockedTimes?: BlockedTimeSlot[];
}

/** Parse "HH:MM" into { h, m } */
function parseHHMM(str: string): { h: number; m: number } {
  const [h, m] = str.split(':').map(Number);
  return { h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m };
}

/** Return total minutes since midnight */
function toMinutes(h: number, m: number): number {
  return h * 60 + m;
}

export function useTimePicker(options: TimePickerOptions = {}) {
  const {
    value,
    defaultValue,
    onChange,
    minTime,
    maxTime,
    minuteStep = 1,
    hourCycle = 'h12',
    id: _id = 'timepicker',
    granularity: _granularity = 'minute',
    disabled = false,
    disabledHours = [],
    disabledMinutes = [],
    blockedTimes = [],
  } = options;

  const isControlled = value !== undefined;
  const [internalDate, setInternalDate] = useState<Date | null>(defaultValue || null);
  const selectedTime = isControlled ? value : internalDate;

  // Always ensure activeTime is a valid Date
  const rawActive = selectedTime instanceof Date && !isNaN(selectedTime.getTime())
    ? selectedTime
    : (selectedTime
        ? new Date(selectedTime as any)
        : null);
  const activeTime = (rawActive && !isNaN((rawActive as Date).getTime())) ? rawActive : new Date();
  const format12 = hourCycle === 'h12' || hourCycle === 'h11';

  // ── Segment filled tracking ────────────────────────────────────────────
  const hasInitialValue = value !== undefined || defaultValue !== undefined;
  const [segmentFilled, setSegmentFilled] = useState({
    hour: !!hasInitialValue,
    minute: !!hasInitialValue,
    second: !!hasInitialValue,
  });
  const segmentFilledRef = useRef(segmentFilled);
  segmentFilledRef.current = segmentFilled;

  // ── Digit buffer for two-digit entry ───────────────────────────────────
  const digitBufferRef = useRef<{ value: string; timer: ReturnType<typeof setTimeout> | null }>({
    value: '', timer: null,
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  const isHourDisabled = useCallback((h: number): boolean => {
    return disabledHours.includes(h);
  }, [disabledHours]);

  const isMinuteDisabled = useCallback((m: number, h: number): boolean => {
    if (Array.isArray(disabledMinutes)) return disabledMinutes.includes(m);
    return disabledMinutes(h).includes(m);
  }, [disabledMinutes]);

  const isTimeBlocked = useCallback((date: Date): { blocked: boolean; label?: string } => {
    if (!blockedTimes.length) return { blocked: false };
    const totalMins = toMinutes(date.getHours(), date.getMinutes());
    for (const slot of blockedTimes) {
      const { h: sh, m: sm } = parseHHMM(slot.start);
      const { h: eh, m: em } = parseHHMM(slot.end);
      if (totalMins >= toMinutes(sh, sm) && totalMins < toMinutes(eh, em)) {
        return { blocked: true, label: slot.label };
      }
    }
    return { blocked: false };
  }, [blockedTimes]);

  // ── Check if all segments filled for current granularity ───────────────

  const canFireOnChange = useCallback((overrides?: Partial<typeof segmentFilled>) => {
    const filled = { ...segmentFilledRef.current, ...overrides };
    if (!filled.hour) return false;
    if (_granularity !== 'hour' && !filled.minute) return false;
    if (_granularity === 'second' && !filled.second) return false;
    return true;
  }, [_granularity]);

  // ── Core update ──────────────────────────────────────────────────────────

  const updateTime = useCallback((newTime: Date, segment?: 'hour' | 'minute' | 'second') => {
    if (disabled) return;
    if (minTime && newTime.getTime() < minTime.getTime()) return;
    if (maxTime && newTime.getTime() > maxTime.getTime()) return;
    if (isHourDisabled(newTime.getHours())) return;
    if (isMinuteDisabled(newTime.getMinutes(), newTime.getHours())) return;
    if (isTimeBlocked(newTime).blocked) return;

    if (!isControlled) {
      setInternalDate(newTime);
    }

    const overrides = segment ? { [segment]: true } : {};
    if (segment) {
      setSegmentFilled(prev => {
        if (prev[segment]) return prev;
        return { ...prev, [segment]: true };
      });
    }

    if (canFireOnChange(overrides)) {
      onChange?.(newTime);
    }
  }, [isControlled, onChange, minTime, maxTime, disabled, isHourDisabled, isMinuteDisabled, isTimeBlocked, canFireOnChange]);

  // ── Increment / Decrement helpers ─────────────────────────────────────────

  const incrementHour = useCallback(() => {
    const d = new Date(activeTime);
    let next = d.getHours() + 1;
    for (let i = 0; i < 24; i++) {
      if (!isHourDisabled(next % 24)) break;
      next++;
    }
    d.setHours(next % 24);
    updateTime(d, 'hour');
  }, [activeTime, updateTime, isHourDisabled]);

  const decrementHour = useCallback(() => {
    const d = new Date(activeTime);
    let prev = d.getHours() - 1;
    for (let i = 0; i < 24; i++) {
      if (!isHourDisabled(((prev % 24) + 24) % 24)) break;
      prev--;
    }
    d.setHours(((prev % 24) + 24) % 24);
    updateTime(d, 'hour');
  }, [activeTime, updateTime, isHourDisabled]);

  const incrementMinute = useCallback(() => {
    const d = new Date(activeTime);
    let next = d.getMinutes() + minuteStep;
    const h = d.getHours();
    for (let i = 0; i < 60; i++) {
      if (!isMinuteDisabled(next % 60, h)) break;
      next += minuteStep;
    }
    d.setMinutes(next % 60);
    updateTime(d, 'minute');
  }, [activeTime, minuteStep, updateTime, isMinuteDisabled]);

  const decrementMinute = useCallback(() => {
    const d = new Date(activeTime);
    let prev = d.getMinutes() - minuteStep;
    const h = d.getHours();
    for (let i = 0; i < 60; i++) {
      const normalized = ((prev % 60) + 60) % 60;
      if (!isMinuteDisabled(normalized, h)) break;
      prev -= minuteStep;
    }
    d.setMinutes(((prev % 60) + 60) % 60);
    updateTime(d, 'minute');
  }, [activeTime, minuteStep, updateTime, isMinuteDisabled]);

  const incrementSecond = useCallback(() => {
    const d = new Date(activeTime);
    d.setSeconds(d.getSeconds() + 1);
    updateTime(d, 'second');
  }, [activeTime, updateTime]);

  const decrementSecond = useCallback(() => {
    const d = new Date(activeTime);
    d.setSeconds(d.getSeconds() - 1);
    updateTime(d, 'second');
  }, [activeTime, updateTime]);

  const toggleAmPm = useCallback(() => {
    const d = new Date(activeTime);
    const h = d.getHours();
    d.setHours(h >= 12 ? h - 12 : h + 12);
    updateTime(d);
  }, [activeTime, updateTime]);

  // ── Keyboard handler ──────────────────────────────────────────────────────

  const handleKeyDown = (
    e: React.KeyboardEvent,
    increment: () => void,
    decrement: () => void,
    min: number,
    max: number,
    setExact: (val: number) => void,
    segmentType: 'hour' | 'minute' | 'second',
    pageIncrement?: () => void,
    pageDecrement?: () => void,
  ) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowUp') { e.preventDefault(); increment(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); decrement(); }
    if (e.key === 'PageUp') {
      e.preventDefault();
      if (pageIncrement) pageIncrement();
      else increment();
    }
    if (e.key === 'PageDown') {
      e.preventDefault();
      if (pageDecrement) pageDecrement();
      else decrement();
    }
    if (e.key === 'Home') { e.preventDefault(); setExact(min); }
    if (e.key === 'End') { e.preventDefault(); setExact(max); }
    if (e.key === 'Backspace') {
      e.preventDefault();
      setSegmentFilled(prev => {
        if (!prev[segmentType]) return prev;
        return { ...prev, [segmentType]: false };
      });
    }
  };

  // ── Page-step functions ─────────────────────────────────────────────────

  const incrementHourByPage = useCallback(() => {
    const d = new Date(activeTime);
    d.setHours((d.getHours() + 3) % 24);
    updateTime(d, 'hour');
  }, [activeTime, updateTime]);

  const decrementHourByPage = useCallback(() => {
    const d = new Date(activeTime);
    d.setHours(((d.getHours() - 3) % 24 + 24) % 24);
    updateTime(d, 'hour');
  }, [activeTime, updateTime]);

  const incrementMinuteByPage = useCallback(() => {
    const d = new Date(activeTime);
    d.setMinutes((d.getMinutes() + 10) % 60);
    updateTime(d, 'minute');
  }, [activeTime, updateTime]);

  const decrementMinuteByPage = useCallback(() => {
    const d = new Date(activeTime);
    d.setMinutes(((d.getMinutes() - 10) % 60 + 60) % 60);
    updateTime(d, 'minute');
  }, [activeTime, updateTime]);

  // ── Prop getters ──────────────────────────────────────────────────────────

  const getHourProps = () => {
    const rawHours = activeTime.getHours();
    let displayHours = rawHours;
    if (format12) {
      displayHours = rawHours % 12 || 12;
    }

    const setExactHour = (val: number) => {
      const d = new Date(activeTime);
      d.setHours(val);
      updateTime(d, 'hour');
    };

    return {
      role: 'spinbutton' as const,
      'data-type': 'hour',
      'aria-label': 'Hour',
      'aria-valuenow': displayHours,
      'aria-valuemin': format12 ? 1 : 0,
      'aria-valuemax': format12 ? 12 : 23,
      'aria-valuetext': format12 ? `${displayHours} ${rawHours >= 12 ? 'PM' : 'AM'}` : `${displayHours}`,
      'aria-disabled': isHourDisabled(rawHours) ? true : undefined,
      tabIndex: disabled ? -1 : 0,
      onKeyDown: (e: React.KeyboardEvent) => {
        handleKeyDown(e, incrementHour, decrementHour, format12 ? 1 : 0, format12 ? 12 : 23, setExactHour, 'hour', incrementHourByPage, decrementHourByPage);
        if (!disabled && (e.key === 'a' || e.key === 'A')) {
          e.preventDefault();
          if (rawHours >= 12) toggleAmPm();
        }
        if (!disabled && (e.key === 'p' || e.key === 'P')) {
          e.preventDefault();
          if (rawHours < 12) toggleAmPm();
        }
        // Two-digit entry
        if (!disabled && /^[0-9]$/.test(e.key)) {
          e.preventDefault();
          const buf = digitBufferRef.current;
          if (buf.timer) clearTimeout(buf.timer);

          const newBuf = buf.value + e.key;
          const num = parseInt(newBuf, 10);
          const maxVal = format12 ? 12 : 23;

          if (newBuf.length >= 2 || num > Math.floor(maxVal / 10)) {
            const finalVal = num <= maxVal ? num : parseInt(e.key, 10);
            setExactHour(finalVal);
            digitBufferRef.current = { value: '', timer: null };
          } else {
            setExactHour(num);
            digitBufferRef.current = {
              value: newBuf,
              timer: setTimeout(() => {
                digitBufferRef.current = { value: '', timer: null };
              }, 1000),
            };
          }
        }
      }
    };
  };

  const getMinuteProps = () => {
    const currentHour = activeTime.getHours();
    const currentMinute = activeTime.getMinutes();

    const setExactMin = (val: number) => {
      const d = new Date(activeTime);
      d.setMinutes(val);
      updateTime(d, 'minute');
    };

    return {
      role: 'spinbutton' as const,
      'data-type': 'minute',
      'aria-label': 'Minute',
      'aria-valuenow': currentMinute,
      'aria-valuemin': 0,
      'aria-valuemax': 59,
      'aria-disabled': isMinuteDisabled(currentMinute, currentHour) ? true : undefined,
      tabIndex: disabled ? -1 : 0,
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, incrementMinute, decrementMinute, 0, 59, setExactMin, 'minute', incrementMinuteByPage, decrementMinuteByPage)
    };
  };

  const getSecondProps = () => {
    const setExactSec = (val: number) => {
      const d = new Date(activeTime);
      d.setSeconds(val);
      updateTime(d, 'second');
    };

    return {
      role: 'spinbutton' as const,
      'data-type': 'second',
      'aria-label': 'Second',
      'aria-valuenow': activeTime.getSeconds(),
      'aria-valuemin': 0,
      'aria-valuemax': 59,
      tabIndex: disabled ? -1 : 0,
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, incrementSecond, decrementSecond, 0, 59, setExactSec, 'second')
    };
  };

  const getPeriodProps = () => {
    return {
      'data-type': 'period',
      'aria-label': 'AM/PM',
      tabIndex: disabled ? -1 : 0,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          toggleAmPm();
        }
      },
      onClick: () => {
        if (!disabled) toggleAmPm();
      }
    };
  };

  // ── Display values ─────────────────────────────────────────────────────

  const hourDisplay = segmentFilled.hour
    ? (format12 ? String(activeTime.getHours() % 12 || 12).padStart(2, '0') : String(activeTime.getHours()).padStart(2, '0'))
    : '--';
  const minuteDisplay = segmentFilled.minute
    ? String(activeTime.getMinutes()).padStart(2, '0')
    : '--';
  const secondDisplay = segmentFilled.second
    ? String(activeTime.getSeconds()).padStart(2, '0')
    : '--';
  const periodDisplay = activeTime.getHours() >= 12 ? 'PM' : 'AM';

  return {
    selectedTime,
    activeTime,
    format12,
    isHourDisabled,
    isMinuteDisabled,
    isTimeBlocked,
    incrementHour,
    decrementHour,
    incrementMinute,
    decrementMinute,
    incrementSecond,
    decrementSecond,
    toggleAmPm,
    getHourProps,
    getMinuteProps,
    getSecondProps,
    getPeriodProps,
    hourDisplay,
    minuteDisplay,
    secondDisplay,
    periodDisplay,
    segmentFilled,
  };
}
