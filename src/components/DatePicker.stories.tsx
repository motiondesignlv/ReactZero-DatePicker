import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: { onChange: { action: 'changed' } },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'Select a date...' },
};


export const WithMinMax: Story = {
  name: 'Min / Max Dates',
  args: {
    placeholder: 'Select a date...',
    min: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    max: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0),
  },
};

export const WithDisabledDays: Story = {
  name: 'Disabled Specific Days (weekends)',
  args: {
    placeholder: 'Select a weekday...',
    isDateDisabled: (date: Date) => date.getDay() === 0 || date.getDay() === 6,
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
};
