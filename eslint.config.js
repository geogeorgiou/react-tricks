import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Lessons break hook "best practices" on purpose (stale closures, missing deps,
// refs written during render...). Only the Rules of Hooks stay enforced there.
const lessonHookRules = Object.fromEntries(
  Object.keys(reactHooks.rules)
    .filter((rule) => rule !== 'rules-of-hooks')
    .map((rule) => [`react-hooks/${rule}`, 'off']),
);

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['src/lessons/**/*.{ts,tsx}'],
    rules: lessonHookRules,
  },
  {
    // shadcn components export variants and hooks next to components
    files: ['src/components/ui/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
]);
