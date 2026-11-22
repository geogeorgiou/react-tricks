import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vite-plus/test';

import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

import { AppSidebar } from './app-sidebar';

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </TooltipProvider>
    </MemoryRouter>,
  );
}

function sectionOf(title: string) {
  const trigger = screen.getByRole('button', { name: title });
  const group = trigger.closest<HTMLElement>('[data-sidebar="group"]');
  if (!group) throw new Error(`No sidebar group for ${title}`);
  return { trigger, group };
}

describe('AppSidebar', () => {
  test('shows each Section as a heading over its Lessons, all open', () => {
    renderSidebar();

    const effects = sectionOf('Effects');
    expect(effects.trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(effects.group)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['useEffect', 'useEffect + setInterval']);

    for (const title of [
      'State & rendering',
      'Memoization',
      'New in React 19',
    ]) {
      expect(sectionOf(title).trigger).toHaveAttribute('aria-expanded', 'true');
    }
  });

  test('collapses and reopens a Section', async () => {
    const user = userEvent.setup();
    renderSidebar();
    const memoization = sectionOf('Memoization');

    await user.click(memoization.trigger);
    expect(memoization.trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: 'useMemo' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'useEffect' })).toBeVisible();

    await user.click(memoization.trigger);
    expect(screen.getByRole('link', { name: 'useMemo' })).toBeInTheDocument();
  });
});
