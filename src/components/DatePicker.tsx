import React, { useCallback } from 'react';
import { useDatePicker, type DatePickerOptions } from '../hooks';
import { CalendarGrid } from './CalendarGrid';
import { formatMonthYear, toISODateString, mergeRefs } from '../utils';

export type DpTheme = 'light' | 'dark' | 'minimal' | 'ocean' | 'rose';
export type DpDensity = 'compact' | 'default' | 'comfortable';
export type DpTriggerStyle = 'default' | 'icon' | 'minimal' | 'pill' | 'ghost';

/** Default calendar icon */
const CalendarIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export interface DatePickerProps extends DatePickerOptions {
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  /** Render the calendar inline (no dialog/trigger) */
  inline?: boolean;
  /** Built-in theme preset */
  theme?: DpTheme;
  /** Density / size mode */
  density?: DpDensity;
  /**
   * Trigger style variant:
   * - `'default'` — full input with label + icon (default)
   * - `'icon'`    — icon-only circular button
   * - `'minimal'` — underline only, no box
   * - `'pill'`    — fully rounded, filled
   * - `'ghost'`   — transparent, shows border only on hover
   */
  triggerStyle?: DpTriggerStyle;
  /** Replace the trigger entirely with your own render function */
  renderTrigger?: (props: {
    onClick: () => void;
    selectedDate: Date | null;
    isOpen: boolean;
    placeholder: string;
    id?: string;
  }) => React.ReactNode;
  /** Custom icon replacing the default calendar icon. Pass `null` to hide the icon. */
  icon?: React.ReactNode | null;
  /** Replace the prev-month button */
  renderPrevButton?: (onClick: () => void) => React.ReactNode;
  /** Replace the next-month button */
  renderNextButton?: (onClick: () => void) => React.ReactNode;
  /** Render a custom footer inside the calendar popover */
  renderFooter?: (selectedDate: Date | null, close: () => void) => React.ReactNode;
  /** Format the selected date for display in the trigger */
  formatValue?: (date: Date) => string;
}

export const DatePicker = /*#__PURE__*/ React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({
    placeholder = 'Select date',
    className = '',
    required,
    disabled,
    inline,
    theme,
    density,
    triggerStyle = 'default',
    renderTrigger,
    icon,
    renderPrevButton,
    renderNextButton,
    renderFooter,
    formatValue,
    ...options
  }, ref) => {
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
    } = useDatePicker(options);

    const { viewDate, selectedDate, grid, firstDayOfWeek } = state;

    const themeAttr = theme && theme !== 'light' ? theme : undefined;
    const densityAttr = density && density !== 'default' ? density : undefined;

    const displayValue = selectedDate
      ? (formatValue ? formatValue(selectedDate) : toISODateString(selectedDate))
      : '';

    const resolvedIcon = icon === null ? null : (icon ?? <CalendarIcon />);
    const headingId = `${options.id || 'dp'}-heading`;

    // Handle input keydown for Enter to open
    const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!disabled) toggle();
      }
    }, [disabled, toggle]);

    const handleInputClick = useCallback(() => {
      if (!disabled) toggle();
    }, [disabled, toggle]);

    // Navigate view to today's month
    const handleToday = useCallback(() => {
      state.setViewDate(new Date());
    }, [state]);

    // Clear the selection
    const handleClear = useCallback(() => {
      state.setSelectedDate(null);
    }, [state]);

    // ── Shared header + grid + footer ──────────────────────────────────────────
    const calendarContent = (
      <>
        <div className="dp-header">
          {renderPrevButton
            ? renderPrevButton(state.goToPreviousMonth)
            : (
              <button type="button" onClick={state.goToPreviousMonth} className="dp-nav-btn" aria-label="Previous month">
                <ChevronLeft />
              </button>
            )
          }
          <h2 id={headingId} className="dp-title" aria-live="polite" aria-atomic="true">
            {formatMonthYear(viewDate, options.locale)}
          </h2>
          {renderNextButton
            ? renderNextButton(state.goToNextMonth)
            : (
              <button type="button" onClick={state.goToNextMonth} className="dp-nav-btn" aria-label="Next month">
                <ChevronRight />
              </button>
            )
          }
        </div>

        <CalendarGrid
          gridProps={getGridProps()}
          cellProps={getCellProps}
          grid={grid}
          firstDayOfWeek={firstDayOfWeek}
          locale={options.locale}
        />

        {renderFooter ? (
          <div className="dp-custom-footer">
            {renderFooter(selectedDate || null, close)}
          </div>
        ) : (
          <div className="dp-footer">
            <button type="button" onClick={handleToday} className="dp-footer-btn">
              Today
            </button>
            <button type="button" onClick={handleClear} className="dp-footer-btn">
              Clear
            </button>
          </div>
        )}
      </>
    );

    // ── INLINE mode ────────────────────────────────────────────────────────────
    if (inline) {
      return (
        <div
          {...getContainerProps()}
          ref={mergeRefs(getContainerProps().ref, ref)}
          className={`dp-container dp-inline ${className}`}
          data-dp-theme={themeAttr}
          data-dp-density={densityAttr}
        >
          {calendarContent}

          {options.name && (
            <input
              type="hidden"
              name={options.name}
              value={selectedDate ? toISODateString(selectedDate) : ''}
              required={required}
            />
          )}
        </div>
      );
    }

    // ── POPOVER mode ───────────────────────────────────────────────────────────
    const triggerProps = getTriggerProps();

    let triggerNode: React.ReactNode;

    if (renderTrigger) {
      triggerNode = renderTrigger({
        onClick: toggle,
        selectedDate: selectedDate || null,
        isOpen,
        placeholder,
        id: options.id,
      });
    } else if (triggerStyle === 'icon') {
      triggerNode = (
        <button
          ref={(el) => {
            (triggerProps.ref as React.MutableRefObject<HTMLElement | null>).current = el;
          }}
          id={triggerProps.id}
          type="button"
          onClick={triggerProps.onClick}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="dp-trigger dp-trigger--icon"
          aria-label={displayValue || placeholder}
          title={displayValue || placeholder}
          disabled={disabled}
        >
          {resolvedIcon}
        </button>
      );
    } else {
      const styleClass = triggerStyle !== 'default' ? ` dp-input--${triggerStyle}` : '';
      triggerNode = (
        <div className="dp-input-group">
          <input
            ref={(el) => {
              (triggerProps.ref as React.MutableRefObject<HTMLElement | null>).current = el;
            }}
            type="text"
            readOnly
            role="combobox"
            className={`dp-input${styleClass}`}
            placeholder={placeholder}
            value={displayValue}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={isOpen ? `${options.id || 'dp'}-dialog` : undefined}
            onClick={handleInputClick}
            onKeyDown={handleInputKeyDown}
          />
          <button
            type="button"
            className="dp-trigger-icon-btn"
            onClick={handleInputClick}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-label={displayValue || placeholder}
            tabIndex={-1}
          >
            {resolvedIcon}
          </button>
        </div>
      );
    }

    return (
      <div
        {...getContainerProps()}
        ref={mergeRefs(getContainerProps().ref, ref)}
        className={`dp-container ${className}`}
        data-dp-theme={themeAttr}
        data-dp-density={densityAttr}
        data-dp-trigger={triggerStyle}
      >
        {triggerNode}

        {options.name && (
          <input
            type="hidden"
            name={options.name}
            value={selectedDate ? toISODateString(selectedDate) : ''}
            required={required}
          />
        )}

        {isOpen && (
          <div {...getDialogProps()} className="dp-popover">
            {calendarContent}
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
