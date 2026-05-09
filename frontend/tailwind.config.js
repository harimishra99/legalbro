/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          DEFAULT: "#080B14",
          2: "#0D1220",
          3: "#111827",
        },
        panel: {
          DEFAULT: "#161D2E",
          2: "#1C243A",
        },
        border: {
          DEFAULT: "#2A3450",
          2: "#3A4560",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
