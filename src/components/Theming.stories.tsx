import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { DateRangePicker } from './DateRangePicker';
import { FieldWrapper } from './FieldWrapper';

const meta = {
  title: 'Theming & Customization',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

/* ── Layout helpers ────────────────────────────────────────── */
const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.125rem', fontWeight: 700 }}>{title}</h2>
    {subtitle && <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', opacity: 0.55 }}>{subtitle}</p>}
    <div style={{ marginTop: '1rem' }}>{children}</div>
  </div>
);

const Row = ({ children, gap = '1rem', wrap = true }: { children: React.ReactNode; gap?: string; wrap?: boolean }) => (
  <div style={{ display: 'flex', gap, flexWrap: wrap ? 'wrap' : 'nowrap', alignItems: 'flex-start' }}>{children}</div>
);

const Card = ({ children, bg, label }: { children: React.ReactNode; bg?: string; label?: string }) => (
  <div style={{ padding: '1.5rem', borderRadius: '0.75rem', background: bg || 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)', minWidth: 200 }}>
    {label && <p style={{ margin: '0 0 1rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.45 }}>{label}</p>}
    {children}
  </div>
);

const CODE = (s: string) => (
  <code style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.06)', padding: '0.15em 0.5em', borderRadius: '0.25rem', fontFamily: 'monospace' }}>{s}</code>
);

/* ============================================================
   Story 1 — All Themes
   ============================================================ */
export const AllThemes: StoryObj = {
  name: '🎨 All 9 Themes',
  render: () => (
    <div>
      <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', opacity: 0.6 }}>
        Apply any theme with {CODE('<DatePicker theme="dark" />')} — or scope it to a CSS class.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
        {([
          ['light',   '#ffffff'],
          ['dark',    '#1e293b'],
          ['minimal', '#ffffff'],
          ['ocean',   '#f0fdff'],
          ['rose',    '#fff8f8'],
          ['purple',  '#faf5ff'],
          ['amber',   '#fffbeb'],
          ['slate',   '#f8fafc'],
          ['glass',   'linear-gradient(135deg,#e0e7ff,#f0fdf4)'],
        ] as [string, string][]).map(([theme, bg]) => (
          <Card key={theme} bg={bg === '#ffffff' || bg === '#f8fafc' || bg === '#faf5ff' || bg === '#fffbeb' || bg === '#fff8f8' || bg === '#f0fdff' || bg === '#ffffff' ? 'rgba(0,0,0,0.02)' : undefined} label={theme}>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              // @ts-ignore
              data-dp-theme={theme !== 'light' ? theme : undefined}
            >
              <DatePicker theme={theme as any} placeholder="Select date…" />
              <TimePicker theme={theme as any} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  ),
};

/* ============================================================
   Story 2 — Trigger Styles
   ============================================================ */
export const TriggerStyles: StoryObj = {
  name: '🔘 Trigger Style Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.6 }}>
        Use {CODE('triggerStyle')} prop to change how the picker button looks.
      </p>

      {([
        ['default', 'Full button with label and icon (default)'],
        ['pill',    'Accent-filled, fully rounded'],
        ['minimal', 'Underline only — content-first UIs'],
        ['ghost',   'Invisible until hovered'],
        ['icon',    'Icon-only circular button'],
      ] as [any, string][]).map(([style, desc]) => (
        <Card key={style} label={`triggerStyle="${style}"`}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', opacity: 0.55 }}>{desc}</p>
          <Row>
            <DatePicker triggerStyle={style} placeholder="Select date…" />
            <DatePicker triggerStyle={style} placeholder="Select date…" theme="ocean" />
            <DatePicker triggerStyle={style} placeholder="Select date…" theme="rose" />
          </Row>
        </Card>
      ))}
    </div>
  ),
};

/* ============================================================
   Story 3 — Custom Icon
   ============================================================ */
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export const CustomIcons: StoryObj = {
  name: '🎭 Custom Icons & renderTrigger',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Section title="Custom icon via icon prop" subtitle="Pass any ReactNode as the icon. Pass null to hide it entirely.">
        <Row>
          <Card label="⭐ star icon">
            <DatePicker icon={<StarIcon />} placeholder="Pick a date…" />
          </Card>
          <Card label="🕒 clock icon">
            <DatePicker icon={<ClockIcon />} placeholder="Remind me…" triggerStyle="pill" theme="ocean" />
          </Card>
          <Card label="no icon (icon=null)">
            <DatePicker icon={null} placeholder="Select date…" />
          </Card>
        </Row>
      </Section>

      <Section
        title="Custom trigger with renderTrigger"
        subtitle="Full control over the trigger — receive selectedDate, isOpen, onClick, placeholder."
      >
        <Row>
          <Card label="calendar badge button">
            <DatePicker
              renderTrigger={({ onClick, selectedDate, placeholder }) => (
                <button
                  type="button"
                  onClick={onClick}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                    background: selectedDate ? '#7c3aed' : '#f5f3ff',
                    color: selectedDate ? '#fff' : '#7c3aed',
                    border: '2px dashed #7c3aed', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.875rem',
                  }}
                >
                  <StarIcon />
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : placeholder}
                </button>
              )}
              placeholder="Choose a date"
            />
          </Card>

          <Card label="text link trigger">
            <DatePicker
              renderTrigger={({ onClick, selectedDate }) => (
                <button type="button" onClick={onClick} style={{ background: 'none', border: 'none', color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, padding: 0 }}>
                  {selectedDate ? `📅 ${selectedDate.toLocaleDateString()}` : '📅 Set date'}
                </button>
              )}
            />
          </Card>
        </Row>
      </Section>

      <Section title="Custom formatValue" subtitle="Control how the selected date appears in the button — no custom trigger needed.">
        <Row>
          <Card label="long format">
            <DatePicker formatValue={d => d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })} placeholder="Select date…" />
          </Card>
          <Card label="relative hint + icon">
            <DatePicker
              formatValue={d => {
                const diffDays = Math.round((d.getTime() - Date.now()) / 86400000);
                if (diffDays === 0) return 'Today';
                if (diffDays === 1) return 'Tomorrow';
                if (diffDays === -1) return 'Yesterday';
                return d.toLocaleDateString();
              }}
              placeholder="Select date…"
              theme="ocean"
            />
          </Card>
        </Row>
      </Section>

      <Section title="Custom nav buttons" subtitle="Replace prev/next arrows with your own components via renderPrevButton / renderNextButton.">
        <DatePicker
          placeholder="Select date…"
          renderPrevButton={onClick => (
            <button type="button" onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '0 0.5rem', color: '#7c3aed' }}>←</button>
          )}
          renderNextButton={onClick => (
            <button type="button" onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '0 0.5rem', color: '#7c3aed' }}>→</button>
          )}
          renderFooter={(date, close) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', opacity: 0.6 }}>
                {date ? `Selected: ${date.toLocaleDateString()}` : 'No date selected'}
              </span>
              <button type="button" onClick={close} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '0.375rem', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                Done ✓
              </button>
            </div>
          )}
        />
      </Section>
    </div>
  ),
};

/* ============================================================
   Story 4 — Accessibility / FieldWrapper
   ============================================================ */
export const AccessibilityFieldWrapper: StoryObj = {
  name: '♿ Accessibility — FieldWrapper',
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    const [timeSet, setTimeSet] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 480 }}>
        <p style={{ margin: '0', fontSize: '0.875rem', opacity: 0.6 }}>
          {CODE('<FieldWrapper>')} wraps any picker with a label, hint, required indicator, and error/success/warning messages — all properly aria-linked.
        </p>

        {/* Standard with hint */}
        <FieldWrapper
          id="event-date"
          label="Event date"
          hint="The event must take place within the next 90 days."
          required
        >
          <DatePicker id="event-date" value={date} onChange={setDate} placeholder="Select event date…" />
        </FieldWrapper>

        {/* Error state */}
        <FieldWrapper
          id="deadline"
          label="Project deadline"
          error="Deadline cannot be in the past. Please choose a future date."
          required
        >
          <DatePicker id="deadline" placeholder="Select deadline…" />
        </FieldWrapper>

        {/* Success state */}
        <FieldWrapper
          id="start-date"
          label="Start date"
          status="success"
          message="Start date confirmed. Your team has been notified."
        >
          <DatePicker
            id="start-date"
            defaultValue={new Date()}
            placeholder="Select start date…"
          />
        </FieldWrapper>

        {/* Warning state */}
        <FieldWrapper
          id="meeting-date"
          label="Meeting date"
          status="warning"
          message="This date falls on a public holiday in some regions."
        >
          <DatePicker id="meeting-date" placeholder="Select meeting date…" />
        </FieldWrapper>

        {/* With label action */}
        <FieldWrapper
          id="reminder-time"
          label="Reminder time"
          hint="Times are in your local timezone."
          labelAction={<a href="#" style={{ fontSize: '0.8125rem', color: 'inherit', opacity: 0.5 }}>What's this?</a>}
        >
          <TimePicker
            aria-label="reminder-time"
            onChange={() => setTimeSet(true)}
          />
        </FieldWrapper>
        {timeSet && <p style={{ margin: '-1.5rem 0 0', fontSize: '0.8125rem', color: '#16a34a', fontWeight: 500 }}>✓ Reminder time set</p>}

        {/* Range Picker with field */}
        <FieldWrapper
          id="date-range"
          label="Travel dates"
          hint="Select your arrival and departure dates."
          required
        >
          <DateRangePicker />
        </FieldWrapper>

        {/* Dark theme */}
        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem' }} data-dp-theme="dark">
          <FieldWrapper
            id="dark-date"
            label="Dark theme field"
            hint="FieldWrapper adapts to the parent theme automatically."
          >
            <DatePicker id="dark-date" theme="dark" placeholder="Select date…" />
          </FieldWrapper>
        </div>
      </div>
    );
  },
};

/* ============================================================
   Story 5 — All Densities
   ============================================================ */
export const AllDensities: StoryObj = {
  name: '📐 All 3 Densities',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {(['compact', 'default', 'comfortable'] as const).map(density => (
        <Card key={density} label={density}>
          <Row>
            <DatePicker density={density} placeholder="Select date…" />
            <TimePicker density={density} />
          </Row>
        </Card>
      ))}
    </div>
  ),
};

/* ============================================================
   Story 6 — Theme × Density Matrix
   ============================================================ */
export const ThemeDensityMatrix: StoryObj = {
  name: '🔢 Theme × Density Matrix',
  render: () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: '0.75rem', minWidth: 700 }}>
        <thead>
          <tr>
            <th style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 600, textTransform: 'uppercase', textAlign: 'left' }}></th>
            {(['compact', 'default', 'comfortable'] as const).map(d => (
              <th key={d} style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(['light', 'dark', 'ocean', 'purple', 'amber'] as const).map(theme => (
            <tr key={theme}>
              <td style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.45, whiteSpace: 'nowrap' }}>{theme}</td>
              {(['compact', 'default', 'comfortable'] as const).map(density => (
                <td key={density} style={{ padding: '0.75rem', background: theme === 'dark' ? '#1e293b' : theme === 'purple' ? '#faf5ff' : theme === 'amber' ? '#fffbeb' : theme === 'ocean' ? '#f0fdff' : 'rgba(0,0,0,0.02)', borderRadius: '0.5rem' }}>
                  <DatePicker theme={theme} density={density} placeholder="Pick…" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

/* ============================================================
   Story 7 — Custom Brand Override
   ============================================================ */
export const CustomBrandOverride: StoryObj = {
  name: '✏️ Custom Brand (CSS Variables)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.6 }}>
        Override any {CODE('--dp-*')} variable on a wrapper element. No config files, no build step, no extra props.
      </p>

      <Card label="Purple brand — 4-variable override">
        <div style={{ '--dp-accent': '#7c3aed', '--dp-accent-hover': '#6d28d9', '--dp-accent-subtle': '#ede9fe', '--dp-accent-ring': 'rgba(124,58,237,0.25)', '--dp-radius-md': '1rem' } as React.CSSProperties}>
          <Row>
            <DatePicker placeholder="Select date…" />
            <TimePicker />
          </Row>
        </div>
      </Card>

      <Card label="Forest green brand">
        <div style={{ '--dp-accent': '#16a34a', '--dp-accent-hover': '#15803d', '--dp-accent-subtle': '#dcfce7', '--dp-accent-ring': 'rgba(22,163,74,0.25)', '--dp-bg': '#f0fdf4', '--dp-border': '#bbf7d0' } as React.CSSProperties}>
          <DateRangePicker />
        </div>
      </Card>

      <Card label="Warm amber — fully flat corners">
        <div style={{ '--dp-accent': '#d97706', '--dp-accent-hover': '#b45309', '--dp-accent-subtle': '#fef3c7', '--dp-accent-ring': 'rgba(217,119,6,0.25)', '--dp-radius-xs': '0', '--dp-radius-sm': '0', '--dp-radius-md': '0', '--dp-radius-lg': '0', '--dp-cell-radius': '0' } as React.CSSProperties}>
          <Row>
            <DatePicker placeholder="Select date…" />
            <TimePicker />
          </Row>
        </div>
      </Card>

      <Card label="Corporate slate — subtle, no shadows">
        <div style={{ '--dp-accent': '#475569', '--dp-shadow': 'none', '--dp-shadow-sm': 'none', '--dp-cell-radius': '0.25rem', '--dp-radius-md': '0.25rem', '--dp-radius-lg': '0.375rem' } as React.CSSProperties}>
          <Row>
            <FieldWrapper label="Meeting date" hint="Required for scheduling">
              <DatePicker placeholder="Select date…" />
            </FieldWrapper>
            <FieldWrapper label="Meeting time">
              <TimePicker hourCycle="h24" granularity="minute" />
            </FieldWrapper>
          </Row>
        </div>
      </Card>
    </div>
  ),
};

/* ============================================================
   Story 8 — Glass & Dark
   ============================================================ */
export const DarkAndGlass: StoryObj = {
  name: '✨ Dark & Glass Themes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '1rem' }}>
        <p style={{ margin: '0 0 1.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>Dark theme with range picker + presets</p>
        <DateRangePicker
          theme="dark"
          showFooter
          presets={[
            { label: 'Last 7 days', getValue: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate()-6); return { start: s, end: e }; } },
            { label: 'Last 30 days', getValue: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate()-29); return { start: s, end: e }; } },
            { label: 'This month', getValue: () => { const n = new Date(); return { start: new Date(n.getFullYear(), n.getMonth(), 1), end: new Date(n.getFullYear(), n.getMonth()+1, 0) }; } },
          ]}
        />
      </div>

      <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)', padding: '2rem', borderRadius: '1rem' }}>
        <p style={{ margin: '0 0 1.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Glass theme — frosted backdrop</p>
        <Row>
          <DatePicker theme="glass" placeholder="Select date…" />
          <TimePicker theme="glass" />
        </Row>
      </div>
    </div>
  ),
};

/* ============================================================
   Story 9 — High-Contrast & Accessibility
   ============================================================ */
export const HighContrast: StoryObj = {
  name: '🔲 High Contrast Theme',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.6 }}>
        The {CODE('"hc"')} theme maximises contrast for accessibility. All interactive elements have visible focus rings and borders.
      </p>
      <Row>
        <DatePicker theme="hc" placeholder="Select date…" />
        <TimePicker theme="hc" />
      </Row>
      <FieldWrapper label="Accessible date field" hint="Required" required id="hc-date" error="">
        <DatePicker theme="hc" id="hc-date" placeholder="Select date…" />
      </FieldWrapper>
    </div>
  ),
};

/* ============================================================
   Story 10 — CSS Variable Reference
   ============================================================ */
export const CssVariableReference: StoryObj = {
  name: '📖 CSS Variable Reference',
  render: () => (
    <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem', lineHeight: 1.7 }}>
      {([
        ['Colors', [
          ['--dp-accent', 'Primary action color (selected cells, focus ring, buttons)'],
          ['--dp-accent-hover', 'Hover accent'],
          ['--dp-accent-fg', 'Text on accent background (usually white)'],
          ['--dp-accent-subtle', 'Light tint of accent (range highlight)'],
          ['--dp-accent-ring', 'Focus ring color (rgba with opacity)'],
          ['--dp-bg', 'Popover / picker background'],
          ['--dp-surface', 'Input / button surface'],
          ['--dp-surface-hover', 'Hover surface'],
          ['--dp-border', 'Default border'],
          ['--dp-border-strong', 'Emphasized border (hover)'],
          ['--dp-text', 'Primary text'],
          ['--dp-text-muted', 'Labels, placeholders, weekday names'],
          ['--dp-text-disabled', 'Disabled / outside-month text'],
          ['--dp-disabled-opacity', 'Opacity multiplier for disabled state (default 0.35)'],
        ]],
        ['Shape', [
          ['--dp-radius-xs / sm / md / lg / xl', 'Border radii — override all at once or individually'],
          ['--dp-cell-radius', 'Calendar cell radius (defaults to --dp-radius-full for circles)'],
          ['--dp-shadow / --dp-shadow-sm', 'Popover and input drop shadows'],
        ]],
        ['Density (sizes)', [
          ['--dp-cell-size', 'Calendar cell width & height'],
          ['--dp-cell-font', 'Calendar cell font size'],
          ['--dp-weekday-font', 'Weekday header font size'],
          ['--dp-trigger-px / --dp-trigger-py', 'Trigger button horizontal / vertical padding'],
          ['--dp-trigger-font', 'Trigger button font size'],
          ['--dp-popover-padding', 'Popover inner padding'],
          ['--dp-spin-size', 'Time spin box size'],
          ['--dp-spin-font', 'Time spin box font size'],
          ['--dp-spin-btn-size', 'Time ▲/▼ button size'],
        ]],
        ['Built-in Themes', [
          ['light (default)', 'Clean light, blue accent'],
          ['dark', 'Slate dark, blue accent'],
          ['minimal', 'Flat, hairline borders, no shadow, square cells'],
          ['ocean', 'Teal/cyan, airy feel'],
          ['rose', 'Warm rose/pink accent'],
          ['purple', 'Violet/indigo accent'],
          ['amber', 'Warm amber, sunlit palette'],
          ['slate', 'Corporate grey, subtle shadows'],
          ['glass', 'Frosted backdrop blur, indigo accent'],
          ['hc', 'High contrast — black borders, maximum legibility'],
        ]],
        ['Trigger Styles (triggerStyle prop)', [
          ['default', 'Full button with label + icon + chevron'],
          ['icon', 'Icon-only circular button'],
          ['minimal', 'Underline only — content-first UIs'],
          ['pill', 'Accent-filled, fully rounded'],
          ['ghost', 'Invisible until hovered'],
        ]],
        ['Component Props', [
          ['theme', 'Built-in theme name'],
          ['density', 'compact | default | comfortable'],
          ['triggerStyle', 'Trigger appearance variant'],
          ['icon', 'Custom icon ReactNode, or null to hide'],
          ['renderTrigger(props)', 'Fully custom trigger render function'],
          ['renderPrevButton(onClick)', 'Custom ‹ prev-month button'],
          ['renderNextButton(onClick)', 'Custom › next-month button'],
          ['renderFooter(date, close)', 'Custom footer inside the calendar popover'],
          ['formatValue(date)', 'Custom date display string in trigger'],
          ['<FieldWrapper>', 'label / hint / error / status / required / labelAction'],
        ]],
      ] as [string, [string, string][]][]).map(([section, vars]) => (
        <div key={section} style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.45 }}>{section}</h3>
          {vars.map(([name, desc]) => (
            <div key={name} style={{ display: 'grid', gridTemplateColumns: '22rem 1fr', gap: '1rem', padding: '0.25rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <code style={{ color: '#2563eb' }}>{name}</code>
              <span style={{ opacity: 0.65 }}>{desc}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
