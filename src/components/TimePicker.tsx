import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTimePicker, type TimePickerOptions } from '../hooks';
import type { DpTheme, DpDensity } from './DatePicker';

export type TimePickerMode = 'inline' | 'popover';
export type TimePickerTriggerStyle = 'default' | 'icon' | 'minimal' | 'pill' | 'ghost';

export interface TimePickerProps extends TimePickerOptions {
  className?: string;
  disabled?: boolean;
  theme?: DpTheme | string;   // also accepts extra themes like 'purple', 'amber', etc.
  density?: DpDensity;
  /**
   * Render mode:
   * - `'inline'`  — spin controls always visible (default, current behaviour)
   * - `'popover'` — shows a time-display trigger; controls appear in a floating panel on click
   */
  mode?: TimePickerMode;
  /** triggerStyle only applies when mode="popover" */
  triggerStyle?: TimePickerTriggerStyle;
  /** Custom icon for the clock display — pass null to hide */
  icon?: React.ReactNode | null;
  /** Render a custom wrapper around the entire component (inline mode only) */
  renderContainer?: (children: React.ReactNode) => React.ReactNode;
  /** Custom label for each spin segment */
  segmentLabels?: { hour?: string; minute?: string; second?: string; period?: string };
  /** Render a footer inside the popover (popover mode only) */
  renderPopoverFooter?: (currentTime: Date, close: () => void) => React.ReactNode;
  /** Popover placement: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** Placeholder text shown in the trigger when no time is selected (popover mode) */
  placeholder?: string;
}

/* ── Default clock icon ─────────────────────────────────────── */
const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/* ── SpinGroup ──────────────────────────────────────────────── */
function SpinGroup({
  value, onUp, onDown, spinProps, label, disabled,
}: {
  value: string; onUp: () => void; onDown: () => void;
  spinProps: React.HTMLAttributes<HTMLDivElement>; label: string; disabled?: boolean;
}) {
  return (
    <div className="dp-spin-group">
      <button type="button" aria-label={`Increase ${label}`} onClick={onUp} disabled={disabled} tabIndex={-1} className="dp-spin-btn">▲</button>
      <div {...spinProps} className="dp-spin-value">{value}</div>
      <button type="button" aria-label={`Decrease ${label}`} onClick={onDown} disabled={disabled} tabIndex={-1} className="dp-spin-btn">▼</button>
    </div>
  );
}

/* ── Spin Controls (shared between inline & popover) ────────── */
function SpinControls({
  hourDisplay, minuteDisplay, secondDisplay, periodDisplay,
  getHourProps, getMinuteProps, getSecondProps, getPeriodProps,
  incrementHour, decrementHour,
  incrementMinute, decrementMinute,
  incrementSecond, decrementSecond,
  format12, granularity, disabled, labels,
}: {
  hourDisplay: string; minuteDisplay: string; secondDisplay: string; periodDisplay: string;
  getHourProps: () => React.HTMLAttributes<HTMLDivElement>;
  getMinuteProps: () => React.HTMLAttributes<HTMLDivElement>;
  getSecondProps: () => React.HTMLAttributes<HTMLDivElement>;
  getPeriodProps: () => Record<string, unknown>;
  incrementHour: () => void; decrementHour: () => void;
  incrementMinute: () => void; decrementMinute: () => void;
  incrementSecond: () => void; decrementSecond: () => void;
  format12: boolean; granularity: string; disabled?: boolean;
  labels: { hour: string; minute: string; second: string; period: string };
}) {
  return (
    <>
      <SpinGroup value={hourDisplay} onUp={incrementHour} onDown={decrementHour} spinProps={getHourProps()} label={labels.hour} disabled={disabled} />

      {granularity !== 'hour' && (
        <>
          <span className="dp-spin-sep">:</span>
          <SpinGroup value={minuteDisplay} onUp={incrementMinute} onDown={decrementMinute} spinProps={getMinuteProps()} label={labels.minute} disabled={disabled} />
        </>
      )}

      {granularity === 'second' && (
        <>
          <span className="dp-spin-sep">:</span>
          <SpinGroup value={secondDisplay} onUp={incrementSecond} onDown={decrementSecond} spinProps={getSecondProps()} label={labels.second} disabled={disabled} />
        </>
      )}

      {format12 && (
        <button
          {...(getPeriodProps() as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          type="button"
          disabled={disabled}
          className="dp-period-btn"
          aria-label={labels.period}
        >
          {periodDisplay}
        </button>
      )}
    </>
  );
}

/* ── Format display string ───────────────────────────────────── */
function formatTimeDisplay(time: Date, format12: boolean, granularity: string): string {
  const h = format12 ? String(time.getHours() % 12 || 12).padStart(2, '0') : String(time.getHours()).padStart(2, '0');
  const m = String(time.getMinutes()).padStart(2, '0');
  const s = String(time.getSeconds()).padStart(2, '0');
  const period = format12 ? (time.getHours() >= 12 ? ' PM' : ' AM') : '';

  if (granularity === 'hour') return `${h}${period}`;
  if (granularity === 'second') return `${h}:${m}:${s}${period}`;
  return `${h}:${m}${period}`;
}

/* ── Main TimePicker ─────────────────────────────────────────── */
export function TimePicker({
  className = '',
  disabled,
  theme,
  density,
  mode = 'inline',
  triggerStyle = 'default',
  icon,
  renderContainer,
  segmentLabels,
  renderPopoverFooter,
  placement = 'bottom-start',
  placeholder = 'Select time…',
  ...options
}: TimePickerProps) {
  const {
    activeTime, selectedTime, format12,
    getHourProps, getMinuteProps, getSecondProps, getPeriodProps,
    incrementHour, decrementHour, incrementMinute, decrementMinute,
    incrementSecond, decrementSecond,
    hourDisplay, minuteDisplay, secondDisplay, periodDisplay,
  } = useTimePicker({ ...options, disabled });

  const granularity = options.granularity || 'minute';
  const labels = { hour: 'hour', minute: 'minute', second: 'second', period: 'period', ...segmentLabels };

  const themeAttr = theme ? theme : undefined;
  const densityAttr = density && density !== 'default' ? density : undefined;

  // ── Popover state ─────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(o => !o), []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const spinControls = (
    <SpinControls
      hourDisplay={hourDisplay} minuteDisplay={minuteDisplay}
      secondDisplay={secondDisplay} periodDisplay={periodDisplay}
      getHourProps={getHourProps} getMinuteProps={getMinuteProps}
      getSecondProps={getSecondProps} getPeriodProps={getPeriodProps}
      incrementHour={incrementHour!} decrementHour={decrementHour!}
      incrementMinute={incrementMinute!} decrementMinute={decrementMinute!}
      incrementSecond={incrementSecond!} decrementSecond={decrementSecond!}
      format12={format12} granularity={granularity} disabled={disabled} labels={labels}
    />
  );

  // ── INLINE mode ───────────────────────────────────────────────
  if (mode === 'inline') {
    const content = (
      <div
        className={`dp-time-picker${disabled ? ' dp-disabled' : ''} ${className}`}
        role="group"
        aria-label={options['aria-label'] || 'Time picker'}
        data-dp-theme={themeAttr}
        data-dp-density={densityAttr}
      >
        {icon !== null && (icon !== undefined ? <span className="dp-time-icon">{icon}</span> : null)}
        {spinControls}
      </div>
    );
    return renderContainer ? <>{renderContainer(content)}</> : content;
  }

  // ── POPOVER mode ──────────────────────────────────────────────
  const hasValue = selectedTime != null;
  const displayValue = hasValue || isOpen
    ? formatTimeDisplay(activeTime, format12, granularity)
    : null;

  // Placement classes for positioning
  const placementStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 50,
    ...(placement.startsWith('bottom') ? { top: 'calc(100% + 6px)' } : { bottom: 'calc(100% + 6px)' }),
    ...(placement.endsWith('start') ? { left: 0 } : { right: 0 }),
  };

  const triggerClass = triggerStyle === 'default'
    ? 'dp-trigger'
    : `dp-trigger dp-trigger--${triggerStyle}`;

  return (
    <div
      ref={containerRef}
      className={`dp-container dp-time-popover-container ${className}`}
      data-dp-theme={themeAttr}
      data-dp-density={densityAttr}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={triggerClass}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={displayValue || placeholder}
      >
        {/* Icon */}
        {icon !== null && (
          <span className="dp-trigger-icon">
            {icon !== undefined ? icon : <ClockIcon />}
          </span>
        )}

        {/* Time value / placeholder */}
        <span className={`dp-time-popover-value${!displayValue ? ' dp-trigger-placeholder' : ''}`}>
          {displayValue || placeholder}
        </span>

        {/* Chevron (hidden for icon-only style) */}
        {triggerStyle !== 'icon' && triggerStyle !== 'minimal' && (
          <svg className="dp-trigger-chevron" width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"
            style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}>
            <path d="M2.22 4.47a.75.75 0 0 1 1.06 0L6 7.19l2.72-2.72a.75.75 0 1 1 1.06 1.06L6.53 8.78a.75.75 0 0 1-1.06 0L2.22 5.53a.75.75 0 0 1 0-1.06z"/>
          </svg>
        )}
      </button>

      {/* Popover panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Time picker"
          aria-modal="false"
          className="dp-time-popover"
          style={placementStyle}
        >
          {/* Header */}
          <div className="dp-time-popover-header">
            <span className="dp-time-popover-label">Select time</span>
            <button
              type="button"
              onClick={close}
              className="dp-time-popover-close"
              aria-label="Close time picker"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Spin controls */}
          <div className="dp-time-popover-body">
            <div
              className="dp-time-picker"
              role="group"
              aria-label="Time controls"
              style={{ border: 'none', padding: 0, boxShadow: 'none', background: 'transparent' }}
            >
              {spinControls}
            </div>
          </div>

          {/* Optional footer */}
          {renderPopoverFooter ? (
            <div className="dp-time-popover-footer">
              {renderPopoverFooter(activeTime, close)}
            </div>
          ) : (
            <div className="dp-time-popover-footer">
              <button type="button" onClick={() => { options.onChange?.(null); }} className="dp-footer-clear">
                Clear
              </button>
              <button type="button" onClick={close} className="dp-footer-apply">
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
