import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vite-plus/test';

import { sections } from '@/features/lessons/registry';

import { SearchDialog } from './search-dialog';

describe('SearchDialog', () => {
  test('lists Lessons under their Sections, in course order', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchDialog />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /search/i }));

    const dialog = screen.getByRole('dialog');
    const options = within(dialog).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(
      sections.flatMap((section) =>
        section.lessons.map((lesson) => lesson.title),
      ),
    );
    for (const section of sections) {
      const group = within(dialog).getByRole('group', { name: section.title });
      expect(
        within(group)
          .getAllByRole('option')
          .map((option) => option.textContent),
      ).toEqual(section.lessons.map((lesson) => lesson.title));
    }
  });
});
