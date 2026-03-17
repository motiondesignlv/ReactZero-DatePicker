import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect, fn } from '@storybook/test';
import { DateRangePicker } from './DateRangePicker';

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  parameters: {},
  tags: ['autodocs'],
  args: { onChange: fn() },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Click start input to open calendar', async () => {
      await userEvent.click(canvas.getByPlaceholderText('Start date'));
      await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    });

    await step('Select start date (first enabled cell)', async () => {
      const cells = canvas.getAllByRole('gridcell')
        .filter(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      await userEvent.click(cells[4]);
    });

    await step('Select end date (a later cell)', async () => {
      const cells = canvas.getAllByRole('gridcell')
        .filter(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      await userEvent.click(cells[10]);
    });

    await step('Verify both inputs are populated and onChange fired', async () => {
      const startInput = canvas.getByPlaceholderText('Start date') as HTMLInputElement;
      const endInput = canvas.getByPlaceholderText('End date') as HTMLInputElement;
      await expect(startInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      await expect(endInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      await expect(args.onChange).toHaveBeenCalled();
    });
  },
};

export const WithFooter: Story = {
  args: { showFooter: true, closeOnSelect: false },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open calendar and select a range', async () => {
      await userEvent.click(canvas.getByPlaceholderText('Start date'));
      const cells = canvas.getAllByRole('gridcell')
        .filter(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      await userEvent.click(cells[2]);
      await userEvent.click(cells[8]);
    });

    await step('Click Clear — inputs should empty', async () => {
      await userEvent.click(canvas.getByText('Clear'));
      const startInput = canvas.getByPlaceholderText('Start date') as HTMLInputElement;
      await expect(startInput.value).toBe('');
    });

    await step('Select again and click Apply — popover should close', async () => {
      const cells = canvas.getAllByRole('gridcell')
        .filter(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      await userEvent.click(cells[3]);
      await userEvent.click(cells[9]);
      await userEvent.click(canvas.getByText('Apply'));
      await expect(canvas.queryByRole('dialog')).toBeNull();
    });
  },
};

export const WithPresets: Story = {
  args: {
    showFooter: true,
    presets: [
      {
        label: 'Last 7 days',
        getValue: () => {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - 6);
          return { start, end };
        },
      },
      {
        label: 'Last 30 days',
        getValue: () => {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - 29);
          return { start, end };
        },
      },
      {
        label: 'This month',
        getValue: () => {
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          return { start, end };
        },
      },
    ],
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Open calendar', async () => {
      await userEvent.click(canvas.getByPlaceholderText('Start date'));
      await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    });

    await step('Click "Last 7 days" preset', async () => {
      await userEvent.click(canvas.getByText('Last 7 days'));
    });

    await step('Verify both inputs are populated', async () => {
      const startInput = canvas.getByPlaceholderText('Start date') as HTMLInputElement;
      const endInput = canvas.getByPlaceholderText('End date') as HTMLInputElement;
      await expect(startInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      await expect(endInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      await expect(args.onChange).toHaveBeenCalled();
    });

    await step('Click "This month" preset', async () => {
      await userEvent.click(canvas.getByText('This month'));
      const startInput = canvas.getByPlaceholderText('Start date') as HTMLInputElement;
      await expect(startInput.value).toMatch(/-01$/);
    });
  },
};

export const WithDisabledDays: Story = {
  name: 'Disabled Days (weekends)',
  args: {
    isDateDisabled: (date: Date) => date.getDay() === 0 || date.getDay() === 6,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open and verify weekend cells are disabled', async () => {
      await userEvent.click(canvas.getByPlaceholderText('Start date'));
      const disabledCells = canvas.getAllByRole('gridcell')
        .filter(c => c.getAttribute('aria-disabled') === 'true');
      await expect(disabledCells.length).toBeGreaterThanOrEqual(8);
    });
  },
};

/* ── A11y: ARIA Semantics ─────────────────────────────────────── */
export const AriaSemantics: Story = {
  name: 'A11y — ARIA Semantics',
  args: { closeOnSelect: false },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify input group and input labels', async () => {
      await expect(canvas.getByRole('group')).toBeInTheDocument();
      await expect(canvas.getByLabelText('Start date')).toBeInTheDocument();
      await expect(canvas.getByLabelText('End date')).toBeInTheDocument();
    });

    await step('Open and verify dialog semantics', async () => {
      await userEvent.click(canvas.getByPlaceholderText('Start date'));
      const dialog = canvas.getByRole('dialog');
      await expect(dialog).toHaveAttribute('aria-label', 'Select date range');
    });

    await step('Verify grid is multi-selectable', async () => {
      const grid = canvas.getByRole('grid');
      await expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    });

    await step('Select start date and verify aria-label prefix', async () => {
      const cells = canvas.getAllByRole('gridcell')
        .filter(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      await userEvent.click(cells[5]);
      // After clicking start, the cell label should include "start of range"
      const startCell = canvas.getAllByRole('gridcell')
        .find(c => c.getAttribute('aria-label')?.includes('start of range'));
      await expect(startCell).toBeTruthy();
    });

    await step('Select end date and verify range labels', async () => {
      const cells = canvas.getAllByRole('gridcell')
        .filter(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      await userEvent.click(cells[12]);
      // End cell should say "end of range"
      const endCell = canvas.getAllByRole('gridcell')
        .find(c => c.getAttribute('aria-label')?.includes('end of range'));
      await expect(endCell).toBeTruthy();
      // Cells in between should say "in range"
      const inRangeCells = canvas.getAllByRole('gridcell')
        .filter(c => c.getAttribute('aria-label')?.includes('in range'));
      await expect(inRangeCells.length).toBeGreaterThan(0);
    });
  },
};

export const WithSpecialDays: Story = {
  name: 'Special Days (events)',
  args: {
    specialDays: [
      {
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
        label: 'Sprint review',
        dotColor: '#8b5cf6',
      },
      {
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
        label: 'Deadline',
        dotColor: '#ef4444',
      },
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open and verify special days have indicators', async () => {
      await userEvent.click(canvas.getByPlaceholderText('Start date'));
      const sprintCell = canvas.getAllByRole('gridcell')
        .find(c => c.getAttribute('aria-description')?.includes('Sprint review'));
      await expect(sprintCell).toBeTruthy();

      const deadlineCell = canvas.getAllByRole('gridcell')
        .find(c => c.getAttribute('aria-description')?.includes('Deadline'));
      await expect(deadlineCell).toBeTruthy();
    });
  },
};
