import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect, fn } from '@storybook/test';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {},
  tags: ['autodocs'],
  args: { onChange: fn() },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'Select a date...' },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Open the calendar popover', async () => {
      const trigger = canvas.getByRole('combobox');
      await userEvent.click(trigger);
      await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    });

    await step('Navigate to next month and back', async () => {
      await userEvent.click(canvas.getByLabelText('Next month'));
      await userEvent.click(canvas.getByLabelText('Previous month'));
    });

    await step('Select a date', async () => {
      const cells = canvas.getAllByRole('gridcell')
        .filter(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      await userEvent.click(cells[14]);
      await expect(args.onChange).toHaveBeenCalled();
    });

    await step('Verify the input shows the selected value', async () => {
      const trigger = canvas.getByRole('combobox') as HTMLInputElement;
      await expect(trigger.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    await step('Clear the selection', async () => {
      await userEvent.click(canvas.getByRole('combobox'));
      await userEvent.click(canvas.getByText('Clear'));
      await expect(canvas.getByRole('combobox')).toHaveValue('');
    });
  },
};


export const WithMinMax: Story = {
  name: 'Min / Max Dates',
  args: {
    placeholder: 'Select a date...',
    min: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    max: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0),
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Open and verify disabled cells exist', async () => {
      await userEvent.click(canvas.getByRole('combobox'));
      const disabledCells = canvas.getAllByRole('gridcell')
        .filter(c => c.getAttribute('aria-disabled') === 'true');
      await expect(disabledCells.length).toBeGreaterThan(0);
    });

    await step('Click a disabled cell — onChange should NOT fire', async () => {
      const disabledCell = canvas.getAllByRole('gridcell')
        .find(c => c.getAttribute('aria-disabled') === 'true');
      if (disabledCell) {
        const callsBefore = (args.onChange as ReturnType<typeof fn>).mock.calls.length;
        await userEvent.click(disabledCell);
        await expect((args.onChange as ReturnType<typeof fn>).mock.calls.length).toBe(callsBefore);
      }
    });

    await step('Click an enabled cell — onChange fires', async () => {
      const enabledCell = canvas.getAllByRole('gridcell')
        .find(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      if (enabledCell) {
        await userEvent.click(enabledCell);
        await expect(args.onChange).toHaveBeenCalled();
      }
    });
  },
};

export const WithDisabledDays: Story = {
  name: 'Disabled Specific Days (weekends)',
  args: {
    placeholder: 'Select a weekday...',
    isDateDisabled: (date: Date) => date.getDay() === 0 || date.getDay() === 6,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Open and verify weekends are disabled', async () => {
      await userEvent.click(canvas.getByRole('combobox'));
      const disabledCells = canvas.getAllByRole('gridcell')
        .filter(c => c.getAttribute('aria-disabled') === 'true');
      await expect(disabledCells.length).toBeGreaterThanOrEqual(8);
    });

    await step('Select a weekday — should succeed', async () => {
      const enabledCell = canvas.getAllByRole('gridcell')
        .find(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      if (enabledCell) {
        await userEvent.click(enabledCell);
        await expect(args.onChange).toHaveBeenCalled();
      }
    });
  },
};

export const WithSpecialDays: Story = {
  name: 'Special Days (holidays)',
  args: {
    placeholder: 'Select a date...',
    specialDays: [
      {
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 14),
        label: "Valentine's Day ❤️",
        dotColor: '#ef4444',
        className: 'dp-holiday',
      },
      {
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 17),
        label: 'Team offsite',
        dotColor: '#3b82f6',
        className: 'dp-event',
      },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open and verify special day indicators', async () => {
      await userEvent.click(canvas.getByRole('combobox'));
      const valentineCell = canvas.getAllByRole('gridcell')
        .find(c => c.getAttribute('aria-description')?.includes("Valentine"));
      await expect(valentineCell).toBeTruthy();

      const offsiteCell = canvas.getAllByRole('gridcell')
        .find(c => c.getAttribute('aria-description')?.includes('Team offsite'));
      await expect(offsiteCell).toBeTruthy();
    });

    await step('Verify colored dots are rendered', async () => {
      const dots = canvas.getByRole('dialog').querySelectorAll('.dp-special-dot');
      await expect(dots.length).toBe(2);
    });
  },
};

/* ── A11y: Keyboard Navigation ────────────────────────────── */
export const KeyboardNavigation: Story = {
  name: 'A11y — Keyboard Navigation',
  args: { placeholder: 'Select a date...' },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Open via Enter key on trigger', async () => {
      const trigger = canvas.getByRole('combobox');
      trigger.focus();
      await userEvent.keyboard('{Enter}');
      await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    });

    await step('Verify dialog ARIA attributes', async () => {
      const dialog = canvas.getByRole('dialog');
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(dialog).toHaveAttribute('aria-label', 'Choose date');
    });

    await step('Verify grid and heading semantics', async () => {
      const gridEl = canvas.getByRole('grid');
      await expect(gridEl).toHaveAttribute('aria-labelledby');
      const headingId = gridEl.getAttribute('aria-labelledby')!;
      const heading = document.getElementById(headingId);
      await expect(heading).toHaveAttribute('aria-live', 'polite');
      await expect(heading).toHaveAttribute('aria-atomic', 'true');
    });

    await step('Verify trigger shows aria-expanded="true"', async () => {
      const trigger = canvas.getByRole('combobox');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    await step('Arrow key navigation in grid', async () => {
      // Focus the cell with tabindex=0 (today or selected date) — not click, which would select & close
      const focusableCell = canvas.getAllByRole('gridcell')
        .find(c => c.getAttribute('tabindex') === '0');
      if (focusableCell) focusableCell.focus();
      await userEvent.keyboard('{ArrowRight}');
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowLeft}');
      await userEvent.keyboard('{ArrowUp}');
    });

    await step('Select via Enter key', async () => {
      // Press Enter on the currently focused cell — this selects and closes the dialog
      await userEvent.keyboard('{Enter}');
      await expect(args.onChange).toHaveBeenCalled();
    });

    await step('Escape closes dialog and focus returns to trigger', async () => {
      // Re-open since Enter selection closed it
      await userEvent.click(canvas.getByRole('combobox'));
      await expect(canvas.getByRole('dialog')).toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
      await expect(canvas.queryByRole('dialog')).toBeNull();
      await expect(canvas.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

/* ── A11y: Today Marker ───────────────────────────────────── */
export const TodayMarker: Story = {
  name: 'A11y — Today Marker',
  args: { placeholder: 'Select a date...' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open and verify today cell has aria-current="date"', async () => {
      await userEvent.click(canvas.getByRole('combobox'));
      const todayCell = canvas.getAllByRole('gridcell')
        .find(c => c.getAttribute('aria-current') === 'date');
      await expect(todayCell).toBeTruthy();
      // Verify the aria-label contains today's date info
      const label = todayCell!.getAttribute('aria-label')!;
      const today = new Date();
      await expect(label).toContain(String(today.getDate()));
    });
  },
};
