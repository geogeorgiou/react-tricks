import { describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useIsReRender } from './useIsReRender';

// Mock component to use the hook
const MockComponent = () => {
  useIsReRender();
  return <div>Mock Component</div>;
};

describe('useIsReRender', () => {
  test('should log "Re-rendered" on re-render', () => {
    const consoleLogSpy = vi.spyOn(console, 'log');

    const { rerender } = render(<MockComponent />);
    rerender(<MockComponent />);

    expect(consoleLogSpy).toHaveBeenCalledWith('Re-rendered');
    consoleLogSpy.mockRestore();
  });
});
