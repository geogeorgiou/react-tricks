import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { App1 } from '/Users/georgiosgeorgiou/Desktop/react-tricks/src/lessons/consoleLog/App1';
import { assertFunctionAndTextContent } from './test-utils';

// Mock console.log
const consoleLogSpy = vi.spyOn(console, 'log');

const initialCount = 0;

describe('App1', () => {
  afterEach(() => {
    consoleLogSpy.mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  test('should render button with initial count', () => {
    const { getByText } = render(<App1 />);
    expect(getByText(initialCount.toString())).toBeVisible();
  });

  test('should increment count and log correct message on button click', () => {
    const { getByText } = render(<App1 />);

    const button = getByText(initialCount);

    fireEvent.click(button);
    assertFunctionAndTextContent(button, consoleLogSpy, 0);

    fireEvent.click(button);
    assertFunctionAndTextContent(button, consoleLogSpy, 1);
  });
});
