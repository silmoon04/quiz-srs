import { test, expect } from '@playwright/test';

test.describe('Static Assets', () => {
  test('should serve default-quiz.md', async ({ request }) => {
    const response = await request.get('/default-quiz.md');
    expect(response.ok()).toBeTruthy();
    const content = await response.text();
    expect(content).toContain('# Advanced Data Structures & Algorithms Viva Prep');
  });

  test('should serve default-quiz.json', async ({ request }) => {
    const response = await request.get('/default-quiz.json');
    expect(response.ok()).toBeTruthy();
    const content = await response.json();
    expect(content.name).toBe('Advanced Data Structures & Algorithms Viva Prep');
  });
});
