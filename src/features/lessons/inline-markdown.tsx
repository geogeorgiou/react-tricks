import { Fragment } from 'react';

/** Renders `code` spans in short frontmatter strings such as questions. */
export function InlineMarkdown({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/).map((part, index) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code
        key={index}
        className='rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] font-normal'>
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
