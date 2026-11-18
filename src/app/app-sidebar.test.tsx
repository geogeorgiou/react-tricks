import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, test } from 'vite-plus/test';

import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

import { AppSidebar } from './app-sidebar';

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/lessons/use-memo']}>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </TooltipProvider>
    </MemoryRouter>,
  );
}

function lessonTitlesIn(section: string) {
  const menu = screen.getByRole('list', { name: section });
  return within(menu)
    .getAllByRole('link')
    .map((link) => link.textContent);
}

describe('AppSidebar', () => {
  beforeEach(() => {
    // jsdom has no matchMedia; the sidebar's mobile hook reads it.
    window.matchMedia ??= ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
  });

  test('lists lessons under their Section headings, in order', () => {
    renderSidebar();

    expect(lessonTitlesIn('State')).toEqual(['Console Log']);
    expect(lessonTitlesIn('Effects')).toEqual([
      'useEffect',
      'useEffect + setInterval',
    ]);
    expect(lessonTitlesIn('Memoization')).toEqual([
      'useMemo',
      'useCallback',
      'Will it re-render?',
    ]);
    expect(lessonTitlesIn('Context')).toEqual(['Context']);
    expect(lessonTitlesIn('React 19 APIs')).toEqual(['use()']);
  });

  test('marks the current lesson active inside its Section', () => {
    renderSidebar();

    const active = within(
      screen.getByRole('list', { name: 'Memoization' }),
    ).getByRole('link', { name: 'useMemo' });
    expect(active).toHaveAttribute('data-active', 'true');
  });
});
