/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts,js,jsx,tsx}',
  ],
  safelist: [
    {
      pattern: /grid-cols-\d+/,
    },
  ],
  theme: {
    extend: {
      borderRadius: {
        custom: 'var(--radius)',
      },
      colors: {
        // Dark theme colors
        dark: {
          bg: {
            1: 'var(--color-dark-bg-1)',
            2: 'var(--color-dark-bg-2)',
            3: 'var(--color-dark-bg-3)',
            4: 'var(--color-dark-bg-4)',
          },
          text: {
            1: 'var(--color-dark-text-1)',
            2: 'var(--color-dark-text-2)',
            3: 'var(--color-dark-text-3)',
          },
          primary: {
            1: 'var(--color-dark-primary-1)',
            2: 'var(--color-dark-primary-2)',
          },
          secondary: {
            1: 'var(--color-dark-secondary-1)',
            2: 'var(--color-dark-secondary-2)',
          },
        },
        // Light theme colors
        light: {
          bg: {
            1: 'var(--color-light-bg-1)',
            2: 'var(--color-light-bg-2)',
            3: 'var(--color-light-bg-3)',
            4: 'var(--color-light-bg-4)',
          },
          text: {
            1: 'var(--color-light-text-1)',
            2: 'var(--color-light-text-2)',
            3: 'var(--color-light-text-3)',
          },
          primary: {
            1: 'var(--color-light-primary-1)',
            2: 'var(--color-light-primary-2)',
          },
          secondary: {
            1: 'var(--color-light-secondary-1)',
            2: 'var(--color-light-secondary-2)',
          },
        },
        // Current theme (uses CSS vars that switch based on .light class)
        bg: {
          1: 'var(--color-bg-1)',
          2: 'var(--color-bg-2)',
          3: 'var(--color-bg-3)',
          4: 'var(--color-bg-4)',
        },
        text: {
          1: 'var(--color-text-1)',
          2: 'var(--color-text-2)',
          3: 'var(--color-text-3)',
        },
        primary: {
          1: 'var(--color-primary-1)',
          2: 'var(--color-primary-2)',
        },
        secondary: {
          1: 'var(--color-secondary-1)',
          2: 'var(--color-secondary-2)',
        },
        correct: {
          1: 'var(--color-correct-1)',
          2: 'var(--color-correct-2)',
        },
        error: {
          1: 'var(--color-error-1)',
          2: 'var(--color-error-2)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
