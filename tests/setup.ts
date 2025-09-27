import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Configure axe for accessibility testing (temporarily disabled due to ES module issues)
const axe: any = null;
// TODO: Re-enable vitest-axe once ES module compatibility is resolved
console.warn('vitest-axe temporarily disabled due to ES module compatibility issues');

export { axe };

// Cleanup after each test
afterEach(() => {
  cleanup();
});
