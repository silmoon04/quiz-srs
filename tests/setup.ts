import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Configure axe for accessibility testing (if available)
let axe: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { configureAxe, toHaveNoViolations } = require('vitest-axe');
  expect.extend(toHaveNoViolations);
  axe = configureAxe({
    rules: {
      region: { enabled: false },
    },
  });
} catch (error) {
  console.warn('vitest-axe not available:', error);
}

export { axe };

// Cleanup after each test
afterEach(() => {
  cleanup();
});
