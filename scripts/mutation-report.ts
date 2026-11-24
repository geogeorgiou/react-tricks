#!/usr/bin/env node
/**
 * Turns Stryker's JSON report into what a CI run shows: a job summary with the
 * mutation score, and one line annotation per mutant the tests let through.
 * See docs/adr/0002-adopt-stryker-mutation-testing.md.
 *
 * Usage: scripts/mutation-report.ts [report]
 *   report   defaults to reports/mutation/mutation.json
 *
 * The summary is appended to $GITHUB_STEP_SUMMARY, or printed when that is
 * unset. Annotations (`::warning file=…,line=…::…`) go to stdout, where the
 * Actions runner reads them. With no report, as after "nothing to mutate", it
 * says so and exits 0.
 */
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import process from 'node:process';

type Position = { line: number; column: number };
type Mutant = {
  mutatorName: string;
  replacement?: string;
  status: string;
  location: { start: Position; end: Position };
};
type Report = {
  files: Record<string, { mutants: Mutant[] }>;
  thresholds: { high: number; low: number; break: number | null };
};

/** Mutants the tests let through. A no-coverage mutant counts against the score too. */
const UNDETECTED = new Set(['Survived', 'NoCoverage']);
const DETECTED = new Set(['Killed', 'Timeout']);

/** Stryker's mutation score: detected out of detected + undetected, in percent. */
function score(mutants: Mutant[]): number | null {
  const detected = mutants.filter((m) => DETECTED.has(m.status)).length;
  const undetected = mutants.filter((m) => UNDETECTED.has(m.status)).length;
  const valid = detected + undetected;
  return valid === 0 ? null : (detected / valid) * 100;
}

const formatScore = (value: number | null) =>
  value === null ? 'n/a' : `${value.toFixed(2)}%`;

/** Escape a workflow-command message. */
const escapeData = (text: string) =>
  text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');

/** Escape a workflow-command property value, such as a file path. */
const escapeProperty = (text: string) =>
  escapeData(text).replaceAll(':', '%3A').replaceAll(',', '%2C');

/** Keep a table cell on one line and its pipes out of the table syntax. */
const cell = (text: string) => text.replaceAll('|', '\\|').replace(/\s+/g, ' ');

function annotation(file: string, mutant: Mutant): string {
  const { start, end } = mutant.location;
  const title =
    mutant.status === 'NoCoverage'
      ? 'Mutant not covered by any test'
      : 'Mutant survived';
  const props = [
    `file=${escapeProperty(file)}`,
    `line=${start.line}`,
    `endLine=${end.line}`,
    `title=${escapeProperty(title)}`,
  ].join(',');
  return `::warning ${props}::${escapeData(`${mutant.mutatorName}: ${mutant.replacement ?? ''}`)}`;
}

function summary(report: Report): string {
  const files = Object.entries(report.files).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const all = files.flatMap(([, { mutants }]) => mutants);
  const total = score(all);
  const breakAt = report.thresholds.break;
  const failed = total !== null && breakAt !== null && total < breakAt;
  const count = (status: string) =>
    all.filter((m) => m.status === status).length;

  const lines = [
    `## Mutation score: ${formatScore(total)} ${failed ? '❌' : '✅'}`,
    '',
    breakAt === null
      ? 'No break threshold is set.'
      : `The job fails below ${breakAt}%. Only the lines this PR changed are mutated.`,
    '',
    `Killed ${count('Killed')} · Timeout ${count('Timeout')} · Survived ${count('Survived')} · No coverage ${count('NoCoverage')}`,
    '',
    '| File | Score | Mutants |',
    '| --- | --- | --- |',
    ...files.map(
      ([file, { mutants }]) =>
        `| \`${cell(file)}\` | ${formatScore(score(mutants))} | ${mutants.length} |`,
    ),
  ];

  const undetected = files.flatMap(([file, { mutants }]) =>
    mutants.filter((m) => UNDETECTED.has(m.status)).map((m) => ({ file, m })),
  );
  if (undetected.length > 0) {
    lines.push(
      '',
      '### Mutants the tests let through',
      '',
      '| Where | Status | Mutator | Replacement |',
      '| --- | --- | --- | --- |',
      ...undetected.map(
        ({ file, m }) =>
          `| \`${cell(file)}:${m.location.start.line}\` | ${m.status} | ${m.mutatorName} | \`${cell(m.replacement ?? '')}\` |`,
      ),
    );
  }
  return `${lines.join('\n')}\n`;
}

const reportPath = process.argv[2] ?? 'reports/mutation/mutation.json';

if (!existsSync(reportPath)) {
  console.log(
    `No mutation report at ${reportPath}, so there is nothing to summarize.`,
  );
  process.exit(0);
}

const report = JSON.parse(readFileSync(reportPath, 'utf8')) as Report;

for (const [file, { mutants }] of Object.entries(report.files)) {
  for (const mutant of mutants) {
    if (UNDETECTED.has(mutant.status)) console.log(annotation(file, mutant));
  }
}

const markdown = summary(report);
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) appendFileSync(summaryFile, markdown);
else console.log(markdown);
