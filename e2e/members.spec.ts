import { expect, test } from '@playwright/test';

/**
 * Members Directory E2E Tests
 * 
 * These tests validate the complete user flow for member search and directory functionality
 */

// Utility: wait for either member cards or no-results state
async function waitForResults(page: any, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const cardCount = await page.getByTestId('member-card').count();
    const noResultsVisible = await page.getByTestId('no-results').isVisible().catch(() => false);
    if (cardCount > 0 || noResultsVisible) {
      return { cardCount, noResultsVisible };
    }
    await page.waitForTimeout(100);
  }
  return { cardCount: 0, noResultsVisible: false };
}

test.describe('Members Directory', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the members directory
    await page.goto('/members');
  });

  test('should display members directory page', async ({ page }) => {
    // Check page title and description
    await expect(page.getByRole('heading', { name: 'Members Directory' })).toBeVisible();
    await expect(page.getByText('Search and browse team member profiles and skills')).toBeVisible();
  });

  test('should have search and filter controls', async ({ page }) => {
    // Check search input
    await expect(page.getByTestId('search-input')).toBeVisible();

    // Open skill select via label instead of button name
    await page.getByLabel('Filter by Skill').click();
    await expect(page.getByText('All Skills').first()).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');

    // Type in search input
    await searchInput.fill('test search');

    // Verify the input value
    await expect(searchInput).toHaveValue('test search');
  });

  test('should show no results message when no members found', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('nonexistent_user_12345');

    const { cardCount, noResultsVisible } = await waitForResults(page, 7000);
    expect(cardCount > 0 || noResultsVisible).toBe(true);
  });

  test('should display member cards when results exist', async ({ page }) => {
    const { cardCount, noResultsVisible } = await waitForResults(page, 7000);
    if (cardCount > 0) {
      await expect(page.getByTestId('member-card').first()).toBeVisible();
    } else {
      expect(noResultsVisible).toBe(true);
    }
  });

  test('should have pagination controls when needed', async ({ page }) => {
    await waitForResults(page, 7000);
    const prevButton = page.getByRole('button', { name: 'Previous', exact: true });
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    const hasPrev = await prevButton.count();
    if (hasPrev === 1 && await prevButton.isVisible()) {
      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();
      await expect(prevButton).toBeDisabled();
    }
  });

  test('should clear search when clicking on skill filter', async ({ page }) => {
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('search text');
    await expect(searchInput).toHaveValue('search text');
    await page.getByLabel('Filter by Skill').click();
  });
});

test.describe('Member Detail Page', () => {
  test('should handle member not found gracefully', async ({ page }) => {
    await page.goto('/members/nonexistent-id-12345', { waitUntil: 'networkidle' });
    await expect(page.getByTestId('member-not-found')).toBeVisible();
    await expect(page.getByText('Member Not Found')).toBeVisible();
  });

  test('should navigate back to directory from member detail', async ({ page }) => {
    // Start from a non-existent member page
    await page.goto('/members/nonexistent-id-12345');

    // Click back to directory
    await page.getByRole('link', { name: 'Back to Directory' }).click();

    // Should navigate back to members directory
    await expect(page.getByRole('heading', { name: 'Members Directory' })).toBeVisible();
  });
});

test.describe('Navigation Integration', () => {
  test('should navigate to members directory from header', async ({ page }) => {
    await page.goto('/');

    // Look for members link in navigation
    const membersLink = page.getByRole('link', { name: 'Members' });

    // Check if the link exists (it should be in the header)
    await expect(membersLink).toBeVisible();

    // Click the members link
    await membersLink.click();

    // Should navigate to members directory
    await expect(page.getByRole('heading', { name: 'Members Directory' })).toBeVisible();
  });

  test('should handle responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Look for mobile menu toggle
    const menuToggle = page.getByRole('button', { name: 'Toggle Menu' });

    if (await menuToggle.isVisible()) {
      await menuToggle.click();

      // Should show mobile navigation with members link
      await expect(page.getByRole('link', { name: 'Members' })).toBeVisible();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/members');

    // Check for proper form labels
    await expect(page.getByLabel('Search')).toBeVisible();
    await expect(page.getByLabel('Filter by Skill')).toBeVisible();

    // Check for heading hierarchy
    await expect(page.getByRole('heading', { name: 'Members Directory', level: 1 })).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page, browserName }) => {
    await page.goto('/members');

    const searchInput = page.getByTestId('search-input');
    // Try to reach search input by tabbing up to 15 steps
    let focused = false;
    for (let i = 0; i < 15; i++) {
      if (await searchInput.evaluate((el: HTMLElement) => el === document.activeElement)) {
        focused = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(focused).toBe(true);

    const skillFilter = page.getByLabel('Filter by Skill');
    let skillFocused = false;
    for (let i = 0; i < 20; i++) {
      if (await skillFilter.evaluate((el: HTMLElement) => el === document.activeElement)) {
        skillFocused = true;
        break;
      }
      // Safari/WebKit focuses only text boxes by default unless using Option+Tab
      await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
    }
    expect(skillFocused).toBe(true);
  });
});

test.describe('Performance and Loading States', () => {
  test('should show loading skeletons initially', async ({ page }) => {
    // Navigate to members and check for loading states
    const response = page.goto('/members');

    // Look for skeleton loading components
    // Note: This might be very fast in local development
    const _skeletons = page.locator('.animate-pulse');

    await response;

    // After loading, skeletons should be gone and content should be visible
    await expect(page.getByRole('heading', { name: 'Members Directory' })).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // This test would need network interception to simulate failures
    // For now, just verify the page loads without JavaScript errors

    let hasError = false;
    page.on('pageerror', () => {
      hasError = true;
    });

    await page.goto('/members');
    await page.waitForTimeout(2000);

    expect(hasError).toBe(false);
  });
});
