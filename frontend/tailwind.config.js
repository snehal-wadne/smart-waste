/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          primary: '#16A34A',
          dark: '#166534',
          light: '#DCFCE7',
          bg: '#F7FAF7',
          charcoal: '#172017',
          warning: '#F59E0B',
          danger: '#DC2626',
          blue: '#2563EB',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'eco-sm': '0 1px 3px 0 rgba(22, 163, 74, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'eco': '0 4px 12px -2px rgba(22, 101, 52, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'eco-lg': '0 10px 25px -3px rgba(22, 101, 52, 0.12), 0 4px 10px -4px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
