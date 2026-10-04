# react-tricks

It's React Interview trick questions Time ⏰!

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

> **StrictMode:** the app runs inside `<StrictMode>`, which only does its double render / double effect checks in development. Lessons affected by it show a badge saying which mode you're in, so you know why `yarn dev` and the deployed site can log differently.

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

Use the Node version from `.nvmrc`, then install dependencies:

```bash
yarn
```

Run dev server (http://localhost:3000)

```bash
yarn dev
```

## Checks

These are the same checks CI runs on every PR:

```bash
yarn typecheck
yarn lint
yarn format:check
yarn test --run
yarn build
```

## Stack

React 19, Vite 6, react-router, Tailwind CSS v4 + shadcn/ui, MDX, Shiki and Vitest. Deployed on Vercel (`vercel.json` rewrites every route to the SPA).
