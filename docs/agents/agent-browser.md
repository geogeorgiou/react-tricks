# Driving the app with agent-browser

[agent-browser](https://github.com/vercel-labs/agent-browser) is a CLI that
drives a real Chrome: one command per action, the answer on stdout. Use it to
look at a change in the running app, and for the before and after screenshots
a pull request or an explore comment carries as evidence.

It is not a dependency of this repo. The agent workflows install it, pinned,
in `.github/actions/setup-agent`. On your own machine, once:

```bash
npm install -g agent-browser
agent-browser install
```

## Ask the page

Start the app with `pnpm dev` in the background, and wait for it rather than
sleeping a fixed time. `set -m` gives it a process group of its own, and you
stop it by killing that group: pnpm does not pass a plain `kill` on to Vite.

```bash
set -m
pnpm dev >/tmp/dev.log 2>&1 & echo $! >/tmp/dev.pid
for i in $(seq 60); do curl -s localhost:3000 >/dev/null && break; sleep 1; done
# ...
kill -- -"$(cat /tmp/dev.pid)"
```

The port is `3000` (`server.port` in `vite.config.ts`). If the loop runs out,
`/tmp/dev.log` says why. The app has two routes: the overview at `/`, and each Lesson at
`/lessons/<lesson-id>`, the folder name under `src/lessons/`.

A screenshot is pixels. To verify a change you need a yes or a no, so read the
DOM:

```bash
agent-browser open http://localhost:3000/lessons/will-re-render
agent-browser find role button click --name "Show"

agent-browser get text main     # what the Lesson shows now
agent-browser errors            # anything thrown
agent-browser console           # anything logged
agent-browser screenshot /tmp/evidence/after.png
```

`agent-browser --help` lists the rest: `snapshot` (the accessibility tree,
with refs), `fill`, `wait`, `get count|url|attr`, `is visible|enabled`,
`eval`, `close`.

## The thing that will bite you

**Vite re-optimizes on the first load.** On a fresh checkout, the first page
load finds dependencies Vite has not pre-bundled and forces a full reload a
moment later. Load a throwaway page once before the real run, or the reload
lands mid-interaction.
