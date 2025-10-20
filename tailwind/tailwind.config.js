/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["../public/alpha/**/*.html", "../public/alpha/**/*.js"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
