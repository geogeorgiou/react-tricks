import { describe, expect, test } from 'vite-plus/test';

import { findLesson, lessonSections, lessons } from './registry';
import { sections } from './sections';

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

  test('every lesson belongs to a known Section', () => {
    const sectionIds = sections.map((section) => section.id);
    lessons.forEach((lesson) => {
      expect(sectionIds).toContain(lesson.section);
    });
  });

  test('lessonSections groups every lesson once, in Section then lesson order', () => {
    expect(
      lessonSections.map((section) => [
        section.id,
        section.lessons.map((lesson) => lesson.id),
      ]),
    ).toEqual([
      ['state', ['console-log']],
      ['effects', ['use-effect', 'use-effect-set-interval']],
      ['memoization', ['use-memo', 'use-callback', 'will-re-render']],
      ['context', ['context']],
      ['react-19', ['use']],
    ]);
    expect(lessonSections.flatMap((section) => section.lessons)).toHaveLength(
      lessons.length,
    );
  });
});
