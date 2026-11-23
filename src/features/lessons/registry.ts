import type { MDXContent } from 'mdx/types';
import type { ComponentType } from 'react';

/**
 * Lessons are discovered from the file system:
 *
 *   src/lessons/<lesson-id>/index.mdx   lesson title, section, order, summary
 *   src/lessons/<lesson-id>/AppN.tsx    the question component (and its source)
 *   src/lessons/<lesson-id>/AppN.mdx    prompt + explanation for AppN
 *
 * A lesson shows up once it has an index.mdx, and a question once it has both
 * its .tsx and .mdx files.
 */

/**
 * Sections in sidebar order. A Lesson names its Section in frontmatter. Its
 * `order` places it across the whole course (the overview and search), and a
 * Section lists its Lessons in that same relative order.
 */
export const SECTION_TITLES = [
  'Rendering Fundamentals',
  'Effects',
  'Memoization',
  'New in React 19',
] as const;

export type SectionTitle = (typeof SECTION_TITLES)[number];

export type LessonFrontmatter = {
  title: string;
  section: SectionTitle;
  order: number;
  summary: string;
};

export type QuestionFrontmatter = {
  title: string;
  prompt: string;
  strictModeSensitive?: boolean;
};

type MdxModule<T> = { default: MDXContent; frontmatter: T };

export type Question = QuestionFrontmatter & {
  /** URL tab value, e.g. `app1` */
  id: string;
  /** File name shown above the code, e.g. `App1.tsx` */
  fileName: string;
  source: string;
  Component: ComponentType;
  Explanation: MDXContent;
};

export type Lesson = LessonFrontmatter & {
  /** Folder name, also the URL slug */
  id: string;
  Intro: MDXContent;
  questions: Question[];
};

const lessonDocs = import.meta.glob<MdxModule<LessonFrontmatter>>(
  '/src/lessons/*/index.mdx',
  { eager: true },
);

const questionDocs = import.meta.glob<MdxModule<QuestionFrontmatter>>(
  '/src/lessons/*/App*.mdx',
  { eager: true },
);

const questionModules = import.meta.glob<Record<string, ComponentType>>(
  ['/src/lessons/*/App*.tsx', '!/src/lessons/**/*.test.tsx'],
  { eager: true },
);

const questionSources = import.meta.glob<string>(
  ['/src/lessons/*/App*.tsx', '!/src/lessons/**/*.test.tsx'],
  { eager: true, query: '?raw', import: 'default' },
);

const LESSON_DIR = /^\/src\/lessons\/([^/]+)\//;
const QUESTION_FILE = /\/(App(\d+))\.mdx$/;

function lessonIdOf(path: string) {
  const match = LESSON_DIR.exec(path);
  if (!match) throw new Error(`Unexpected lesson path: ${path}`);
  return match[1];
}

function assertFrontmatter(
  path: string,
  frontmatter: Record<string, unknown> | undefined,
  required: Record<string, 'string' | 'number'>,
) {
  for (const [key, type] of Object.entries(required)) {
    if (typeof frontmatter?.[key] !== type) {
      throw new Error(`${path}: frontmatter "${key}" must be a ${type}`);
    }
  }
}

function buildQuestions(lessonId: string): Question[] {
  return Object.entries(questionDocs)
    .filter(([path]) => lessonIdOf(path) === lessonId)
    .map(([path, doc]) => {
      const [, name, number] = QUESTION_FILE.exec(path) ?? [];
      const codePath = `/src/lessons/${lessonId}/${name}.tsx`;
      const Component = questionModules[codePath]?.[name];

      if (!Component) {
        throw new Error(`${path}: expected ${codePath} to export ${name}`);
      }
      assertFrontmatter(path, doc.frontmatter, {
        title: 'string',
        prompt: 'string',
      });

      return {
        ...doc.frontmatter,
        id: name.toLowerCase(),
        fileName: `${name}.tsx`,
        source: questionSources[codePath],
        Component,
        Explanation: doc.default,
        order: Number(number),
      };
    })
    .sort((a, b) => a.order - b.order)
    .map(({ order: _order, ...question }) => question);
}

export type Section = {
  title: SectionTitle;
  lessons: Lesson[];
};

export function isSectionTitle(value: unknown): value is SectionTitle {
  return SECTION_TITLES.some((title) => title === value);
}

/** Every Lesson across the course, in `order`. */
export const lessons: Lesson[] = Object.entries(lessonDocs)
  .map(([path, doc]) => {
    assertFrontmatter(path, doc.frontmatter, {
      title: 'string',
      section: 'string',
      order: 'number',
      summary: 'string',
    });
    if (!isSectionTitle(doc.frontmatter.section)) {
      throw new Error(
        `${path}: frontmatter "section" must be one of ${SECTION_TITLES.join(', ')}`,
      );
    }
    const id = lessonIdOf(path);

    return {
      ...doc.frontmatter,
      id,
      Intro: doc.default,
      questions: buildQuestions(id),
    };
  })
  .filter((lesson) => lesson.questions.length > 0)
  .sort((a, b) => a.order - b.order);

/**
 * Sections in sidebar order, each with its Lessons in `order`, leaving out any
 * Section that has no Lessons yet.
 */
export const sections: Section[] = SECTION_TITLES.map((title) => ({
  title,
  lessons: lessons.filter((lesson) => lesson.section === title),
})).filter((section) => section.lessons.length > 0);

export function findLesson(id: string | undefined) {
  return lessons.find((lesson) => lesson.id === id);
}
