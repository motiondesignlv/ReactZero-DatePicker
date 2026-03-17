import React from 'react';
import { DatePicker, type DatePickerProps } from './DatePicker';
import { DateRangePicker, type DateRangePickerProps } from './DateRangePicker';
import { DateTimePicker, type DateTimePickerProps } from './DateTimePicker';
import { TimePicker, type TimePickerProps } from './TimePicker';

// ── DatePicker variants ─────────────────────────────────────────────────────

export type DatePickerInlineProps = Omit<DatePickerProps, 'mode' | 'inline'>;
export type DatePickerPopoverProps = Omit<DatePickerProps, 'mode' | 'inline'>;

export const DatePickerInline = /*#__PURE__*/ React.forwardRef<HTMLDivElement, DatePickerInlineProps>(
  (props, ref) => React.createElement(DatePicker, { ...props, mode: 'inline', ref }),
);
DatePickerInline.displayName = 'DatePickerInline';

export const DatePickerPopover = /*#__PURE__*/ React.forwardRef<HTMLDivElement, DatePickerPopoverProps>(
  (props, ref) => React.createElement(DatePicker, { ...props, mode: 'popover', ref }),
);
DatePickerPopover.displayName = 'DatePickerPopover';

// ── DateRangePicker variants ────────────────────────────────────────────────

export type DateRangePickerInlineProps = Omit<DateRangePickerProps, 'mode'>;
export type DateRangePickerPopoverProps = Omit<DateRangePickerProps, 'mode'>;

export const DateRangePickerInline = /*#__PURE__*/ (props: DateRangePickerInlineProps) =>
  React.createElement(DateRangePicker, { ...props, mode: 'inline' });
DateRangePickerInline.displayName = 'DateRangePickerInline';

export const DateRangePickerPopover = /*#__PURE__*/ (props: DateRangePickerPopoverProps) =>
  React.createElement(DateRangePicker, { ...props, mode: 'popover' });
DateRangePickerPopover.displayName = 'DateRangePickerPopover';

// ── DateTimePicker variants ─────────────────────────────────────────────────

export type DateTimePickerInlineProps = Omit<DateTimePickerProps, 'mode'>;
export type DateTimePickerPopoverProps = Omit<DateTimePickerProps, 'mode'>;

export const DateTimePickerInline = /*#__PURE__*/ (props: DateTimePickerInlineProps) =>
  React.createElement(DateTimePicker, { ...props, mode: 'inline' });
DateTimePickerInline.displayName = 'DateTimePickerInline';

export const DateTimePickerPopover = /*#__PURE__*/ (props: DateTimePickerPopoverProps) =>
  React.createElement(DateTimePicker, { ...props, mode: 'popover' });
DateTimePickerPopover.displayName = 'DateTimePickerPopover';

// ── TimePicker variants ─────────────────────────────────────────────────────

export type TimePickerInlineProps = Omit<TimePickerProps, 'mode'>;
export type TimePickerPopoverProps = Omit<TimePickerProps, 'mode'>;

export const TimePickerInline = /*#__PURE__*/ (props: TimePickerInlineProps) =>
  React.createElement(TimePicker, { ...props, mode: 'inline' });
TimePickerInline.displayName = 'TimePickerInline';

export const TimePickerPopover = /*#__PURE__*/ (props: TimePickerPopoverProps) =>
  React.createElement(TimePicker, { ...props, mode: 'popover' });
TimePickerPopover.displayName = 'TimePickerPopover';
