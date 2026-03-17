import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DatePicker } from './DatePicker';
import { DateRangePicker } from './DateRangePicker';
import { DateTimePicker } from './DateTimePicker';
import { TimePicker } from './TimePicker';

/* ── Layout helper ─────────────────────────────────────────── */
function TwoUp({ label1, label2, children }: { label1: string; label2: string; children: [React.ReactNode, React.ReactNode] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: 800 }}>
      <div>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>{label1}</h3>
        {children[0]}
      </div>
      <div>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>{label2}</h3>
        {children[1]}
      </div>
    </div>
  );
}

/* ── Meta ───────────────────────────────────────────────────── */
const meta = {
  title: 'Variants/Inline vs Popover',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ── DatePicker ──────────────────────────────────────────────── */
export const DatePickerVariants: Story = {
  name: 'DatePicker',
  render: () => (
    <TwoUp label1="Inline" label2="Popover">
      {[
        <DatePicker key="inline" inline defaultValue={new Date(2026, 2, 15)} aria-label="Inline date picker" />,
        <DatePicker key="popover" defaultValue={new Date(2026, 2, 15)} aria-label="Popover date picker" />,
      ]}
    </TwoUp>
  ),
};

/* ── DateRangePicker ─────────────────────────────────────────── */
export const DateRangePickerVariants: Story = {
  name: 'DateRangePicker',
  render: () => (
    <DateRangePicker
      defaultValue={{ start: new Date(2026, 2, 5), end: new Date(2026, 2, 15) }}
      showFooter
      aria-label="Range picker"
    />
  ),
};

/* ── DateTimePicker ──────────────────────────────────────────── */
export const DateTimePickerVariants: Story = {
  name: 'DateTimePicker',
  render: () => (
    <TwoUp label1="Inline" label2="Popover">
      {[
        <DateTimePicker
          key="inline"
          inline
          defaultValue={new Date(2026, 2, 15, 14, 30)}
          hourCycle="h12"
          aria-label="Inline datetime picker"
        />,
        <DateTimePicker
          key="popover"
          defaultValue={new Date(2026, 2, 15, 14, 30)}
          hourCycle="h12"
          aria-label="Popover datetime picker"
        />,
      ]}
    </TwoUp>
  ),
};

/* ── TimePicker ──────────────────────────────────────────────── */
export const TimePickerVariants: Story = {
  name: 'TimePicker',
  render: () => (
    <TwoUp label1="Inline (mode='inline')" label2="Popover (mode='popover')">
      {[
        <TimePicker
          key="inline"
          mode="inline"
          defaultValue={new Date(2026, 0, 1, 14, 30)}
          hourCycle="h12"
          aria-label="Inline time picker"
        />,
        <TimePicker
          key="popover"
          mode="popover"
          defaultValue={new Date(2026, 0, 1, 14, 30)}
          hourCycle="h12"
          aria-label="Popover time picker"
        />,
      ]}
    </TwoUp>
  ),
};

/* ── Themed ──────────────────────────────────────────────────── */
export const ThemedInline: Story = {
  name: 'Themed Inline Pickers',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Dark Theme</h3>
        <DatePicker inline theme="dark" defaultValue={new Date(2026, 2, 15)} aria-label="Dark inline" />
      </div>
      <div>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Ocean Theme</h3>
        <DateRangePicker
          theme="ocean"
          defaultValue={{ start: new Date(2026, 2, 5), end: new Date(2026, 2, 15) }}
          aria-label="Ocean range picker"
        />
      </div>
    </div>
  ),
};
