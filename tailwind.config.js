/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html","./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg-color)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-terciary": "var(--bg-terciary)",

        "text-title": "var(--text-title)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",

        primary: "var(--accent-primary)",
        secondary: "var(--accent-secondary)",
      },
    },
  }
};
