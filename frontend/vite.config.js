import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      include: /\.(j|t)sx?$/,
    }),
  ],

  // ── Vitest configuration ──────────────────────────────────
  test: {
    // Use a browser-like DOM so React components can render.
    environment: "jsdom",

    // Run this file before every test suite to import jest-dom matchers.
    setupFiles: ["./src/__tests__/setupTests.js"],

    // Treat .jsx/.js files without needing explicit transforms.
    globals: true,

    // Only pick up test files inside src/__tests__/ with any extension.
    // This prevents the old stale App.test.js at src/ root from running.
    include: ["src/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}"],

    // Coverage report (run: vitest run --coverage)
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/__tests__/**", "src/main.jsx", "src/App.test.js"],
    },
  },

});
