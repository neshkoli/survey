/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Rubik",
          "system-ui",
          "Segoe UI",
          "Noto Sans Hebrew",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        cream: {
          "color-scheme": "light",
          primary: "#b8743d",
          "primary-content": "#fffaf2",
          secondary: "#d6a878",
          "secondary-content": "#3a2410",
          accent: "#7a8c5a",
          "accent-content": "#ffffff",
          neutral: "#5b4636",
          "neutral-content": "#fff7ea",
          "base-100": "#fbf2df",
          "base-200": "#f6e8ce",
          "base-300": "#ecd9b4",
          "base-content": "#3a2410",
          info: "#5a8db0",
          success: "#5a8c6b",
          warning: "#c89c3d",
          error: "#b04a3a",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.75rem",
          "--rounded-badge": "1rem",
        },
      },
      "light",
      "dark",
      "cupcake",
    ],
  },
};
