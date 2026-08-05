/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          light: "#fcfcfb",
          dark: "#1a1a19",
        },
        page: {
          light: "#f9f9f7",
          dark: "#0d0d0d",
        },
        ink: {
          primary: { light: "#0b0b0b", dark: "#ffffff" },
          secondary: { light: "#52514e", dark: "#c3c2b7" },
          muted: "#898781",
        },
        series: {
          1: { DEFAULT: "#2a78d6", dark: "#3987e5" }, // blue
          2: { DEFAULT: "#eb6834", dark: "#d95926" }, // orange
          3: { DEFAULT: "#1baf7a", dark: "#199e70" }, // aqua
          4: { DEFAULT: "#eda100", dark: "#c98500" }, // yellow
          5: { DEFAULT: "#e87ba4", dark: "#d55181" }, // magenta
          6: { DEFAULT: "#008300", dark: "#008300" }, // green
          7: { DEFAULT: "#4a3aa7", dark: "#9085e9" }, // violet
          8: { DEFAULT: "#e34948", dark: "#e66767" }, // red
        },
        status: {
          good: "#0ca30c",
          warning: "#fab219",
          serious: "#ec835a",
          critical: "#d03b3b",
        },
        gridline: { light: "#e1e0d9", dark: "#2c2c2a" },
        brand: {
          50: "#eef6ff",
          100: "#d9ecff",
          200: "#b7dbff",
          300: "#86c2ff",
          400: "#4f9fff",
          500: "#2a78d6",
          600: "#1c5cab",
          700: "#184f95",
          800: "#104281",
          900: "#0d366b",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,11,11,0.06), 0 1px 1px rgba(11,11,11,0.04)",
      },
    },
  },
  plugins: [],
};
