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
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}; 