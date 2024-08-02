import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { App2 } from '/Users/georgiosgeorgiou/Desktop/react-tricks/src/lessons/consoleLog/App2';
import { assertConsoleCount, assertFunctionAndTextContent } from './test-utils';

// Mock console.log
const consoleLogSpy = vi.spyOn(console, 'log');

const initialCount = 0;

describe('App2', () => {
  afterEach(() => {
    consoleLogSpy.mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  test('should render button with initial count', () => {
    const { getByText } = render(<App2 />);
    expect(getByText(initialCount.toString())).toBeVisible();
    assertConsoleCount(consoleLogSpy, initialCount);
  });

  test('should increment count and log correct message on button click', () => {
    const { getByText } = render(<App2 />);

    const button = getByText(initialCount);

    fireEvent.click(button);
    assertFunctionAndTextContent(button, consoleLogSpy, 0);

    fireEvent.click(button);
    assertFunctionAndTextContent(button, consoleLogSpy, 1);
  });
});
