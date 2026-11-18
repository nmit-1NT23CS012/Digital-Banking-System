/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        secondary: '#FF6B6B',
        dark: '#1A1A2E',
        light: '#F5F7FA',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
