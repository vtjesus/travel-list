/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF8474",
        secondary: "#FFC996",
        accent: "#9F5F80",
        dark: "#583D72",
      },
      textColor: {
        light: "#FFF2E0",
        dark: "#2A1B36",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"], // Heading font
        body: ["Nunito", "sans-serif"], // Body text font
      },
    },
  },
  plugins: [],
};
