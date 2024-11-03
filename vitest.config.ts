/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules/**', 'src/**/test-utils/**', 'src/main.tsx'],
    coverage: {
      exclude: ['src/**/test-utils/**', 'src/main.tsx'],
    },
  },
});
