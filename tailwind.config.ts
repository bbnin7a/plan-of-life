import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7FDF2",
        foreground: "#1F2937",
        primary: {
          DEFAULT: "#58CC02",
          dark: "#46A302",
          light: "#D7FFB8",
        },
        card: "#FFFFFF",
        muted: "#6B7280",
        yellow: "#FFC800",
        blue: "#1CB0F6",
        danger: "#FF4B4B",
        border: "#E5F4DB",
      },
      boxShadow: {
        playful: "0 8px 0 rgba(31, 41, 55, 0.08)",
        soft: "0 18px 40px rgba(31, 41, 55, 0.08)",
      },
      fontFamily: {
        sans: ["Nunito", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
