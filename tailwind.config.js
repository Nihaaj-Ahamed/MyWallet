/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#1C1C1C',
          light: '#2E2E2E',
        },
        sage: {
          DEFAULT: '#78909C',
          light: '#90A4AE',
          dark: '#546E7A',
        },
        sunshine: {
          DEFAULT: '#F4FF81',
          light: '#F9FFB3',
        },
        mint: {
          DEFAULT: '#E0F2F1',
          light: '#E0F2F1',
        },
        obsidian: {
          DEFAULT: '#0B0C10',
          light: '#13151D',
          dark: '#050608',
        },
        slate: {
          surface: '#1A1C23',
          border: 'rgba(255, 255, 255, 0.04)',
          borderHover: 'rgba(255, 255, 255, 0.08)',
          muted: '#8E9AA8',
        },
        champagne: {
          DEFAULT: '#D4AF37',
          light: '#E5C05E',
          dark: '#B08E22',
          glow: 'rgba(212, 175, 55, 0.15)',
        },
        crimson: {
          DEFAULT: '#FF5252',
          light: '#FF7373',
          dark: '#D32F2F',
          glow: 'rgba(255, 82, 82, 0.15)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.15)',
        'gold-glow-lg': '0 0 25px rgba(212, 175, 55, 0.25)',
        'crimson-glow': '0 0 15px rgba(255, 82, 82, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'soft': '0 10px 30px -5px rgba(120, 144, 156, 0.12), 0 4px 12px -2px rgba(120, 144, 156, 0.06)',
        'soft-lg': '0 20px 40px -10px rgba(120, 144, 156, 0.18), 0 8px 20px -5px rgba(120, 144, 156, 0.08)',
      },
      textShadow: {
        'gold': '0 0 8px rgba(212, 175, 55, 0.5)',
        'crimson': '0 0 8px rgba(255, 82, 82, 0.5)',
      },
    },
  },
  plugins: [],
}
