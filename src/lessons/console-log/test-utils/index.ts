import { expect, MockInstance } from 'vite-plus/test';

export function assertFunctionAndTextContent(
  button: HTMLElement,
  // oxlint-disable-next-line typescript/no-explicit-any
  consoleLogSpy: MockInstance<(...data: any[]) => void>,
  countArg: number,
) {
  assertConsoleCount(consoleLogSpy, countArg);
  expect(button.textContent).toBe(`${countArg + 1}`);
}

export function assertConsoleCount(
  // oxlint-disable-next-line typescript/no-explicit-any
  consoleLogSpy: MockInstance<(...data: any[]) => void>,
  countArg: number,
) {
  expect(consoleLogSpy).toHaveBeenCalledWith(`Count: ${countArg}`);
}
