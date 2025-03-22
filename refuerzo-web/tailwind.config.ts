import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/theme";
import { heroui } from "@heroui/theme";

const config: Config = {
  darkMode: "class", // Activa el modo oscuro basado en una clase
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/components/(button|snippet|code|input).js",
  ],
  theme: {
    extend: {
      colors: {
        blue_principal: "#003C71",
        beige_secondary: "#CC9E13",
      },
    },
  },
  plugins: [nextui(), heroui()],
};

export default config;
