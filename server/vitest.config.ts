import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["src/generated/**", "src/test/**", "**/*.test.ts"],
    },
  },
  resolve: {
    alias: [
      { find: /^@\/generated(.*)$/, replacement: resolve(__dirname, "./generated$1") },
      { find: /^@\/(.*)$/, replacement: resolve(__dirname, "./src/$1") },
    ],
  },
});
