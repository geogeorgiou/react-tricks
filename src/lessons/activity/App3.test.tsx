import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  describe,
  expect,
  test,
  vi,
} from 'vite-plus/test';

import { App3 } from './App3';

const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

const logged = () => consoleLogSpy.mock.calls.map(([message]) => message);

describe('App3', () => {
  afterEach(() => {
    consoleLogSpy.mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  test('cleans up effects while hidden but keeps state', async () => {
    render(<App3 />);
    expect(logged()).toEqual(['connected']);

    const send = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(send);
    fireEvent.click(send);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Hide chat' }));
    });
    expect(logged()).toEqual(['connected', 'disconnected']);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Show chat' }));
    });
    expect(logged()).toEqual(['connected', 'disconnected', 'connected']);
    expect(screen.getByText('Messages sent: 2')).toBeVisible();
  });
});
