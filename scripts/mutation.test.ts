// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

import { afterEach, beforeEach, describe, expect, test } from 'vite-plus/test';

const SCRIPT = path.resolve(import.meta.dirname, 'mutation.ts');

// Keep the throwaway repo free of the caller's git state, such as a hook's
// GIT_INDEX_FILE.
const env = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
);
delete env.MUTATION_BASE;

let repo: string;
let edits = 0;

function git(...args: string[]) {
  execFileSync('git', args, { cwd: repo, env, stdio: 'pipe' });
}

function write(file: string) {
  // Unique content, so rewriting a file always counts as a change.
  const content = `export const x = ${++edits};\n`;
  const full = path.join(repo, file);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content);
}

/** Write a file line by line, so a test can change some lines and not others. */
function writeLines(file: string, lines: string[]) {
  const full = path.join(repo, file);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, lines.map((line) => `${line}\n`).join(''));
}

const FIVE = [
  'const a = 1;',
  'const b = 2;',
  'const c = 3;',
  'const d = 4;',
  'const e = 5;',
];

/** Commit a five-line file on `feature`, then branch `edit` off it to change it. */
function startFromFiveLines(file: string) {
  writeLines(file, FIVE);
  git('add', '--all');
  git('commit', '--quiet', '-m', 'five lines');
  git('switch', '--quiet', '--create', 'edit');
}

function commit(...files: string[]) {
  for (const file of files) write(file);
  git('add', '--all');
  git('commit', '--quiet', '--allow-empty', '-m', 'change');
}

function run(
  args: string[],
  extraEnv: Record<string, string> = {},
  cwd = repo,
) {
  // Through node, not the shebang: Stryker's sandbox copy of a .ts file drops
  // the executable bit.
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd,
    env: { ...env, ...extraEnv },
    encoding: 'utf8',
  });
  // A script that could not start has no output to assert on.
  if (result.error) throw result.error;
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    lines: result.stdout.split('\n').filter(Boolean),
  };
}

const list = (base = 'main') => run(['--list', base]);

beforeEach(() => {
  repo = mkdtempSync(path.join(tmpdir(), 'mutation-'));
  git('init', '--quiet', '--initial-branch=main');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  git('config', 'commit.gpgsign', 'false');
  // Files that exist on the base branch, so the sibling rule can find them.
  commit(
    'src/features/preview/sandbox.ts',
    'src/features/preview/sandbox.test.ts',
    'src/features/feedback/feedback-button.tsx',
    'src/features/feedback/feedback-button.test.tsx',
    'src/lessons/console-log/App1.tsx',
    'src/lessons/console-log/App1.test.tsx',
    'src/features/lessons/registry.ts',
    'src/features/lessons/registry.test.ts',
  );
  git('switch', '--quiet', '--create', 'feature');
});

afterEach(() => {
  rmSync(repo, { recursive: true, force: true });
});

describe('scripts/mutation.ts --list', () => {
  test('lists a changed in-scope file', () => {
    commit('src/features/preview/console-panel.tsx', 'src/app/app-layout.tsx');

    expect(list().lines).toEqual([
      'src/app/app-layout.tsx',
      'src/features/preview/console-panel.tsx',
    ]);
  });

  test.each([
    'src/features/foo.ts',
    'src/app/foo.tsx',
    'src/pages/foo.tsx',
    'src/common/hooks/foo.tsx',
    'src/components/ui/button.tsx',
  ])('lists in-scope %s', (file) => {
    commit(file);

    expect(list().lines).toEqual([file]);
  });

  test('a changed X.test.tsx alone lists its sibling X.tsx', () => {
    commit('src/features/feedback/feedback-button.test.tsx');

    expect(list().lines).toEqual(['src/features/feedback/feedback-button.tsx']);
  });

  test('a changed X.test.ts alone lists its sibling X.ts', () => {
    commit('src/features/preview/sandbox.test.ts');

    expect(list().lines).toEqual(['src/features/preview/sandbox.ts']);
  });

  test('only the last .test. names the sibling', () => {
    commit('src/features/a.test.dir/x.ts');
    git('switch', '--quiet', '--create', 'sibling');
    commit('src/features/a.test.dir/x.test.ts');

    expect(list('feature').lines).toEqual(['src/features/a.test.dir/x.ts']);
  });

  test('finds the sibling when run from a subfolder', () => {
    commit('src/features/preview/sandbox.test.ts');

    expect(run(['--list', 'main'], {}, path.join(repo, 'src')).lines).toEqual([
      'src/features/preview/sandbox.ts',
    ]);
  });

  test('a test without a sibling lists nothing', () => {
    commit('src/features/preview/orphan.test.ts');

    expect(list().lines).toEqual(['nothing to mutate']);
  });

  test('never lists excluded paths, even when changed', () => {
    commit(
      'src/features/lessons/registry.ts',
      'src/features/lessons/registry.test.ts',
      'src/lessons/console-log/App1.tsx',
      'src/lessons/console-log/App1.test.tsx',
      'src/lessons/console-log/App1.mdx',
      'src/features/lessons/notes.mdx',
      'src/features/test-utils/render.tsx',
      'src/test-utils/render.tsx',
      '.sandcastle/agent-workflows/review/review.ts',
      'src/main.tsx',
      'src/features/preview/new.test.tsx',
      'src/features/preview/new.test.ts',
    );

    const result = list();

    expect(result.lines).toEqual(['nothing to mutate']);
    expect(result.status).toBe(0);
  });

  test('drops deleted files', () => {
    git('rm', '--quiet', 'src/features/preview/sandbox.ts');
    commit('src/app/app-sidebar.tsx');

    expect(list().lines).toEqual(['src/app/app-sidebar.tsx']);
  });

  test('with no in-scope changes, prints "nothing to mutate" and exits 0', () => {
    commit('README.md', 'src/index.css', 'scripts/other.sh');

    const result = list();

    expect(result.stdout).toBe('nothing to mutate\n');
    expect(result.status).toBe(0);
  });

  test('only counts changes since the merge-base', () => {
    commit('src/features/preview/mine.ts');
    git('switch', '--quiet', 'main');
    commit('src/features/preview/theirs.ts');
    git('switch', '--quiet', 'feature');

    expect(list().lines).toEqual(['src/features/preview/mine.ts']);
  });
});

describe('scripts/mutation.ts --list, changed lines', () => {
  const file = 'src/features/preview/console-panel.tsx';

  test('a changed file lists only its changed line ranges', () => {
    startFromFiveLines(file);
    writeLines(file, [
      'const a = 1;',
      'const b = 20;',
      'const c = 3;',
      'const d = 40;',
      'const e = 50;',
    ]);
    git('commit', '--quiet', '--all', '-m', 'edit');

    expect(list('feature').lines).toEqual([`${file}:2-2`, `${file}:4-5`]);
  });

  test('a file new since the merge-base is listed whole', () => {
    commit(file);

    expect(list().lines).toEqual([file]);
  });

  test('lists unstaged and staged changes', () => {
    startFromFiveLines(file);
    writeLines(file, ['const a = 10;', ...FIVE.slice(1)]);
    writeLines('src/app/app-layout.tsx', ['export const x = 1;']);
    git('add', 'src/app/app-layout.tsx');

    expect(list('feature').lines).toEqual([
      'src/app/app-layout.tsx',
      `${file}:1-1`,
    ]);
  });

  test('lists an untracked file whole', () => {
    writeLines('src/app/draft.tsx', [
      'export const a = 1;',
      'export const b = 2;',
    ]);

    expect(list().lines).toEqual(['src/app/draft.tsx']);
  });

  test('a change that only deletes lines lists nothing', () => {
    startFromFiveLines(file);
    writeLines(file, FIVE.slice(0, 3));
    git('commit', '--quiet', '--all', '-m', 'delete lines');

    expect(list('feature').lines).toEqual(['nothing to mutate']);
  });

  test('a test that only deletes lines lists its sibling whole', () => {
    const test = 'src/features/preview/console-panel.test.tsx';
    writeLines(file, FIVE);
    startFromFiveLines(test);
    writeLines(test, FIVE.slice(0, 4));
    git('commit', '--quiet', '--all', '-m', 'drop an assertion');

    expect(list('feature').lines).toEqual([file]);
  });

  test('a deleted test lists its sibling whole', () => {
    git('rm', '--quiet', 'src/features/preview/sandbox.test.ts');
    git('commit', '--quiet', '-m', 'drop the test');

    expect(list().lines).toEqual(['src/features/preview/sandbox.ts']);
  });

  test('a changed test lists its sibling whole, even when the sibling changed too', () => {
    const test = 'src/features/preview/console-panel.test.tsx';
    writeLines(test, ['test();']);
    startFromFiveLines(file);
    writeLines(file, ['const a = 10;', ...FIVE.slice(1)]);
    writeLines(test, ['test();', 'test();']);
    git('commit', '--quiet', '--all', '-m', 'edit both');

    expect(list('feature').lines).toEqual([file]);
  });
});

describe('scripts/mutation.ts --list, .sandcastle', () => {
  // .sandcastle is the agent orchestrator, not app code: it is never mutated,
  // however it changed. `--mutate` replaces stryker.config.mjs's globs, so
  // this script is the only guard.
  const source = '.sandcastle/agent-workflows/review/left-findings.ts';
  const testFile = '.sandcastle/agent-workflows/review/left-findings.test.ts';

  test.each([
    [
      'changed lines',
      () => {
        startFromFiveLines(source);
        writeLines(source, ['const a = 10;', ...FIVE.slice(1)]);
        git('commit', '--quiet', '--all', '-m', 'edit');
      },
    ],
    [
      'an uncommitted edit',
      () => {
        startFromFiveLines(source);
        writeLines(source, ['const a = 10;', ...FIVE.slice(1)]);
      },
    ],
    [
      'an untracked file',
      () => {
        git('switch', '--quiet', '--create', 'edit');
        writeLines('.sandcastle/agent-workflows/review/draft.ts', FIVE);
      },
    ],
    [
      'a changed test next to its source',
      () => {
        writeLines(source, FIVE);
        startFromFiveLines(testFile);
        writeLines(testFile, FIVE.slice(0, 4));
        git('commit', '--quiet', '--all', '-m', 'edit the test');
      },
    ],
  ])('lists nothing for %s', (_name, change) => {
    change();

    const result = list('feature');

    expect(result.lines).toEqual(['nothing to mutate']);
    expect(result.status).toBe(0);
  });
});

describe('scripts/mutation.ts base', () => {
  beforeEach(() => {
    commit('src/features/preview/console-panel.tsx');
  });

  test('defaults to origin/main', () => {
    const noOrigin = run(['--list']);
    expect(noOrigin.status).not.toBe(0);

    git('update-ref', 'refs/remotes/origin/main', 'main');

    expect(run(['--list']).lines).toEqual([
      'src/features/preview/console-panel.tsx',
    ]);
  });

  test('can be overridden with MUTATION_BASE', () => {
    expect(run(['--list'], { MUTATION_BASE: 'main' }).lines).toEqual([
      'src/features/preview/console-panel.tsx',
    ]);
  });

  test('an argument overrides MUTATION_BASE', () => {
    expect(run(['--list', 'main'], { MUTATION_BASE: 'nope' }).lines).toEqual([
      'src/features/preview/console-panel.tsx',
    ]);
  });

  test('ignores the `--` that `pnpm test:mutation -- <base>` passes through', () => {
    expect(
      run(['--list', '--', 'main'], { MUTATION_BASE: 'nope' }).lines,
    ).toEqual(['src/features/preview/console-panel.tsx']);
  });

  test('rejects an unknown option', () => {
    const result = run(['--nope']);

    expect(result.stderr).toContain('Unknown option: --nope');
    expect(result.status).toBe(2);
  });
});

describe('scripts/mutation.ts without --list', () => {
  let bin: string;

  beforeEach(() => {
    // A fake Stryker that records its arguments and exits with $FAKE_STATUS.
    bin = mkdtempSync(path.join(tmpdir(), 'mutation-bin-'));
    const stryker = path.join(bin, 'stryker');
    writeFileSync(
      stryker,
      '#!/usr/bin/env bash\nprintf "%s\\n" "$@"\nexit "${FAKE_STATUS:-0}"\n',
    );
    chmodSync(stryker, 0o755);
  });

  afterEach(() => {
    rmSync(bin, { recursive: true, force: true });
  });

  const withFakeStryker = (status = '0') => ({
    PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    FAKE_STATUS: status,
  });

  test('passes --incremental and the comma-separated --mutate list', () => {
    commit('src/features/preview/console-panel.tsx', 'src/app/app-layout.tsx');

    const result = run(['main'], withFakeStryker());

    expect(result.lines).toEqual([
      'run',
      '--incremental',
      '--mutate',
      'src/app/app-layout.tsx,src/features/preview/console-panel.tsx',
    ]);
    expect(result.status).toBe(0);
  });

  test('passes line ranges to --mutate', () => {
    const file = 'src/features/preview/console-panel.tsx';
    startFromFiveLines(file);
    writeLines(file, ['const a = 10;', ...FIVE.slice(1, 4), 'const e = 50;']);
    git('commit', '--quiet', '--all', '-m', 'edit');

    expect(run(['feature'], withFakeStryker()).lines).toEqual([
      'run',
      '--incremental',
      '--mutate',
      `${file}:1-1,${file}:5-5`,
    ]);
  });

  test("exits with Stryker's status", () => {
    commit('src/features/preview/console-panel.tsx');

    expect(run(['main'], withFakeStryker('1')).status).toBe(1);
  });

  test('fails with a hint when Stryker is not installed', () => {
    commit('src/features/preview/console-panel.tsx');
    // A copy outside this repo, so its node_modules/.bin fallback is empty.
    const script = path.join(bin, 'scripts', 'mutation.ts');
    mkdirSync(path.dirname(script));
    copyFileSync(SCRIPT, script);

    const result = spawnSync(process.execPath, [script, 'main'], {
      cwd: repo,
      env: { ...env, PATH: '/usr/bin:/bin' },
      encoding: 'utf8',
    });

    expect(result.stderr).toContain('stryker not found');
    expect(result.status).toBe(1);
  });

  test('does not run Stryker when nothing is in scope', () => {
    commit('README.md');

    const result = run(['main'], withFakeStryker('1'));

    expect(result.stdout).toBe('nothing to mutate\n');
    expect(result.status).toBe(0);
  });
});
