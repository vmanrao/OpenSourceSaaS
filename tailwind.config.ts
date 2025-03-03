import type { Config } from "tailwindcss";

export default {
  darkMode: 'media',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316', // Orange-500: Vibrant orange
          light: '#FB923C',   // Orange-400: Light orange
          dark: '#EA580C',    // Orange-600: Deep orange
        },
        danger: {
          DEFAULT: '#DC2626', // Red-600: Clear red
          light: '#F87171',   // Red-400: Soft red
          dark: '#B91C1C',    // Red-700: Deep red
        },
        neutral: {
          DEFAULT: '#F8FAFC', // Slate-50: Crisp light
          dark: '#171717',    // Neutral-900: Rich dark
          darker: '#0A0A0A',  // Neutral-950: Deep dark
        },
        text: {
          DEFAULT: '#0A0A0A', // Neutral-950: Sharp text
          light: '#525252',   // Neutral-600: Soft text
          dark: '#F8FAFC',    // Slate-50: Light text
        },
        surface: {
          light: '#FFFFFF',   // Pure white
          dark: '#171717',    // Neutral-900: Rich surface
        },
        accent: {
          DEFAULT: '#F97316', // Orange-500: Matching primary
          light: '#FB923C',   // Orange-400: Light orange
          dark: '#EA580C',    // Orange-600: Deep orange
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.05)',
        'hover': '0 4px 6px -1px rgba(249, 115, 22, 0.1), 0 2px 4px -1px rgba(249, 115, 22, 0.06)', // Orange shadow
      }
    },
  },
  plugins: [],
} satisfies Config;
