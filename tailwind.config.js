/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#39ff14',
        'primary-hover': '#2de010',
        background: {
          dark: '#0a1a0a',
          light: '#0a1a0a',
        },
        card: 'rgba(255,255,255,0.05)',
        input: '#0f1f0f',
        'sidebar-border': '#283928',
        muted: 'rgba(255,255,255,0.55)',
        secondary: 'rgba(255,255,255,0.75)',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.1)',
      },
    },
  },
  plugins: [],
};
