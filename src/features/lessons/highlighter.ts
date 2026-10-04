import type { HighlighterCore } from 'shiki/core';

let highlighter: Promise<HighlighterCore> | undefined;

/**
 * Lazily creates a single TSX highlighter shared by every code block. Shiki is
 * loaded on demand so it stays out of the initial bundle.
 */
export function getHighlighter() {
  highlighter ??= Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
  ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
    createHighlighterCore({
      themes: [
        import('shiki/themes/github-light.mjs'),
        import('shiki/themes/github-dark.mjs'),
      ],
      langs: [import('shiki/langs/tsx.mjs')],
      engine: createJavaScriptRegexEngine(),
    }),
  );
  return highlighter;
}
