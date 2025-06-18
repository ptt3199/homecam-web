/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PTT Home custom colors from UI reference
        'ptt-blue': '#3B82F6',
        'ptt-green': '#10B981', 
        'ptt-red': '#EF4444',
        'ptt-gray': '#6B7280',
        'ptt-bg': '#F9FAFB',
        'ptt-dark': '#1F2937',
        'ptt-dark-light': '#374151',
      },
      animation: {
        // Custom animations from UI reference
        'pulse-slow': 'pulse 2s infinite',
        'blink': 'blink 1s infinite',
        'loading-shimmer': 'loading 1.5s infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        loading: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
      },
    },
  },
  plugins: [],
}
