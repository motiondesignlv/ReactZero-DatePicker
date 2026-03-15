import { useState } from 'react';
import {
  DatePicker,
  TimePicker,
  DateRangePicker,
  type DpTheme,
  type DateRange,
} from '@reactzero/datepicker';
import '@reactzero/datepicker/styles';

const ALL_THEMES: string[] = [
  'light', 'dark', 'minimal', 'ocean', 'rose',
  'purple', 'amber', 'slate', 'glass', 'hc',
];

/** Themes that use a dark color scheme */
const DARK_THEMES = new Set(['dark']);

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code, lang = 'tsx' }: { code: string; lang?: string }) {
  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-lang">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useState<DpTheme>('light');
  const [date, setDate] = useState<Date | null>(null);
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`docs ${darkMode ? 'docs--dark' : ''}`}>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <a href="#" className="navbar-brand">@reactzero/datepicker</a>
          <div className="navbar-links">
            <a href="#features">Features</a>
            <a href="#demos">Demos</a>
            <a href="#themes">Themes</a>
            <a href="#usage">Usage</a>
            <a href="#customization">Customize</a>
            <a href="https://github.com/motiondesignlv/reactzero-datepicker" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://69b589f74a0ec7ecc0bc217f-swkwfanwje.chromatic.com/" target="_blank" rel="noopener noreferrer">
              Storybook
            </a>
            <button
              className="dark-toggle"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '\u2600' : '\u263E'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="hero">
        <div className="container">
          <h1 className="hero-title">@reactzero/datepicker</h1>
          <p className="hero-subtitle">
            A zero-dependency, accessible React date &amp; time picker.
            <br />
            WCAG 2.1 AA &middot; 10 themes &middot; {'<'}12 kB gzipped
          </p>
          <div className="hero-badges">
            <a href="https://www.npmjs.com/package/@reactzero/datepicker" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/@reactzero/datepicker?color=cb3837&logo=npm&label=npm" alt="npm version" /></a>
            <a href="https://www.npmjs.com/package/@reactzero/datepicker" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/dm/@reactzero/datepicker?color=cb3837" alt="npm downloads" /></a>
            <a href="https://69b589f74a0ec7ecc0bc217f-swkwfanwje.chromatic.com/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/storybook-live-ff4785?logo=storybook&logoColor=white" alt="Storybook" /></a>
            <a href="https://www.chromatic.com/builds?appId=69b589f74a0ec7ecc0bc217f" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/chromatic-visual--tests-fc521f?logo=chromatic" alt="Chromatic" /></a>
            <a href="https://bundlephobia.com/package/@reactzero/datepicker" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/bundlephobia/minzip/@reactzero/datepicker" alt="bundle size" /></a>
            <a href="https://github.com/motiondesignlv/reactzero-datepicker/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/l/@reactzero/datepicker" alt="license" /></a>
          </div>
          <div className="hero-install">
            <code>npm install @reactzero/datepicker</code>
            <CopyButton text="npm install @reactzero/datepicker" />
          </div>
          <div className="hero-actions">
            <a href="#demos" className="btn btn-primary">Live Demos</a>
            <a
              href="https://github.com/motiondesignlv/reactzero-datepicker"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
            <a href="./ai-reference.md" download className="btn btn-ai">
              AI Reference (.md)
            </a>
          </div>
        </div>
      </header>

      {/* ── Features ── */}
      <section id="features" className="section">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            {[
              { icon: '0', title: 'Zero Dependencies', desc: 'No third-party runtime dependencies. Just React.' },
              { icon: '\u26A1', title: 'Tiny Bundle', desc: 'Under 12 kB gzipped (JS + CSS). Tree-shakeable ESM.' },
              { icon: '\u267F', title: 'Accessible', desc: 'WCAG 2.1 AA compliant. Full keyboard navigation, ARIA patterns, screen reader tested.' },
              { icon: '\uD83C\uDFA8', title: '10 Themes', desc: 'Light, dark, minimal, ocean, rose, purple, amber, slate, glass, and high-contrast.' },
              { icon: '\uD83C\uDF0D', title: 'i18n Ready', desc: 'Built on Intl.DateTimeFormat. RTL support, locale-aware formatting.' },
              { icon: '\uD83E\uDDE9', title: '4 Variants', desc: 'DatePicker, TimePicker, DateRangePicker, and DateTimePicker.' },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Demos ── */}
      <section id="demos" className="section section--alt">
        <div className="container">
          <h2 className="section-title">Live Demos</h2>

          <div className="demo-grid">
            {/* DatePicker */}
            <div className="demo-card">
              <h3>DatePicker</h3>
              <p>Single date selection with popover calendar.</p>
              <div className={`demo-preview ${
                DARK_THEMES.has(theme) && !darkMode ? 'demo-preview--dark' :
                !DARK_THEMES.has(theme) && darkMode ? 'demo-preview--light' : ''
              }`}>
                <DatePicker
                  id="demo-date"
                  theme={theme}
                  value={date ?? undefined}
                  onChange={setDate}
                  placeholder="Pick a date"
                />
              </div>
              <div className="demo-value">
                Selected: {date ? date.toLocaleDateString() : 'none'}
              </div>
            </div>

            {/* DatePicker Compact */}
            <div className="demo-card">
              <h3>Compact Density</h3>
              <p>Smaller cells and tighter spacing for dense UIs.</p>
              <div className={`demo-preview ${
                DARK_THEMES.has(theme) && !darkMode ? 'demo-preview--dark' :
                !DARK_THEMES.has(theme) && darkMode ? 'demo-preview--light' : ''
              }`}>
                <DatePicker
                  id="demo-compact"
                  theme={theme}
                  density="compact"
                  placeholder="Compact"
                />
              </div>
            </div>

            {/* TimePicker */}
            <div className="demo-card">
              <h3>TimePicker</h3>
              <p>Time selection with hour/minute spinbuttons.</p>
              <div className={`demo-preview ${
                DARK_THEMES.has(theme) && !darkMode ? 'demo-preview--dark' :
                !DARK_THEMES.has(theme) && darkMode ? 'demo-preview--light' : ''
              }`}>
                <TimePicker
                  id="demo-time"
                  theme={theme as string}
                />
              </div>
            </div>

            {/* DateRangePicker */}
            <div className="demo-card demo-card--wide">
              <h3>DateRangePicker</h3>
              <p>Select a start and end date with visual range highlighting.</p>
              <div className={`demo-preview ${
                DARK_THEMES.has(theme) && !darkMode ? 'demo-preview--dark' :
                !DARK_THEMES.has(theme) && darkMode ? 'demo-preview--light' : ''
              }`}>
                <DateRangePicker
                  id="demo-range"
                  theme={theme as string}
                  value={range}
                  onChange={setRange}
                />
              </div>
              <div className="demo-value">
                Range: {range.start ? range.start.toLocaleDateString() : '...'} — {range.end ? range.end.toLocaleDateString() : '...'}
              </div>
            </div>
          </div>

          <h3 className="subsection-title" style={{ marginTop: '3rem' }}>Trigger Styles</h3>
          <p className="section-desc">
            Choose from 5 built-in trigger styles with the <code>triggerStyle</code> prop.
          </p>

          <div className="demo-grid">
            <div className="demo-card">
              <h3>Default</h3>
              <p>Full input with icon.</p>
              <div className={`demo-preview ${
                DARK_THEMES.has(theme) && !darkMode ? 'demo-preview--dark' :
                !DARK_THEMES.has(theme) && darkMode ? 'demo-preview--light' : ''
              }`}>
                <DatePicker id="trig-default" theme={theme} placeholder="Default" />
              </div>
              <CodeBlock code={`<DatePicker triggerStyle="default" />`} />
            </div>

            <div className="demo-card">
              <h3>Icon Only</h3>
              <p>Compact circular icon button.</p>
              <div className={`demo-preview ${
                DARK_THEMES.has(theme) && !darkMode ? 'demo-preview--dark' :
                !DARK_THEMES.has(theme) && darkMode ? 'demo-preview--light' : ''
              }`}>
                <DatePicker id="trig-icon" theme={theme} triggerStyle="icon" />
              </div>
              <CodeBlock code={`<DatePicker triggerStyle="icon" />`} />
            </div>

            <div className="demo-card">
              <h3>Minimal</h3>
              <p>Underline only, no box.</p>
              <div className={`demo-preview ${
                DARK_THEMES.has(theme) && !darkMode ? 'demo-preview--dark' :
                !DARK_THEMES.has(theme) && darkMode ? 'demo-preview--light' : ''
              }`}>
                <DatePicker id="trig-minimal" theme={theme} triggerStyle="minimal" placeholder="Minimal" />
              </div>
              <CodeBlock code={`<DatePicker triggerStyle="minimal" />`} />
            </div>

            <div className="demo-card">
              <h3>Pill</h3>
              <p>Fully rounded, accent-filled.</p>
              <div className={`demo-preview ${
                DARK_THEMES.has(theme) && !darkMode ? 'demo-preview--dark' :
                !DARK_THEMES.has(theme) && darkMode ? 'demo-preview--light' : ''
              }`}>
                <DatePicker id="trig-pill" theme={theme} triggerStyle="pill" placeholder="Pill style" />
              </div>
              <CodeBlock code={`<DatePicker triggerStyle="pill" />`} />
            </div>

            <div className="demo-card">
              <h3>Ghost</h3>
              <p>Transparent, shows border on hover.</p>
              <div className={`demo-preview ${
                DARK_THEMES.has(theme) && !darkMode ? 'demo-preview--dark' :
                !DARK_THEMES.has(theme) && darkMode ? 'demo-preview--light' : ''
              }`}>
                <DatePicker id="trig-ghost" theme={theme} triggerStyle="ghost" placeholder="Ghost" />
              </div>
              <CodeBlock code={`<DatePicker triggerStyle="ghost" />`} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Theme Showcase ── */}
      <section id="themes" className="section">
        <div className="container">
          <h2 className="section-title">Themes</h2>
          <p className="section-desc">
            Switch themes with a single prop. All powered by CSS custom properties.
          </p>

          <div className="theme-switcher">
            {ALL_THEMES.map((t) => (
              <button
                key={t}
                className={`theme-chip ${theme === t ? 'theme-chip--active' : ''}`}
                onClick={() => setTheme(t as DpTheme)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className={`theme-demo ${
            DARK_THEMES.has(theme) && !darkMode ? 'theme-demo--dark' :
            !DARK_THEMES.has(theme) && darkMode ? 'theme-demo--light' : ''
          }`}>
            <DatePicker
              id="theme-demo"
              theme={theme}
              inline
            />
          </div>

          <CodeBlock code={`<DatePicker theme="${theme}" />`} />
        </div>
      </section>

      {/* ── Usage ── */}
      <section id="usage" className="section section--alt">
        <div className="container">
          <h2 className="section-title">Quick Start</h2>

          <CodeBlock
            lang="bash"
            code="npm install @reactzero/datepicker"
          />

          <CodeBlock code={`import { DatePicker } from '@reactzero/datepicker';
import '@reactzero/datepicker/styles';

function App() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <DatePicker
      value={date ?? undefined}
      onChange={setDate}
      placeholder="Select date"
      theme="ocean"
    />
  );
}`} />

          <h3 className="subsection-title">TimePicker</h3>
          <CodeBlock code={`import { TimePicker } from '@reactzero/datepicker';
import '@reactzero/datepicker/styles';

function App() {
  return (
    <TimePicker
      id="meeting-time"
      granularity="minute"
      hourCycle={12}
      theme="ocean"
    />
  );
}`} />

          <h3 className="subsection-title">DateRangePicker</h3>
          <CodeBlock code={`import { useState } from 'react';
import { DateRangePicker, type DateRange } from '@reactzero/datepicker';
import '@reactzero/datepicker/styles';

function App() {
  const [range, setRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  return (
    <DateRangePicker
      id="trip-dates"
      value={range}
      onChange={setRange}
      theme="rose"
    />
  );
}`} />

          <h3 className="subsection-title">Inline Calendar</h3>
          <CodeBlock code={`<DatePicker
  id="embedded-cal"
  inline
  theme="minimal"
  onChange={(date) => console.log(date)}
/>`} />

          <h3 className="subsection-title">Custom Trigger</h3>
          <CodeBlock code={`<DatePicker
  id="custom"
  renderTrigger={({ onClick, selectedDate, placeholder }) => (
    <button onClick={onClick} className="my-button">
      {selectedDate
        ? selectedDate.toLocaleDateString()
        : placeholder}
    </button>
  )}
/>`} />

          <h3 className="subsection-title">Headless Usage</h3>
          <p className="section-desc">
            Use the hooks directly for full control over rendering.
          </p>

          <CodeBlock code={`import { useDatePicker } from '@reactzero/datepicker';

function MyDatePicker() {
  const {
    state,
    isOpen,
    toggle,
    getCellProps,
    getGridProps,
  } = useDatePicker({ closeOnSelect: true });

  return (
    <div>
      <button onClick={toggle}>
        {state.selectedDate?.toLocaleDateString() ?? 'Pick date'}
      </button>
      {isOpen && (
        <div {...getGridProps()}>
          {state.grid.map((week, i) => (
            <div key={i} role="row">
              {week.map((date) => (
                <button key={date.toISOString()} {...getCellProps(date)}>
                  {date.getDate()}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`} />
        </div>
      </section>

      {/* ── Customization ── */}
      <section id="customization" className="section">
        <div className="container">
          <h2 className="section-title">Customization</h2>
          <p className="section-desc">
            Every visual aspect is controlled by CSS custom properties. Override them globally or scope to a container.
          </p>

          <h3 className="subsection-title">Global Override</h3>
          <CodeBlock lang="css" code={`:root {
  --dp-accent: #8b5cf6;        /* Primary accent color */
  --dp-accent-hover: #7c3aed;  /* Hover state */
  --dp-bg: #ffffff;             /* Calendar background */
  --dp-text: #1e293b;           /* Text color */
  --dp-border: #e2e8f0;         /* Border color */
  --dp-cell-size: 2.5rem;       /* Day cell size */
  --dp-radius: 8px;             /* Border radius */
  --dp-font: inherit;           /* Font family */
}`} />

          <h3 className="subsection-title">Scoped to a Container</h3>
          <CodeBlock lang="css" code={`.my-form .dp-container {
  --dp-accent: #059669;
  --dp-bg: #f0fdf4;
  --dp-cell-size: 2rem;
  --dp-radius: 12px;
}`} />

          <h3 className="subsection-title">Brand Colors Example</h3>
          <CodeBlock code={`// Apply brand colors using a wrapper
function BrandDatePicker(props) {
  return (
    <div style={{
      '--dp-accent': '#e11d48',
      '--dp-accent-hover': '#be123c',
    } as React.CSSProperties}>
      <DatePicker {...props} />
    </div>
  );
}`} />

          <h3 className="subsection-title">Density Modes</h3>
          <CodeBlock code={`{/* Compact — smaller cells, tighter spacing */}
<DatePicker density="compact" />

{/* Default — balanced for most UIs */}
<DatePicker density="default" />

{/* Comfortable — larger touch targets */}
<DatePicker density="comfortable" />`} />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container footer-inner">
          <p>
            MIT License &middot; Built by{' '}
            <a href="https://github.com/motiondesignlv" target="_blank" rel="noopener noreferrer">
              motiondesignlv
            </a>
          </p>
          <div className="footer-links">
            <a href="https://github.com/motiondesignlv/reactzero-datepicker" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.npmjs.com/package/@reactzero/datepicker" target="_blank" rel="noopener noreferrer">npm</a>
            <a href="https://69b589f74a0ec7ecc0bc217f-swkwfanwje.chromatic.com/" target="_blank" rel="noopener noreferrer">Storybook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
