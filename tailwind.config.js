/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  safelist: [
    "btn","btn-primary","btn-secondary","btn-accent","btn-info","btn-warning","btn-error","btn-outline","btn-ghost",
    "badge","badge-primary","badge-secondary","badge-accent","badge-info","badge-success","badge-warning","badge-error",
    "bg-base-100","bg-base-200","bg-base-300","text-base-content",
    "radio","radio-primary",
    "collapse","collapse-title","collapse-content","collapse-arrow","collapse-plus",
  ],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
    darkTheme: "dark",
  },
};
