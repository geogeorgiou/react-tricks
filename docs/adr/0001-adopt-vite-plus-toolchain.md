# 0001: Adopt the Vite+ toolchain

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

The repo ran five separately configured tools: Vite, Vitest, ESLint (with
`typescript-eslint`, `react-hooks`, `react-refresh`), Prettier and `tsc`, all
installed with Yarn 1. `typescript-eslint` only supports TypeScript < 6.1, which
kept the repo on TS 6.

[Vite+](https://viteplus.dev) bundles Vite, Vitest, Oxlint, Oxfmt and a
type checker (tsgolint, on TypeScript 7) behind one `vp` CLI, with all config in
`vite.config.ts`. This is also a learning repo, so trying the new Vite paradigm
first-hand is a goal in itself.

## Decision

- Use Vite+ (`vite-plus` devDependency, project-local `vp`). Migrate with
  `vp migrate`, then adjust by hand.
- Use **Oxlint** natively for linting, with no ESLint left over. Oxlint ships the
  React Compiler rules from `eslint-plugin-react-hooks` v7, so no JS plugin is
  needed.
- Use **Oxfmt** for formatting, with Prettier's options carried over. Enable
  import sorting and Tailwind class sorting.
- Run **`vp check`** as the single static check (format, lint, type-aware
  lint and type checking). Drop `tsc --noEmit` and upgrade to **TypeScript 7**.
- Switch from **Yarn 1 to pnpm** (pinned with `packageManager`). `vp migrate`
  manages `vite`/`vitest` through a pnpm catalog, and Yarn 1 is in maintenance
  mode.
- In CI, use one job on `voidzero-dev/setup-vp`. Vercel infers install and build
  from the lockfile.
- Leave git hooks out of scope; CI is the gate.
- Harden pnpm in `pnpm-workspace.yaml`: `strictDepBuilds` (fail on unapproved
  dependency build scripts), `minimumReleaseAge: 2880` (ignore releases newer
  than 48h) and `trustPolicy: no-downgrade` (fail when a package loses
  provenance). The one exclusion, `semver@6.3.1`, predates npm provenance and
  is pinned exactly.

## Consequences

### What we lose

| Item                                       | Impact                                                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-dupe-args`, `no-octal`                 | None: strict mode (ES modules) makes both a syntax error.                                                                                   |
| `react-hooks/config`, `react-hooks/gating` | None: they validate React Compiler options and the compiler isn't used. Oxlint will add them when its compiler options become configurable. |
| `tsc --noEmit` script                      | Type checking now runs through tsgolint (TS 7) in `vp check`. `tsc` is still installed for editors and ad-hoc use.                          |
| `.nvmrc` → `.node-version`                 | `nvm use` no longer picks up the version automatically. `vp env`, fnm, Volta and asdf do.                                                   |
| Independent Vite/Vitest versions           | `vite` resolves to `@voidzero-dev/vite-plus-core` through the pnpm catalog. Vite and Vitest upgrades now arrive with `vite-plus` releases.  |
| ESLint plugin ecosystem                    | Rules that Oxlint doesn't ship need its JS-plugin API (`lint.jsPlugins`).                                                                   |
| Prettier output parity                     | None observed: Oxfmt left all 122 files unchanged, MDX included.                                                                            |

### What we gain

- One config file and fewer devDependencies (`eslint`, `@eslint/js`,
  `typescript-eslint`, both React ESLint plugins, `prettier` and `globals` are
  gone).
- TypeScript 7 with no new type errors.
- Type-aware lint rules (for example `no-floating-promises` and
  `no-base-to-string`), plus Oxlint's `correctness` category and `unicorn` rules.
  These found an unhandled `navigate()` promise in the search dialog.
  `no-floating-promises` is off under `src/lessons`, since lessons use
  fire-and-forget effects on purpose.
- Import and Tailwind class sorting without Prettier plugins.
- A simpler CI: one job with cached setup.

### Follow-ups

- Git hooks (`vp migrate --hooks` with a `staged` block) if CI feedback is too
  slow.
- Editor setup (Oxc VS Code extension) is not committed. `vp migrate --editor`
  can generate it.
