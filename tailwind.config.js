/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  safelist: [
    'tap-target',
    'mobile-container',
    'mobile-sticky',
    'mobile-input',
    'mobile-grid'
  ],
  theme: {
    extend: {
      colors: {
        'oil': {
          'black': '#1a1a1a',
          'orange': '#7CB342',
          'blue': '#558B2F',
          'gray': '#4b5563',
        },
        'drydrive': {
          'green': '#7CB342',
          'light-green': '#9CCC65',
          'dark-green': '#558B2F',
          'accent': '#CDDC39',
          'black': '#1A1A1A',
          'gray': '#6B7280',
        },
        'danger': {
          'red': '#ef4444',
        },
        'success': {
          'green': '#10b981',
        },
        'warning': {
          'yellow': '#f59e0b',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'mono': ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
} 