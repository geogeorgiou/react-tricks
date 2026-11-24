// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

import { afterEach, beforeEach, describe, expect, test } from 'vite-plus/test';

const SCRIPT = path.resolve(import.meta.dirname, 'mutation.sh');

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

function commit(...files: string[]) {
  for (const file of files) write(file);
  git('add', '--all');
  git('commit', '--quiet', '--allow-empty', '-m', 'change');
}

function run(args: string[], extraEnv: Record<string, string> = {}) {
  const result = spawnSync(SCRIPT, args, {
    cwd: repo,
    env: { ...env, ...extraEnv },
    encoding: 'utf8',
  });
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

describe('scripts/mutation.sh --list', () => {
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

describe('scripts/mutation.sh base', () => {
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
});

describe('scripts/mutation.sh without --list', () => {
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

  test("exits with Stryker's status", () => {
    commit('src/features/preview/console-panel.tsx');

    expect(run(['main'], withFakeStryker('1')).status).toBe(1);
  });

  test('does not run Stryker when nothing is in scope', () => {
    commit('README.md');

    const result = run(['main'], withFakeStryker('1'));

    expect(result.stdout).toBe('nothing to mutate\n');
    expect(result.status).toBe(0);
  });
});
