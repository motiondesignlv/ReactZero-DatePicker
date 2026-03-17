import React from 'react';
import { DatePicker, type DatePickerProps } from './DatePicker';
import { DateTimePicker, type DateTimePickerProps } from './DateTimePicker';
import { TimePicker, type TimePickerProps } from './TimePicker';

// ── DatePicker variants ─────────────────────────────────────────────────────

export type DatePickerInlineProps = Omit<DatePickerProps, 'inline'>;
export type DatePickerPopoverProps = Omit<DatePickerProps, 'inline'>;

export const DatePickerInline = /*#__PURE__*/ React.forwardRef<HTMLDivElement, DatePickerInlineProps>(
  (props, ref) => React.createElement(DatePicker, { ...props, inline: true, ref }),
);
DatePickerInline.displayName = 'DatePickerInline';

export const DatePickerPopover = /*#__PURE__*/ React.forwardRef<HTMLDivElement, DatePickerPopoverProps>(
  (props, ref) => React.createElement(DatePicker, { ...props, inline: false, ref }),
);
DatePickerPopover.displayName = 'DatePickerPopover';

// ── DateTimePicker variants ─────────────────────────────────────────────────

export type DateTimePickerInlineProps = Omit<DateTimePickerProps, 'inline'>;
export type DateTimePickerPopoverProps = Omit<DateTimePickerProps, 'inline'>;

export const DateTimePickerInline = /*#__PURE__*/ (props: DateTimePickerInlineProps) =>
  React.createElement(DateTimePicker, { ...props, inline: true });
DateTimePickerInline.displayName = 'DateTimePickerInline';

export const DateTimePickerPopover = /*#__PURE__*/ (props: DateTimePickerPopoverProps) =>
  React.createElement(DateTimePicker, { ...props, inline: false });
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
