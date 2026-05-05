import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/__tests__/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/api/**", "src/lib/alert-checker.ts", "src/lib/prisma.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
