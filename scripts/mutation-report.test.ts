// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

import { afterEach, beforeEach, describe, expect, test } from 'vite-plus/test';

const SCRIPT = path.resolve(import.meta.dirname, 'mutation-report.ts');

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'mutation-report-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

type Status = 'Killed' | 'Timeout' | 'Survived' | 'NoCoverage' | 'CompileError';

function mutant(status: Status, line: number, replacement = '""') {
  return {
    mutatorName: 'StringLiteral',
    replacement,
    status,
    location: { start: { line, column: 1 }, end: { line, column: 9 } },
  };
}

function writeReport(files: Record<string, ReturnType<typeof mutant>[]>) {
  const report = path.join(dir, 'mutation.json');
  writeFileSync(
    report,
    JSON.stringify({
      files: Object.fromEntries(
        Object.entries(files).map(([file, mutants]) => [file, { mutants }]),
      ),
      thresholds: { high: 85, low: 70, break: 60 },
    }),
  );
  return report;
}

/** Run the script as CI does, with a job summary file. */
function run(report: string) {
  const summaryFile = path.join(dir, 'summary.md');
  writeFileSync(summaryFile, '');
  // Through node, not the shebang: Stryker's sandbox copy of a .ts file drops
  // the executable bit.
  const result = spawnSync(process.execPath, [SCRIPT, report], {
    env: { ...process.env, GITHUB_STEP_SUMMARY: summaryFile },
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  return {
    status: result.status,
    annotations: result.stdout.split('\n').filter((l) => l.startsWith('::')),
    stdout: result.stdout,
    summary: readFileSync(summaryFile, 'utf8'),
  };
}

describe('scripts/mutation-report.ts', () => {
  test('with no report, says so and exits 0', () => {
    const result = run(path.join(dir, 'missing.json'));

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('nothing to summarize');
    expect(result.summary).toBe('');
  });

  test('writes the score to the job summary', () => {
    const report = writeReport({
      'src/app/a.ts': [
        mutant('Killed', 1),
        mutant('Timeout', 2),
        mutant('Survived', 3),
      ],
      'src/app/b.ts': [mutant('NoCoverage', 4), mutant('CompileError', 5)],
    });

    const { summary, status } = run(report);

    // 2 detected out of 4: the compile error counts on neither side.
    expect(summary).toContain('## Mutation score: 50.00% ❌');
    expect(summary).toContain('The job fails below 60%.');
    expect(summary).toContain('| `src/app/a.ts` | 66.67% | 3 |');
    expect(summary).toContain('| `src/app/b.ts` | 0.00% | 2 |');
    expect(status).toBe(0);
  });

  test('marks a score at or above the break threshold as passing', () => {
    const report = writeReport({
      'src/app/a.ts': [
        mutant('Killed', 1),
        mutant('Killed', 2),
        mutant('Survived', 3),
      ],
    });

    expect(run(report).summary).toContain('## Mutation score: 66.67% ✅');
  });

  test('annotates each surviving and uncovered mutant at its line', () => {
    const report = writeReport({
      'src/app/a.ts': [
        mutant('Killed', 1),
        mutant('Survived', 3, "default('')"),
      ],
      'src/app/b.ts': [mutant('NoCoverage', 7, 'false')],
    });

    expect(run(report).annotations).toEqual([
      "::warning file=src/app/a.ts,line=3,endLine=3,title=Mutant survived::StringLiteral: default('')",
      '::warning file=src/app/b.ts,line=7,endLine=7,title=Mutant not covered by any test::StringLiteral: false',
    ]);
  });

  test('escapes workflow-command characters in an annotation', () => {
    const report = writeReport({
      'src/app/a,b.ts': [mutant('Survived', 1, '100%\nnext')],
    });

    expect(run(report).annotations).toEqual([
      '::warning file=src/app/a%2Cb.ts,line=1,endLine=1,title=Mutant survived::StringLiteral: 100%25%0Anext',
    ]);
  });

  test('lists the mutants the tests let through in the summary', () => {
    const report = writeReport({
      'src/app/a.ts': [mutant('Survived', 3, 'a | b')],
    });

    expect(run(report).summary).toContain(
      '| `src/app/a.ts:3` | Survived | StringLiteral | `a \\| b` |',
    );
  });

  test('a report with no valid mutants scores n/a', () => {
    const report = writeReport({ 'src/app/a.ts': [mutant('CompileError', 1)] });

    expect(run(report).summary).toContain('## Mutation score: n/a ✅');
  });
});
