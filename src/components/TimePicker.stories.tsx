import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { TimePicker } from './TimePicker';
import { FieldWrapper } from './FieldWrapper';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'TimePicker',
  component: TimePicker,
  parameters: { layout: 'padded' },
  argTypes: {
    mode:         { control: 'radio',  options: ['inline', 'popover'], description: 'Render mode' },
    triggerStyle: { control: 'select', options: ['default', 'icon', 'minimal', 'pill', 'ghost'], description: 'Trigger appearance (popover mode)' },
    hourCycle:    { control: 'radio',  options: ['h12', 'h24'], description: 'Hour format' },
    granularity:  { control: 'select', options: ['hour', 'minute', 'second'], description: 'Precision' },
    density:      { control: 'radio',  options: ['compact', 'default', 'comfortable'] },
    disabled:     { control: 'boolean' },
  },
} satisfies Meta<typeof TimePicker>;
export default meta;

type Story = StoryObj<typeof TimePicker>;

/* ── Helpers ─────────────────────────────────────────────── */
const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>{children}</div>
);
const Card = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ padding: '1.25rem', borderRadius: '0.625rem', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
    <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.4 }}>{label}</p>
    {children}
  </div>
);

/* ── 1. ↔ Inline vs Popover Side by Side ──────────────────── */
export const InlineVsPopover: Story = {
  name: '↔ Inline vs Popover',
  render: () => (
    <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700 }}>mode="inline"</p>
        <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', opacity: 0.55 }}>Controls always visible. Best for prominent placement.</p>
        <TimePicker mode="inline" granularity="second" hourCycle="h12" />
      </div>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700 }}>mode="popover"</p>
        <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', opacity: 0.55 }}>Compact trigger, click to open. Best for forms and tight layouts.</p>
        <TimePicker mode="popover" granularity="second" hourCycle="h12" placeholder="Select time…" />
      </div>
    </div>
  ),
};

/* ── 2. Inline default ────────────────────────────────────── */
export const Default: Story = {
  name: 'Inline — Default',
  args: { mode: 'inline', hourCycle: 'h12', granularity: 'minute' },
};

/* ── 3. Inline granularities ──────────────────────────────── */
export const InlineGranularities: Story = {
  name: 'Inline — Granularities',
  render: () => (
    <Row>
      <Card label="hour only"><TimePicker granularity="hour" hourCycle="h12" /></Card>
      <Card label="hour:minute (default)"><TimePicker granularity="minute" hourCycle="h12" /></Card>
      <Card label="hour:minute:second"><TimePicker granularity="second" hourCycle="h12" /></Card>
      <Card label="24-hour"><TimePicker granularity="minute" hourCycle="h24" /></Card>
    </Row>
  ),
};

/* ── 4. Inline disabled slots ─────────────────────────────── */
export const InlineDisabledSlots: Story = {
  name: 'Inline — Disabled Hours & Minute Steps',
  args: { mode: 'inline', granularity: 'minute', hourCycle: 'h24', disabledHours: [0,1,2,3,4,5,22,23], minuteStep: 15 },
};

/* ── 5. Popover — default ─────────────────────────────────── */
export const PopoverDefault: Story = {
  name: 'Popover — Default',
  args: { mode: 'popover', hourCycle: 'h12', granularity: 'minute', placeholder: 'Select time…' },
};

/* ── 6. Popover — all trigger styles ────────────────────────── */
export const PopoverTriggerStyles: Story = {
  name: 'Popover — All Trigger Styles',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {([
        ['default', 'Full button — label + clock icon'],
        ['pill',    'Accent-filled, fully rounded'],
        ['minimal', 'Underline only'],
        ['ghost',   'Invisible until hovered'],
        ['icon',    'Icon-only, circular'],
      ] as [any, string][]).map(([style, desc]) => (
        <Card key={style} label={`triggerStyle="${style}"`}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', opacity: 0.5 }}>{desc}</p>
          <Row>
            <TimePicker mode="popover" triggerStyle={style} placeholder="Time…" />
            <TimePicker mode="popover" triggerStyle={style} theme="ocean" placeholder="Time…" />
            <TimePicker mode="popover" triggerStyle={style} theme="rose" placeholder="Time…" />
          </Row>
        </Card>
      ))}
    </div>
  ),
};

/* ── 7. Popover controlled + FieldWrapper ────────────────────── */
export const PopoverControlled: Story = {
  name: 'Popover — Controlled + FieldWrapper',
  render: () => {
    const [time, setTime] = useState<Date | null>(null);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 360 }}>
        <FieldWrapper label="Meeting time" hint="Times are in your local timezone." id="meeting-time">
          <TimePicker mode="popover" id="meeting-time" value={time} onChange={setTime} placeholder="Choose a time…" />
        </FieldWrapper>
        {time && (
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#16a34a', fontWeight: 500 }}>
            ✓ {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    );
  },
};

/* ── 8. Popover placements ───────────────────────────────────── */
export const PopoverPlacements: Story = {
  name: 'Popover — Placements',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', paddingTop: '1rem', paddingBottom: '10rem' }}>
      {(['bottom-start', 'bottom-end', 'top-start', 'top-end'] as const).map(p => (
        <Card key={p} label={`placement="${p}"`}>
          <TimePicker mode="popover" placement={p} placeholder="Select time…" />
        </Card>
      ))}
    </div>
  ),
};

/* ── 9. Popover custom footer ────────────────────────────────── */
export const PopoverCustomFooter: Story = {
  name: 'Popover — Custom Footer',
  render: () => (
    <TimePicker
      mode="popover"
      placeholder="Select time…"
      renderPopoverFooter={(time, close) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563eb' }}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="dp-footer-clear" onClick={close}>Cancel</button>
            <button type="button" className="dp-footer-apply" onClick={close}>Confirm →</button>
          </div>
        </div>
      )}
    />
  ),
};

/* ── 10. Compact Date + Time row ─────────────────────────────── */
export const DateTimeCompactRow: Story = {
  name: '📅 Compact Date + Time Row',
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<Date | null>(null);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 500 }}>
        <FieldWrapper label="Event date & time" hint="Both required." required id="event">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <DatePicker id="event" value={date} onChange={setDate} placeholder="Date…" />
            <TimePicker mode="popover" value={time} onChange={setTime} placeholder="Time…" />
          </div>
        </FieldWrapper>
        {date && time && (
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#16a34a', fontWeight: 500 }}>
            ✓ {date.toLocaleDateString()} at {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    );
  },
};

/* ── 11. All themes in popover mode ─────────────────────────── */
export const PopoverAllThemes: Story = {
  name: 'Popover — All Themes',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
      {(['light', 'dark', 'ocean', 'rose', 'purple', 'amber', 'slate', 'glass'] as const).map(theme => (
        <Card key={theme} label={theme}>
          <div style={theme === 'dark' ? { background: '#1e293b', padding: '0.75rem', borderRadius: '0.5rem' } : {}}>
            <TimePicker mode="popover" theme={theme} placeholder="Select time…" />
          </div>
        </Card>
      ))}
    </div>
  ),
};

/* ── 12. Blocked Times ───────────────────────────────────────── */
export const WithBlockedTimes: Story = {
  name: 'Inline — Blocked Time Ranges',
  args: {
    mode: 'inline',
    hourCycle: 'h24',
    blockedTimes: [
      { start: '09:00', end: '09:30', label: 'Booked' },
      { start: '12:00', end: '13:00', label: 'Lunch break' },
    ],
  },
};
