/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
 theme: {
    extend: {
      colors: {
        'dashboard-success': 'hsl(var(--dashboard-success) / <alpha-value>)',
        'dashboard-danger': 'hsl(var(--dashboard-danger) / <alpha-value>)',
        'dashboard-warning': 'hsl(var(--dashboard-warning) / <alpha-value>)',
        'dashboard-primary': 'hsl(var(--dashboard-primary) / <alpha-value>)',
        'dashboard-secondary': 'hsl(var(--dashboard-secondary) / <alpha-value>)',
        'dashboard-accent': 'hsl(var(--dashboard-accent) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        'card-foreground': 'hsl(var(--card-foreground) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}