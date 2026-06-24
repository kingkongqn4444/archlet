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
        "inset-pill":
          "inset 0 1px 0 0 rgba(255,255,255,0.55), inset 0 -1px 0 0 rgba(54,17,74,0.04)",
        "inset-pill-dark":
          "inset 0 1px 0 0 rgba(255,255,255,0.05), inset 0 -1px 0 0 rgba(0,0,0,0.2)",
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
        slideInRight: {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        bobSlow: {
          "0%,100%": { transform: "translateY(0) rotate(-0.5deg)" },
          "50%": { transform: "translateY(-6px) rotate(0.5deg)" },
        },
        glowOnce: {
          "0%": { boxShadow: "0 0 0 0 rgba(108,43,217,0.55), 0 0 0 0 rgba(108,43,217,0.0)" },
          "60%": { boxShadow: "0 0 0 6px rgba(108,43,217,0.0), 0 0 18px 2px rgba(108,43,217,0.0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(108,43,217,0.0), 0 0 0 0 rgba(108,43,217,0.0)" },
        },
      },
      animation: {
        dashdraw: "dashdraw 1s linear infinite",
        floatY: "floatY 4s ease-in-out infinite",
        "slide-in-right": "slideInRight 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
        "bob-slow": "bobSlow 6s ease-in-out infinite",
        "glow-once": "glowOnce 0.7s ease-out",
      },
    },
  },
  plugins: [],
};
