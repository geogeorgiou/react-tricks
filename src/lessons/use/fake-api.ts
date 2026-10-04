export type Brewery = {
  id: number;
  name: string;
  city: string;
};

const breweries: Brewery[] = [
  { id: 1, name: 'Anchor Brewing', city: 'San Francisco' },
  { id: 2, name: 'Brooklyn Brewery', city: 'New York' },
  { id: 3, name: 'Sierra Nevada', city: 'Chico' },
];

// Safety net for the uncached-promise lesson: without it the preview would
// keep "fetching" forever.
const WINDOW_MS = 3000;
const MAX_CALLS_PER_WINDOW = 8;
let recentCalls: number[] = [];
let blockedUntil = 0;

/** Stand-in for a real network request: resolves with fresh data after a delay. */
export function fetchBreweries(): Promise<Brewery[]> {
  const now = Date.now();
  recentCalls = [...recentCalls.filter((t) => now - t < WINDOW_MS), now];

  if (recentCalls.length > MAX_CALLS_PER_WINDOW) {
    recentCalls = [];
    // Keep failing for a moment: React may retry with an earlier promise first.
    blockedUntil = now + 1000;
  }

  if (now < blockedUntil) {
    return rejectedNow(
      new Error(
        'Stopped: fetchBreweries() kept being called. Every render created a brand-new promise.',
      ),
    );
  }

  console.log('fetchBreweries() called');
  return new Promise((resolve) =>
    setTimeout(() => resolve(structuredClone(breweries)), 300),
  );
}

// A promise React's `use` can read synchronously: marking it as already
// rejected makes `use` throw right away instead of suspending (and re-rendering
// into yet another fetch).
function rejectedNow<T>(error: Error): Promise<T> {
  const promise = Promise.reject(error) as Promise<T> & {
    status?: string;
    reason?: unknown;
  };
  promise.catch(() => {});
  promise.status = 'rejected';
  promise.reason = error;
  return promise;
}
