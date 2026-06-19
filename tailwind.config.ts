import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        groen: { DEFAULT: '#16a34a', licht: '#dcfce7', donker: '#14532d' },
        oranje: { DEFAULT: '#d97706', licht: '#fef3c7', donker: '#78350f' },
        rood: { DEFAULT: '#dc2626', licht: '#fee2e2', donker: '#7f1d1d' },
        blauw: { DEFAULT: '#2563eb', licht: '#dbeafe', donker: '#1e3a5f' },
        grijs: { DEFAULT: '#6b7280', licht: '#f9fafb', donker: '#111827' },
      },
    },
  },
  plugins: [],
}

export default config
