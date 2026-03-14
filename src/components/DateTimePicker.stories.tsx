import type { Meta, StoryObj } from '@storybook/react';
import { DateTimePicker } from './DateTimePicker';

const meta = {
  title: 'Components/DateTimePicker',
  component: DateTimePicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: { onChange: { action: 'datetime changed' } },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Select date...',
    layout: 'column',
  },
};

export const RowLayout: Story = {
  args: {
    placeholder: 'Select date...',
    layout: 'row',
  },
};

export const TwentyFourHour: Story = {
  name: '24-Hour Clock',
  args: {
    placeholder: 'Select date...',
    hourCycle: 'h24',
    layout: 'column',
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
  name: 'Office Hours Only (9–17)',
  args: {
    placeholder: 'Select date...',
    hourCycle: 'h24',
    disabledHours: [0,1,2,3,4,5,6,7,8,18,19,20,21,22,23],
    layout: 'column',
  },
};
