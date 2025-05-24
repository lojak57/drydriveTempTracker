/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'oil': {
          'black': '#1a1a1a',
          'orange': '#ff6b35',
          'blue': '#2563eb',
          'gray': '#4b5563',
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