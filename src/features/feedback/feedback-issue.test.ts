import { describe, expect, test, vi } from 'vite-plus/test';

import {
  FeedbackError,
  fileFeedbackIssue,
  githubRepoFromRemote,
  issueBody,
  type RunCommand,
} from './feedback-issue';

const ISSUE_URL = 'https://github.com/geogeorgiou/react-tricks/issues/42';

function fakeRun(remote = 'https://github.com/geogeorgiou/react-tricks.git') {
  return vi.fn<RunCommand>(async (command) =>
    command === 'git' ? `${remote}\n` : `${ISSUE_URL}\n`,
  );
}

describe('githubRepoFromRemote', () => {
  test.each([
    ['https://github.com/owner/repo.git', 'owner/repo'],
    ['https://github.com/owner/repo', 'owner/repo'],
    ['git@github.com:owner/repo.git', 'owner/repo'],
    ['ssh://git@github.com/owner/repo.git', 'owner/repo'],
    ['https://gitlab.com/owner/repo.git', null],
  ])('%s → %s', (remote, repo) => {
    expect(githubRepoFromRemote(remote)).toBe(repo);
  });
});

describe('issueBody', () => {
  test('names the Lesson and Question of a lesson page', () => {
    expect(
      issueBody({
        title: 't',
        description: 'It broke.',
        page: '/lessons/use-callback?tab=app2',
      }),
    ).toBe(
      '_Sent from the feedback button on `/lessons/use-callback?tab=app2` — Lesson: `use-callback`, Question: `app2`._\n\nIt broke.\n',
    );
  });

  test('names only the page elsewhere', () => {
    expect(issueBody({ title: 't', description: 'Hi.', page: '/' })).toBe(
      '_Sent from the feedback button on `/`._\n\nHi.\n',
    );
  });
});

describe('fileFeedbackIssue', () => {
  test("files the issue on origin's repo with gh, without labels", async () => {
    const run = fakeRun('git@github.com:geogeorgiou/react-tricks.git');

    const issue = await fileFeedbackIssue(run, {
      title: '  Wrong answer  ',
      description: 'App2 logs twice.',
      page: '/lessons/use-memo?tab=app2',
    });

    expect(issue).toEqual({ url: ISSUE_URL, number: 42 });
    expect(run).toHaveBeenNthCalledWith(1, 'git', [
      'remote',
      'get-url',
      'origin',
    ]);
    expect(run).toHaveBeenNthCalledWith(2, 'gh', [
      'issue',
      'create',
      '--repo',
      'geogeorgiou/react-tricks',
      '--title',
      'Wrong answer',
      '--body',
      issueBody({
        title: 'Wrong answer',
        description: 'App2 logs twice.',
        page: '/lessons/use-memo?tab=app2',
      }),
    ]);
  });

  test('rejects an empty title or description before running anything', async () => {
    const run = fakeRun();

    await expect(
      fileFeedbackIssue(run, { title: ' ', description: '' }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'Give the feedback a title. Say what happened.',
    });
    expect(run).not.toHaveBeenCalled();
  });

  test('refuses an origin that is not on GitHub', async () => {
    const run = fakeRun('https://gitlab.com/owner/repo.git');

    const filing = fileFeedbackIssue(run, { title: 't', description: 'd' });

    await expect(filing).rejects.toBeInstanceOf(FeedbackError);
    await expect(filing).rejects.toMatchObject({ status: 500 });
    expect(run).toHaveBeenCalledTimes(1);
  });
});
