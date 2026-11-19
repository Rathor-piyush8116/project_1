/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        groq: {
          bg: '#131519',
          panel: '#1c1e23',
          'panel-secondary': '#23262d',
          card: '#1c1e23',
          input: '#15171b',
          border: '#2b2f38',
          'border-light': '#383d49',
          accent: '#f55036',
          'accent-hover': '#ff634a',
          'accent-glow': 'rgba(245, 80, 54, 0.35)',
          'accent-subtle': 'rgba(245, 80, 54, 0.12)',
          muted: '#9ba1ad',
          dim: '#656a76',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-accent': '0 0 20px -3px rgba(245, 80, 54, 0.45)',
        'glow-subtle': '0 0 15px -3px rgba(245, 80, 54, 0.25)',
      }
    },
  },
  plugins: [],
};
