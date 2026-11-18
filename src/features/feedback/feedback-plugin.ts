import { Buffer } from 'node:buffer';
import { execFile } from 'node:child_process';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { promisify } from 'node:util';

import type { Plugin } from 'vite-plus';

import { FEEDBACK_ENDPOINT } from './feedback-endpoint';
import {
  FeedbackError,
  fileFeedbackIssue,
  type RunCommand,
} from './feedback-issue';

const execFileAsync = promisify(execFile);

const runCommand: RunCommand = async (command, args) => {
  const { stdout } = await execFileAsync(command, args);
  return stdout;
};

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new FeedbackError('The feedback was not valid JSON.', 400);
  }
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

/** Handles one `POST /__feedback`. Exported with `run` injected for tests. */
export async function handleFeedback(
  run: RunCommand,
  req: IncomingMessage,
  res: ServerResponse,
) {
  if (req.method !== 'POST') {
    send(res, 405, { error: 'Use POST.' });
    return;
  }
  try {
    send(res, 200, await fileFeedbackIssue(run, await readJson(req)));
  } catch (error) {
    if (error instanceof FeedbackError) {
      send(res, error.status, { error: error.message });
    } else {
      // gh or git failed: not logged in, offline, missing binary.
      const message = error instanceof Error ? error.message : String(error);
      send(res, 500, { error: `Filing the issue failed: ${message}` });
    }
  }
}

/**
 * Dev only (`apply: 'serve'`): the endpoint exists under `pnpm dev` and is
 * never part of a build, so production has no way to file issues.
 */
export function feedbackPlugin(run: RunCommand = runCommand): Plugin {
  return {
    name: 'react-tricks:feedback',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(FEEDBACK_ENDPOINT, (req, res) => {
        void handleFeedback(run, req, res);
      });
    },
  };
}
