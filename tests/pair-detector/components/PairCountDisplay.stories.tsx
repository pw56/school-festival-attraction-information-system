import type { Meta, StoryObj } from '@storybook/react';
import PairCountDisplay from './PairCountDisplay';

const meta: Meta<typeof PairCountDisplay> = {
  title: 'Components/PairCountDisplay',
  component: PairCountDisplay,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'number',
      description: '表示するペアの数',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PairCountDisplay>;

export const Default: Story = {
  args: {
    children: 5,
  },
};

export const Zero: Story = {
  args: {
    children: 0,
  },
};

export const LargeNumber: Story = {
  args: {
    children: 123,
  },
};
