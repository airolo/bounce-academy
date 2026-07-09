/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        surface: '#f5f5f5',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}

