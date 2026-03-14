import type { Meta, StoryObj } from '@storybook/react';
import { DateRangePicker } from './DateRangePicker';

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: { onChange: { action: 'range changed' } },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithFooter: Story = {
  args: { showFooter: true },
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
};

export const WithDisabledDays: Story = {
  name: 'Disabled Days (weekends)',
  args: {
    isDateDisabled: (date: Date) => date.getDay() === 0 || date.getDay() === 6,
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
};
