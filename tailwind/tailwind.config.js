/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/alpha-vue/**/*.vue", "./public/alpha-vue/**/*.js"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
