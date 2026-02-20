/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        baloo: ["'Baloo Bhai 2'", "cursive"],
      },
      fontSize: {
        display: ["56px", { lineHeight: "64px", fontWeight: "800" }],
        h1: ["42px", { lineHeight: "50px", fontWeight: "700" }],
        h2: ["32px", { lineHeight: "40px", fontWeight: "700" }],
        h3: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        body: ["16px", { lineHeight: "26px", fontWeight: "400" }],
        small: ["14px", { lineHeight: "22px", fontWeight: "400" }],
        xs: ["12px", { lineHeight: "18px", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};
