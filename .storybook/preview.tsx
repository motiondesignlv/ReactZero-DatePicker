import type { Preview } from '@storybook/react';
import '../src/styles/datepicker.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '3rem 2rem 20rem',
        minHeight: '100vh',
        fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
      }}>
        <div style={{ width: '100%', maxWidth: 1200 }}>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      story: {
        height: '500px',
      },
    },
  },
};

export default preview;
