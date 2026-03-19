import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts", "src/stores/**/*.ts"],
      exclude: ["src/**/__tests__/**", "src/**/*.d.ts", "src/lib/db/**", "src/lib/alert-sources/demo.ts"],
      reporter: ["text", "text-summary", "json-summary"],
    },
  },
});
