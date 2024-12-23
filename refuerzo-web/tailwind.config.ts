import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Activa el modo oscuro basado en una clase
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blue_principal: "#003C71",
      },
    },
  },
  plugins: [],
};

export default config;
