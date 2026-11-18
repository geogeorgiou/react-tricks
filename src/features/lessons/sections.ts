/**
 * Sections group related Lessons in the sidebar. They show in this order, and
 * each Lesson names its Section by id in its `index.mdx` frontmatter.
 */
export const sections = [
  { id: 'state', title: 'State' },
  { id: 'effects', title: 'Effects' },
  { id: 'memoization', title: 'Memoization' },
  { id: 'context', title: 'Context' },
  { id: 'react-19', title: 'React 19 APIs' },
] as const;

export type SectionId = (typeof sections)[number]['id'];
