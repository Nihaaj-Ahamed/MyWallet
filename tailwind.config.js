/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
      },
      textShadow: {
        'gold': '0 0 8px rgba(212, 175, 55, 0.5)',
        'crimson': '0 0 8px rgba(255, 82, 82, 0.5)',
      },
    },
  },
  plugins: [],
}
