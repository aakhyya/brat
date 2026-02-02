/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Y2K Neon Colors
        'neon-green': '#00ff41',
        'neon-purple': '#b026ff',
        'acid-lime': '#39ff14',
        'cyber-magenta': '#ff00ff',
        'electric-cyan': '#00ffff',
        'hot-pink': '#ff006e',
        // Metallic Colors
        'chrome-silver': '#e8e8e8',
        'liquid-metal': '#c0c0c0',
        'dark-chrome': '#808080',
        'glossy-black': '#0a0a0a',
      },
      fontFamily: {
        'grotesk': ['Space Grotesk', 'sans-serif'],
        'display': ['Bebas Neue', 'sans-serif'],
      },
      boxShadow: {
        'neon-glow': '0 0 20px rgba(0, 255, 65, 0.6)',
        'purple-glow': '0 0 20px rgba(176, 38, 255, 0.6)',
        'chrome': 'inset 0 1px 0 rgba(255,255,255,0.8), 0 10px 30px rgba(0,0,0,0.4)',
      },
      animation: {
        'float-gentle': 'float-gentle 8s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
      },
      keyframes: {
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(2deg)' },
          '66%': { transform: 'translateY(10px) rotate(-1deg)' },
        },
        'rotate-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}

