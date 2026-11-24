import { describe, expect, test } from 'vite-plus/test';

import { findLesson, lessons, sections } from './registry';

describe('lesson registry', () => {
  test('discovers every lesson folder, in course order Section by Section', () => {
    expect(lessons.map((lesson) => lesson.id)).toEqual([
      'console-log',
      'will-re-render',
      'context',
      'use-effect',
      'use-effect-set-interval',
      'use-memo',
      'use-callback',
      'use',
      'activity',
    ]);
  });

  test('groups every lesson into exactly one Section, in Section order', () => {
    expect(
      sections.map((section) => [
        section.title,
        section.lessons.map((lesson) => lesson.id),
      ]),
    ).toEqual([
      ['Rendering Fundamentals', ['console-log', 'will-re-render', 'context']],
      ['Effects', ['use-effect', 'use-effect-set-interval']],
      ['Memoization', ['use-memo', 'use-callback']],
      ['New in React 19', ['use', 'activity']],
    ]);
    expect(sections.flatMap((section) => section.lessons)).toEqual(lessons);
  });

  test.each(lessons.map((lesson) => [lesson.id, lesson] as const))(
    '%s questions are complete and in file order',
    (_id, lesson) => {
      expect(lesson.questions.length).toBeGreaterThan(0);
      lesson.questions.forEach((question, index) => {
        expect(question.id).toBe(`app${index + 1}`);
        expect(question.fileName).toBe(`App${index + 1}.tsx`);
        expect(question.source).toContain(`export const App${index + 1}`);
        expect(question.title).not.toBe('');
        expect(question.prompt).not.toBe('');
        expect(typeof question.Component).toBe('function');
        expect(typeof question.Explanation).toBe('function');
      });
    },
  );

  test('every lesson file has an explanation', () => {
    const files = Object.keys(
      import.meta.glob(['/src/lessons/*/App*.tsx', '!**/*.test.tsx']),
    );
    const explained = lessons.flatMap((lesson) =>
      lesson.questions.map((q) => `/src/lessons/${lesson.id}/${q.fileName}`),
    );
    expect(explained.sort()).toEqual(files.sort());
  });

  test('findLesson looks lessons up by slug', () => {
    expect(findLesson('context')?.title).toBe('Context');
    expect(findLesson('nope')).toBeUndefined();
  });
});
