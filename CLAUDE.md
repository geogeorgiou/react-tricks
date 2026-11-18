# react-tricks

- **Domain language** lives in `GLOSSARY.md` (Lesson, Question, Prompt, Answer, Explanation, Takeaway, ...). Read it before naming code, writing UI copy or lesson MDX, or grilling a design, and use its terms, not the ones it lists under _Avoid_. A new or changed term goes into `GLOSSARY.md` first.
- **Decisions** that are hard to reverse are recorded as ADRs in `docs/adr/`. Read them before changing tooling or architecture.

## Agent skills

### Issue tracker

Issues and specs live in this repo's GitHub Issues, managed with `gh`; `agent:*` labels start the agent workflows. See `docs/agents/issue-tracker.md`.

### Vendored skills

`.agents/skills/` (also `.claude/skills/`) holds the skills the agent workflows read in CI, copied byte-identical from `~/.agents/skills/` and excluded from Oxfmt. To change one, edit upstream and copy it back over.
