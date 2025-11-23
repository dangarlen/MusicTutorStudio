/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../src/**/*.vue",
    "../src/**/*.js",
    "../src/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
