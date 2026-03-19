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
      screens: {
        "xs": "390px",
      },
      height: {
        "screen-dvh": "100dvh",
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top, 0px)",
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-left": "env(safe-area-inset-left, 0px)",
        "safe-right": "env(safe-area-inset-right, 0px)",
      },
    },
  },
  plugins: [],
};

export default config;
