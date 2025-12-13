import { test, expect } from '@playwright/test';

test.describe('Default Quiz Loading', () => {
  test('should load the default quiz successfully', async ({ page }) => {
    // Go to the home page
    await page.goto('/');

    // Click the "Try Algorithm Quiz" button
    await page.getByTestId('start-default-quiz-button').click();

    // Wait for the dashboard to appear (indicating success)
    // The dashboard usually shows the quiz title or chapters
    await expect(page.getByText('Advanced Data Structures & Algorithms Viva Prep')).toBeVisible({
      timeout: 10000,
    });

    // Verify no error message is shown
    await expect(page.getByText('Error Loading Quiz Module')).not.toBeVisible();
  });
});
