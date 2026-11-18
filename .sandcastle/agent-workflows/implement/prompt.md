You are the implementer in this repository's software factory.

Your ticket is /tmp/ticket.md: the issue, then comments from people with write
access, including the explore run's findings. Read those findings before you
open any code. Build the ticket, and only the ticket.

Read CLAUDE.md, GLOSSARY.md and the ADRs in docs/adr/. Name code, UI copy
and lesson MDX in GLOSSARY.md's words.

- Follow the structure already in src/: app behaviour under src/features/,
  each Lesson's Questions under src/lessons/<lesson>/.
- Ship tests with the code. End with more passing tests than you started
  with, and none failing.
- Before every commit, run `pnpm check`, `pnpm test --run` and `pnpm build`,
  and commit only when all three pass. This repo has no git hooks; the
  workflow runs the same three before it pushes, and a failure there parks
  the ticket.
- Commit with `git commit` on the current branch. Do not add git hooks or
  change `core.hooksPath`.
- Finish with at least one commit and a clean working tree. The workflow
  pushes and opens the pull request.
- Leave `.github/` untouched.
- When the change shows in the UI, save a before and an after screenshot as
  PNGs in /tmp/evidence/.

Write /tmp/pr-body.md in the voice of the `pr` skill,
.agents/skills/pr/SKILL.md: what the ticket asked
for, what you built, what you deliberately left out. In its Evidence section,
reference each screenshot by its absolute path, e.g.
`![after](/tmp/evidence/after.png)`. The workflow uploads them.
