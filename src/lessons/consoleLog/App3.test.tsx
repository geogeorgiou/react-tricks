import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { App3 } from '/Users/georgiosgeorgiou/Desktop/react-tricks/src/lessons/consoleLog/App3';
import { assertConsoleCount } from './test-utils';

// Mock console.log
const consoleLogSpy = vi.spyOn(console, 'log');

const initialCount = 0;

describe('App3', () => {
  afterEach(() => {
    consoleLogSpy.mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  test('should render button with initial count', () => {
    const { getByText } = render(<App3 />);
    expect(getByText(initialCount.toString())).toBeVisible();
    // assertConsoleCount(consoleLogSpy, initialCount + 1);
  });

  test('should increment count and log correct message on button click', () => {
    const { getByText } = render(<App3 />);

    const button = getByText(initialCount);

    fireEvent.click(button);
    assertConsoleCount(consoleLogSpy, initialCount + 1);

    fireEvent.click(button);
    assertConsoleCount(consoleLogSpy, initialCount + 2);
    // assertFunctionAndTextContent(button, consoleLogSpy, 1);
  });
});
