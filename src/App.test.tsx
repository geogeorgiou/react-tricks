import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('should render successfully', () => {
    render(<App />);

    const img = screen.getByRole('img', { name: 'Vite logo' });

    expect(img).toBeVisible();
  });
});
