import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { App4 } from '/Users/georgiosgeorgiou/Desktop/react-tricks/src/lessons/consoleLog/App4';
import { assertConsoleCount } from './test-utils';

// Mock console.log
const consoleLogSpy = vi.spyOn(console, 'log');

const initialCount = 0;

describe('App4', () => {
  afterEach(() => {
    consoleLogSpy.mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  test('should render button with initial count', () => {
    const { getByText } = render(<App4 />);
    expect(getByText(initialCount.toString())).toBeVisible();
    assertConsoleCount(consoleLogSpy, initialCount);
  });

  test('should increment count and log correct message on button click', () => {
    const { getByText } = render(<App4 />);

    const button = getByText(initialCount.toString());

    fireEvent.click(button);
    let nextCount = initialCount + 4;
    assertConsoleCount(consoleLogSpy, 0);
    assertConsoleCount(consoleLogSpy, nextCount);
    expect(getByText(nextCount.toString())).toBeVisible();

    fireEvent.click(button);
    nextCount += 4;
    assertConsoleCount(consoleLogSpy, nextCount);
    expect(getByText(nextCount.toString())).toBeVisible();
  });
});
