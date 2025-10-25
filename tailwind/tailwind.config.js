/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/alpha-vue/**/*.vue",
    "./public/alpha-vue/**/*.js",
    "./public/alpha-vue/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
