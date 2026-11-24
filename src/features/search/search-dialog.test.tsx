import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, test, vi } from 'vite-plus/test';

import { sections } from '@/features/lessons/registry';

import { SearchDialog } from './search-dialog';

const CurrentPath = () => (
  <output aria-label='path'>{useLocation().pathname}</output>
);

const renderSearch = () =>
  render(
    <MemoryRouter>
      <SearchDialog />
      <CurrentPath />
    </MemoryRouter>,
  );

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

  test('shows a pointer cursor over every search result', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchDialog />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /search/i }));

    for (const option of within(screen.getByRole('dialog')).getAllByRole(
      'option',
    )) {
      expect(option).toHaveClass('cursor-pointer');
    }
  });

  test('opens a Lesson from its search result and closes', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.click(screen.getByRole('button', { name: /search/i }));
    await user.click(screen.getByRole('option', { name: 'Context' }));

    expect(screen.getByRole('status', { name: 'path' })).toHaveTextContent(
      '/lessons/context',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test.each([['{Control>}j{/Control}'], ['{Meta>}j{/Meta}']])(
    '%s toggles the dialog',
    async (shortcut) => {
      const user = userEvent.setup();
      renderSearch();

      await user.keyboard(shortcut);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard(shortcut);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    },
  );

  test('stops the browser handling Ctrl+J itself', () => {
    renderSearch();

    const shortcut = new KeyboardEvent('keydown', {
      key: 'j',
      ctrlKey: true,
      cancelable: true,
    });
    document.dispatchEvent(shortcut);

    expect(shortcut.defaultPrevented).toBe(true);
  });

  test.each([['j'], ['{Control>}k{/Control}'], ['{Shift>}j{/Shift}']])(
    '%s leaves the dialog closed',
    async (keys) => {
      const user = userEvent.setup();
      renderSearch();

      await user.keyboard(keys);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    },
  );

  test('stops listening for the shortcut once unmounted', () => {
    const addListener = vi.spyOn(document, 'addEventListener');
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderSearch();
    const [, onKeyDown] = addListener.mock.calls.find(
      ([type]) => type === 'keydown',
    )!;

    unmount();

    expect(removeListener).toHaveBeenCalledWith('keydown', onKeyDown);
    addListener.mockRestore();
    removeListener.mockRestore();
  });
});
