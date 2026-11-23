import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { Link, MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, test } from 'vite-plus/test';

import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CLOSED_SECTIONS_KEY } from '@/features/sections/closed-sections';

import { AppSidebar } from './app-sidebar';

function renderSidebar({
  sidebarOpen = true,
  path = '/',
  children,
}: { sidebarOpen?: boolean; path?: string; children?: ReactNode } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <TooltipProvider>
        <SidebarProvider defaultOpen={sidebarOpen}>
          <AppSidebar />
          {children}
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
  beforeEach(() => {
    localStorage.clear();
  });

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
      'Rendering Fundamentals',
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

  test('reopens a closed Section when its Lesson becomes active', async () => {
    const user = userEvent.setup();
    renderSidebar({
      children: <Link to='/lessons/use-memo'>Go to useMemo</Link>,
    });
    const memoization = sectionOf('Memoization');

    await user.click(memoization.trigger);
    expect(memoization.trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(screen.getByRole('link', { name: 'Go to useMemo' }));
    expect(memoization.trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'useMemo' })).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  test('reopens its Section when moving to another Lesson in it', async () => {
    const user = userEvent.setup();
    renderSidebar({
      path: '/lessons/use-effect',
      children: (
        <Link to='/lessons/use-effect-set-interval'>Go to setInterval</Link>
      ),
    });
    const effects = sectionOf('Effects');

    await user.click(effects.trigger);
    expect(effects.trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(screen.getByRole('link', { name: 'Go to setInterval' }));
    expect(effects.trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('link', { name: 'useEffect + setInterval' }),
    ).toHaveAttribute('data-active', 'true');
  });

  test('keeps every Section open on the icon rail', async () => {
    const user = userEvent.setup();
    renderSidebar({ sidebarOpen: false });
    const memoization = sectionOf('Memoization');
    expect(memoization.trigger).toBeDisabled();

    await user.click(memoization.trigger);
    expect(memoization.trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'useMemo' })).toBeInTheDocument();

    // The click on the rail is not remembered once the sidebar expands.
    await user.click(screen.getByRole('button', { name: 'Toggle Sidebar' }));
    expect(sectionOf('Memoization').trigger).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(sectionOf('Memoization').trigger).toBeEnabled();
  });

  test('remembers closed Sections across a reload', async () => {
    const user = userEvent.setup();
    const { unmount } = renderSidebar();

    await user.click(sectionOf('Memoization').trigger);
    expect(JSON.parse(localStorage.getItem(CLOSED_SECTIONS_KEY)!)).toEqual([
      'Memoization',
    ]);
    unmount();

    renderSidebar();
    expect(sectionOf('Memoization').trigger).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(sectionOf('Effects').trigger).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await user.click(sectionOf('Memoization').trigger);
    expect(JSON.parse(localStorage.getItem(CLOSED_SECTIONS_KEY)!)).toEqual([]);
  });

  test('opens a remembered closed Section when loading one of its Lessons', () => {
    localStorage.setItem(
      CLOSED_SECTIONS_KEY,
      JSON.stringify(['Memoization', 'Effects']),
    );
    renderSidebar({ path: '/lessons/use-memo' });

    expect(sectionOf('Memoization').trigger).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(sectionOf('Effects').trigger).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(JSON.parse(localStorage.getItem(CLOSED_SECTIONS_KEY)!)).toEqual([
      'Effects',
    ]);
  });
});
