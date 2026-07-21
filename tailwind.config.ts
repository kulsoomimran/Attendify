import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF7",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1D1D1D",
        },
        foreground: "#1D1D1D",
        primary: {
          DEFAULT: "#1D1D1D",
          foreground: "#FAFAF7",
        },
        secondary: {
          DEFAULT: "#666666",
          foreground: "#FAFAF7",
        },
        accent: {
          sage: {
            DEFAULT: "#A8B5A0",
            foreground: "#1D1D1D",
          },
        },
        border: "#E7EBE3",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["monospace"],
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
        md: "6px",
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(29, 29, 29, 0.04), 0 4px 20px -4px rgba(29, 29, 29, 0.02)",
        elevation: "0 1px 3px rgba(29, 29, 29, 0.05), 0 10px 24px -8px rgba(29, 29, 29, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
