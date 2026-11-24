import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vite-plus/test';

import { App2 } from './App2';

describe('App2', () => {
  test('keeps the count after switching tabs back and forth', () => {
    render(<App2 />);
    const home = screen.getByRole('tab', { name: 'Home' });
    const counter = screen.getByRole('tab', { name: 'Counter' });
    expect(home).toHaveAttribute('aria-selected', 'true');
    expect(counter).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(counter);
    expect(counter).toHaveAttribute('aria-selected', 'true');
    expect(home).toHaveAttribute('aria-selected', 'false');
    const plusOne = screen.getByRole('button', { name: '+1' });
    fireEvent.click(plusOne);
    fireEvent.click(plusOne);
    fireEvent.click(plusOne);

    fireEvent.click(home);
    expect(screen.getByText('Count: 3')).not.toBeVisible();
    expect(screen.getByText(/Welcome/)).toBeVisible();

    fireEvent.click(counter);
    expect(screen.getByText('Count: 3')).toBeVisible();
    expect(screen.getByText(/Welcome/)).not.toBeVisible();
  });
});
