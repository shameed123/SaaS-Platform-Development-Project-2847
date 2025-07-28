/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          warm: {
            50: 'var(--color-warm-50)',
            100: 'var(--color-warm-100)',
            200: 'var(--color-warm-200)',
            300: 'var(--color-warm-300)',
            400: 'var(--color-warm-400)',
            500: 'var(--color-warm-500)',
            600: 'var(--color-warm-600)',
            700: 'var(--color-warm-700)',
            800: 'var(--color-warm-800)',
            900: 'var(--color-warm-900)',
          },
          soft: {
            50: 'var(--color-soft-50)',
            100: 'var(--color-soft-100)',
            200: 'var(--color-soft-200)',
            300: 'var(--color-soft-300)',
            400: 'var(--color-soft-400)',
            500: 'var(--color-soft-500)',
            600: 'var(--color-soft-600)',
            700: 'var(--color-soft-700)',
            800: 'var(--color-soft-800)',
            900: 'var(--color-soft-900)',
          },
        },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}