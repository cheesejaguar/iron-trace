import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "iron": {
          "panel": "rgba(27, 42, 74, 0.92)",
          "panel-solid": "#1B2A4A",
          "text": "#F0F0F0",
          "ballistic": "#DC143C",
          "cruise": "#FF8C00",
          "uav": "#FFD700",
          "rocket": "#8B8B8B",
          "arc-iran": "#C0392B",
          "arc-lebanon": "#E67E22",
        },
      },
    },
  },
  plugins: [],
};

export default config;
