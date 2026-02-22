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
        background: "var(--background)",
        foreground: "var(--foreground)",
        rpg: {
          gold: '#D4AF37',
          'gold-dark': '#B8860B',
          'gold-light': '#FFD700',
          blue: '#1A3A52',
          'blue-mid': '#2E5C8A',
          'blue-light': '#4A8FD8',
          purple: '#7B3FF2',
          'purple-dark': '#5A2FA0',
          'purple-light': '#9B6FFF',
          green: '#2D5016',
          red: '#C41E3A',
          silver: '#C0C0C0',
          black: '#0A0E27',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'rpg-gold': '0 0 20px rgba(212, 175, 55, 0.4)',
        'rpg-gold-lg': '0 0 30px rgba(212, 175, 55, 0.6)',
        'rpg-purple': '0 0 20px rgba(123, 63, 242, 0.3)',
        'rpg-purple-lg': '0 0 30px rgba(123, 63, 242, 0.5)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float-up': 'floatUp 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(212, 175, 55, 0.8)' },
        },
        floatUp: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.15' },
          '50%': { transform: 'translateY(-20px) scale(1.3)', opacity: '0.3' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}
