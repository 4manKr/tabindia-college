/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"],
        display: ["Bahnschrift", "Segoe UI", "Arial", "sans-serif"],
      },
      colors: {
        navy: {
          DEFAULT: "#123d63",
          strong: "#0a2844",
          ink: "#19324f",
        },
        brand: {
          orange: "#f26430",
          "orange-soft": "#ffb06d",
          gold: "#ffd6ab",
        },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #0a2844 0%, #123d63 55%, #1a5a8a 100%)",
        "brand-orange-gradient":
          "linear-gradient(135deg, #ff9155 0%, #f26430 60%, #e0481a 100%)",
      },
    },
  },
  plugins: [],
};
