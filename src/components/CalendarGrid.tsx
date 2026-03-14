import React, { useMemo } from 'react';
import { getWeekdayNames, formatDay } from '../utils';

export interface CalendarGridProps {
  gridProps: React.HTMLAttributes<HTMLTableElement>;
  cellProps: (date: Date) => React.HTMLAttributes<HTMLTableCellElement>;
  grid: Date[][];
  firstDayOfWeek: number;
  locale?: string;
  className?: string;
}

export function CalendarGrid({
  gridProps,
  cellProps,
  grid,
  firstDayOfWeek,
  locale,
  className = '',
}: CalendarGridProps) {
  const weekdays = useMemo(
    () => getWeekdayNames(firstDayOfWeek, 'short', locale),
    [firstDayOfWeek, locale]
  );

  const weekdaysLong = useMemo(
    () => getWeekdayNames(firstDayOfWeek, 'long', locale),
    [firstDayOfWeek, locale]
  );

  return (
    <table {...gridProps} className={`dp-calendar-grid ${className}`}>
      <thead>
        <tr>
          {weekdays.map((day, i) => (
            <th key={i} className="dp-calendar-header-cell" scope="col" abbr={weekdaysLong[i]}>
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {grid.map((week, weekIndex) => (
          <tr key={weekIndex}>
            {week.map((date, dayIndex) => {
              const props = cellProps(date);
              const isSelected = props['aria-selected'];
              const isToday = props['aria-current'] === 'date';
              const isDisabled = props['aria-disabled'];

              const outsideMonth = (props as any)['data-outside-month'];
              const isStart = (props as any)['data-start'];
              const isEnd = (props as any)['data-end'];
              const inRange = (props as any)['data-in-range'];
              const hoverRange = (props as any)['data-hover-range'];

              const specialClass = (props as any)['data-special-class'] ?? '';
              const specialLabel = (props as any)['data-special-label'];
              const specialDot = (props as any)['data-special-dot'];

              const cellClass = [
                'dp-calendar-cell',
                outsideMonth ? 'dp-outside-month' : '',
                isSelected ? 'dp-selected' : '',
                isToday ? 'dp-today' : '',
                isDisabled ? 'dp-disabled' : '',
                isStart ? 'dp-start-range' : '',
                isEnd ? 'dp-end-range' : '',
                inRange ? 'dp-in-range' : '',
                hoverRange ? 'dp-hover-range' : '',
                specialClass,
              ].filter(Boolean).join(' ');

              return (
                <td
                  key={dayIndex}
                  {...props}
                  title={specialLabel || undefined}
                  aria-description={specialLabel || undefined}
                  className={cellClass}
                >
                  <div className="dp-calendar-cell-inner">
                    {formatDay(date, locale)}
                  </div>
                  {specialDot && (
                    <span
                      className="dp-special-dot"
                      style={{ backgroundColor: specialDot }}
                      aria-hidden="true"
                    />
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
