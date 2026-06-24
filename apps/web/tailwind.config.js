/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FEFCF6",
          100: "#FBF7EC",
          200: "#F2EAD3",
        },
        plum: {
          50: "#F5EFFA",
          100: "#E9DFF4",
          200: "#D4BFEA",
          300: "#B294D1",
          400: "#8E60BC",
          500: "#6C2BD9",
          600: "#5A22B5",
          700: "#4A1B95",
          800: "#3A1577",
          900: "#36114a",
          950: "#1A0F26",
        },
        amber: {
          300: "#FCD34D",
          400: "#FBB525",
          500: "#F59E0B",
          600: "#D97706",
        },
        ink: {
          900: "#1A0E22",
          700: "#3D2C4A",
          500: "#6B5C7A",
          300: "#A89BBC",
        },
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(54,17,74,0.08)",
        card: "0 2px 12px -4px rgba(54,17,74,0.12)",
        float: "0 8px 28px -8px rgba(54,17,74,0.18)",
      },
      keyframes: {
        dashdraw: {
          from: { strokeDashoffset: "20" },
          to: { strokeDashoffset: "0" },
        },
        floatY: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        dashdraw: "dashdraw 1s linear infinite",
        floatY: "floatY 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
