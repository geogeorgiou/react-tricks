const todos: Record<string, unknown> = {
  '/todos/1': {
    userId: 1,
    id: 1,
    title: 'delectus aut autem',
    completed: false,
  },
};

/**
 * Stand-in for `fetch(url).then((res) => res.json())` so the preview is
 * deterministic and never hammers a real API. Like a real response, every
 * call resolves with a brand-new object.
 */
export function fakeFetchJson(url: string): Promise<unknown> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(structuredClone(todos[url] ?? null)), 300),
  );
}
