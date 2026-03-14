import { useEffect, useRef } from 'react';
import { useRangePicker, type RangePickerOptions } from '../hooks';
import { CalendarGrid } from './CalendarGrid';
import { toISODateString, formatMonthYear } from '../utils';
import type { DpTheme, DpDensity } from './DatePicker';

export interface DateRangePickerProps extends RangePickerOptions {
  className?: string;
  startName?: string;
  endName?: string;
  showFooter?: boolean;
  presets?: { label: string; getValue: () => { start: Date; end: Date } }[];
  theme?: DpTheme;
  density?: DpDensity;
}

export function DateRangePicker({
  className = '',
  startName,
  endName,
  showFooter,
  presets,
  theme,
  density,
  ...options
}: DateRangePickerProps) {
  const {
    state,
    getContainerProps,
    getGroupProps,
    getStartInputProps,
    getEndInputProps,
    getDialogProps,
    getGridProps,
    getCellProps,
    getPrevMonthProps,
    getNextMonthProps,
    isOpen,
    range,
    setRange,
    clearRange,
    setIsOpen,
  } = useRangePicker(options);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, setIsOpen]);

  const formatValue = (date: Date | null | undefined) =>
    date ? toISODateString(date) : '';

  const monthLabel = formatMonthYear(state.viewDate, options.locale);

  const themeAttr = theme && theme !== 'light' ? theme : undefined;
  const densityAttr = density && density !== 'default' ? density : undefined;

  return (
    <div
      {...getContainerProps()}
      ref={containerRef}
      className={`dp-container ${className}`}
      data-dp-theme={themeAttr}
      data-dp-density={densityAttr}
    >
      <div {...getGroupProps()} className="dp-range-input-group">
        <input
          {...getStartInputProps()}
          value={formatValue(range?.start)}
          placeholder="Start date"
          className="dp-range-input"
        />
        <span className="dp-range-sep">&rarr;</span>
        <input
          {...getEndInputProps()}
          value={formatValue(range?.end)}
          placeholder="End date"
          className="dp-range-input"
        />
        {startName && <input type="hidden" name={startName} value={formatValue(range?.start)} />}
        {endName && <input type="hidden" name={endName} value={formatValue(range?.end)} />}
      </div>

      {isOpen && (
        <div {...getDialogProps()} className="dp-popover">
          {/* Header */}
          <div className="dp-header">
            <button {...getPrevMonthProps()} className="dp-nav-btn" aria-label="Previous month">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="dp-title">{monthLabel}</span>
            <button {...getNextMonthProps()} className="dp-nav-btn" aria-label="Next month">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Presets */}
          {presets && presets.length > 0 && (
            <div className="dp-presets">
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRange(p.getValue())}
                  className="dp-preset-btn"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <CalendarGrid
            gridProps={getGridProps()}
            cellProps={getCellProps}
            grid={state.grid}
            firstDayOfWeek={state.firstDayOfWeek}
            locale={options.locale}
          />

          {showFooter && (
            <div className="dp-footer">
              <button type="button" onClick={clearRange} className="dp-footer-clear">
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={!range?.start || !range?.end}
                className="dp-footer-apply"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
