/**
 * vitest.config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Vitest is used instead of Jest because:
 * - Same config as Vite — one build tool for the whole project
 * - Native ESM support (no transform quirks with .ts/.tsx)
 * - Faster test execution via esbuild transforms
 * - Compatible with all @testing-library/* packages
 *
 * Environment: jsdom
 * - Provides a full DOM API for component rendering tests
 * - Required by @testing-library/react
 * - Alternative: happy-dom is faster but less spec-complete; jsdom is safer
 *   for a library where DOM edge cases (e.g., focus management) are critical
 *
 * Coverage: v8
 * - Uses Node.js's built-in V8 coverage rather than Istanbul
 * - Faster, no instrumentation overhead
 * - Native source map support for TypeScript
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for a realistic browser-like DOM environment
    environment: 'jsdom',

    // Run global setup before each test file
    setupFiles: ['./src/test-utils/setup.ts'],

    // Include all test files
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // Exclude compiled output and node_modules
    exclude: ['node_modules', 'dist'],

    // Global test API (describe, it, expect) without importing
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: [
        'text',        // Console summary
        'lcov',        // For Codecov/Coveralls upload
        'html',        // Local browsable report
        'json-summary' // For badge generation
      ],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/test-utils/**',
        'src/**/*.css',
        'src/index.ts',           // Barrel file — no logic to cover
        'src/components/index.ts', // Barrel file
      ],
      // Enforce minimum coverage thresholds — CI fails if these drop
      thresholds: {
        lines:      80,
        functions:  80,
        branches:   75,
        statements: 80,
      },
    },

    // Retry flaky tests once before marking as failed
    retry: 1,

    // Print a full diff on assertion failures
    reporters: ['verbose'],
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
