import * as path from 'node:path';

import * as sandcastle from '@ai-hero/sandcastle';
import { noSandbox } from '@ai-hero/sandcastle/sandboxes/no-sandbox';

import { claudeAgent } from '../shared/common';

// The agent edits files and commits them itself, running `pnpm check` and
// `pnpm build` before each commit (there are no git hooks; the test suite is
// the reviewer's). It does not push or open the PR, and it holds no GitHub
// token to do either — the
// workflow steps after this one do, where you can read them.
await sandcastle.run({
  name: 'implement',
  agent: claudeAgent(),
  sandbox: noSandbox(),
  logging: { type: 'stdout' },
  promptFile: path.join(import.meta.dirname, 'prompt.md'),
});
