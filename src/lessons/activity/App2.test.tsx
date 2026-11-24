import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vite-plus/test';

import { App2 } from './App2';

describe('App2', () => {
  test('keeps the count after switching views back and forth', () => {
    render(<App2 />);

    fireEvent.click(screen.getByRole('button', { name: 'Counter' }));
    const plusOne = screen.getByRole('button', { name: '+1' });
    fireEvent.click(plusOne);
    fireEvent.click(plusOne);
    fireEvent.click(plusOne);

    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(screen.getByText('Count: 3')).not.toBeVisible();
    expect(screen.getByText(/Welcome/)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Counter' }));
    expect(screen.getByText('Count: 3')).toBeVisible();
    expect(screen.getByText(/Welcome/)).not.toBeVisible();
  });
});
