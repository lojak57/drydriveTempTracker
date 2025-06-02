/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'oil-black': '#1a1a1a',
        'oil-gray': '#6b7280',
        'oil-orange': '#FF6B35',
        'oil-blue': '#004E89',
      },
      fontFamily: {
        'sf-pro': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addUtilities }) {
      const newUtilities = {
        '.text-success': {
          '@apply text-green-600': {},
        },
        '.text-warning': {
          '@apply text-yellow-600': {},
        },
        '.text-error': {
          '@apply text-red-600': {},
        },
        '.text-info': {
          '@apply text-blue-600': {},
        },
        '.text-highlight': {
          '@apply text-blue-600 font-semibold': {},
        },
        '.text-neutral': {
          '@apply text-slate-600': {},
        },
        '.text-success-dark': {
          '@apply dark:text-green-400': {},
        },
        '.text-warning-dark': {
          '@apply dark:text-yellow-400': {},
        },
        '.text-error-dark': {
          '@apply dark:text-red-400': {},
        },
        '.text-info-dark': {
          '@apply dark:text-blue-400': {},
        },
        '.text-highlight-dark': {
          '@apply dark:text-blue-400 dark:font-semibold': {},
        },
        '.text-neutral-dark': {
          '@apply dark:text-slate-400': {},
        },
      }
      addUtilities(newUtilities)
    }
  ],
}; 