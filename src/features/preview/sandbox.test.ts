import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  beginSession,
  formatMessage,
  getEntries,
  installSandbox,
  retainSession,
} from './sandbox';

installSandbox();

describe('preview sandbox', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('records console output only while a session is retained', async () => {
    vi.useFakeTimers();
    beginSession();
    const release = retainSession();

    console.log('inside', 1);
    expect(getEntries().map((e) => e.message)).toEqual(['inside 1']);

    release();
    await vi.runAllTimersAsync();
    console.log('outside');
    expect(getEntries().map((e) => e.message)).toEqual(['inside 1']);
  });

  test('a StrictMode-style release + retain keeps the session alive', async () => {
    vi.useFakeTimers();
    beginSession();
    const release = retainSession();
    release();
    const releaseAgain = retainSession();
    await vi.runAllTimersAsync();

    console.warn('still recording');
    expect(getEntries().at(-1)).toMatchObject({
      level: 'warn',
      message: 'still recording',
    });
    releaseAgain();
    await vi.runAllTimersAsync();
  });

  // Real timers: fake timers would replace the patched setInterval.
  test('clears intervals left running when the session ends', async () => {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const tick = vi.fn();
    beginSession();
    const release = retainSession();
    setInterval(tick, 10);

    await wait(35);
    const callsWhileRunning = tick.mock.calls.length;
    expect(callsWhileRunning).toBeGreaterThan(0);

    release();
    await wait(5);
    const callsAtRelease = tick.mock.calls.length;
    await wait(40);
    expect(tick.mock.calls.length).toBe(callsAtRelease);
  });

  test('formats printf-style messages like the browser console', () => {
    expect(formatMessage(['%s has %d items', 'cart', 3])).toBe(
      'cart has 3 items',
    );
    expect(formatMessage(['%cstyled', 'color: red'])).toBe('styled');
    expect(formatMessage([{ a: 1 }])).toBe('{\n  "a": 1\n}');
  });
});
