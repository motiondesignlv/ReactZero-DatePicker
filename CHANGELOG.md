# @reactzero/datepicker Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-14

### Added
- DatePicker component with full keyboard navigation and WCAG 2.1 AA compliance
- TimePicker component with inline and popover modes
- DateRangePicker component with hover preview and preset ranges
- DateTimePicker composite component
- CalendarGrid presentational component
- FieldWrapper for form integration with labels, hints, and error states
- TimeInput compact time entry component
- Headless hooks: `useDatePicker`, `useTimePicker`, `useRangePicker`, `useCalendarState`
- Zero-dependency date/time utilities using native `Intl` and `Date` APIs
- 10 built-in themes via CSS custom properties (light, dark, minimal, ocean, rose, purple, amber, slate, glass, high-contrast)
- 3 density modes: compact, default, comfortable
- Full i18n support via `Intl.DateTimeFormat` (RTL, first-day-of-week, locale-aware formatting)
- 5 trigger style variants: default, icon, minimal, pill, ghost
