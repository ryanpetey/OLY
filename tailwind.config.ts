import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        rose: "#fdf2f8",
        lilac: "#f5f3ff",
        warm: "#fffaf2"
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(17, 24, 39, 0.15)"
      }
    }
  },
  plugins: []
};

export default config;
