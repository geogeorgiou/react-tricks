import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vite-plus/test';

import { App1 } from './App1';

describe('App1', () => {
  test('keeps an expanded filter group expanded after hiding and showing the panel', () => {
    render(<App1 />);

    fireEvent.click(screen.getByRole('button', { name: /Genre/ }));
    expect(screen.getByText('Jazz')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Hide filters' }));
    expect(screen.getByText('Jazz')).not.toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Show filters' }));
    expect(screen.getByText('Jazz')).toBeVisible();
    expect(screen.queryByText('1970s')).toBeNull();
  });
});
