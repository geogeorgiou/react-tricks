import { expect, MockInstance } from 'vitest';

export function assertFunctionAndTextContent(
  button: HTMLElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  consoleLogSpy: MockInstance<(...data: any[]) => void>,
  countArg: number,
) {
  assertConsoleCount(consoleLogSpy, countArg);
  expect(button.textContent).toBe(`${countArg + 1}`);
}

export function assertConsoleCount(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  consoleLogSpy: MockInstance<(...data: any[]) => void>,
  countArg: number,
) {
  expect(consoleLogSpy).toHaveBeenCalledWith(`Count: ${countArg}`);
}
