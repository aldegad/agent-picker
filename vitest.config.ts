import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "tools/**/*.test.ts",
      "web/**/*.test.ts",
    ],
    exclude: [
      "example/next-host/.next/**",
      "example/next-host/node_modules/**",
      "example/next-host/vendor/**",
      "web/node_modules/**",
    ],
  },
});
