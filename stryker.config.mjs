// Mutation testing with Stryker, run through the Vitest runner on vite.config.ts.
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  // pnpm doesn't hoist the runner next to @stryker-mutator/core, so Stryker's
  // default `@stryker-mutator/*` lookup misses it. Name it explicitly.
  plugins: ['@stryker-mutator/vitest-runner'],
  testRunner: 'vitest',
  vitest: {
    configFile: 'vite.config.ts',
  },
  // Stryker rewrites `extends` and `references` in this tsconfig when they
  // point outside the sandbox, using the TypeScript JS API. TypeScript 7
  // (tsgo) has no JS API, so the rewrite crashes. Our tsconfig.json has
  // neither field, so point Stryker at no file and skip the rewrite.
  tsconfigFile: '',
  ignorePatterns: [
    '.claude',
    '.agents',
    '/.sandcastle',
    '/scripts',
    '/src/main.tsx',
  ],
  mutate: [],
  thresholds: { high: 85, low: 70, break: 60 },
  incremental: true,
  reporters: ['clear-text', 'progress', 'json', 'html'],
};
