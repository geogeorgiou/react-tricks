# react-tricks

It's React Interview trick questions Time ⏰!

## Stack

- [React 19](https://react.dev)
- [Vite+](https://viteplus.dev): [Vite 8](https://vite.dev), [Vitest 5](https://vitest.dev), [Oxlint](https://oxc.rs/docs/guide/usage/linter), [Oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- [TypeScript 7](https://www.typescriptlang.org)
- [React Router](https://reactrouter.com)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [MDX](https://mdxjs.com)
- [Shiki](https://shiki.style)
- [pnpm](https://pnpm.io)
- Deployed on [Vercel](https://vercel.com) (`vercel.json` rewrites every route to the SPA)

## Motivation

The goal here is to have fun by learning more about React and its rendering paradigm, with a dashboard where every question runs live next to its code.

**Hint:** Try your best to guess the result before revealing the answer! Then cross-check with the live preview and figure out where you were right or wrong.

Enjoy! 🎉🎉🎉

## Introduction

This repo is all about learning React in a better way and the nitty gritty stuff about:

- `console.log` events 📋 during component lifecycle
- `useEffect, useMemo, useCallback` executions ⚛
- `will it re-render?` scenarios 🌀
- `Context` API 🚀
- React 19's `use` API with Suspense ⏳

## How it works

Pick a lesson from the sidebar. Each lesson has a tab per question, and the URL (`/lessons/console-log?tab=app2`) is shareable.

Every tab shows the question and the lesson's real source code. Hit **Reveal answer** to:

- run the component live,
- capture its `console` output in the console panel,
- read the explanation (expected output, why, takeaway).

> **StrictMode:** the app runs inside `<StrictMode>`, which only does its double render / double effect checks in development. Lessons affected by it show a badge saying which mode you're in, so you know why `pnpm dev` and the deployed site can log differently.

## Adding a lesson

Lessons are discovered from the file system. There's no registry to update:

```
src/lessons/<lesson-id>/      folder name = URL slug (kebab-case)
  index.mdx                   title, order, summary + short intro
  App1.tsx                    the component, exported as `App1`
  App1.mdx                    question + explanation for App1
  App2.tsx / App2.mdx         …and so on
```

`index.mdx`:

```mdx
---
title: 'Console Log'
order: 1
summary: 'Shown on the overview card.'
---

Intro paragraph shown under the lesson title.
```

`AppN.mdx`:

```mdx
---
title: 'Short tab label'
question: 'What is logged on the first click?'
strictModeSensitive: true # optional: shows the StrictMode badge
---

## Expected output

## Why

## Takeaway
```

A lesson only shows up once it has an `index.mdx`, and a tab only once both `AppN.tsx` and `AppN.mdx` exist. Helper files such as `fake-api.ts` can live in the folder too. Hook lint rules (apart from the Rules of Hooks) are switched off under `src/lessons`, because lessons break them on purpose.

## How do I run this?

Use the Node version from `.node-version`, then install dependencies:

```bash
pnpm install
```

Run dev server (http://localhost:3000)

```bash
pnpm dev
```

## Checks

These are the same checks CI runs on every PR:

```bash
pnpm check        # format + lint + type check (vp check)
pnpm test --run
pnpm build
```

`pnpm check:fix` formats and applies lint autofixes. Tooling choices are recorded in [ADR 0001](docs/adr/0001-adopt-vite-plus-toolchain.md).

## GitHub Actions

Workflows in `.github/` are linted by [zizmor](https://docs.zizmor.sh): locally with `pnpm lint:actions`, and in CI by `.github/workflows/zizmor.yml`. The CI job uploads SARIF to code scanning (Security tab) and doesn't fail on findings itself. Fix findings rather than suppressing them.

- Pin every action to a full commit SHA with a version comment: `uses: owner/repo@<sha> # vX.Y.Z`. Dependabot (`.github/dependabot.yml`, weekly, 7-day cooldown) bumps both together.
- Every `actions/checkout` sets `persist-credentials: false`.
- Workflow-level `permissions` stay minimal; grant anything extra per job.
- Dependabot opens routine update PRs. Use `pnpm actions:up` (actions-up, `scripts/actions-up.sh`) to update sooner or take a major bump by hand; it writes the same `sha # vX.Y.Z` pins with the same 7-day cooldown. `pnpm actions:outdated` only reports.
- The zizmor version is pinned in `zizmor.yml` (`version:`). Dependabot doesn't update it: bump it by hand, alongside your local `brew upgrade zizmor`.

`pnpm lint:actions` needs `brew install zizmor` and a GitHub token (`GH_TOKEN` or `gh auth login`) for its online audits.
