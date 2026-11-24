# 0002: Adopt Stryker mutation testing

- **Status:** Accepted
- **Date:** 2026-11-24

## Context

The test suite runs on Vitest and CI checks that it passes, but nothing checks
that the tests would notice a bug. A test can pass while asserting almost
nothing, and the agent workflows write a lot of the tests.

[Stryker](https://stryker-mutator.io/) mutates the source (flips conditions,
empties blocks, swaps operators) and reruns the covering tests. A mutant the
tests don't catch survives, and the score is the share of mutants killed. That
measures test strength, and the surviving mutants are concrete work for
`agent-review`: write a test that kills each one.

A full mutation run is slow and grows with the codebase. It also says nothing
about the change under review. Lesson code under `src/lessons/` is buggy on
purpose, so mutating it is meaningless.

## Decision

### What gets mutated

- **In scope:** `src/features/**`, `src/app/**`, `src/pages/**`,
  `src/common/**` and `src/components/ui/**`. Nothing else under `src/` is
  mutated, which today leaves out `src/hooks/` and `src/lib/`.
- **Never mutated, even when changed:**
  - `src/features/lessons/registry.ts`
  - `src/lessons/**` (Lesson code is buggy on purpose)
  - `**/*.mdx`
  - `src/**/test-utils/**`
  - `.sandcastle/**`
  - `src/main.tsx`
  - test files (`*.test.ts(x)`)

### Per-PR scope: diff-scoped and incremental

- Stryker never runs against the whole codebase. It mutates the **lines**
  each in-scope file added or changed since the merge-base with the base
  branch, read from the hunk headers of `git diff -U0 <merge-base>` and passed
  to Stryker as `--mutate file:20-21`. A mutant on a line the PR didn't write
  grades code that isn't the PR's, and agent-review would be asked to kill it.
- The diff is against the work tree, so committed, staged and unstaged changes
  all count, and an untracked file counts whole. A local run before a commit
  then sees the same work CI will see after it.
- A file new since the merge-base is mutated whole.
- **Test → sibling rule:** a changed or deleted `X.test.ts(x)` mutates its
  colocated `X.ts(x)` **whole**, if that file is in scope. A test edit writes
  no source lines, and the edited tests grade the whole file, so a test edit
  that weakens the suite is caught.
- Every run uses `--incremental`, so later pushes to the same PR only re-test
  mutants whose code or covering tests changed.

### One script decides scope

- `scripts/mutation.ts` computes what to mutate (line ranges, scope filter,
  sibling rule) and invokes Stryker. It is exposed as `pnpm test:mutation`
  and run with `node`, which strips the types, so it needs no build step.
- It is the only place scope is defined. `stryker.config.mjs` leaves `mutate`
  empty, so a bare `stryker run` finds no files and stops instead of
  mutating the whole codebase. Never-mutated paths that no app code imports
  (`.sandcastle`, `scripts`, `src/main.tsx`) are also left out of Stryker's
  sandbox with `ignorePatterns`, so their tests don't run under it. So are
  `.claude` and `.agents`: Stryker's copy fails on the `.claude/skills`
  symlink (`EISDIR`).
- Its base defaults to `origin/main` and can be overridden.
- CI, `agent-review` and local runs all call it, so they never disagree about
  scope.
- When nothing is left to mutate, it prints "nothing to mutate" and exits 0.

### Thresholds

- `thresholds: { high: 85, low: 70, break: 60 }`, applied to the mutants of
  the PR's files only. A score below 60 fails.
- A no-coverage mutant counts against the score. Changing an untested
  `src/components/ui/*` (shadcn) file therefore fails the gate **on purpose**:
  changing a shadcn component requires a test.

### CI

- A `mutation` job in `.github/workflows/ci.yml`, parallel to `ci`, on
  `pull_request` only, never on a push to `main`.
- Same setup as `ci` (`voidzero-dev/setup-vp`), with checkout at
  `fetch-depth: 0` so the merge-base resolves, and `timeout-minutes: 20`.
- The incremental baseline (`stryker-incremental.json`) lives in
  `actions/cache`, scoped to the PR: key `stryker-pr-<number>-<sha>`,
  restore-key `stryker-pr-<number>-`. There is no baseline on `main`.
  Restore and save are separate steps (`actions/cache/restore`,
  `actions/cache/save` on `always()`), so a run below the threshold still
  saves its baseline for the next push.
- The job checks out the PR's head, not the test merge commit, so annotation
  lines match the PR's files.
- Reporting: a job summary with the score, a line annotation per surviving
  mutant (file, line, mutator, replacement, from the JSON reporter) and the
  HTML report uploaded as an artifact.
- The job passes when there is nothing to mutate, so it can be a required
  check.
- New actions are pinned by SHA, like the existing ones, and
  `pnpm lint:actions` must pass.

### agent-review

- The review agent runs `pnpm test:mutation` itself, in its own checkout. It
  does not pull CI artifacts, in line with the workflow's memory-less rule.
- It reads the surviving mutants from the JSON report, writes tests that kill
  them, commits and re-runs: **at most two kill rounds**.
- Mutants it can't kill become inline review comments.
- It **never** adds a `Stryker disable` comment to get past the gate. A
  suppression it thinks is right goes to a human as a review comment.

### Suppressions

`// Stryker disable next-line <mutator>: <reason>` is allowed only with a
reason, and only added by a human.

### Out of scope

- Any full-codebase Stryker run, scheduled or otherwise.
- Writing tests for existing untested files beyond what a PR's own diff needs.
- Turning on branch protection. Making `mutation` a required check is a GitHub
  setting the maintainer enables after merge.

These are tooling terms, not domain terms, so `GLOSSARY.md` doesn't change.

## Consequences

### What we lose

| Item                      | Impact                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| PR feedback time          | Each PR waits on a mutation run, capped at 20 minutes. Diff scoping and the incremental baseline keep it to the PR's own files. |
| Cheap shadcn edits        | Touching an untested `src/components/ui/*` file now needs a test, because its no-coverage mutants fail the gate.                |
| Whole-codebase score      | There is none. Untested code nobody changes is never measured.                                                                  |
| Free hand on suppressions | Agents can't silence a mutant. Equivalent mutants (ones no test can tell apart) need a human with a written reason.             |
| Two more devDependencies  | `@stryker-mutator/core` and `@stryker-mutator/vitest-runner`, under the pnpm hardening from ADR 0001.                           |

### What we gain

- A merge gate on test strength, not just on tests passing.
- Concrete work for `agent-review`: each surviving mutant is a missing
  assertion it can turn into a test.
- One script for scope, so CI, `agent-review` and local runs agree on what gets
  mutated.
- Runs that stay small as the codebase grows, since they follow the diff.

### Open risk

`@stryker-mutator/vitest-runner` hasn't been tried with the Vite+ catalog
Vitest (`vitest` 5.0.5, with `vite` aliased to
`@voidzero-dev/vite-plus-core`) and `vite.config.ts`. If the runner can't load
that setup, the decision stands but the wiring needs a workaround, or this ADR
gets revisited.

### Follow-ups

- Prove the runner works with a real run on an in-scope file, in the PR that
  adds the config.
- The maintainer makes `mutation` a required check after merge.
- Revisit the thresholds once a few PRs have gone through the gate.
