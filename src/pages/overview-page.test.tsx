import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vite-plus/test';

import { sections } from '@/features/lessons/registry';

import { OverviewPage } from './overview-page';

describe('OverviewPage', () => {
  test('shows the Sections in course order, each over its Lessons', () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>,
    );

    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([
      'Rendering Fundamentals',
      'Effects',
      'Memoization',
      'New in React 19',
    ]);

    for (const section of sections) {
      const region = screen.getByRole('region', { name: section.title });
      expect(
        within(region)
          .getAllByRole('link')
          .map((link) => link.getAttribute('href')),
      ).toEqual(section.lessons.map((lesson) => `/lessons/${lesson.id}`));
    }
  });
});
