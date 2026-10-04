/**
 * The preview sandbox records console output and tracks intervals created by a
 * running lesson preview, so the console panel can show what a lesson logs and
 * leaked intervals (some lessons leak on purpose) are cleared once the preview
 * goes away.
 *
 * Patches are installed once at startup. Everything is still forwarded to the
 * real console / timers; recording only happens while a session is active.
 */

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export type ConsoleEntry = {
  id: number;
  level: ConsoleLevel;
  message: string;
  timestamp: number;
};

const MAX_ENTRIES = 300;
const LEVELS: ConsoleLevel[] = ['log', 'info', 'warn', 'error', 'debug'];

let installed = false;
let recording = false;
let retainCount = 0;
let entryCounter = 0;
let entries: ConsoleEntry[] = [];
let trackedIntervals = new Set<number>();

const listeners = new Set<() => void>();
let notifyScheduled = false;

// Logs often happen while React is rendering the preview. Notifying
// subscribers synchronously would update the console panel mid-render, so
// notifications are batched into a microtask.
function scheduleNotify() {
  if (notifyScheduled) return;
  notifyScheduled = true;
  queueMicrotask(() => {
    notifyScheduled = false;
    listeners.forEach((listener) => listener());
  });
}

export function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (typeof arg === 'function') return `ƒ ${arg.name || 'anonymous'}()`;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
  if (typeof arg === 'object' && arg !== null) {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

/** Applies printf-style substitutions (`%s`, `%o`, `%c`…) like the browser console. */
export function formatMessage(args: unknown[]): string {
  const [first, ...rest] = args;
  if (typeof first !== 'string' || !first.includes('%')) {
    return args.map(formatArg).join(' ');
  }

  const head = first.replace(/%[sdifoOc%]/g, (token) => {
    if (token === '%%') return '%';
    if (rest.length === 0) return token;
    const value = rest.shift();
    return token === '%c' ? '' : formatArg(value);
  });

  return [head, ...rest.map(formatArg)].join(' ');
}

function record(level: ConsoleLevel, args: unknown[]) {
  if (!recording) return;
  entries = [
    ...entries,
    {
      id: ++entryCounter,
      level,
      message: formatMessage(args),
      timestamp: Date.now(),
    },
  ].slice(-MAX_ENTRIES);
  scheduleNotify();
}

export function installSandbox() {
  if (installed) return;
  installed = true;

  for (const level of LEVELS) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      record(level, args);
      original(...args);
    };
  }

  const originalSetInterval = window.setInterval.bind(window);
  const originalClearInterval = window.clearInterval.bind(window);

  window.setInterval = ((...args: Parameters<typeof setInterval>) => {
    const id = originalSetInterval(...args);
    if (recording) trackedIntervals.add(id);
    return id;
  }) as typeof window.setInterval;

  window.clearInterval = ((id?: number) => {
    if (id !== undefined) trackedIntervals.delete(id);
    originalClearInterval(id);
  }) as typeof window.clearInterval;
}

function clearTrackedIntervals() {
  const ids = trackedIntervals;
  trackedIntervals = new Set();
  ids.forEach((id) => window.clearInterval(id));
}

/**
 * Starts a fresh recording, clearing previous entries and intervals. Safe to
 * call more than once (StrictMode double-invokes state initializers).
 */
export function beginSession() {
  clearTrackedIntervals();
  entries = [];
  recording = true;
  scheduleNotify();
}

/**
 * Mounted previews retain the session; it stops once none are left. Releases
 * are deferred so StrictMode's cleanup/setup replay and a Reset (new preview
 * mounts before the old one's cleanup) never stop a live session.
 */
export function retainSession() {
  retainCount++;
  return () => {
    setTimeout(() => {
      retainCount--;
      if (retainCount > 0) return;
      recording = false;
      clearTrackedIntervals();
    }, 0);
  };
}

export function clearEntries() {
  entries = [];
  scheduleNotify();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getEntries() {
  return entries;
}
