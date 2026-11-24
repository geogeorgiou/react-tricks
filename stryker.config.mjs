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
  // Kept out of the sandbox copy, so Stryker never sees them and their tests
  // never run under it:
  // - .claude and .agents: .claude/skills is a symlink to a directory, which
  //   Stryker's copy fails on (EISDIR), and no test reads either folder.
  // - .sandcastle (the agent orchestrator), scripts (tooling) and
  //   src/main.tsx (the browser entry): never mutated, and no app code or app
  //   test imports them.
  // Never-mutated files that app code or its tests do import (registry.ts,
  // src/lessons, test-utils) must stay in the sandbox: they are excluded
  // under `mutate` below instead.
  ignorePatterns: [
    '.claude',
    '.agents',
    '/.sandcastle',
    '/scripts',
    '/src/main.tsx',
  ],
  mutate: [
    'src/features/**/*.{ts,tsx}',
    'src/app/**/*.{ts,tsx}',
    'src/pages/**/*.{ts,tsx}',
    'src/common/**/*.{ts,tsx}',
    'src/components/ui/**/*.{ts,tsx}',
    // Lesson code is buggy on purpose.
    '!src/features/lessons/registry.ts',
    '!src/lessons/**',
    '!**/*.mdx',
    '!src/**/test-utils/**',
    '!**/*.test.{ts,tsx}',
  ],
  thresholds: { high: 85, low: 70, break: 60 },
  incremental: true,
  reporters: ['clear-text', 'progress', 'json', 'html'],
};
