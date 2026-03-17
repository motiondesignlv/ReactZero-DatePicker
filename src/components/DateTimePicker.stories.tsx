import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect, fn } from '@storybook/test';
import { DateTimePicker } from './DateTimePicker';

const meta = {
  title: 'Components/DateTimePicker',
  component: DateTimePicker,
  parameters: {},
  tags: ['autodocs'],
  args: { onChange: fn() },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Select date...',
    layout: 'column',
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Open the date popover', async () => {
      await userEvent.click(canvas.getByRole('combobox'));
      await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    });

    await step('Select a date', async () => {
      const cells = canvas.getAllByRole('gridcell')
        .filter(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      await userEvent.click(cells[10]);
      await expect(args.onChange).toHaveBeenCalled();
    });

    await step('Adjust the time — increment hour', async () => {
      await userEvent.click(canvas.getByLabelText('Increase hour'));
    });

    await step('Verify onChange was called for both date and time', async () => {
      const calls = (args.onChange as ReturnType<typeof fn>).mock.calls;
      await expect(calls.length).toBeGreaterThanOrEqual(2);
    });
  },
};

export const RowLayout: Story = {
  args: {
    placeholder: 'Select date...',
    layout: 'row',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Open the date popover in row layout', async () => {
      await userEvent.click(canvas.getByRole('combobox'));
      await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    });

    await step('Select a date and verify input updates', async () => {
      const cells = canvas.getAllByRole('gridcell')
        .filter(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      await userEvent.click(cells[7]);
      await expect((canvas.getByRole('combobox') as HTMLInputElement).value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  },
};

export const TwentyFourHour: Story = {
  name: '24-Hour Clock',
  args: {
    placeholder: 'Select date...',
    hourCycle: 'h24',
    layout: 'column',
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Verify 24-hour mode — no AM/PM toggle', async () => {
      await expect(canvas.queryByLabelText('period')).toBeNull();
    });

    await step('Verify hour spinbutton range is 0–23', async () => {
      const hourSpin = canvas.getByRole('spinbutton', { name: 'Hour' });
      await expect(hourSpin).toHaveAttribute('aria-valuemin', '0');
      await expect(hourSpin).toHaveAttribute('aria-valuemax', '23');
    });
  },
};

/* ── A11y: Keyboard Full Flow ─────────────────────────────────── */
export const KeyboardFullFlow: Story = {
  name: 'A11y — Keyboard Full Flow',
  args: {
    placeholder: 'Select date...',
    layout: 'column',
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step('Open date picker via Enter', async () => {
      const trigger = canvas.getByRole('combobox');
      trigger.focus();
      await userEvent.keyboard('{Enter}');
      await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    });

    await step('Navigate grid with arrows and select via Enter', async () => {
      const cells = canvas.getAllByRole('gridcell')
        .filter(c => !c.getAttribute('aria-disabled') && c.dataset.outsideMonth !== 'true');
      await userEvent.click(cells[8]);
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{Enter}');
      await expect(args.onChange).toHaveBeenCalled();
    });

    await step('Tab to TimePicker and use ArrowUp', async () => {
      const hourSpin = canvas.getByRole('spinbutton', { name: 'Hour' });
      hourSpin.focus();
      await expect(hourSpin).toHaveFocus();
      await userEvent.keyboard('{ArrowUp}');
    });

    await step('Verify onChange called for both date and time', async () => {
      const calls = (args.onChange as ReturnType<typeof fn>).mock.calls;
      await expect(calls.length).toBeGreaterThanOrEqual(2);
    });
  },
};

export const WithQuarterHourSteps: Story = {
  name: '15-Minute Steps',
  args: {
    placeholder: 'Select date...',
    minuteStep: 15,
    layout: 'column',
  },
};

export const WithOfficeHoursOnly: Story = {
  name: 'Office Hours Only (9-17)',
  args: {
    placeholder: 'Select date...',
    hourCycle: 'h24',
    disabledHours: [0,1,2,3,4,5,6,7,8,18,19,20,21,22,23],
    layout: 'column',
  },
};
