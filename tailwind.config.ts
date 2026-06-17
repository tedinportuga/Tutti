import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1B3A2D',
        'brand-medium': '#2E5E45',
        'brand-action': '#D4751A',
        'brand-cream': '#F5E6C8',
        'brand-bg': '#F9F4EC',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundColor: {
        'brand-dark': '#1B3A2D',
        'brand-medium': '#2E5E45',
        'brand-action': '#D4751A',
        'brand-cream': '#F5E6C8',
        'brand-bg': '#F9F4EC',
      },
    },
  },
  plugins: [],
};
export default config;
