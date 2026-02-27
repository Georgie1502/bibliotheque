import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Space Grotesk'", "sans-serif"]
      },
      colors: {
        midnight: "#0f172a",
        sand: "#f1e9db",
        teal: "rgb(var(--color-accent) / <alpha-value>)",
        amber: "#f59e0b",
        ink: "#111827"
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
