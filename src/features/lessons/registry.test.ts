import { describe, expect, test } from 'vitest';
import { findLesson, lessons } from './registry';

describe('lesson registry', () => {
  test('discovers every lesson folder, ordered by frontmatter', () => {
    expect(lessons.map((lesson) => lesson.id)).toEqual([
      'console-log',
      'use-effect',
      'use-effect-set-interval',
      'use-memo',
      'use-callback',
      'will-re-render',
      'context',
      'use',
    ]);
  });

  test.each(lessons.map((lesson) => [lesson.id, lesson] as const))(
    '%s variants are complete and in file order',
    (_id, lesson) => {
      expect(lesson.variants.length).toBeGreaterThan(0);
      lesson.variants.forEach((variant, index) => {
        expect(variant.id).toBe(`app${index + 1}`);
        expect(variant.fileName).toBe(`App${index + 1}.tsx`);
        expect(variant.source).toContain(`export const App${index + 1}`);
        expect(variant.title).not.toBe('');
        expect(variant.question).not.toBe('');
        expect(typeof variant.Component).toBe('function');
        expect(typeof variant.Explanation).toBe('function');
      });
    },
  );

  test('every lesson file has an explanation', () => {
    const files = Object.keys(
      import.meta.glob(['/src/lessons/*/App*.tsx', '!**/*.test.tsx']),
    );
    const explained = lessons.flatMap((lesson) =>
      lesson.variants.map((v) => `/src/lessons/${lesson.id}/${v.fileName}`),
    );
    expect(explained.sort()).toEqual(files.sort());
  });

  test('findLesson looks lessons up by slug', () => {
    expect(findLesson('context')?.title).toBe('Context');
    expect(findLesson('nope')).toBeUndefined();
  });
});
