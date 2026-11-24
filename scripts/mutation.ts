#!/usr/bin/env node
/**
 * Runs Stryker on the lines this branch changed since its merge-base with the
 * base branch, incrementally. CI, agent-review and local runs all call this
 * script, so they agree on scope.
 * See docs/adr/0002-adopt-stryker-mutation-testing.md.
 *
 * Usage: scripts/mutation.ts [--list] [base]
 *   base     defaults to $MUTATION_BASE, then origin/main
 *   --list   print what to mutate, one `--mutate` entry per line, and exit
 *            without running Stryker
 *
 * What gets mutated, per in-scope file:
 * - the lines it added or changed since the merge-base (`file:20-21`),
 *   committed, staged or unstaged. A mutant on a line this branch didn't
 *   write grades code that isn't the branch's.
 * - every line, when the file is new since the merge-base or untracked.
 * - every line, when its colocated `X.test.ts(x)` changed (the test → sibling
 *   rule). A test edit writes no source lines, and the edited tests grade the
 *   whole file, so a test edit that weakens the suite is caught.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/** Line ranges such as `20-21`, or `'whole'` for every line of the file. */
type Lines = string[] | 'whole';

/**
 * Run git from the repository root and return its output, one entry per line.
 * A failure throws: a diff git could not produce must stop the run, not read
 * as "nothing changed" and pass. A diff can run past the 1 MB execFileSync
 * holds by default, so the buffer is far larger than that.
 */
function git(cwd: string, args: string[]): string[] {
  return execFileSync('git', ['-c', 'core.quotePath=false', ...args], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
    .split('\n')
    .filter(Boolean);
}

function isTest(file: string): boolean {
  return /\.test\.tsx?$/.test(file);
}

/** The colocated source file a test grades: `X.test.ts(x)` → `X.ts(x)`. */
function siblingOf(test: string): string {
  return test.replace(/\.test\.(tsx?)$/, '.$1');
}

/** The scope ADR 0002 sets. Keep in step with `mutate` in stryker.config.mjs. */
function inScope(file: string): boolean {
  if (!/\.tsx?$/.test(file) || isTest(file)) return false;
  if (
    file === 'src/features/lessons/registry.ts' ||
    file === 'src/main.tsx' ||
    file.startsWith('src/lessons/') ||
    file.startsWith('.sandcastle/') ||
    /^src\/(.+\/)?test-utils\//.test(file)
  ) {
    return false;
  }
  return /^src\/(features|app|pages|common|components\/ui)\//.test(file);
}

/**
 * The lines each file added or changed since `mergeBase`, read from the hunk
 * headers of `git diff -U0`. Diffing against the work tree, not HEAD, holds
 * committed, staged and unstaged changes in one diff. A hunk header is
 * `@@ -a,b +start,count @@`; a count of 0 only deletes lines, which leaves
 * nothing to mutate. A file the diff creates (`--- /dev/null`) is new, so
 * every line counts.
 */
function changedLines(root: string, mergeBase: string): Map<string, Lines> {
  const lines = new Map<string, Lines>();
  let file: string | null = null;
  let isNew = false;
  for (const line of git(root, [
    'diff',
    '-U0',
    '--no-color',
    '--no-ext-diff',
    mergeBase,
  ])) {
    if (line.startsWith('--- ')) {
      isNew = line === '--- /dev/null';
      continue;
    }
    if (line.startsWith('+++ ')) {
      file = line === '+++ /dev/null' ? null : line.slice('+++ b/'.length);
      if (file && isNew) lines.set(file, 'whole');
      continue;
    }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (!hunk || !file || isNew) continue;
    const start = Number(hunk[1]);
    const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
    if (count === 0) continue;
    const ranges = lines.get(file);
    const range = `${start}-${start + count - 1}`;
    lines.set(file, ranges === 'whole' ? 'whole' : [...(ranges ?? []), range]);
  }
  return lines;
}

/** What to mutate, as Stryker's `--mutate` entries (`file` or `file:20-21`). */
function mutateEntries(root: string, base: string): string[] {
  const [mergeBase] = git(root, ['merge-base', base, 'HEAD']);
  const targets = changedLines(root, mergeBase);

  // Every file that changed, deleted ones included: a test edit that only
  // deletes an assertion, or deletes the whole test file, still pulls in its
  // sibling. Deleted source files drop out at the existsSync filter below.
  const changed = git(root, ['diff', '--name-only', '--no-renames', mergeBase]);
  const untracked = git(root, ['ls-files', '--others', '--exclude-standard']);
  for (const file of untracked) targets.set(file, 'whole');
  for (const file of [...changed, ...untracked]) {
    if (isTest(file)) targets.set(siblingOf(file), 'whole');
  }

  return [...targets]
    .filter(([file]) => inScope(file) && existsSync(path.join(root, file)))
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([file, lines]) =>
      lines === 'whole' ? [file] : lines.map((range) => `${file}:${range}`),
    );
}

function parseArgs(argv: string[]) {
  let listOnly = false;
  let base = process.env.MUTATION_BASE || 'origin/main';
  for (const arg of argv) {
    if (arg === '--list') listOnly = true;
    else if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`);
      process.exit(2);
    } else base = arg;
  }
  return { listOnly, base };
}

const { listOnly, base } = parseArgs(process.argv.slice(2));

// git prints paths from the repository root, so resolve every path from there.
// A run from a subfolder would otherwise find no files and report a false
// "nothing to mutate".
const [root] = git(process.cwd(), ['rev-parse', '--show-toplevel']);
const entries = mutateEntries(root, base);

if (entries.length === 0) {
  console.log('nothing to mutate');
  process.exit(0);
}

if (listOnly) {
  console.log(entries.join('\n'));
  process.exit(0);
}

// Outside `pnpm`, fall back to this repo's own Stryker.
const localBin = path.resolve(
  import.meta.dirname,
  '..',
  'node_modules',
  '.bin',
);
const env = {
  ...process.env,
  PATH: `${process.env.PATH ?? ''}${path.delimiter}${localBin}`,
};

// One argument, no shell: a path with a space or a shell character must not
// change the command.
try {
  execFileSync(
    'stryker',
    ['run', '--incremental', '--mutate', entries.join(',')],
    { cwd: root, env, stdio: 'inherit' },
  );
} catch (error) {
  const { code, status } = error as { code?: string; status?: number | null };
  if (code === 'ENOENT') {
    console.error(
      'stryker not found. Install the dependencies with: pnpm install',
    );
    process.exit(1);
  }
  process.exit(typeof status === 'number' ? status : 1);
}
