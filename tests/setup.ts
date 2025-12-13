import '@testing-library/jest-dom';
import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { axe, toHaveNoViolations } from 'jest-axe';

// ============================================================================
// Mock floating-ui autoUpdate to prevent ResizeObserver issues in jsdom
// ============================================================================
// The autoUpdate function from @floating-ui/dom internally uses ResizeObserver
// which doesn't work properly in jsdom. This mock provides a working substitute.
vi.mock('@floating-ui/dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@floating-ui/dom')>();
  return {
    ...mod,
    autoUpdate: (_reference: Element, _floating: Element, update: () => void) => {
      // Call update once to simulate initial positioning
      update();
      // Return cleanup function
      return () => {};
    },
  };
});

// ============================================================================
// Mock ResizeObserver for components that use it directly
// ============================================================================
class ResizeObserverMock implements ResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(_target: Element, _options?: ResizeObserverOptions) {
    // Trigger callback with empty entries to simulate observation starting
    this.callback([], this);
  }

  unobserve(_target: Element) {}

  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// ============================================================================
// Mock PointerEvent for components that use pointer events
// ============================================================================
class PointerEventMock extends MouseEvent {
  readonly pointerId: number;
  readonly pointerType: string;

  constructor(type: string, params: PointerEventInit = {}) {
    super(type, params);
    this.pointerId = params.pointerId ?? 0;
    this.pointerType = params.pointerType ?? 'mouse';
  }
}

if (typeof global.PointerEvent === 'undefined') {
  global.PointerEvent = PointerEventMock as unknown as typeof PointerEvent;
}

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);
expect.extend(toHaveNoViolations);

export { axe };

// Suppress console noise during tests
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

// Cleanup after each test
afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});
