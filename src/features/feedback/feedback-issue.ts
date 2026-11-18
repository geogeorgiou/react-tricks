import { z } from 'zod';

/** Dev server only. Turns a posted feedback form into a GitHub issue. */

/** Runs a program with its arguments, never through a shell, and resolves with its stdout. */
export type RunCommand = (command: string, args: string[]) => Promise<string>;

/** An error whose message is safe to show the developer in a toast. */
export class FeedbackError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const feedbackSchema = z.object({
  title: z.string().trim().min(1, 'Give the feedback a title.'),
  description: z.string().trim().min(1, 'Say what happened.'),
  page: z.string().default('/'),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export type FiledIssue = { url: string; number: number };

/** The Lesson and Question a page shows, read from `/lessons/:lessonId?tab=<questionId>`. */
function pageContext(page: string) {
  const url = new URL(page, 'http://localhost');
  const lessonId = url.pathname.match(/^\/lessons\/([^/]+)\/?$/)?.[1];
  if (!lessonId) return null;
  return { lessonId, questionId: url.searchParams.get('tab') };
}

export function issueBody({ description, page }: FeedbackInput) {
  const context = pageContext(page);
  let source = `_Sent from the feedback button on \`${page}\``;
  if (context) {
    source += ` — Lesson: \`${context.lessonId}\``;
    if (context.questionId) source += `, Question: \`${context.questionId}\``;
  }
  return `${source}._\n\n${description}\n`;
}

/** `owner/repo` from a GitHub remote: https, ssh:// or scp-style `git@`. */
export function githubRepoFromRemote(remoteUrl: string) {
  const match = remoteUrl
    .trim()
    .match(/github\.com[:/]([^/\s]+\/[^/\s]+?)(?:\.git)?\/?$/);
  return match ? match[1] : null;
}

// `gh` on its own may pick an `upstream` remote over origin. Feedback is for
// this repo, so the target is always origin's.
async function originRepo(run: RunCommand) {
  const remote = await run('git', ['remote', 'get-url', 'origin']);
  const repo = githubRepoFromRemote(remote);
  if (!repo) {
    throw new FeedbackError(
      `origin is not a GitHub repo: ${remote.trim()}`,
      500,
    );
  }
  return repo;
}

/**
 * Files the feedback as an issue on origin's GitHub repo with
 * `gh issue create`, signed in as whoever ran `gh auth login`. Adds no
 * labels: starting an agent workflow stays a manual step.
 */
export async function fileFeedbackIssue(
  run: RunCommand,
  input: unknown,
): Promise<FiledIssue> {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    throw new FeedbackError(
      parsed.error.issues.map((issue) => issue.message).join(' '),
      400,
    );
  }

  const repo = await originRepo(run);
  const stdout = await run('gh', [
    'issue',
    'create',
    '--repo',
    repo,
    '--title',
    parsed.data.title,
    '--body',
    issueBody(parsed.data),
  ]);

  const url = stdout.trim().split('\n').at(-1) ?? '';
  const number = Number(url.match(/\/issues\/(\d+)$/)?.[1]);
  if (!number) {
    throw new FeedbackError(`gh did not return an issue URL: ${url}`, 500);
  }
  return { url, number };
}
