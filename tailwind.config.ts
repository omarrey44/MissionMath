import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        crema: "#FFF9EE",
        cielo: "#EAF4FE",
        azul: {
          DEFAULT: "#2B6FE3",
          dark: "#1D4FA8",
          light: "#5B93F0",
        },
        amarillo: {
          DEFAULT: "#FFC93C",
          dark: "#E8AE1B",
          light: "#FFE08A",
        },
        coral: {
          DEFAULT: "#FF7B54",
          dark: "#E55934",
        },
        exito: "#3BB273",
        error: "#F2766B",
        tinta: "#1E2A4A",
      },
      fontFamily: {
        display: ["var(--font-baloo)", "cursive"],
        body: ["var(--font-nunito)", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 14px rgba(30, 42, 74, 0.08)",
        "card-hover": "0 8px 24px rgba(30, 42, 74, 0.14)",
        boton: "0 4px 0 rgba(0,0,0,0.15)",
      },
      backgroundImage: {
        cuaderno:
          "linear-gradient(rgba(43,111,227,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(43,111,227,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        cuaderno: "28px 28px",
      },
    },
  },
  plugins: [],
};
export default config;
