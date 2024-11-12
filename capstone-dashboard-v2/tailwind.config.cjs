const withMT = require("@material-tailwind/react/utils/withMT");
 
module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff5ed",
          100: "#ffe9d5",
          200: "#fed0aa",
          300: "#fcae75",
          400: "#fa823d",
          500: "#f85f16",
          600: "#e9450d",
          700: "#c1310d",
          800: "#992813",
          900: "#7c2412",
          950: "#430f07",
        },
        secondary: {
          50: "#f6f6f6",
          100: "#efefef",
          200: "#dcdcdc",
          300: "#bdbdbd",
          400: "#989898",
          500: "#7c7c7c",
          600: "#656565",
          700: "#525252",
          800: "#464646",
          900: "#3d3d3d",
          950: "#292929",
        },
      },
    },
    fontFamily: {
      roboto: ["Roboto", "sans-serif"],
      outfit: ["Outfit", "sans-serif"],
    },
    screens: {
      xxxs: "320px",
      xxs: "360px",
      xs: "425px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [require("daisyui"), require('tailwindcss-animated')],
  daisyui: {
    themes: ["corporate"],
  },
});