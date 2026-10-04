import type { ComponentType } from 'react';
import type { MDXContent } from 'mdx/types';

/**
 * Lessons are discovered from the file system:
 *
 *   src/lessons/<lesson-id>/index.mdx   lesson title, order, summary
 *   src/lessons/<lesson-id>/AppN.tsx    the variant component (and its source)
 *   src/lessons/<lesson-id>/AppN.mdx    question + explanation for AppN
 *
 * A lesson shows up once it has an index.mdx, and a variant once it has both
 * its .tsx and .mdx files.
 */

export type LessonFrontmatter = {
  title: string;
  order: number;
  summary: string;
};

export type VariantFrontmatter = {
  title: string;
  question: string;
  strictModeSensitive?: boolean;
};

type MdxModule<T> = { default: MDXContent; frontmatter: T };

export type Variant = VariantFrontmatter & {
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
  variants: Variant[];
};

const lessonDocs = import.meta.glob<MdxModule<LessonFrontmatter>>(
  '/src/lessons/*/index.mdx',
  { eager: true },
);

const variantDocs = import.meta.glob<MdxModule<VariantFrontmatter>>(
  '/src/lessons/*/App*.mdx',
  { eager: true },
);

const variantModules = import.meta.glob<Record<string, ComponentType>>(
  ['/src/lessons/*/App*.tsx', '!/src/lessons/**/*.test.tsx'],
  { eager: true },
);

const variantSources = import.meta.glob<string>(
  ['/src/lessons/*/App*.tsx', '!/src/lessons/**/*.test.tsx'],
  { eager: true, query: '?raw', import: 'default' },
);

const LESSON_DIR = /^\/src\/lessons\/([^/]+)\//;
const VARIANT_FILE = /\/(App(\d+))\.mdx$/;

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

function buildVariants(lessonId: string): Variant[] {
  return Object.entries(variantDocs)
    .filter(([path]) => lessonIdOf(path) === lessonId)
    .map(([path, doc]) => {
      const [, name, number] = VARIANT_FILE.exec(path) ?? [];
      const codePath = `/src/lessons/${lessonId}/${name}.tsx`;
      const Component = variantModules[codePath]?.[name];

      if (!Component) {
        throw new Error(`${path}: expected ${codePath} to export ${name}`);
      }
      assertFrontmatter(path, doc.frontmatter, {
        title: 'string',
        question: 'string',
      });

      return {
        ...doc.frontmatter,
        id: name.toLowerCase(),
        fileName: `${name}.tsx`,
        source: variantSources[codePath],
        Component,
        Explanation: doc.default,
        order: Number(number),
      };
    })
    .sort((a, b) => a.order - b.order)
    .map(({ order: _order, ...variant }) => variant);
}

export const lessons: Lesson[] = Object.entries(lessonDocs)
  .map(([path, doc]) => {
    assertFrontmatter(path, doc.frontmatter, {
      title: 'string',
      order: 'number',
      summary: 'string',
    });
    const id = lessonIdOf(path);

    return {
      ...doc.frontmatter,
      id,
      Intro: doc.default,
      variants: buildVariants(id),
    };
  })
  .filter((lesson) => lesson.variants.length > 0)
  .sort((a, b) => a.order - b.order);

export function findLesson(id: string | undefined) {
  return lessons.find((lesson) => lesson.id === id);
}
