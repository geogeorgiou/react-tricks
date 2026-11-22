import { beforeEach, describe, expect, test } from 'vite-plus/test';

import { CLOSED_SECTIONS_KEY, readClosedSections } from './closed-sections';

describe('readClosedSections', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('starts with every Section open', () => {
    expect(readClosedSections()).toEqual([]);
  });

  test('reads the stored Section titles', () => {
    localStorage.setItem(CLOSED_SECTIONS_KEY, '["Effects","Memoization"]');
    expect(readClosedSections()).toEqual(['Effects', 'Memoization']);
  });

  test('drops titles that are not Sections any more', () => {
    localStorage.setItem(CLOSED_SECTIONS_KEY, '["Effects","Old",3]');
    expect(readClosedSections()).toEqual(['Effects']);
  });

  test('ignores a value that is not a list', () => {
    localStorage.setItem(CLOSED_SECTIONS_KEY, '{nope');
    expect(readClosedSections()).toEqual([]);
    localStorage.setItem(CLOSED_SECTIONS_KEY, '"Effects"');
    expect(readClosedSections()).toEqual([]);
  });
});
