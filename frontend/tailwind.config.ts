import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F1EFFE',
          100: '#E1DDFD',
          200: '#C4B5FD',
          300: '#A78BFA',
          400: '#8B5CF6',
          500: '#5B4FE9', // Primary Brand Purple
          600: '#4A3FD1', // Primary Hover
          700: '#3C30B8',
          800: '#2E229B',
          900: '#1E1268',
          950: '#0C0A2E',
        },
        surface: {
          50: '#FFFFFF',      // Cards, white
          muted: '#F7F7FB',   // Page background
          sunken: '#F1F0F8',  // Sidebar background, hover
          100: '#F1F0F8',
          200: '#E7E6F1',
          300: '#CBD5E1',
          400: '#9295AC',
          500: '#5C5E76',
          600: '#475569',
          700: '#1F2033',
          800: '#1E293B',
          900: '#0F172A',
          950: '#090D16',
        },
        ink: {
          900: '#1F2033', // Primary Text
          600: '#5C5E76', // Secondary Text
          400: '#9295AC', // Muted Text
        },
        line: '#E7E6F1', // Default hairline border
        accent: {
          amber: '#F0A94E', // Warning / processing
          green: '#2FAE6B', // Completed
          red: '#E85C5C',   // Destructive
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
