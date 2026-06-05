/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#faf7f0",
        ink: "#1c1b19",
        muted: "#6b6760",
        forest: "#1f6f54",
        "forest-dark": "#155440",
        line: "#e6e0d4",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        sans: ['"Hanken Grotesk"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
