import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vite-plus/test';

// jsdom has no ResizeObserver; Radix tooltips and popovers measure with it
// once they open, and crash the tree without it.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom has no matchMedia; the sidebar's mobile hook reads it.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  addEventListener: () => {},
  removeEventListener: () => {},
})) as unknown as typeof window.matchMedia;

// jsdom has no scrollIntoView; cmdk scrolls the selected search result into view.
Element.prototype.scrollIntoView ??= () => {};

afterEach(() => {
  cleanup();
});
