/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts,js,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': '#2C292D',
      },
    },
  },
  // eslint-disable-next-line global-require
  plugins: [require('@tailwindcss/forms')],
};
